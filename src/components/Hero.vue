<template>
  <!-- 
    1. pt-28 : On force un gros padding en haut pour passer sous la nav (environ 112px).
    2. justify-around : Au lieu de center, ça répartit l'espace entre le texte et les cartes.
    3. pb-10 : On garde la marge en bas.
  -->
  <div
    class="h-dvh w-full flex flex-col lg:flex-row items-center justify-around lg:justify-center px-6 md:px-16 pt-20 lg:pt-0 pb-6 overflow-hidden relative bg-transparent">

    <div class="flex flex-col lg:grid lg:grid-cols-2 gap-4 lg:gap-10 items-center w-full max-w-[1100px] mx-auto">

      <!-- GAUCHE : TEXTE HERO -->
      <!-- mt-4 pour s'assurer qu'il ne colle pas à la nav si l'écran est petit -->
      <div class="space-y-2 w-full text-left order-1 lg:order-none z-10 mt-2 lg:mt-0">
        <h1
          class="text-xl md:text-[clamp(1.2rem,3vw,2.2rem)] font-montserrat font-black text-[#333] leading-tight uppercase max-w-[240px] md:max-w-lg">
          {{ activeData.title }}
        </h1>
        <div class="h-1 w-10 md:h-1.5 md:w-12 transition-all duration-700" :class="activeData.bgColor"></div>
      </div>

      <!-- DROITE : CARTES ET BADGE MOBILE -->
      <!-- mt-12 pour donner de l'air entre le titre et la carte sur mobile -->
      <div class="relative flex items-center justify-center w-full order-2 lg:order-none mt-6 lg:mt-0">

        <!-- Augmentation de la hauteur du conteneur mobile pour la photo qui dépasse -->
        <TransitionGroup name="cards" tag="div"
          class="relative flex items-end w-full min-h-[180px] md:h-[400px] pb-4 md:pb-8">

          <div v-for="(card, index) in roles" :key="card.id" @click="selectRole(index)"
            class="transition-all duration-700 ease-in-out cursor-pointer" :class="[
              card.id === activeRole ? 'z-30' : 'z-50',

              !isMobile ? (
                card.id === activeRole
                  ? 'absolute w-[280px] lg:w-[320px] bg-white p-6 lg:p-8 rounded-xl shadow-xl border-l-[6px] opacity-100'
                  : 'absolute w-[240px] lg:w-[280px] bg-white/60 p-6 lg:p-8 rounded-xl shadow-xl border-l-[6px] translate-x-[150px] lg:translate-x-[380px] opacity-70 scale-90 grayscale hidden lg:block'
              ) : '',

              isMobile ? (
                card.id === activeRole
                  ? 'absolute w-[92%] bg-white p-6 rounded-2xl shadow-2xl border-l-[8px] left-1/2 -translate-x-1/2 bottom-0 opacity-100'
                  : 'absolute top-[-30px] right-[0%] scale-90 opacity-80'
              ) : ''
            ]" :style="{ borderColor: card.hexColor }">

            <!-- CONTENU CARTE ACTIVE -->
            <template v-if="!isMobile || (isMobile && card.id === activeRole)">
              <!-- IMAGE : Ajustement de imgOffsetMobile pour qu'elle soit bien haute -->
              <img src="/Profil.png" alt="Profil"
                class="absolute left-1/2 -translate-x-1/2 w-[70%] md:w-[80%] h-auto pointer-events-none transition-all duration-700 z-40"
                :class="[
                  card.id === activeRole ? 'opacity-100 scale-100' : 'opacity-0 scale-90',
                  isMobile ? card.imgOffsetMobile : card.imgOffset
                ]" />

              <h2 class="text-xl md:text-3xl font-bold mb-0 md:mb-4 uppercase leading-none"
                :style="{ color: card.hexColor }">
                {{ card.name }}
              </h2>

              <p class="hidden lg:block text-gray-400 text-sm leading-relaxed max-w-[220px] mt-4 font-montserrat">
                {{ card.shortDesc }}
              </p>
            </template>

            <!-- CONTENU BADGE MOBILE -->
            <div v-else
              class="animate-glow w-12 h-12 bg-white rounded-full border-2 shadow-lg flex items-center justify-center transition-all duration-500"
              :style="{ borderColor: card.hexColor, '--glow-color': card.hexColor }">
              <svg v-if="card.id === 'dev'" xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none"
                viewBox="0 0 24 24" :stroke="card.hexColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
              </svg>
              <svg v-else xmlns="http://www.w3.org/2000/svg" class="w-6 h-6" fill="none" viewBox="0 0 24 24"
                :stroke="card.hexColor" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round"
                  d="M4.5 12a7.5 7.5 0 0015 0m-15 0a7.5 7.5 0 1115 0m-15 0H3m16.5 0H21m-1.5 0H12m-8.457 3.077l1.41-.513m14.095-5.13l1.41-.513M5.106 17.785l1.15-.964m11.49-9.642l1.149-.964M7.501 19.795l.75-1.3m11.75-3.115.75-1.3m-13.25-10.38l.75-1.3m13.25 10.38l.75-1.3" />
              </svg>
            </div>
          </div>
        </TransitionGroup>

        <!-- FLÈCHE DESKTOP (Inchangée) -->
        <div class="hidden lg:block absolute left-[350px] bottom-[155px] z-20 transition-all duration-700"
          :style="{ color: activeData.hexColor }">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 fill-current" viewBox="0 0 24 24">
            <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
          </svg>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const isMobile = ref(false)
const checkMobile = () => { isMobile.value = window.innerWidth < 1024 }

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => window.removeEventListener('resize', checkMobile))

const roles = ref([
  {
    id: 'dev',
    name: 'Développeur',
    title: 'Je code des solutions avec une vision industrielle',
    shortDesc: 'Développement d\'applications web et mobiles performantes.',
    hexColor: '#00a39b',
    bgColor: 'bg-[#00a39b]',
    imgOffset: '-top-[90%]',
    // AJUSTEMENT : On remonte plus l'image pour mobile (évite qu'elle tombe sur le texte)
    imgOffsetMobile: '-top-[230%]'
  },
  {
    id: 'indus',
    name: 'Génie Industriel',
    title: 'L\'ingénierie au service de l\'optimisation logicielle',
    shortDesc: 'Optimisation des processus de production et gestion de flux.',
    hexColor: '#e67e22',
    bgColor: 'bg-[#e67e22]',
    imgOffset: '-top-[80%]',
    // AJUSTEMENT : On remonte plus l'image pour mobile
    imgOffsetMobile: '-top-[230%]'
  }
])

const activeRole = ref('dev')
const activeData = computed(() => roles.value.find(r => r.id === activeRole.value))

const selectRole = (index) => {
  if (index === 0) return
  const item = roles.value.splice(index, 1)[0]
  roles.value.unshift(item)
  activeRole.value = item.id
}
</script>

<style scoped>
.cards-move {
  transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
}

.cards-leave-active,
.cards-enter-active {
  position: absolute;
}

@keyframes glow {

  0%,
  100% {
    transform: scale(1);
    box-shadow: 0 0 5px var(--glow-color);
  }

  50% {
    transform: scale(1.1);
    box-shadow: 0 0 20px var(--glow-color);
  }
}

.animate-glow {
  animation: glow 2s infinite ease-in-out;
}
</style>
