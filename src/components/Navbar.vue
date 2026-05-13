<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'

const authStore = useAuthStore()
const emit = defineEmits(['sectionChanged'])

const menuItems = [
  { name: 'Moi', id: 'accueil' },
  { name: 'Compétences', id: 'competences' },
  { name: 'Projets', id: 'projets' },
  { name: 'Me Contacter', id: 'contact' },
]

const activeSection = ref('accueil')
const isMenuOpen = ref(false)

// Fonction de scroll fluide avec décalage pour la Navbar
const scrollTo = (id: string) => {
  isMenuOpen.value = false
  const element = document.getElementById(id)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth' })
  }
}
const goBack = () => {
  const currentIndex = menuItems.findIndex(item => item.id === activeSection.value)

  // On vérifie que l'index précédent existe
  if (currentIndex > 0) {
    const prevItem = menuItems[currentIndex - 1];
    
    // On vérifie explicitement que prevItem n'est pas undefined
    if (prevItem) {
      scrollTo(prevItem.id)
    }
  }
}

onMounted(() => {
  const observerOptions = {
    root: null, // utilise le viewport
    threshold: 0.5
    // On déclenche quand la section occupe 60% de l'écran
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        activeSection.value = entry.target.id
        emit('sectionChanged', entry.target.id)
      }
    })
  }, observerOptions)

  menuItems.forEach((item) => {
    const element = document.getElementById(item.id)
    if (element) observer.observe(element)
  })
})
</script>

<template>
  <nav
    class="fixed top-0 left-0 w-full z-[100] bg-white/80 backdrop-blur-md border-b border-gray-100 h-14 md:h-16 transition-all duration-300">
    <div class="grid grid-cols-3 items-center h-full px-4 md:px-8 max-w-[1400px] mx-auto w-full">

      <!-- GAUCHE : Bouton Retour -->
      <div class="flex justify-start">
        <button @click="goBack"
          class="p-1.5 md:p-2 bg-white shadow-sm border border-gray-100 rounded-full transition-all active:scale-90 hover:shadow-md group"
          :class="activeSection === 'accueil' ? 'opacity-0 pointer-events-none translate-x-[-20px]' : 'opacity-100 translate-x-0'">
          <svg xmlns="http://www.w3.org/2000/svg"
            class="w-5 h-5 md:w-6 md:h-6 text-teal-600 group-hover:-translate-x-1 transition-transform" fill="none"
            viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      <!-- CENTRE : Menu Desktop -->
      <div class="hidden md:flex justify-center items-center space-x-6 lg:space-x-8">
        <button v-for="item in menuItems" :key="item.id" @click="scrollTo(item.id)"
          class="font-montserrat font-bold text-[9px] lg:text-xs uppercase tracking-[0.15em] transition-all relative py-1 cursor-pointer"
          :class="activeSection === item.id ? 'text-teal-600' : 'text-gray-400 hover:text-teal-400'">
          {{ item.name }}
          <span v-if="activeSection === item.id"
            class="absolute bottom-0 left-0 w-full h-0.5 bg-teal-600 rounded-full"></span>
        </button>
      </div>

      <!-- DROITE : Logout & Hamburger -->
      <div class="flex justify-end items-center gap-4">
        <!-- Logout Desktop -->
        <button v-if="authStore.isAdmin" @click="authStore.logout"
          class="hidden md:flex items-center gap-1 px-3 py-1.5 border border-red-500 text-red-500 rounded-lg font-black text-[9px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 cursor-pointer">
          Quitter
        </button>

        <!-- Hamburger Mobile -->
        <button @click="isMenuOpen = true"
          class="md:hidden p-3 bg-white shadow-md border border-gray-50 rounded-xl active:scale-95 transition-transform text-gray-800 cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"
            stroke-width="2.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16m-7 6h7" />
          </svg>
        </button>
      </div>
    </div>
  </nav>

  <!-- MENU MOBILE PLEIN ÉCRAN -->
  <Transition name="menu-fade">
    <div v-if="isMenuOpen" class="fixed inset-0 w-screen h-screen bg-white z-[200] flex flex-col p-8 overflow-hidden">

      <!-- Close Header -->
      <div class="flex justify-end w-full">
        <button @click="isMenuOpen = false"
          class="p-4 bg-gray-50 rounded-2xl active:scale-90 transition-transform cursor-pointer">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-8 h-8 text-gray-800" fill="none" viewBox="0 0 24 24"
            stroke="currentColor" stroke-width="3">
          </svg>
        </button>
      </div>

      <!-- Links -->
      <div class="flex-1 flex flex-col items-center justify-center space-y-8">
        <button v-for="(item, index) in menuItems" :key="item.id" @click="scrollTo(item.id)"
          class="text-2xl font-montserrat font-black uppercase tracking-tighter transition-all flex items-center cursor-pointer"
          :class="activeSection === item.id ? 'text-teal-600 scale-110' : 'text-gray-300'">
          <span class="text-[10px] font-black mr-4 opacity-50">0{{ index + 1 }}</span>
          {{ item.name }}
        </button>

        <!-- Logout Mobile -->
        <button v-if="authStore.isAdmin" @click="authStore.logout(); isMenuOpen = false"
          class="mt-10 px-8 py-4 border-2 border-red-500 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-2 active:scale-95 transition-all cursor-pointer">
          Déconnexion
        </button>
      </div>

      <!-- Footer Mobile Menu -->
      <div class="flex flex-col items-center pt-8 border-t border-gray-50">
        <p class="font-montserrat text-[10px] font-black uppercase tracking-[0.5em] text-gray-200">
          © Portfolio Rivo 2026
        </p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
/* Transition Menu Mobile */
.menu-fade-enter-active,
.menu-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.menu-fade-enter-active, .menu-fade-leave-active {
  transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
.menu-fade-enter-from, .menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

/* On remplace les <a> par des boutons pour un meilleur contrôle du scroll */
button {
  -webkit-tap-highlight-color: transparent;
}
</style>
