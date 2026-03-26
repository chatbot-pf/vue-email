<script setup lang="ts">
import { codeToHtml } from 'shiki'

const props = defineProps<Props>()
const RE_AMP = /&/g
const RE_LT = /</g
const RE_GT = />/g

interface Tab {
  key: string
  label: string
  content: string
  language: string
  extension?: string
}

interface Props {
  source: string
  html: string
  plainText: string
  basename: string
  sourceExtension?: string
}

const activeTab = ref<string>('source')

const tabs = computed<Tab[]>(() => [
  {
    key: 'source',
    label: props.sourceExtension === 'vue' ? 'Vue' : 'TSX',
    content: props.source,
    language: props.sourceExtension === 'vue' ? 'vue' : 'tsx',
    extension: props.sourceExtension,
  },
  {
    key: 'html',
    label: 'HTML',
    content: props.html,
    language: 'html',
    extension: 'html',
  },
  {
    key: 'plaintext',
    label: 'Plain Text',
    content: props.plainText,
    language: 'text',
    extension: 'txt',
  },
])

const currentTab = computed(() => tabs.value.find(t => t.key === activeTab.value) ?? tabs.value[0]!)

const highlightedHtml = ref<string>('')
const isLoading = ref(false)

async function highlight(content: string, language: string) {
  if (!content) {
    highlightedHtml.value = ''
    return
  }
  isLoading.value = true
  try {
    const result = await codeToHtml(content, {
      lang: language === 'text' ? 'plaintext' : language,
      theme: 'github-dark',
    })
    highlightedHtml.value = result
  }
  catch {
    // fallback to plain text if language not supported
    const escaped = content.replace(RE_AMP, '&amp;').replace(RE_LT, '&lt;').replace(RE_GT, '&gt;')
    highlightedHtml.value = `<pre><code>${escaped}</code></pre>`
  }
  finally {
    isLoading.value = false
  }
}

watch(
  currentTab,
  (tab) => {
    highlight(tab.content, tab.language)
  },
  { immediate: true },
)

const isCopied = ref(false)
let copyTimeout: ReturnType<typeof setTimeout> | undefined

async function copyToClipboard() {
  if (!currentTab.value)
    return
  await navigator.clipboard.writeText(currentTab.value.content)
  isCopied.value = true
  clearTimeout(copyTimeout)
  copyTimeout = setTimeout(() => {
    isCopied.value = false
  }, 3000)
}

function downloadFile() {
  const tab = currentTab.value
  if (!tab)
    return
  const ext = tab.extension ?? tab.language
  const filename = `${props.basename}.${ext}`
  const blob = new Blob([tab.content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div
    class="relative h-full w-full whitespace-pre rounded-md border border-slate-6 text-sm overflow-hidden"
    style="
      background: linear-gradient(145.37deg, rgba(255, 255, 255, 0.09) -8.75%, rgba(255, 255, 255, 0.027) 83.95%);
      box-shadow: rgb(0 0 0 / 10%) 0px 5px 30px -5px;
    "
  >
    <!-- Top gradient accent -->
    <div
      class="absolute right-0 top-0 h-px w-[200px] pointer-events-none"
      style="background: linear-gradient(90deg, rgba(56, 189, 248, 0) 0%, rgba(232, 232, 232, 0.2) 33%, rgba(143, 143, 143, 0.67) 64%, rgba(236, 72, 153, 0) 99%)"
    />

    <!-- Tab bar -->
    <div class="h-9 border-b border-slate-6 flex items-center relative">
      <div class="flex h-full">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="relative px-4 h-full font-sans text-sm font-medium transition-colors duration-200 hover:text-slate-12"
          :class="activeTab === tab.key ? 'text-slate-12' : 'text-slate-11'"
          type="button"
          @click="activeTab = tab.key"
        >
          <span
            v-if="activeTab === tab.key"
            class="absolute inset-0 bg-slate-4"
          />
          <span class="relative">{{ tab.label }}</span>
        </button>
      </div>

      <!-- Action buttons -->
      <div class="absolute right-2 top-1.5 hidden md:flex gap-1">
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          :icon="isCopied ? 'i-lucide-check' : 'i-lucide-clipboard'"
          :aria-label="isCopied ? 'Copied!' : 'Copy to clipboard'"
          @click="copyToClipboard"
        />
        <UButton
          color="neutral"
          variant="ghost"
          size="xs"
          icon="i-lucide-download"
          aria-label="Download"
          @click="downloadFile"
        />
      </div>
    </div>

    <!-- Code content -->
    <div class="h-[calc(100%-2.25rem)] overflow-auto">
      <div
        v-if="isLoading"
        class="flex items-center justify-center h-16 text-slate-11 text-sm"
      >
        Loading...
      </div>
      <!-- eslint-disable-next-line vue/no-v-html -->
      <div v-else class="shiki-wrapper p-4 text-[13px] leading-[130%] font-mono" v-html="highlightedHtml" />
    </div>

    <!-- Bottom gradient accent -->
    <div
      class="absolute bottom-0 left-0 h-px w-[200px] pointer-events-none"
      style="background: linear-gradient(90deg, rgba(56, 189, 248, 0) 0%, rgba(232, 232, 232, 0.2) 33%, rgba(143, 143, 143, 0.67) 64%, rgba(236, 72, 153, 0) 99%)"
    />
  </div>
</template>

<style>
.shiki-wrapper pre {
  background: transparent !important;
  margin: 0;
  padding: 0;
}

.shiki-wrapper code {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace;
  font-size: 13px;
  line-height: 130%;
}
</style>
