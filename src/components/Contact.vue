<script setup lang="ts">
import { ref } from 'vue';
import emailjs from '@emailjs/browser';
import Notification from './Notification.vue'

// --- CONFIGURATION SOCIALE ---
const socialLinks = {
  linkedin: 'https://www.linkedin.com/in/rivo-nirina-ravoson-andry-b29693380',
  twitter: 'https://x.com/TON_NOM_UTILISATEUR',
  whatsapp: 'https://wa.me/261344195990' 
};

const form = ref({
  name: '',
  email: '',
  subject: '',
  message: ''
});

const isSending = ref(false);
const notifRef = ref();
const notifConfig = ref({ type: 'success' as any, message: '' });

const handleSubmit = async () => {
  if (isSending.value) return;
  isSending.value = true;

  try {
    await emailjs.send(
      import.meta.env.VITE_SERVICE_ID_EMAILJS,
      import.meta.env.VITE_TEMPLATE_ID_EMAILJS,
      {
        name: form.value.name,
        email: form.value.email,
        subject: form.value.subject,
        message: form.value.message,
      },
      import.meta.env.VITE_PUBLIC_KEY_EMAILJS
    );

    notifConfig.value = { type: 'success', message: "Message envoyé avec succès !" };
    notifRef.value.show();

    // Reset du formulaire
    form.value = { name: '', email: '', subject: '', message: '' };
  } catch (error) {
    notifConfig.value = { type: 'error', message: "Une erreur est survenue lors de l'envoi." };
    notifRef.value.show();
  } finally {
    isSending.value = false;
  }
};
</script>

