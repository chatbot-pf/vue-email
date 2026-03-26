<script setup lang="ts">
import Compatibility from './toolbar/Compatibility.vue'
import Linter from './toolbar/Linter.vue'
import SendEmail from './toolbar/SendEmail.vue'
import SpamCheck from './toolbar/SpamCheck.vue'

defineProps<{
  emailSlug: string
  html: string
  plainText: string
}>()

type TabValue = 'linter' | 'spam' | 'compatibility' | 'send'

const route = useRoute()
const router = useRouter()

const activeTab = computed<TabValue | undefined>(
  () => (route.query['toolbar-panel'] as TabValue) ?? undefined,
)

const toggled = computed(() => activeTab.value !== undefined)

function setActiveTab(value: TabValue | undefined) {
  const query = { ...route.query }
  if (value === undefined) {
    delete query['toolbar-panel']
  }
  else {
    query['toolbar-panel'] = value
  }
  router.push({ query })
}

function toggle() {
  if (activeTab.value === undefined) {
    setActiveTab('linter')
  }
  else {
    setActiveTab(undefined)
  }
}

// Refs to child components for manual reload
const linterRef = ref<InstanceType<typeof Linter> | null>(null)
const spamRef = ref<InstanceType<typeof SpamCheck> | null>(null)
const compatRef = ref<InstanceType<typeof Compatibility> | null>(null)

const isLoading = computed(() => {
  return linterRef.value?.loading || spamRef.value?.loading || compatRef.value?.loading
})

async function reload() {
  if (activeTab.value === 'linter') {
    await linterRef.value?.runLint()
  }
  else if (activeTab.value === 'spam') {
    await spamRef.value?.runCheck()
  }
  else if (activeTab.value === 'compatibility') {
    await compatRef.value?.runCheck()
  }
}

const tabs = [
  { value: 'linter', label: 'Linter' },
  { value: 'spam', label: 'Spam' },
  { value: 'compatibility', label: 'Compatibility' },
  { value: 'send', label: 'Send' },
] as const

const tooltips: Record<TabValue, string> = {
  linter: 'The Linter tab checks all the images and links for common issues like missing alt text, broken URLs, insecure HTTP methods, and more.',
  spam: 'The Spam tab will look at the content and use a robust scoring framework to determine if the email is likely to be spam. Powered by SpamAssassin.',
  compatibility: 'The Compatibility tab shows how well the HTML/CSS is supported across mail clients like Outlook, Gmail, etc. Powered by Can I Email.',
  send: 'The Send tab allows you to send a test email via Resend.',
}
</script>

<template>
  <div
    :data-toggled="toggled"
    class="absolute bottom-0 left-0 right-0 border-t border-slate-6 text-xs text-slate-11 h-52 transition-transform group/toolbar data-[toggled=false]:translate-y-[10.625rem]"
  >
    <div class="flex flex-col h-full">
      <!-- Tab bar -->
      <div class="flex gap-4 px-4 border-b border-solid border-slate-6 h-10 w-full shrink-0 items-center">
        <!-- Tab buttons -->
        <button
          v-for="tab in tabs"
          :key="tab.value"
          class="h-full px-1 text-xs font-medium border-b-2 transition-colors" :class="[
            activeTab === tab.value
              ? 'border-white text-white'
              : 'border-transparent text-slate-11 hover:text-slate-12',
          ]"
          @click="setActiveTab(tab.value)"
        >
          {{ tab.label }}
        </button>

        <!-- Right-side controls -->
        <div class="flex gap-0.5 ml-auto items-center">
          <!-- Info tooltip -->
          <UTooltip
            v-if="activeTab"
            :text="tooltips[activeTab]"
            :delay-duration="0"
          >
            <button class="p-1 text-slate-11 hover:text-slate-12 transition-colors rounded">
              <UIcon name="i-lucide-info" class="text-base" />
            </button>
          </UTooltip>

          <!-- Reload button (not on send tab) -->
          <button
            v-if="activeTab && activeTab !== 'send'"
            :disabled="!!isLoading"
            class="p-1 text-slate-11 hover:text-slate-12 transition-colors rounded disabled:opacity-40"
            @click="reload"
          >
            <UIcon
              name="i-lucide-refresh-cw"
              class="text-base" :class="[isLoading ? 'animate-spin' : '']"
            />
          </button>

          <!-- Toggle button -->
          <button
            class="p-1 text-slate-11 hover:text-slate-12 transition-colors rounded"
            @click="toggle"
          >
            <UIcon
              name="i-lucide-chevron-down"
              class="text-base transition-transform" :class="[!toggled ? 'rotate-180' : '']"
            />
          </button>
        </div>
      </div>

      <!-- Panel content -->
      <div class="grow overflow-y-auto pr-3 pl-4 pt-3 transition-opacity opacity-100 group-data-[toggled=false]/toolbar:opacity-0">
        <Linter
          v-if="activeTab === 'linter'"
          ref="linterRef"
          :email-slug="emailSlug"
          :html="html"
        />
        <SpamCheck
          v-else-if="activeTab === 'spam'"
          ref="spamRef"
          :email-slug="emailSlug"
          :html="html"
          :plain-text="plainText"
        />
        <Compatibility
          v-else-if="activeTab === 'compatibility'"
          ref="compatRef"
          :email-slug="emailSlug"
          :html="html"
        />
        <SendEmail
          v-else-if="activeTab === 'send'"
          :email-slug="emailSlug"
          :html="html"
        />
      </div>
    </div>
  </div>
</template>
