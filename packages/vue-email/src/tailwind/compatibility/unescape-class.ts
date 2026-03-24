const UNESCAPE_REGEX = /\\\d|\\/g

export function unescapeClass(singleClass: string) {
  return singleClass.replaceAll(UNESCAPE_REGEX, '')
}
