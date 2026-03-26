<script setup lang="ts">
export interface ErrorObject {
  name: string
  stack: string | undefined
  cause?: unknown
  message: string
}

const props = defineProps<{
  error: ErrorObject
}>()

const RE_CLOSING_TAG_ERROR = /(Unexpected closing tag "[^"]+". It may happen when the tag has already been closed by another tag). (For more info see) (.+)/

const closingTagMatch = computed(() => RE_CLOSING_TAG_ERROR.exec(props.error.message))
</script>

<template>
  <div class="absolute inset-0 z-50">
    <div class="absolute inset-0 bg-black/80" />
    <div class="min-h-[50vh] w-full max-w-lg sm:rounded-lg md:max-w-[568px] lg:max-w-[920px] absolute left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 rounded-t-sm overflow-hidden bg-white text-black shadow-lg flex flex-col">
      <div class="bg-red-500 h-3" />
      <div class="flex grow p-6 min-w-0 max-w-full flex-col space-y-1.5">
        <div class="shrink pb-2 text-xl tracking-tight">
          <b>{{ error.name }}</b>:
          <template v-if="closingTagMatch">
            <span>{{ closingTagMatch[1] }}.</span>
            <p class="text-lg">
              {{ closingTagMatch[2] }}
              <a
                class="underline"
                rel="noreferrer"
                target="_blank"
                :href="closingTagMatch[3]"
              >
                {{ closingTagMatch[3] }}
              </a>
            </p>
          </template>
          <template v-else>
            {{ error.message }}
          </template>
        </div>
        <div
          v-if="error.stack"
          class="grow scroll-px-4 overflow-x-auto rounded-lg bg-black p-2 text-gray-100"
        >
          <pre class="w-full min-w-0 font-mono leading-6 text-xs selection:text-cyan-300">{{ error.stack }}</pre>
        </div>
      </div>
    </div>
  </div>
</template>
