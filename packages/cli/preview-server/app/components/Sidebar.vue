<script setup lang="ts">
import type { EmailsDirectory } from '../../../src/utils/discovery'

const props = defineProps<Props>()

const RE_EMAIL_EXT = /\.(vue|tsx|jsx|js)$/

interface Props {
  currentSlug?: string
}

const { data: emailsDir, error } = await useFetch<EmailsDirectory>('/api/templates')

function getEmailSlug(dir: EmailsDirectory, filename: string): string {
  if (!dir.relativePath) {
    return filename
  }
  return `${dir.relativePath}/${filename}`
}

function isActive(slug: string): boolean {
  if (!props.currentSlug)
    return false
  const withoutExt = props.currentSlug.replace(RE_EMAIL_EXT, '')
  return withoutExt === slug || props.currentSlug === slug
}
</script>

<template>
  <nav class="flex flex-col p-4 pr-0 w-full min-w-58">
    <div v-if="error" class="text-red-400 text-sm p-2">
      Failed to load email templates
    </div>
    <SidebarDirectory
      v-else-if="emailsDir"
      :directory="emailsDir"
      :current-slug="currentSlug"
      :is-root="true"
      :get-email-slug="getEmailSlug"
      :is-active="isActive"
    />
  </nav>
</template>
