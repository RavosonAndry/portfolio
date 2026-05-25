<script setup lang="ts">
import { ref, onMounted, nextTick, watch, onUnmounted, computed} from 'vue';
import { useProjectStore } from '../stores/projectStore';
import { useAuthStore } from '../stores/authStore.ts'
import Notification from './Notification.vue'

const sortOrder = ref<'asc' | 'desc'>('desc');

const notifRef = ref();
const projectIdToDelete = ref<string | null>(null);
const authStore = useAuthStore();
const IMGBB_API_KEY = import.meta.env.VITE_IMGBB_API_KEY;
const projectStore = useProjectStore();
const showModal = ref(false);
const scrollContainer = ref<HTMLElement | null>(null);

const selectedFile = ref<File | null>(null);
const imagePreview = ref<string | null>(null);
const isUploading = ref(false);

const IMG_DEV = "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1000";
const IMG_INDUS = "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop";

const form = ref({ name: '', description: '', link: '', category: 'dev' as 'dev' | 'indus', imageUrl: '' });

// --- LOGIQUE SCROLL & ANIMATION ---
const canScrollLeft = ref(false);
const canScrollRight = ref(false);
let observer: IntersectionObserver | null = null;

// Logique de tri
const sortedProjects = computed(() => {
  return [...projectStore.projects].sort((a, b) => {
    const dateA = a.createdAt || 0;
    const dateB = b.createdAt || 0;
    return sortOrder.value === 'desc' ? dateB - dateA : dateA - dateB;
  });
});

const toggleSort = () => {
  sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
};

// MODIFICATION DU WATCHER : On observe sortedProjects au lieu de projectStore.projects
watch(sortedProjects, async () => {
  await nextTick();
  initFocusEffect();
  handleScroll();
}, { deep: true });
const handleScroll = () => {
  if (scrollContainer.value) {
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
    // canScrollLeft si on a défilé de plus de 10px
    canScrollLeft.value = scrollLeft > 10;
    // canScrollRight si la position actuelle + largeur vue est inférieure à la largeur totale (marge de 10px)
    canScrollRight.value = Math.ceil(scrollLeft + clientWidth) < scrollWidth - 10;
  }
};

const scroll = (direction: 'left' | 'right') => {
  if (scrollContainer.value) {
    const { clientWidth } = scrollContainer.value;
    const scrollAmount = clientWidth * 0.85;
    scrollContainer.value.scrollBy({ 
      left: direction === 'right' ? scrollAmount : -scrollAmount, 
      behavior: 'smooth' 
    });
  }
};

const initFocusEffect = () => {
  if (observer) observer.disconnect();

  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const card = entry.target as HTMLElement;
      if (entry.isIntersecting && entry.intersectionRatio > 0.7) {
        card.classList.add('focused'); 
        card.classList.remove('dimmed');
      } else {
        card.classList.remove('focused'); 
        card.classList.add('dimmed');
      }
    });
  }, { 
    root: scrollContainer.value, 
    threshold: [0.1, 0.7, 0.9] 
  });

  document.querySelectorAll('.project-card').forEach(el => observer?.observe(el));
};

// Ré-initialiser l'effet et les flèches dès que les projets changent (chargement ou modif)
watch(() => projectStore.projects, async () => {
  await nextTick();
  initFocusEffect();
  handleScroll();
}, { deep: true });

onMounted(async () => {
  await projectStore.fetchProjects();
  // Double sécurité : init au montage si les projets sont déjà là
  nextTick(() => {
    initFocusEffect();
    handleScroll();
  });
});

onUnmounted(() => {
  if (observer) observer.disconnect();
});

// --- LOGIQUE ADMIN ---
const onFileSelected = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    selectedFile.value = target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => { imagePreview.value = e.target?.result as string; };
    reader.readAsDataURL(selectedFile.value);
  }
};

const handleSave = async () => {
  if (!form.value.name) return alert("Nom requis");
  isUploading.value = true;
  try {
    let finalImageUrl = form.value.category === 'dev' ? IMG_DEV : IMG_INDUS;
    if (selectedFile.value) {
      const formData = new FormData();
      formData.append('image', selectedFile.value);
      const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (data.success) finalImageUrl = data.data.url;
    }
    await projectStore.addProject({ ...form.value, imageUrl: finalImageUrl });
    showModal.value = false;
    form.value = { name: '', description: '', link: '', category: 'dev', imageUrl: '' };
    selectedFile.value = null;
    imagePreview.value = null;
  } catch (error) {
    console.error("Erreur:", error);
  } finally {
    isUploading.value = false;
  }
};

