<script setup lang="ts">
import type { EmailsDirectory } from '../../../src/utils/discovery'

interface Props {
  directory: EmailsDirectory
  currentSlug?: string
  isRoot?: boolean
  getEmailSlug: (dir: EmailsDirectory, filename: string) => string
  isActive: (slug: string) => boolean
}

const props = defineProps<Props>()

const isEmpty = computed(
  () =>
    props.directory.emailFilenames.length === 0
    && props.directory.subDirectories.length === 0,
)

const containsCurrentEmail = computed(() => {
  if (!props.currentSlug || !props.directory.relativePath)
    return false
  return props.currentSlug.startsWith(props.directory.relativePath)
})

const open = ref(props.isRoot || containsCurrentEmail.value)

function toggleOpen() {
  if (!isEmpty.value) {
    open.value = !open.value
  }
}
</script>

<template>
  <!-- Root: just render children directly -->
  <template v-if="isRoot">
    <SidebarDirectory
      v-for="subDir in directory.subDirectories"
      :key="subDir.absolutePath"
      :directory="subDir"
      :current-slug="currentSlug"
      :get-email-slug="getEmailSlug"
      :is-active="isActive"
    />
    <SidebarFileLink
      v-for="filename in directory.emailFilenames"
      :key="filename"
      :slug="getEmailSlug(directory, filename)"
      :label="filename"
      :active="isActive(getEmailSlug(directory, filename))"
    />
  </template>

  <!-- Sub-directory: collapsible -->
  <div v-else class="mb-1">
    <button
      class="mt-1 mb-1.5 flex w-full items-center text-start justify-between gap-2 font-medium text-[14px] text-slate-11 hover:text-slate-12 transition-colors"
      :class="{ 'cursor-default': isEmpty }"
      type="button"
      @click="toggleOpen"
    >
      <UIcon
        :name="open ? 'i-lucide-folder-open' : 'i-lucide-folder'"
        class="w-5 h-5 shrink-0"
      />
      <span class="grow truncate w-[calc(100%-40px)]">
        {{ directory.directoryName }}
      </span>
      <UIcon
        v-if="!isEmpty"
        name="i-lucide-chevron-down"
        class="ml-auto opacity-60 transition-transform duration-200 shrink-0"
        :class="{ 'rotate-180': open }"
      />
    </button>

    <div
      v-if="!isEmpty"
      class="relative overflow-hidden pl-1 transition-all duration-200"
      :class="open ? 'max-h-[9999px] opacity-100' : 'max-h-0 opacity-0'"
    >
      <div class="absolute left-2.5 h-full w-px bg-slate-6" />
      <div class="flex flex-col truncate">
        <SidebarDirectory
          v-for="subDir in directory.subDirectories"
          :key="subDir.absolutePath"
          :directory="subDir"
          :current-slug="currentSlug"
          :get-email-slug="getEmailSlug"
          :is-active="isActive"
        />
        <SidebarFileLink
          v-for="filename in directory.emailFilenames"
          :key="filename"
          :slug="getEmailSlug(directory, filename)"
          :label="filename"
          :active="isActive(getEmailSlug(directory, filename))"
          class="pl-3"
        />
      </div>
    </div>
  </div>
</template>
