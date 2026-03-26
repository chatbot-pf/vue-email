<script setup lang="ts">
import type { CompatibilityIssue } from '../../../server/api/compatibility.post'

export type { CompatibilityIssue }

const props = defineProps<{
  emailSlug: string
  html: string
}>()

const CACHE_KEY = computed(() => `compatibility-${props.emailSlug.replaceAll('/', '-')}`)

const loading = ref(false)
const issues = ref<CompatibilityIssue[] | null>(null)

const toast = useToast()

function loadCache(): CompatibilityIssue[] | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY.value)
    if (!raw)
      return null
    return JSON.parse(raw) as CompatibilityIssue[]
  }
  catch {
    return null
  }
}

function saveCache(data: CompatibilityIssue[]) {
  try {
    localStorage.setItem(CACHE_KEY.value, JSON.stringify(data))
  }
  catch {}
}

async function runCheck(silent = false) {
  if (loading.value)
    return
  if (!silent)
    loading.value = true

  try {
    const result = await $fetch<CompatibilityIssue[]>('/api/compatibility', {
      method: 'POST',
      body: { html: props.html },
    })
    issues.value = result
    saveCache(result)
  }
  catch (err: any) {
    const msg = err?.data?.statusMessage ?? err?.message ?? 'Compatibility check failed'
    toast.add({ title: msg, color: 'error' })
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  const cached = loadCache()
  if (cached) {
    // Show cached results immediately, then refresh silently in the background
    issues.value = cached
    runCheck(true)
  }
  else {
    runCheck()
  }
})

watch(
  () => props.html,
  () => runCheck(),
)

defineExpose({ runCheck, loading, issues })
</script>

<template>
  <div class="text-xs">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center pt-8"
    >
      <div class="h-5 w-5 rounded-full border-2 border-white/50 border-t-transparent animate-spin mb-3" />
      <p class="text-slate-11">
        Checking email compatibility...
      </p>
    </div>

    <div
      v-else-if="issues !== null && issues.length === 0"
      class="flex flex-col items-center justify-center pt-8 text-center"
    >
      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-check" class="text-white text-lg" />
      </div>
      <h3 class="text-slate-12 font-medium text-sm mb-1">
        Great compatibility
      </h3>
      <p class="text-slate-11 text-xs">
        Template should render properly everywhere.
      </p>
    </div>

    <table
      v-else-if="issues && issues.length > 0"
      class="w-full"
    >
      <tbody>
        <tr
          v-for="(issue, i) in issues"
          :key="i"
          class="border-b border-slate-6"
        >
          <td class="py-2 px-3 w-48">
            <span class="flex text-red-400 uppercase gap-2 items-center">
              <UIcon name="i-lucide-triangle-alert" class="shrink-0" />
              {{ issue.title }}
            </span>
          </td>
          <td class="py-2 px-3 text-slate-11">
            <span v-if="issue.unsupportedIn.length > 0">
              Not supported in {{ issue.unsupportedIn.join(', ') }}
            </span>
            <a
              :href="issue.url"
              class="underline ml-2 decoration-slate-9 decoration-1 hover:decoration-slate-11 transition-colors hover:text-slate-12"
              rel="noreferrer"
              target="_blank"
            >
              More ↗
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
