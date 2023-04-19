import * as core from '@actions/core'
import * as github from '@actions/github'
import {Configuration, OpenAIApi} from 'openai'
import {isNullOrWhitespace} from './stringsHelper'
import {throwIfLanguageIsNotSupported} from './supportedLanguages'

if (!process.env.GITHUB_TOKEN) throw new Error('No GITHUB_TOKEN set')

const token: string = process.env.GITHUB_TOKEN
const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
})

export async function getSha(): Promise<string> {
  try {
    const {data: latestRelease} = await github
      .getOctokit(token)
      .rest.repos.getLatestRelease({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo
      })
    return latestRelease.target_commitish
  } catch (error) {
    core.warning('No release found, defaulting to `main`.')
    core.debug(`${error}`)
    return 'main'
  }
}

export async function getMessages(sha: string): Promise<string[]> {
  try {
    const {data: commits} = await github
      .getOctokit(token)
      .rest.repos.listCommits({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        sha
      })
    if (!commits) throw new Error('no new commits found')
    return commits.map(commit => commit.commit.message)
  } catch (error) {
    core.warning('No messages found.')
    core.debug(`${error}`)
    throw error
  }
}

export async function generateRelease(
  releaseName: string,
  projectName: string,
  messages: string[],
  whimsical: boolean,
  language: string
): Promise<string> {
  const openai = new OpenAIApi(configuration)
  const jointMessages = messages.join('\n')

  const generateReleaseNotesPromptWithoutLanguageSpecification = whimsical
    ? `Generate release notes for version ${releaseName}. The project name is ${projectName}. The tone should be fun and whimsical, yet informative. Use the following commit messages:\n\n${jointMessages}`
    : `Generate release notes for version ${releaseName}, for project ${projectName}, based on the following commit messages:\n\n${process.env.COMMIT_MESSAGES}`

  let languagePrompt: string | null = null
  if (!isNullOrWhitespace(language)) {
    throwIfLanguageIsNotSupported(language)
    languagePrompt = `translate the message to ${language}`
  }

  const prompt = languagePrompt
    ? `Please first ${generateReleaseNotesPromptWithoutLanguageSpecification} and then ${languagePrompt}`
    : generateReleaseNotesPromptWithoutLanguageSpecification

  try {
    const completions = await openai.createCompletion({
      model: 'text-davinci-003',
      prompt,
      temperature: 0.7,
      max_tokens: 1024,
      presence_penalty: 0.5,
      frequency_penalty: 0.5,
      n: 1,
      stop: ['\n\n\n']
    })
    if (
      !completions ||
      !completions.data ||
      !completions.data.choices ||
      completions.data.choices.length !== 1 ||
      !completions.data.choices[0].text
    )
      throw new Error('Empty response')
    return completions.data.choices[0].text.trim()

    // TypeScript sometimes sucks. This is one such case.
    // Using unknown and not any here is a bloodbath of `if`s.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    if (error.response) {
      core.error(error.response.status)
      core.debug(error.response.data)
    } else {
      core.error(error.message)
    }
    throw new Error('Something went wrong with the OpenAI API.')
  }
}
