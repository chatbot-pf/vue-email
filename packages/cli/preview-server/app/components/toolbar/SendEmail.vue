<script setup lang="ts">
const props = defineProps<{
  emailSlug: string
  html: string
}>()

const toast = useToast()

const to = ref('')
const subject = ref(props.emailSlug)
const sending = ref(false)
const lastResult = ref<{ id: string } | null>(null)
const lastError = ref<string | null>(null)
const hasApiKey = ref<boolean | null>(null)

async function checkApiKey() {
  try {
    const res = await $fetch<{ configured: boolean }>('/api/resend-status')
    hasApiKey.value = res.configured
  }
  catch {
    hasApiKey.value = false
  }
}

async function send() {
  if (!to.value.trim()) {
    toast.add({ title: 'Please enter a recipient email address.', color: 'error' })
    return
  }

  sending.value = true
  lastResult.value = null
  lastError.value = null

  try {
    const result = await $fetch<{ id: string }>('/api/send-email', {
      method: 'POST',
      body: {
        to: to.value.trim(),
        subject: subject.value || props.emailSlug,
        html: props.html,
      },
    })
    lastResult.value = result
    toast.add({ title: 'Email sent successfully!', color: 'success' })
  }
  catch (err: any) {
    const message = err?.data?.statusMessage ?? err?.message ?? 'Failed to send email'
    lastError.value = message
    toast.add({ title: message, color: 'error' })
  }
  finally {
    sending.value = false
  }
}

onMounted(checkApiKey)
</script>

<template>
  <div class="p-4">
    <template v-if="hasApiKey === false">
      <div class="flex flex-col items-center justify-center pt-4 text-center">
        <p class="text-slate-11 text-sm mb-2">
          Resend API key not configured.
        </p>
        <p class="text-slate-11 text-xs">
          Run <code class="bg-slate-800 px-1 rounded text-slate-12">mail-please resend setup</code> in your terminal.
        </p>
      </div>
    </template>
    <template v-else>
      <div class="flex flex-col gap-3 max-w-md">
        <UFormField label="To">
          <UInput
            v-model="to"
            type="email"
            placeholder="recipient@example.com"
            class="w-full"
            :disabled="sending"
          />
        </UFormField>
        <UFormField label="Subject">
          <UInput
            v-model="subject"
            type="text"
            :placeholder="emailSlug"
            class="w-full"
            :disabled="sending"
          />
        </UFormField>
        <UButton
          color="primary"
          :loading="sending"
          :disabled="sending"
          @click="send"
        >
          Send Test Email
        </UButton>
        <p v-if="lastResult" class="text-green-400 text-xs">
          Sent! ID: {{ lastResult.id }}
        </p>
        <p v-if="lastError" class="text-red-400 text-xs">
          {{ lastError }}
        </p>
      </div>
    </template>
  </div>
</template>
