<script setup lang="ts">
export interface SpamCheckingResult {
  checks: {
    name: string
    description: string
    points: number
  }[]
  isSpam: boolean
  points: number
}

const props = defineProps<{
  emailSlug: string
  html: string
  plainText: string
}>()

const CACHE_KEY = computed(() => `spam-check-${props.emailSlug.replaceAll('/', '-')}`)

const loading = ref(false)
const result = ref<SpamCheckingResult | null>(null)
const error = ref<string | null>(null)

const toast = useToast()

function loadCache(): SpamCheckingResult | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY.value)
    if (!raw)
      return null
    return JSON.parse(raw) as SpamCheckingResult
  }
  catch {
    return null
  }
}

function saveCache(data: SpamCheckingResult) {
  try {
    localStorage.setItem(CACHE_KEY.value, JSON.stringify(data))
  }
  catch {}
}

async function runCheck() {
  if (loading.value)
    return
  loading.value = true
  error.value = null

  try {
    const response = await $fetch<SpamCheckingResult | { error: string }>('https://react.email/api/check-spam', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { html: props.html, plainText: props.plainText },
    })

    if ('error' in response) {
      error.value = response.error
      toast.add({ title: response.error, color: 'error' })
    }
    else {
      result.value = response
      saveCache(response)
    }
  }
  catch (err: any) {
    const msg = err?.message ?? 'Failed to check spam'
    error.value = msg
    toast.add({ title: msg, color: 'error' })
  }
  finally {
    loading.value = false
  }
}

onMounted(() => {
  const cached = loadCache()
  if (cached) {
    result.value = cached
  }
  else {
    runCheck()
  }
})

watch(
  [() => props.html, () => props.plainText],
  () => runCheck(),
)

function scoreColor(points: number): string {
  if (points === 0)
    return 'text-green-400'
  if (points <= 1.5)
    return ''
  if (points <= 3)
    return 'text-yellow-200'
  if (points < 5)
    return 'text-orange-400'
  return 'text-red-400'
}

function checkColor(points: number): string {
  if (points > 3)
    return 'text-red-400'
  if (points > 2)
    return 'text-orange-400'
  if (points > 1)
    return 'text-yellow-200'
  return ''
}

const sortedChecks = computed(() => {
  if (!result.value)
    return []
  return [...result.value.checks].sort((a, b) => b.points - a.points)
})

defineExpose({ runCheck, loading, result })
</script>

<template>
  <div class="text-xs">
    <div
      v-if="loading"
      class="flex flex-col items-center justify-center pt-8"
    >
      <div class="h-5 w-5 rounded-full border-2 border-white/50 border-t-transparent animate-spin mb-3" />
      <p class="text-slate-11">
        Evaluating your email for spam indicators...
      </p>
    </div>

    <div
      v-else-if="result && result.isSpam === false && result.checks.length === 0"
      class="flex flex-col items-center justify-center pt-8 text-center"
    >
      <div class="h-10 w-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mb-4">
        <UIcon name="i-lucide-check" class="text-white text-lg" />
      </div>
      <h3 class="text-slate-12 font-medium text-sm mb-1">
        10/10
      </h3>
      <p class="text-slate-11 text-xs">
        Your email is clean of abuse indicators.
      </p>
    </div>

    <template v-else-if="result">
      <table class="w-full">
        <tbody>
          <!-- Score header row -->
          <tr class="border-b border-slate-6 sticky top-0 bg-black">
            <td class="py-2 px-3 uppercase">
              <span class="flex gap-2 items-center">
                <UIcon
                  name="i-lucide-triangle-alert"
                  :class="scoreColor(result.points)"
                  class="shrink-0"
                />
                Score
              </span>
            </td>
            <td class="py-2 px-3 text-slate-11">
              {{ result.points === 0 ? 'Congratulations! Your email is clean of abuse indicators.' : 'Higher scores are better' }}
            </td>
            <td class="py-2 px-3 text-right tracking-tighter font-bold">
              <span class="text-3xl" :class="[scoreColor(result.points)]">
                {{ (10 - result.points).toFixed(1) }}
              </span>
              <span class="text-lg"> / 10</span>
            </td>
          </tr>
          <!-- Individual checks -->
          <tr
            v-for="check in sortedChecks"
            :key="check.name"
            class="border-b border-slate-6"
          >
            <td class="py-2 px-3 uppercase">
              <span class="flex gap-2 items-center">
                <UIcon
                  name="i-lucide-triangle-alert"
                  :class="checkColor(check.points)"
                  class="shrink-0"
                />
                {{ check.name }}
              </span>
            </td>
            <td class="py-2 px-3 text-slate-11">
              {{ check.description }}
            </td>
            <td class="py-2 px-3 text-right font-mono tracking-tighter" :class="[checkColor(check.points)]">
              -{{ check.points.toFixed(1) }}
            </td>
          </tr>
        </tbody>
      </table>
    </template>

    <div
      v-else-if="error"
      class="flex flex-col items-center justify-center pt-8 text-center"
    >
      <p class="text-red-400 text-xs">
        {{ error }}
      </p>
      <UButton
        size="xs"
        color="neutral"
        variant="ghost"
        class="mt-2"
        @click="runCheck"
      >
        Retry
      </UButton>
    </div>
  </div>
</template>
