<template>
  <transition :name="transitionName">
    <div v-if="isVisible" :class="[
      'fixed p-4 rounded-lg shadow-lg flex flex-col z-[2000]',
      positionClass,
      typeClass,
      customClasses,
    ]" :style="customStyles" role="alert" aria-live="assertive">
      <div :class="['flex items-center space-x-3', { 'mb-4': showConfirmButtons || type === 'prompt' }]">
        <div class="flex-shrink-0">
          <i v-if="type === 'success'" class="ri-check-line h-6 w-6 text-green-800"></i>
          <i v-else-if="type === 'error'" class="ri-close-line h-6 w-6 text-red-800"></i>
          <i v-else-if="type === 'warning'" class="ri-alert-line h-6 w-6 text-yellow-800"></i>
          <i v-else-if="type === 'info'" class="ri-information-line h-6 w-6 text-blue-800"></i>
          <i v-else-if="type === 'confirm'" class="ri-delete-bin-line h-6 w-6 text-red-800"></i>
          <!-- Nouvelle icône pour le type 'prompt' -->
          <i v-else-if="type === 'prompt'" class="ri-question-line h-6 w-6 text-blue-800"></i>
          <slot name="icon"></slot>
        </div>

        <div class="flex-1">
          <p :class="['font-medium', textClass]">
            <slot>{{ message }}</slot>
          </p>
          <input v-if="type === 'prompt'" v-model="inputValue" type="text" :placeholder="inputPlaceholder"
            class="mt-2 p-2 w-full border rounded-md text-gray-800" @keyup.enter="handlePrompt(true)" />
        </div>

        <!-- Bouton de fermeture pour les notifications standard -->
        <div v-if="dismissible && type !== 'confirm' && type !== 'prompt'" class="ml-auto pl-3">
          <div class="-mx-1.5 -my-1.5">
            <button @click="hide"
              :class="['inline-flex rounded-md p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2', dismissButtonClasses]">
              <span class="sr-only">Dismiss</span>
              <i class="ri-close-line h-5 w-5"></i>
            </button>
          </div>
        </div>
      </div>

      <!-- Boutons de confirmation/annulation pour 'confirm' et 'prompt' - déplacés en bas et centrés -->
      <div v-if="showConfirmButtons || type === 'prompt'" class="flex justify-center space-x-2 mt-4">
        <button v-if="showConfirmButtons" @click="handleConfirm(true)"
          :class="['px-3 py-1 text-white rounded-md hover:opacity-80 transition-colors', confirmButtonClass]">
          {{ confirmText }}
        </button>
        <button v-if="showConfirmButtons" @click="handleConfirm(false)"
          class="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
          {{ cancelText }}
        </button>
        <button v-if="type === 'prompt'" @click="handlePrompt(true)"
          class="px-3 py-1 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
          {{ promptConfirmText }}
        </button>
        <button v-if="type === 'prompt'" @click="handlePrompt(false)"
          class="px-3 py-1 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors">
          {{ promptCancelText }}
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, onUnmounted } from 'vue';

type NotificationType = 'success' | 'error' | 'warning' | 'info' | 'confirm' | 'prompt';
type NotificationPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'center' | 'top-center' | 'bottom-center';

const props = withDefaults(
  defineProps<{
    type?: NotificationType;
    message?: string;
    duration?: number; // 0 pour infini
    dismissible?: boolean;
    position?: NotificationPosition;
    customClasses?: string; // Classes Tailwind personnalisées pour le conteneur
    customStyles?: Record<string, string>; // Styles CSS personnalisés pour le conteneur
    // Props spécifiques au mode 'confirm'
    confirmMessage?: string;
    confirmText?: string;
    cancelText?: string;
    // Props spécifiques au mode 'prompt'
    inputPlaceholder?: string;
    defaultValue?: string;
    promptConfirmText?: string;
    promptCancelText?: string;
  }>(),
  {
    type: 'info',
    message: 'Ceci est une notification.',
    duration: 3000,
    dismissible: true,
    position: 'top-right',
    customClasses: '',
    customStyles: () => ({}),
    confirmMessage: 'Êtes-vous sûr de vouloir continuer ?',
    confirmText: 'Confirmer',
    cancelText: 'Annuler',
    inputPlaceholder: 'Entrez votre texte ici...',
    defaultValue: '',
    promptConfirmText: 'OK',
    promptCancelText: 'Annuler',
  }
);

const emit = defineEmits<{
  (e: 'confirmed', value: boolean): void;
  (e: 'promptResponse', value: string | null): void; // Pour le type 'prompt'
  (e: 'dismissed'): void;
  (e: 'closed'): void; // Émis quand la notification se ferme (auto ou manuellement)
}>();

const isVisible = ref(false);
const inputValue = ref(props.defaultValue);
let timer: ReturnType<typeof setTimeout> | null = null;

// Détermine le nom de la transition en fonction du type ou de la position
const transitionName = computed(() => {
  if (props.type === 'confirm' || props.type === 'prompt') {
    return 'slide-down'; // Nouvelle transition pour les modales centrales
  }
  // Pour les autres notifications, utilisez la transition par défaut 'fade' ou une transition basée sur la position
  if (props.position === 'top-right' || props.position === 'top-left') {
    return 'fade-from-top';
  }
  if (props.position === 'bottom-right' || props.position === 'bottom-left') {
    return 'fade-from-bottom';
  }
  return 'fade'; // Fallback pour les autres positions ou types
});

const typeClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'bg-green-50 text-green-800 ring-1 ring-green-300';
    case 'error':
      return 'bg-red-50 text-red-800 ring-1 ring-red-300';
    case 'warning':
      return 'bg-yellow-50 text-yellow-800 ring-1 ring-yellow-300';
    case 'info':
      return 'bg-blue-50 text-blue-800 ring-1 ring-blue-300';
    case 'confirm':
      return 'bg-red-50 text-red-800 ring-1 ring-red-300'; // Rouge pour le type 'confirm'
    case 'prompt':
      return 'bg-blue-50 text-blue-800 ring-1 ring-blue-300';
    default:
      return 'bg-gray-50 text-gray-800 ring-1 ring-gray-300';
  }
});

const textClass = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-800';
    case 'error':
      return 'text-red-800';
    case 'warning':
      return 'text-yellow-800';
    case 'info':
      return 'text-blue-800';
    case 'confirm':
      return 'text-red-800'; // Texte rouge pour le type 'confirm'
    case 'prompt':
      return 'text-blue-800';
    default:
      return 'text-gray-800';
  }
});

const dismissButtonClasses = computed(() => {
  switch (props.type) {
    case 'success':
      return 'text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50';
    case 'error':
      return 'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50';
    case 'warning':
      return 'text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50';
    case 'info':
      return 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50';
    case 'confirm':
      return 'text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50'; // Rouge pour le type 'confirm'
    case 'prompt':
      return 'text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50';
    default:
      return 'text-gray-500 hover:bg-gray-100 focus:ring-gray-600 focus:ring-offset-gray-50';
  }
});

const confirmButtonClass = computed(() => {
  if (props.type === 'confirm') {
    return 'bg-red-600 hover:bg-red-700'; // Bouton de confirmation rouge pour le type 'confirm'
  }
  return 'bg-blue-600 hover:bg-blue-700';
});

const positionClass = computed(() => {
  const baseClasses = 'fixed';
  switch (props.position) {
    case 'top-right':
      return `${baseClasses} top-24 md:top-4 right-4`;
    case 'top-left':
      return `${baseClasses} top-24 md:top-4 left-4`;
    case 'bottom-right':
      return `${baseClasses} bottom-4 right-4`;
    case 'bottom-left':
      return `${baseClasses} bottom-4 left-4`;
    case 'center':
      // Pour les modales centrées, nous voulons qu'elles soient un peu plus larges et bien centrées
      return `${baseClasses} top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw]`;
    case 'top-center':
      return `${baseClasses} top-4 left-1/2 -translate-x-1/2`;
    case 'bottom-center':
      return `${baseClasses} bottom-4 left-1/2 -translate-x-1/2`;
    default:
      return `${baseClasses} top-4 right-4`;
  }
});

const showConfirmButtons = computed(() => props.type === 'confirm');

function show() {
  isVisible.value = true;
  inputValue.value = props.defaultValue; // Réinitialise la valeur de l'input à chaque affichage
  if (props.duration > 0 && props.type !== 'confirm' && props.type !== 'prompt') {
    clearTimeout(timer as ReturnType<typeof setTimeout>);
    timer = setTimeout(() => {
      hide();
    }, props.duration);
  }
}

function hide() {
  isVisible.value = false;
  clearTimeout(timer as ReturnType<typeof setTimeout>);
  emit('closed');
}

function handleConfirm(value: boolean) {
  emit('confirmed', value);
  hide();
}

function handlePrompt(confirmed: boolean) {
  if (confirmed) {
    emit('promptResponse', inputValue.value);
  } else {
    emit('promptResponse', null);
  }
  hide();
}

defineExpose({
  show,
  hide,
});

onUnmounted(() => {
  clearTimeout(timer as ReturnType<typeof setTimeout>);
});
</script>

<style scoped>
/* Transition par défaut (fade) pour les notifications non-modales */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Transitions pour les notifications venant du haut (top-right, top-left) */
.fade-from-top-enter-active,
.fade-from-top-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-from-top-enter-from {
  opacity: 0;
  transform: translateY(-100%);
  /* Vient du haut */
}

.fade-from-top-leave-to {
  opacity: 0;
  transform: translateY(-100%);
  /* Part vers le haut */
}

/* Transitions pour les notifications venant du bas (bottom-right, bottom-left) */
.fade-from-bottom-enter-active,
.fade-from-bottom-leave-active {
  transition: opacity 0.5s ease, transform 0.5s ease;
}

.fade-from-bottom-enter-from {
  opacity: 0;
  transform: translateY(100%);
  /* Vient du bas */
}

.fade-from-bottom-leave-to {
  opacity: 0;
  transform: translateY(100%);
  /* Part vers le bas */
}

/* Nouvelle transition pour les modales (confirm, prompt) du haut vers le bas */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.5s ease-in-out;
}

.slide-down-enter-from,
.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-100%) translateX(-50%);
  /* Descend depuis le haut */
}

.slide-down-enter-to,
.slide-down-leave-from {
  opacity: 1;
  transform: translateY(-50%) translateX(-50%);
  /* Position finale centrée */
}
</style>
