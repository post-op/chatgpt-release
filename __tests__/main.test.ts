import * as process from 'process'
import {expect, test, describe} from '@jest/globals'
import {getSha, getMessages} from '../src/business'

import nock from 'nock'
import {isNullOrWhitespace} from "../src/stringsHelper";
import {supportedLanguages, throwIfLanguageIsNotSupported} from "../src/supportedLanguages";


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

describe('isNullOrWhitespace', () => {
  test('should return true for null input', () => {
    const result = isNullOrWhitespace(null)
    expect(result).toBe(true)
  })

  test('should return true for undefined input', () => {
    const result = isNullOrWhitespace(undefined)
    expect(result).toBe(true)
  })

  test('should return true for empty string input', () => {
    const result = isNullOrWhitespace('')
    expect(result).toBe(true)
  })

  test('should return true for whitespace string input', () => {
    const result = isNullOrWhitespace('   ')
    expect(result).toBe(true)
  })

  test('should return true for new line string input', () => {
    const result = isNullOrWhitespace('\n')
    expect(result).toBe(true)
  })

  test("should return true for string with white spaces and other special characters", () => {
    const result = isNullOrWhitespace(" \n \t ");
    expect(result).toBe(true);
  });


  test('should return false for non-empty string input', () => {
    const result = isNullOrWhitespace('hello')
    expect(result).toBe(false)
  })

  test('should return false for non-empty string input even if it has some white spaces inside', () => {
    const result = isNullOrWhitespace('hello Moto')
    expect(result).toBe(false)
  })

  test("should return false for string with non-white space characters", () => {
    const result = isNullOrWhitespace("Hello, world!");
    expect(result).toBe(false);
  });

  test("should handle strings with unicode characters", () => {
    const result = isNullOrWhitespace("Héllo, 🌎!");
    expect(result).toBe(false);
  });

  test("should handle strings with spaces only at the beginning or end", () => {
    const result1 = isNullOrWhitespace("  Hello");
    const result2 = isNullOrWhitespace("Hello   ");
    expect(result1).toBe(false);
    expect(result2).toBe(false);
  });

  test("should handle strings with only tabs or line breaks", () => {
    const result1 = isNullOrWhitespace("\t\t");
    const result2 = isNullOrWhitespace("\n\n\n");
    expect(result1).toBe(true);
    expect(result2).toBe(true);
  });
})


describe('throwIfLanguageIsNotSupported', () => {
  test('should throw an error for unsupported language', () => {
    expect(() => {
      throwIfLanguageIsNotSupported('italiano');
    }).toThrowError('Language italiano is not supported.');

    expect(() => {
      throwIfLanguageIsNotSupported('abcde');
    }).toThrowError('Language abcde is not supported.');
  });

  test('should not throw an error for supported language', () => {
    expect(() => {
      throwIfLanguageIsNotSupported('german');
    }).not.toThrow();
  });

  test('should not throw an error for supported language with front and end spaces', () => {
    expect(() => {
      throwIfLanguageIsNotSupported('    english');
    }).not.toThrow();
    expect(() => {
      throwIfLanguageIsNotSupported('english     ');
    }).not.toThrow();
    expect(() => {
      throwIfLanguageIsNotSupported('    english     ');
    }).not.toThrow();
  });

  test('should not throw an error for all supported languages', () => {
    supportedLanguages.forEach((language) => {
      expect(() => {
        throwIfLanguageIsNotSupported(language);
      }).not.toThrow();
    });
  });

  test('should ignore case when checking supported languages', () => {
    expect(() => {
      throwIfLanguageIsNotSupported('SpaNisH');
    }).not.toThrow();
  });

  test('should throw an error for empty or whitespace string language', () => {
    expect(() => {
      throwIfLanguageIsNotSupported('');
    }).toThrowError('Language  is not supported.');
    expect(() => {
      throwIfLanguageIsNotSupported('    ');
    }).toThrowError('Language      is not supported.');
  });

})