<template>
  <!-- pt-24 pour éviter la Navbar mobile, justify-center pour l'équilibre -->
  <section id="contact"
    class="relative min-h-dvh w-full flex flex-col justify-start lg:justify-center items-center bg-transparent px-6 md:px-20 pt-24 lg:pt-0 overflow-y-auto lg:overflow-hidden">
    
    <div class="w-full max-w-2xl z-20">
      <!-- EN-TÊTE -->
      <div class="flex items-center justify-between w-full mb-6 md:mb-1">
        <div>
          <h2 class="font-montserrat text-xl md:text-2xl font-black text-gray-800 uppercase tracking-tighter leading-none">
            Me Contacter
          </h2>
          <div class="h-1 w-10 md:w-14 bg-teal-600 mt-2"></div>
        </div>

        <!-- SOCIAL ICONS MOBILE -->
        <div class="flex gap-3 md:hidden">
          <a :href="socialLinks.linkedin" target="_blank" 
             class="w-10 h-10 flex items-center justify-center bg-teal-600 text-white rounded-full shadow-lg active:scale-90 transition-all cursor-pointer hover:bg-teal-700">
            <svg class="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
            </svg>
          </a>
          <a :href="socialLinks.whatsapp" target="_blank" 
             class="w-10 h-10 flex items-center justify-center bg-teal-600 text-white rounded-full shadow-lg active:scale-90 transition-all cursor-pointer hover:bg-teal-700">
            <svg class="w-6 h-6 fill-current" viewBox="0 0 24 24">
              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.438 9.889-9.886.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.438-9.89 9.886-.001 2.15.613 3.741 1.548 5.356l-1.01 3.689 3.952-1.037z" />
            </svg>
          </a>
        </div>
      </div>

      <!-- FORMULAIRE -->
      <form @submit.prevent="handleSubmit" class="space-y-4 md:space-y-6 font-montserrat">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          
          <!-- NOM -->
          <div class="relative group">
            <input v-model="form.name" type="text" id="name" placeholder=" "
              class="peer w-full p-3.5 md:p-4 bg-white/80 rounded-xl shadow-sm outline-none border-b-2 border-transparent focus:border-teal-600 focus:bg-white transition-all font-bold text-gray-800 placeholder-transparent text-xs md:text-base cursor-text" required />
            <label for="name"
              class="absolute left-4 top-3.5 text-gray-400 font-bold uppercase text-[8px] tracking-widest transition-all pointer-events-none
              peer-focus:text-teal-600 peer-focus:text-[9px] peer-focus:-translate-y-8
              peer-not-placeholder-shown:text-teal-600 peer-not-placeholder-shown:text-[6px] peer-not-placeholder-shown:-translate-y-8">
              Nom complet
            </label>
          </div>

          <!-- EMAIL -->
          <div class="relative group">
            <input v-model="form.email" type="email" id="email" placeholder=" "
              class="peer w-full p-3.5 md:p-4 bg-white/80 rounded-xl shadow-sm outline-none border-b-2 border-transparent focus:border-teal-600 focus:bg-white transition-all font-bold text-gray-800 placeholder-transparent text-xs md:text-base cursor-text" required />
            <label for="email"
              class="absolute left-4 top-3.5 text-gray-400 font-bold uppercase text-[8px] tracking-widest transition-all pointer-events-none
              peer-focus:text-teal-600 peer-focus:text-[9px] peer-focus:-translate-y-8
              peer-not-placeholder-shown:text-teal-600 peer-not-placeholder-shown:text-[6px] peer-not-placeholder-shown:-translate-y-8">
              Votre Email
            </label>
          </div>
        </div>

        <!-- SUJET -->
        <div class="relative group">
          <input v-model="form.subject" type="text" id="subject" placeholder=" "
            class="peer w-full p-3.5 md:p-4 bg-white/80 rounded-xl shadow-sm outline-none border-b-2 border-transparent focus:border-teal-600 focus:bg-white transition-all font-bold text-gray-800 placeholder-transparent text-xs md:text-base cursor-text" required />
          <label for="subject"
            class="absolute left-4 top-3.5 text-gray-400 font-bold uppercase text-[8px] tracking-widest transition-all pointer-events-none
            peer-focus:text-teal-600 peer-focus:text-[9px] peer-focus:-translate-y-8
            peer-not-placeholder-shown:text-teal-600 peer-not-placeholder-shown:text-[6px] peer-not-placeholder-shown:-translate-y-8">
            Sujet
          </label>
        </div>

        <!-- MESSAGE -->
        <div class="relative group">
          <textarea v-model="form.message" id="message" rows="3" placeholder=" "
            class="peer w-full p-3.5 md:p-4 bg-white/80 rounded-xl md:rounded-[rem] shadow-sm outline-none border-b-2 border-transparent focus:border-teal-600 focus:bg-white transition-all font-medium text-gray-800 placeholder-transparent resize-none text-xs md:text-base cursor-text" required></textarea>
          <label for="message"
            class="absolute left-4 top-4 text-gray-400 font-bold uppercase text-[10px] tracking-widest transition-all pointer-events-none
            peer-focus:text-teal-600 peer-focus:text-[9px] peer-focus:-translate-y-8
            peer-not-placeholder-shown:text-teal-600 peer-not-placeholder-shown:text-[6px] peer-not-placeholder-shown:-translate-y-8">
            Message
          </label>
        </div>

        <!-- FOOTER / BOUTON -->
        <div class="flex flex-col md:flex-row items-center justify-end gap-6 pt-4">
          <button type="submit" :disabled="isSending"
            class="w-full md:w-auto bg-orange-500 text-white px-10 py-3 md:px-12 md:py-5 rounded-full font-black uppercase tracking-[0.2em] shadow-xl hover:bg-orange-600 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed text-xs md:text-base transition-all cursor-pointer">
            {{ isSending ? 'Envoi...' : 'Envoyer le message' }}
          </button>
        </div>
      </form>
    </div>
  </section>
  
  <Notification ref="notifRef" :type="notifConfig.type" :message="notifConfig.message" position="top-right" />
</template>

<style scoped>
/* Pour s'assurer que le curseur texte est propre sur les inputs */
input, textarea {
  cursor: text;
}

/* On force le pointer sur les éléments cliquables au cas où */
button, a {
  cursor: pointer;
}
</style>
