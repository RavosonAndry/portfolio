<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import { useSkillStore } from '../stores/skillStore';
import type { Skill } from '../types/skills.ts';
import { useAuthStore } from '../stores/authStore.ts'
import Notification from './Notification.vue'

const notifRef = ref();
const skillIdToDelete = ref<string | null>(null);
const authStore = useAuthStore();
const skillStore = useSkillStore();
const isEditing = ref(false);
const editingId = ref<string | null>(null);

const showModal = ref(false);
const form = ref<Skill>({ name: '', category: 'tech', level: 80 });

// Refs pour le scroll
const techScrollRef = ref<HTMLElement | null>(null);
const indusScrollRef = ref<HTMLElement | null>(null);

const scrollState = ref({
  tech: { top: false, bottom: false },
  indus: { top: false, bottom: false }
});

const checkScroll = (el: HTMLElement | null, key: 'tech' | 'indus') => {
  if (!el) return;
  const { scrollTop, scrollHeight, clientHeight } = el;
  // On affiche si le scroll est possible (marge de 5px)
  scrollState.value[key].top = scrollTop > 5;
  scrollState.value[key].bottom = scrollTop + clientHeight < scrollHeight - 5;
};

const openEdit = (skill: Skill) => {
  form.value = { ...skill };
  editingId.value = skill.id || null;
  isEditing.value = true;
  showModal.value = true;
};
// Fonction pour réinitialiser le formulaire proprement
const closeModal = () => {
  showModal.value = false;
  isEditing.value = false;
  editingId.value = null;
  form.value = { name: '', category: 'tech', level: 80 };
};
// Fonction pour forcer le check sur toutes les listes
const updateAllScrolls = () => {
  nextTick(() => {
    checkScroll(techScrollRef.value, 'tech');
    checkScroll(indusScrollRef.value, 'indus');
  });
};
onMounted(async () => {
  await skillStore.fetchSkills();
  // On attend que les données soient affichées pour calculer le scroll initial
  setTimeout(updateAllScrolls, 600);
  window.addEventListener('resize', updateAllScrolls);
});

const handleSave = async () => {
  try {
    if (isEditing.value && editingId.value) {
      // MODE ÉDITION
      await skillStore.updateSkill(editingId.value, { ...form.value });
    } else {
      // MODE AJOUT
      await skillStore.addSkill({ ...form.value });
    }

    closeModal(); // Ferme et reset

    // Recalculer le scroll après mise à jour du DOM
    nextTick(() => {
      checkScroll(techScrollRef.value, 'tech');
      checkScroll(indusScrollRef.value, 'indus');
    });
  } catch (e) {
    console.error("Erreur lors de la sauvegarde:", e);
  }
};

const handleDelete = (id: string | undefined) => {
  if (id) {
    skillIdToDelete.value = id;
    notifRef.value.show();
  }
};

const onConfirmDelete = async (confirmed: boolean) => {
  if (confirmed && skillIdToDelete.value) {
    try {
      await skillStore.deleteSkill(skillIdToDelete.value);
      nextTick(() => {
        checkScroll(techScrollRef.value, 'tech');
        checkScroll(indusScrollRef.value, 'indus');
      });
    } catch (e) {
      console.error(e);
    } finally {
      skillIdToDelete.value = null;
    }
  }
};
</script>

