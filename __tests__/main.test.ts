import * as process from 'process'
import {expect, test, describe} from '@jest/globals'
import {getSha, getMessages} from '../src/business'

import nock from 'nock'
process.env.GITHUB_REPOSITORY = 'owner/repo'

describe('getSha', () => {
  test('returns the target commitish of the latest release', async () => {
    // Mock the GitHub API response
    const expectedSha = 'abcdef123456'
    nock('https://api.github.com')
      .get('/repos/owner/repo/releases/latest')
      .reply(200, {target_commitish: expectedSha})

    // Call the function and verify the result
    const sha = await getSha()
    expect(sha).toBe(expectedSha)
  })

  test('returns "main" if there is no release', async () => {
    // Set up the mock HTTP response
    nock('https://api.github.com')
      .get('/repos/owner/repo/releases/latest')
      .reply(404)

    // Call the function and verify the result
    const sha = await getSha()
    expect(sha).toBe('main')
  })
})

describe('getMessages', () => {
  test('returns the commit messages for a given SHA', async () => {
    // Set up the mock HTTP response
    const sha = 'abcdef123456'
    const expectedMessages = [
      'Fix issue #123',
      'Add feature X',
      'Update dependencies'
    ]
    nock('https://api.github.com')
      .get(`/repos/owner/repo/commits?sha=${sha}`)
      .reply(
        200,
        expectedMessages.map(message => ({commit: {message}}))
      )

    // Call the function and verify the result
    const messages = await getMessages(sha)
    expect(messages).toEqual(expectedMessages)
  })

  test('throws an error if the API returns nothing', async () => {
    // Set up the mock HTTP response
    const sha = 'abcdef123456'
    nock('https://api.github.com')
      .get(`/repos/owner/repo/commits?sha=${sha}`)
      .reply(500)

    // Call the function and expect it to throw an error
    await expect(getMessages(sha)).rejects.toThrow()
  })
})
