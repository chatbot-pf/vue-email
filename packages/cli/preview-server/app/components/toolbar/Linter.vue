<script setup lang="ts">
import type { LintingRow } from '../../../server/api/lint.post'

export type { LintingRow }

const props = defineProps<{
  emailSlug: string
  html: string
}>()

const CACHE_KEY = computed(() => `linter-${props.emailSlug.replaceAll('/', '-')}`)

const loading = ref(false)
const rows = ref<LintingRow[] | null>(null)

function loadCache(): LintingRow[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY.value)
    if (!raw)
      return null
    return JSON.parse(raw) as LintingRow[]
  }
  catch {
    return null
  }
}

function saveCache(data: LintingRow[]) {
  try {
    localStorage.setItem(CACHE_KEY.value, JSON.stringify(data))
  }
  catch {}
}

async function runLint() {
  loading.value = true
  try {
    const origin = typeof location !== 'undefined' ? location.origin : ''
    const result = await $fetch<LintingRow[]>('/api/lint', {
      method: 'POST',
      body: { html: props.html, base: origin },
    })
    rows.value = result
    saveCache(result)
  }
  catch (err) {
    console.error('Linting error:', err)
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  const cached = loadCache()
  if (cached) {
    rows.value = cached
  }
  else {
    runLint()
  }
})

watch(
  () => props.html,
  () => runLint(),
)

function prettyBytes(bytes: number): string {
  if (bytes < 1024)
    return `${bytes} B`
  if (bytes < 1024 * 1024)
    return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const RE_UNDERSCORE = /_/g

function sanitize(str: string): string {
  return str.replace(RE_UNDERSCORE, ' ')
}

defineExpose({ runLint, loading, rows })
</script>

<template>
  <div class="text-xs">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center pt-8"
    >
      <div class="h-5 w-5 rounded-full border-2 border-white/50 border-t-transparent animate-spin mb-3" />
      <p class="text-slate-11">
        Analyzing your code for linting issues...
      </p>
    </div>

    <div
      v-else-if="rows !== null && rows.length === 0"
      class="flex flex-col items-center justify-center pt-8 text-center"
    >
      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-check" class="text-white text-lg" />
      </div>
      <h3 class="text-slate-12 font-medium text-sm mb-1">
        All good
      </h3>
      <p class="text-slate-11 text-xs">
        No linting issues found.
      </p>
    </div>

    <table
      v-else-if="rows && rows.length > 0"
      class="w-full"
    >
      <tbody>
        <tr
          v-for="(row, i) in rows"
          :key="i"
          class="border-b border-slate-6"
        >
          <td class="py-2 px-3 w-32">
            <span
              class="flex uppercase gap-2 items-center" :class="[
                row.result.status === 'error' ? 'text-red-400' : 'text-orange-300',
              ]"
            >
              <UIcon name="i-lucide-triangle-alert" class="shrink-0" />
              <template v-if="row.source === 'link'">
                {{ sanitize(row.result.checks.find(c => !c.passed)?.type ?? 'link') }}
              </template>
              <template v-else>
                {{ sanitize(row.result.checks.find(c => !c.passed)?.type ?? 'image') }}
              </template>
            </span>
          </td>

          <td class="py-2 px-3 text-slate-11">
            <template v-if="row.source === 'link'">
              <template v-for="check in row.result.checks" :key="check.type">
                <template v-if="!check.passed">
                  <span v-if="check.type === 'security'">Insecure URL, use HTTPS instead of HTTP</span>
                  <span v-else-if="check.type === 'fetch_attempt' && check.metadata.fetchStatusCode && check.metadata.fetchStatusCode >= 300 && check.metadata.fetchStatusCode < 400">There was a redirect, the content may have been moved</span>
                  <span v-else-if="check.type === 'fetch_attempt' && check.metadata.fetchStatusCode && check.metadata.fetchStatusCode >= 400">The link is broken</span>
                  <span v-else-if="check.type === 'fetch_attempt' && !check.metadata.fetchStatusCode">The link could not be reached</span>
                  <span v-else-if="check.type === 'syntax'">The link is broken due to invalid syntax</span>
                </template>
              </template>
              <span class="ml-2 text-ellipsis overflow-hidden text-nowrap max-w-[30ch] inline-block align-bottom">{{ row.result.link }}</span>
            </template>

            <template v-else>
              <template v-for="check in row.result.checks" :key="check.type">
                <template v-if="!check.passed">
                  <span v-if="check.type === 'security'">Insecure URL, use HTTPS instead of HTTP</span>
                  <span v-else-if="check.type === 'fetch_attempt' && check.metadata.fetchStatusCode && check.metadata.fetchStatusCode >= 300 && check.metadata.fetchStatusCode < 400">There was a redirect, the image may have been moved</span>
                  <span v-else-if="check.type === 'fetch_attempt' && check.metadata.fetchStatusCode && check.metadata.fetchStatusCode >= 400">The image is broken</span>
                  <span v-else-if="check.type === 'fetch_attempt' && !check.metadata.fetchStatusCode">The image could not be reached</span>
                  <span v-else-if="check.type === 'syntax'">The image is broken due to an invalid source</span>
                  <span v-else-if="check.type === 'accessibility'">Missing alt text</span>
                  <span v-else-if="check.type === 'image_size' && check.metadata.byteCount">This image is too large, keep it under 1mb</span>
                </template>
              </template>
              <span class="ml-2 text-ellipsis overflow-hidden text-nowrap max-w-[30ch] inline-block align-bottom">{{ row.result.source }}</span>
            </template>
          </td>

          <td class="py-2 px-3 text-right font-mono text-slate-11 whitespace-nowrap">
            <template v-if="row.source === 'image'">
              <template v-for="check in row.result.checks" :key="check.type">
                <span v-if="check.type === 'image_size' && check.metadata.byteCount">{{ prettyBytes(check.metadata.byteCount) }} &middot; </span>
                <span v-if="check.type === 'fetch_attempt' && check.metadata.fetchStatusCode">HTTP {{ check.metadata.fetchStatusCode }} &middot; </span>
              </template>
            </template>
            <template v-else>
              <template v-for="check in row.result.checks" :key="check.type">
                <span v-if="check.type === 'fetch_attempt' && check.metadata.fetchStatusCode">HTTP {{ check.metadata.fetchStatusCode }} &middot; </span>
              </template>
            </template>
            <span class="text-slate-9">L{{ row.result.codeLocation.line }}:{{ row.result.codeLocation.column }}</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
