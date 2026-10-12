<script setup lang="ts">
const { toasts, dismiss } = useToast()

function runAction(id: number, action?: () => void) {
  action?.()
  dismiss(id)
}
</script>

<template>
  <div class="host" role="status" aria-live="polite">
    <TransitionGroup name="toast">
      <div v-for="toast in toasts" :key="toast.id" class="toast">
        <span class="check" aria-hidden="true">✓</span>
        <p class="message">{{ toast.message }}</p>
        <button
          v-if="toast.actionLabel"
          type="button"
          class="action"
          @click="runAction(toast.id, toast.onAction)"
        >{{ toast.actionLabel }}</button>
        <button type="button" class="close" aria-label="Fermer la notification" @click="dismiss(toast.id)">×</button>
      </div>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.host {
  position: fixed;
  right: var(--s-3);
  bottom: var(--s-3);
  left: var(--s-3);
  z-index: 60;
  display: grid;
  gap: var(--s-2);
  justify-items: end;
  pointer-events: none;
}

.toast {
  display: flex;
  align-items: center;
  gap: var(--s-3);
  width: min(100%, 440px);
  padding: var(--s-3) var(--s-3) var(--s-3) var(--s-4);
  border-radius: var(--radius);
  background: var(--c-graphite);
  color: var(--c-white);
  box-shadow: 0 16px 40px -12px rgb(0 0 0 / 0.5);
  pointer-events: auto;
}

.check {
  display: grid;
  flex: none;
  place-items: center;
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: var(--c-gold);
  font-size: 0.75rem;
  font-weight: 700;
}

.message {
  flex: 1;
  font-size: var(--fs-small);
}

.action {
  flex: none;
  padding: var(--s-2) var(--s-3);
  border: 1px solid rgb(255 255 255 / 0.4);
  border-radius: var(--radius);
  background: none;
  color: inherit;
  font-size: var(--fs-small);
  font-weight: 600;
  cursor: pointer;
}

.action:hover {
  background: rgb(255 255 255 / 0.12);
}

.close {
  flex: none;
  width: 28px;
  height: 28px;
  border: 0;
  background: none;
  color: rgb(255 255 255 / 0.7);
  font-size: 1.25rem;
  line-height: 1;
  cursor: pointer;
}

.close:hover {
  color: var(--c-white);
}

.toast-enter-active,
.toast-leave-active {
  transition: opacity 0.25s ease-out, transform 0.3s var(--ease);
}

.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(12px);
}

@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition: none;
  }
}
</style>
