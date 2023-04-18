export const isNullOrWhitespace = (
  value: string | null | undefined
): boolean => {
  if (value === null) {
    return true
  }

  if (!value) {
    return true
  }
  return value.trim().length <= 0
}