<template>
  <div
    class="relative min-h-dvh w-full flex flex-col justify-center items-center bg-transparent pt-16 md:pt-24 overflow-hidden">

    <!-- TITRE -->
    <div class="z-20 self-start px-10 mb-4 md:mb-9 w-full max-w-7xl mx-auto">
      <h2
        class="font-montserrat text-lg md:text-2xl font-black uppercase text-[#1a2b3c] tracking-tighter leading-none">
        Stack &<br>Compétences
      </h2>
      <div class="h-1 w-12 bg-teal-600 mt-2"></div>
    </div>

    <!-- CONTENEUR CAROUSEL (Hauteur adaptée) -->
    <div class="relative w-full max-w-5xl mx-auto px-0 lg:px-10">
      <div
        class="flex flex-row gap-4 lg:gap-8 w-full overflow-x-auto snap-x snap-mandatory no-scrollbar px-6 lg:px-10 py-5 -my-8">

        <!-- CARTE TECH -->
        <div
          class="min-w-[95%] lg:min-w-0 lg:flex-1 bg-white rounded-[1rem] md:rounded-[2rem] shadow-xl p-6 md:p-8 flex flex-col h-[60vh] md:max-h-[450px] snap-center border border-white/50 relative">
          <h3 class="font-montserrat text-sm md:text-base font-black text-teal-600 uppercase mb-4 tracking-wider">Tech
          </h3>

          <div class="relative flex-1 overflow-hidden">
            <!-- Brouillard Haut -->
            <div v-if="scrollState.tech.top"
              class="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none flex justify-center items-start">
              <svg class="w-5 h-5 text-teal-600 animate-bounce mt-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 15l7-7 7 7" />
              </svg>
            </div>

            <div ref="techScrollRef" @scroll="checkScroll(techScrollRef, 'tech')"
              class="h-full overflow-y-auto custom-scrollbar space-y-2 pr-1">
              <div v-for="skill in skillStore.techSkills" :key="skill.id"
                class="flex justify-between items-center p-4 border-b border-gray-50 group">
                <span class="font-bold text-gray-700 text-xs md:text-md">{{ skill.name }}</span>
                <div class="flex items-center gap-1">
                  <span class="text-[9px] md:text-xs font-black text-teal-600 bg-teal-50 px-1.5 py-0.5 rounded">{{
                    skill.level }}%</span>
                  <div v-if="authStore.isAdmin" class="flex gap-1">
                    <button @click="openEdit(skill)" class="text-blue-400 hover:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button @click="handleDelete(skill.id)" class="text-red-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Brouillard Bas -->
            <div v-if="scrollState.tech.bottom"
              class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none flex justify-center items-end">
              <svg class="w-5 h-5 text-teal-600 animate-bounce mb-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        <!-- CARTE INDUSTRIE -->
        <div
          class="min-w-[95%] lg:min-w-0 lg:flex-1 bg-white rounded-[1rem] md:rounded-[1.5rem] shadow-xl p-6 md:p-8 flex flex-col h-[60vh] md:max-h-[450px] snap-center border border-white/50 relative">
          <h3 class="font-montserrat text-sm md:text-lg font-black text-orange-500 uppercase mb-4 tracking-wider">
            Industrie</h3>

          <div class="relative flex-1 overflow-hidden">
            <!-- Brouillard Haut -->
            <div v-if="scrollState.indus.top"
              class="absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white via-white/80 to-transparent z-10 pointer-events-none flex justify-center items-start">
              <svg class="w-5 h-5 text-orange-500 animate-bounce mt-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M5 15l7-7 7 7" />
              </svg>
            </div>

            <div ref="indusScrollRef" @scroll="checkScroll(indusScrollRef, 'indus')"
              class="h-full overflow-y-auto custom-scrollbar space-y-2 pr-1">
              <div v-for="skill in skillStore.indusSkills" :key="skill.id"
                class="flex justify-between items-center p-4 border-b border-gray-50 group">
                <span class="font-bold text-gray-700 text-xs md:text-sm">{{ skill.name }}</span>
                <div class="flex items-center gap-2">
                  <span class="text-[9px] md:text-xs font-black text-orange-500 bg-orange-50 px-1.5 py-0.5 rounded">{{
                    skill.level }}%</span>
                  <div v-if="authStore.isAdmin" class="flex gap-1">
                    <button @click="openEdit(skill)" class="text-blue-400 hover:text-blue-600 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                    <button @click="handleDelete(skill.id)" class="text-red-300 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Brouillard Bas -->
            <div v-if="scrollState.indus.bottom"
              class="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white via-white/80 to-transparent z-10 pointer-events-none flex justify-center items-end">
              <svg class="w-5 h-5 text-orange-500 animate-bounce mb-1" fill="none" viewBox="0 0 24 24"
                stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- BOUTON AJOUT -->
    <button v-if="authStore.isAdmin" @click="showModal = true"
      class="absolute bottom-10 right-6 bg-[#111827] text-white w-14 h-14 rounded-full shadow-2xl flex items-center justify-center z-50 active:scale-90 transition-transform">
      <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
        stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
    </button>


    <Teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[300] flex items-center justify-center p-4"
        @click="showModal = false">
        <div class="bg-white p-8 rounded-[2rem] w-full max-w-md font-montserrat" @click.stop>
          <h2 class="text-xl font-black mb-6 uppercase">Ajouter une compétence</h2>
          <div class="space-y-6">
            <input v-model="form.name" placeholder="Nom..."
              class="w-full p-4 bg-gray-100 rounded-2xl outline-none font-bold">
            <div class="grid grid-cols-2 gap-4">
              <button @click="form.category = 'tech'"
                :class="form.category === 'tech' ? 'bg-teal-600 text-white' : 'bg-gray-100'"
                class="py-3 rounded-xl font-black uppercase text-[10px]">Tech</button>
              <button @click="form.category = 'indus'"
                :class="form.category === 'indus' ? 'bg-orange-500 text-white' : 'bg-gray-100'"
                class="py-3 rounded-xl font-black uppercase text-[10px]">Industrie</button>
            </div>
            <div class="space-y-2">
              <div class="flex justify-between"><label
                  class="text-[10px] font-black uppercase text-gray-400">Maîtrise</label><span class="font-black">{{
                    form.level }}%</span></div>
              <input type="range" v-model="form.level" min="0" max="100" class="w-full accent-teal-600">
            </div>
            <div class="flex gap-4 pt-4">
              <button @click="showModal = false" class="flex-1 text-gray-400 font-bold">Annuler</button>
              <button @click="handleSave" :class="form.category === 'tech' ? 'bg-teal-600' : 'bg-orange-500'"
                class="flex-1 py-4 text-white rounded-2xl font-black">Sauvegarder</button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
  <Notification ref="notifRef" type="confirm" message="Voulez-vous vraiment supprimer cette compétence ?"
    @confirmed="onConfirmDelete" />
</template>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 10px;
}
</style>
