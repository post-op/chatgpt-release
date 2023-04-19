export const supportedLanguages = [
  'english',
  'spanish',
  'french',
  'german',
  'italian',
  'portuguese',
  'russian',
  'japanese',
  'chinese'
]

export const throwIfLanguageIsNotSupported = (language: string): void => {
  const isLanguageSupported = supportedLanguages.includes(
    language.trim().toLowerCase()
  )

  if (!isLanguageSupported) {
    throw new Error(
      `Language ${language} is not supported.\nSupported languages are: ${supportedLanguages.join(
        ', '
      )}`
    )
  }
}
