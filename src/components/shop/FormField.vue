<script setup lang="ts">
const props = withDefaults(defineProps<{
  id: string
  label: string
  modelValue: string
  error?: string
  type?: string
  autocomplete?: string
  inputmode?: 'text' | 'numeric' | 'tel' | 'email'
  placeholder?: string
  required?: boolean
  maxlength?: number
}>(), {
  type: 'text',
  required: true
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const errorId = computed(() => `${props.id}-error`)

function onInput(event: Event) {
  emit('update:modelValue', (event.target as HTMLInputElement).value)
}
</script>

<template>
  <div class="field">
    <label :for="id">{{ label }}<span v-if="!required" class="optional"> (facultatif)</span></label>
    <input
      :id="id"
      :value="modelValue"
      :type="type"
      :autocomplete="autocomplete"
      :inputmode="inputmode"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? errorId : undefined"
      @input="onInput"
    >
    <p v-if="error" :id="errorId" class="error" role="alert">{{ error }}</p>
  </div>
</template>

<style scoped>
.field {
  display: grid;
  gap: var(--s-1);
}

label {
  font-size: 0.75rem;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  color: var(--fg-muted);
}

.optional {
  text-transform: none;
  letter-spacing: 0;
}

input {
  min-height: 48px;
  padding: 0 var(--s-3);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: var(--bg);
  color: var(--fg);
  font: inherit;
}

input:hover {
  border-color: var(--fg-muted);
}

input[aria-invalid='true'] {
  border-color: #b3261e;
}

.error {
  font-size: var(--fs-small);
  color: #b3261e;
}
</style>
