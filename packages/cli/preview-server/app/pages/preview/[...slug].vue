<script setup lang="ts">
import type { RenderErrorResult, RenderResult } from '../../../server/api/render.post'
import type { ErrorObject } from '../../components/ErrorOverlay.vue'
import type { HotReloadChange } from '../../composables/useHotReload'

const route = useRoute()
const router = useRouter()

const slug = computed(() => {
  const params = route.params.slug
  return Array.isArray(params) ? params.join('/') : (params as string)
})

// --- Query param state ---
const isDarkMode = computed(() => 'dark' in route.query)
const activeView = computed(() => (route.query.view as string) ?? 'preview')
const viewWidth = computed(() => route.query.width ? Number(route.query.width) : 1024)
const viewHeight = computed(() => route.query.height ? Number(route.query.height) : 600)

// --- Render state ---
const renderResult = ref<RenderResult | RenderErrorResult | null>(null)
const isLoading = ref(false)
const loadError = ref<string | null>(null)

const hasError = computed(() => {
  if (!renderResult.value)
    return false
  return 'error' in renderResult.value
})

const renderError = computed<ErrorObject | null>(() => {
  if (!renderResult.value || !('error' in renderResult.value))
    return null
  return renderResult.value.error as ErrorObject
})

const renderData = computed<RenderResult | null>(() => {
  if (!renderResult.value || 'error' in renderResult.value)
    return null
  return renderResult.value
})

async function fetchRender(invalidateCache = false) {
  if (!slug.value)
    return
  isLoading.value = true
  loadError.value = null
  try {
    const result = await $fetch<RenderResult | RenderErrorResult>('/api/render', {
      method: 'POST',
      body: { slug: slug.value, invalidateCache },
    })
    renderResult.value = result
  }
  catch (err) {
    loadError.value = (err as Error).message ?? 'Failed to render email'
    renderResult.value = null
  }
  finally {
    isLoading.value = false
  }
}

// Initial fetch
await fetchRender()

// Watch slug changes (navigating to a different email)
watch(slug, () => fetchRender())

// --- Hot reload ---
useHotReload((_changes: HotReloadChange[]) => {
  fetchRender(true)
})

// --- Query param helpers ---
function setQuery(key: string, value: string | null) {
  const query = { ...route.query }
  if (value === null) {
    delete query[key]
  }
  else {
    query[key] = value
  }
  router.replace({ query })
}

function handleDarkModeChange(enabled: boolean) {
  setQuery('dark', enabled ? '' : null)
}

function handleViewChange(view: string) {
  setQuery('view', view)
}

function handleWidthChange(width: number) {
  setQuery('width', String(width))
}

function handleHeightChange(height: number) {
  setQuery('height', String(height))
}

// Page title
useHead({
  title: computed(() =>
    renderData.value?.basename
      ? `${renderData.value.basename} — mail-please`
      : 'mail-please',
  ),
})
</script>

<template>
  <div class="flex flex-col h-full relative">
    <!-- Topbar -->
    <div class="flex h-14 items-center gap-2 px-4 border-b border-slate-6 shrink-0">
      <!-- Email title -->
      <span class="text-slate-12 text-sm font-medium truncate">
        {{ renderData?.basename ?? slug }}
      </span>

      <div class="flex items-center gap-2 ml-auto">
        <!-- Dark mode toggle -->
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :icon="isDarkMode ? 'i-lucide-moon' : 'i-lucide-sun'"
          :aria-label="isDarkMode ? 'Disable dark mode' : 'Enable dark mode'"
          @click="handleDarkModeChange(!isDarkMode)"
        />

        <!-- Preview controls (only in preview view) -->
        <PreviewControls
          v-if="activeView === 'preview'"
          :width="viewWidth"
          :height="viewHeight"
          @update:width="handleWidthChange"
          @update:height="handleHeightChange"
        />

        <!-- View toggle: Preview / Source -->
        <div class="flex rounded-lg border border-slate-6 overflow-hidden">
          <button
            class="px-3 h-8 text-xs transition-colors"
            :class="activeView === 'preview' ? 'bg-slate-4 text-slate-12' : 'text-slate-11 hover:text-slate-12'"
            type="button"
            @click="handleViewChange('preview')"
          >
            Preview
          </button>
          <button
            class="px-3 h-8 text-xs transition-colors border-l border-slate-6"
            :class="activeView === 'source' ? 'bg-slate-4 text-slate-12' : 'text-slate-11 hover:text-slate-12'"
            type="button"
            @click="handleViewChange('source')"
          >
            Source
          </button>
        </div>
      </div>
    </div>

    <!-- Main content area -->
    <div
      class="relative flex-1 overflow-hidden"
      :class="[
        activeView === 'preview' && 'bg-gray-200',
        activeView === 'preview' && isDarkMode && 'bg-gray-400',
      ]"
    >
      <!-- Loading state -->
      <div
        v-if="isLoading && !renderResult"
        class="absolute inset-0 flex items-center justify-center text-slate-11 text-sm"
      >
        Loading...
      </div>

      <!-- Fetch error (network-level) -->
      <div
        v-else-if="loadError"
        class="absolute inset-0 flex items-center justify-center text-red-400 text-sm p-4"
      >
        {{ loadError }}
      </div>

      <!-- Render error overlay -->
      <ErrorOverlay
        v-else-if="hasError && renderError"
        :error="renderError"
      />

      <!-- Preview view -->
      <template v-else-if="renderData && activeView === 'preview'">
        <div class="absolute inset-0 flex items-center justify-center p-4 overflow-auto">
          <EmailFrame
            :markup="renderData.html"
            :width="viewWidth"
            :height="viewHeight"
            :dark-mode="isDarkMode"
            class="max-h-full rounded-lg bg-white"
          />
        </div>
      </template>

      <!-- Source view -->
      <template v-else-if="renderData && activeView === 'source'">
        <div class="absolute inset-0 overflow-auto">
          <div class="m-auto h-full flex max-w-3xl p-6">
            <CodeView
              :source="renderData.source"
              :html="renderData.prettyHtml"
              :plain-text="renderData.plainText"
              :basename="renderData.basename"
              :source-extension="renderData.extname"
            />
          </div>
        </div>
      </template>
    </div>

    <!-- Toolbar (fixed bottom) -->
    <Toolbar
      v-if="renderData"
      :email-slug="slug"
      :html="renderData.html"
      :plain-text="renderData.plainText"
    />
  </div>
</template>
