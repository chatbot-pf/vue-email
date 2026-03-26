<script setup lang="ts">
interface Preset {
  name: string
  width: number
  height: number
  icon: string
}

const props = withDefaults(defineProps<Props>(), {
  // 220 minimum width, 352 = 220 * 1.6 minimum height
  minWidth: 220,
  minHeight: 352,
})

const emit = defineEmits<{
  'update:width': [value: number]
  'update:height': [value: number]
}>()

const PRESETS: Preset[] = [
  { name: 'Desktop', width: 1024, height: 600, icon: 'i-lucide-monitor' },
  { name: 'Mobile', width: 375, height: 667, icon: 'i-lucide-smartphone' },
]

interface Props {
  width: number
  height: number
  minWidth?: number
  minHeight?: number
}

const showCustomPopover = ref(false)
const internalWidth = ref(props.width)
const internalHeight = ref(props.height)

watch(
  () => props.width,
  (v) => { internalWidth.value = v },
)
watch(
  () => props.height,
  (v) => { internalHeight.value = v },
)

function selectPreset(preset: Preset) {
  emit('update:width', preset.width)
  emit('update:height', preset.height)
}

function applyCustomWidth(value: number) {
  internalWidth.value = value
  if (value >= props.minWidth) {
    emit('update:width', value)
  }
}

function applyCustomHeight(value: number) {
  internalHeight.value = value
  if (value >= props.minHeight) {
    emit('update:height', value)
  }
}

function isPresetActive(preset: Preset): boolean {
  return props.width === preset.width
}
</script>

<template>
  <div class="relative flex h-9 w-fit overflow-visible rounded-lg border border-slate-6 text-sm transition-colors duration-300 ease-in-out">
    <!-- Preset buttons -->
    <UTooltip
      v-for="preset in PRESETS"
      :key="preset.name"
      :text="preset.name"
    >
      <button
        class="relative flex items-center justify-center w-9 h-full transition-colors hover:text-slate-12 text-slate-11"
        :class="isPresetActive(preset) ? 'bg-slate-4 text-slate-12' : ''"
        type="button"
        @click="selectPreset(preset)"
      >
        <UIcon :name="preset.icon" class="w-4 h-4" />
      </button>
    </UTooltip>

    <!-- Custom size dropdown -->
    <div class="relative">
      <button
        class="relative flex items-center justify-center w-9 h-full text-slate-11 hover:text-slate-12 transition-colors"
        type="button"
        @click="showCustomPopover = !showCustomPopover"
      >
        <span class="sr-only">Custom size</span>
        <UIcon
          name="i-lucide-chevron-down"
          class="w-4 h-4 transition-transform duration-200"
          :class="showCustomPopover ? '-rotate-180' : ''"
        />
      </button>

      <!-- Popover -->
      <Transition
        enter-active-class="transition ease-out duration-100"
        enter-from-class="opacity-0 scale-95"
        enter-to-class="opacity-100 scale-100"
        leave-active-class="transition ease-in duration-75"
        leave-from-class="opacity-100 scale-100"
        leave-to-class="opacity-0 scale-95"
      >
        <div
          v-if="showCustomPopover"
          v-click-outside="() => showCustomPopover = false"
          class="absolute right-0 top-10 z-50 flex min-w-48 flex-col gap-2 rounded-md border border-slate-8 bg-black px-2 py-2 text-white shadow-lg"
        >
          <div class="flex w-full items-center justify-between gap-2 text-sm">
            <span class="font-medium text-slate-11 text-xs">Width</span>
            <input
              type="number"
              :value="internalWidth"
              :min="minWidth"
              class="w-20 appearance-none rounded-lg border border-slate-6 bg-slate-5 px-1 py-1 text-sm text-slate-12 outline-none transition duration-300 ease-in-out focus:ring-1 focus:ring-slate-10"
              @input="applyCustomWidth(Number(($event.target as HTMLInputElement).value))"
            >
          </div>
          <div class="flex w-full items-center justify-between gap-2 text-sm">
            <span class="font-medium text-slate-11 text-xs">Height</span>
            <input
              type="number"
              :value="internalHeight"
              :min="minHeight"
              class="w-20 appearance-none rounded-lg border border-slate-6 bg-slate-5 px-1 py-1 text-sm text-slate-12 outline-none transition duration-300 ease-in-out focus:ring-1 focus:ring-slate-10"
              @input="applyCustomHeight(Number(($event.target as HTMLInputElement).value))"
            >
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>
