import * as core from '@actions/core'
import * as github from '@actions/github'
import {generateRelease, getMessages, getSha} from './business'

async function run(): Promise<void> {
  try {
    const version: string = core.getInput('version')
    const whimsical: boolean = core.getBooleanInput('whimsical')
    const sha: string = core.getInput('sha') ?? (await getSha())
    const projectName: string =
      core.getInput('project_name') ?? github.context.repo.repo
    const language: string = core.getInput('language')

    core.debug(`Parameters:
    - version: ${version}
    - sha: ${sha}
    - whimsical: ${whimsical}
    - projectName: ${projectName}
    - language: ${language}
    `)

    const messages = await getMessages(sha)

    core.debug(`Messages:
    ${messages.join('\n')}
    `)

    const releaseBody = await generateRelease(
      version,
      projectName,
      messages,
      whimsical,
      language
    )

    core.setOutput('release_body', releaseBody)
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
