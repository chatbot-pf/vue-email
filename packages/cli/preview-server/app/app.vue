<script setup lang="ts">
const route = useRoute()
const sidebarOpen = ref(true)

const currentSlug = computed(() => {
  const params = route.params.slug
  if (!params)
    return undefined
  return Array.isArray(params) ? params.join('/') : params
})

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value
}

provide('sidebarOpen', readonly(sidebarOpen))
provide('toggleSidebar', toggleSidebar)
</script>

<template>
  <UApp>
    <div class="relative h-screen bg-black text-slate-11 leading-loose">
      <!-- Mobile topbar -->
      <div class="flex h-14 items-center justify-between border-b border-slate-6 px-6 lg:hidden">
        <div class="flex items-center">
          <span class="text-white font-semibold text-sm">mail-please</span>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          :icon="sidebarOpen ? 'i-lucide-x' : 'i-lucide-menu'"
          aria-label="Toggle sidebar"
          @click="toggleSidebar"
        />
      </div>

      <!-- Main layout -->
      <div class="flex w-full h-[calc(100dvh-3.5rem)] lg:h-dvh">
        <!-- Sidebar -->
        <aside
          class="fixed top-14 left-0 z-50 h-[calc(100dvh-3.5rem)] w-full max-w-xs bg-black border-r border-slate-6 overflow-hidden lg:static lg:top-auto lg:z-auto lg:max-w-none lg:w-64 lg:h-full lg:translate-x-0 transition-transform duration-200 ease-in-out" :class="[
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0',
          ]"
        >
          <!-- Logo row (desktop only) -->
          <div class="hidden lg:flex items-center h-14 px-4 border-b border-slate-4 shrink-0">
            <span class="text-white font-semibold text-sm">mail-please</span>
          </div>

          <!-- File tree sidebar -->
          <div class="relative grow h-full overflow-y-auto overflow-x-hidden px-4 pb-3">
            <Sidebar :current-slug="currentSlug" />
          </div>
        </aside>

        <!-- Main content -->
        <main
          class="relative overflow-hidden h-full transition-all duration-200 ease-in-out" :class="[
            sidebarOpen ? 'w-full lg:w-[calc(100%-16rem)]' : 'w-full',
          ]"
        >
          <NuxtPage />
        </main>
      </div>
    </div>
  </UApp>
</template>
