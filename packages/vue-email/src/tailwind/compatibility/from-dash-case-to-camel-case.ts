const DASH_TO_CAMEL_REGEX = /-(\w|$)/g

export function fromDashCaseToCamelCase(text: string) {
  return text.replace(DASH_TO_CAMEL_REGEX, (_, p1: string) => p1.toUpperCase())
}