const handleDelete = (id: string | undefined) => {
  if (id) {
    projectIdToDelete.value = id;
    notifRef.value.show();
  }
};

const onConfirmDelete = async (confirmed: boolean) => {
  if (confirmed && projectIdToDelete.value) {
    await projectStore.deleteProject(projectIdToDelete.value);
    projectIdToDelete.value = null;
  }
};
</script>

<template>
  <section class="relative h-dvh w-full flex flex-col justify-center bg-transparent overflow-hidden pt-14 lg:pt-18 pb-8">

    <!-- HEADER PROJET -->
    <div class="px-10 md:px-20 mb-2 z-20 flex justify-between items-end shrink-0">
      <div class="flex flex-col">
        <h2 class="font-montserrat text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter">Mes Projets</h2>
        <div class="h-1 w-12 bg-orange-500 mt-1"></div>
      </div>
        <!-- BOUTON TRI (Admin uniquement) -->
        <button v-if="authStore.isAdmin" @click="toggleSort" 
                class="flex items-center gap-1 px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors group">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600 group-hover:text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span class="text-[10px] font-bold uppercase text-gray-500">{{ sortOrder === 'desc' ? 'Récents' : 'Anciens' }}</span>
        </button>
      <!-- Flèches Mobile -->
      <div class="flex gap-2 lg:hidden mb-1 h-10">
        <Transition name="fade">
          <button v-if="canScrollLeft" @click="scroll('left')"
            class="w-10 h-10 bg-white shadow-lg rounded-full text-orange-500 flex items-center justify-center border border-gray-100 active:scale-90 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        </Transition>

        <Transition name="fade">
          <button v-if="canScrollRight" @click="scroll('right')"
            class="w-10 h-10 bg-white shadow-lg rounded-full text-orange-500 flex items-center justify-center border border-gray-100 active:scale-90 transition-transform">
            <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </Transition>
      </div>
    </div>

    <!-- CAROUSEL -->
    <div class="w-full relative z-10">
      <div ref="scrollContainer" @scroll="handleScroll"
        class="flex items-center gap-4 md:gap-6 overflow-x-auto snap-x snap-mandatory no-scrollbar py-4 -my-4">
        
        <!-- Spacer initial -->
        <div class="min-w-[10%] md:min-w-[25%] h-10 shrink-0"></div>

        <div v-for="project in sortedProjects" :key="project.id"
          class="project-card min-w-[240px] md:min-w-[300px] h-[320px] md:h-[360px] snap-center transition-all duration-500 ease-out relative">

          <!-- BOUTON SUPPRIMER (Admin) -->
          <button v-if="authStore.isAdmin" @click.stop.prevent="handleDelete(project.id)"
            class="absolute top-4 right-4 z-50 bg-white/90 backdrop-blur-md text-red-500 p-2 rounded-2xl shadow-xl active:scale-95 transition-all">
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <a :href="project.link" target="_blank"
            class="block w-full h-full bg-white rounded-[1.5rem] md:rounded-[3rem] shadow-2xl overflow-hidden relative group border border-white/50">
            
            <div class="h-[45%] md:h-2/3 w-full relative overflow-hidden">
              <img :src="project.imageUrl || (project.category === 'dev' ? IMG_DEV : IMG_INDUS)"
                class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000">
              <div class="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
              
              <div class="absolute top-5 left-5 p-3 rounded-2xl backdrop-blur-md"
                :class="project.category === 'dev' ? 'bg-teal-600/90' : 'bg-orange-500/90'">
                <svg v-if="project.category === 'dev'" class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path d="M17.25 6.75 22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3-4.5 16.5" />
                </svg>
                <svg v-else class="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
                  <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                </svg>
              </div>
            </div>

            <div class="p-3 md:p-4 h-[55%] md:h-1/3 flex flex-col">
              <h3 class="text-xl md:text-xl font-black uppercase mb-1 line-clamp-1"
                :class="project.category === 'dev' ? 'text-teal-600' : 'text-orange-500'">{{ project.name }}</h3>
              <p class="text-gray-500 text-sm font-medium italic line-clamp-4 md:line-clamp-1">{{ project.description }}</p>
              
              <div class="mt-auto flex justify-between items-center">
                 <div class="text-[9px] font-black uppercase text-gray-300 tracking-[0.2em]">Détails du projet →</div>
                 <div class="h-1 w-8 rounded-full" :class="project.category === 'dev' ? 'bg-teal-600/20' : 'bg-orange-500/20'"></div>
              </div>
            </div>
          </a>
        </div>

        <!-- Spacer final -->
        <div class="min-w-[10%] md:min-w-[30%] h-10 shrink-0"></div>
      </div>
    </div>

    <!-- BOUTON AJOUT (Admin) -->
    <button v-if="authStore.isAdmin" @click="showModal = true"
      class="absolute bottom-10 right-6 bg-gray-900 text-white w-14 h-14 rounded-full shadow-2xl z-50 flex items-center justify-center hover:bg-orange-500 transition-all active:scale-90">
      <svg class="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    </button>

    <!-- MODAL -->
    <Teleport to="body">
      <div v-if="showModal"
        class="fixed inset-0 bg-black/80 backdrop-blur-md z-[200] flex items-center justify-center p-4"
        @click="showModal = false">
        <div class="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] overflow-hidden" @click.stop>
          <div class="px-8 pt-8 pb-2">
            <h2 class="text-2xl font-black uppercase tracking-tighter text-gray-800">Nouveau Projet</h2>
          </div>
          <div class="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
            <label class="relative flex flex-col items-center justify-center w-full h-40 border-4 border-dashed border-gray-100 rounded-[2rem] cursor-pointer hover:bg-gray-50 transition-all overflow-hidden">
              <img v-if="imagePreview" :src="imagePreview" class="absolute inset-0 w-full h-full object-cover">
              <div v-if="!imagePreview" class="flex flex-col items-center">
                <p class="text-[10px] font-black text-gray-300 uppercase">Ajouter une image</p>
              </div>
              <input type="file" class="hidden" @change="onFileSelected" accept="image/*" />
            </label>
            <div class="space-y-4">
              <input v-model="form.name" placeholder="Nom du projet" class="w-full p-4 bg-gray-100 rounded-2xl outline-none font-bold">
              <textarea v-model="form.description" placeholder="Description" rows="3" class="w-full p-4 bg-gray-100 rounded-2xl outline-none text-sm"></textarea>
              <input v-model="form.link" placeholder="Lien (URL)" class="w-full p-4 bg-gray-100 rounded-2xl outline-none text-blue-500">
              <div class="grid grid-cols-2 gap-4">
                <button @click="form.category = 'dev'" :class="form.category === 'dev' ? 'bg-teal-600 text-white' : 'bg-gray-100'" class="py-3 rounded-xl font-black uppercase text-[10px]">Développement</button>
                <button @click="form.category = 'indus'" :class="form.category === 'indus' ? 'bg-orange-500 text-white' : 'bg-gray-100'" class="py-3 rounded-xl font-black uppercase text-[10px]">Industrie</button>
              </div>
            </div>
            <div class="flex gap-4 pt-4 sticky bottom-0 bg-white">
              <button @click="showModal = false" class="flex-1 font-bold text-gray-400">Annuler</button>
              <button @click="handleSave" :disabled="isUploading" class="flex-[2] py-4 bg-gray-900 text-white rounded-2xl font-black disabled:opacity-50">
                {{ isUploading ? 'UPLOAD...' : 'PUBLIER' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </section>

  <Notification ref="notifRef" type="confirm" message="Supprimer ce projet définitivement ?" confirmText="Supprimer"
    cancelText="Annuler" position="center" @confirmed="onConfirmDelete" />
</template>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
  transform: scale(0.8) translateY(10px);
}

.no-scrollbar::-webkit-scrollbar { display: none; }

.project-card {
  transform: scale(0.9);
  opacity: 0.9;
  transition: all 0.5s ease-out;
}

/* On force l'état focused même si dimmed est présent */
.project-card.focused {
  transform: scale(1) !important;
  opacity: 1 !important;
  filter: blur(0) !important;
  z-index: 10;
}

.project-card.dimmed {
  transform: scale(0.85);
  opacity: 0.3;
  filter: blur(4px);
}

@media (max-width: 768px) {
  .project-card.dimmed {
    transform: scale(0.9);
    opacity: 0.5;
    filter: blur(1.5px);
  }
}
</style>
