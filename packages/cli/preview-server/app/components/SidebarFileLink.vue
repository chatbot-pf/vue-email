<script setup lang="ts">
interface Props {
  slug: string
  label: string
  active?: boolean
}

defineProps<Props>()
</script>

<template>
  <NuxtLink
    :to="`/preview/${slug}`"
    class="relative flex h-8 w-full items-center gap-2 rounded-md text-sm text-slate-11 transition-colors duration-100"
    :class="active ? 'text-cyan-11' : 'hover:text-slate-12'"
  >
    <span
      v-if="active"
      class="absolute inset-0 rounded-md bg-cyan-5"
    />
    <UIcon name="i-lucide-file" class="relative h-5 w-5 shrink-0" />
    <span class="relative truncate w-[calc(100%-1.25rem)]">{{ label }}</span>
  </NuxtLink>
</template>
