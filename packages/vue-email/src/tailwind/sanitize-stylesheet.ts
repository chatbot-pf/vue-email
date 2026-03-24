import type { StyleSheet } from 'css-tree'
import { resolveAllCssVariables } from './css/resolve-all-css-variables'
import { resolveCalcExpressions } from './css/resolve-calc-expressions'
import { sanitizeDeclarations } from './css/sanitize-declarations'

export function sanitizeStyleSheet(styleSheet: StyleSheet) {
  resolveAllCssVariables(styleSheet)
  resolveCalcExpressions(styleSheet)
  sanitizeDeclarations(styleSheet)
}
