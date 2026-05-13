<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';
import { useRouter } from 'vue-router';
import { watch } from 'vue';

const authStore = useAuthStore();
const router = useRouter();

// Si la connexion réussit, on redirige vers l'accueil
watch(() => authStore.isAdmin, (newVal) => {
  if (newVal) router.push('/');
});
</script>

<template>
  <div class="h-screen w-full flex items-center justify-center bg-[#111827] font-montserrat p-6">
    <div class="bg-white p-10 rounded-[3rem] shadow-2xl w-full max-w-sm text-center">
      <h1 class="text-2xl font-black uppercase mb-8 tracking-tighter text-gray-800">Administration</h1>
      
      <button @click="authStore.loginWithGoogle" 
        class="w-full py-4 bg-white border-2 border-gray-100 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-gray-50 transition-all shadow-sm">
        <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5">
        CONTINUER AVEC GOOGLE
      </button>

      <router-link to="/" class="inline-block mt-8 text-[10px] font-black uppercase text-gray-400 hover:text-orange-500 transition-colors">
        Retour au site
      </router-link>
    </div>
  </div>
</template>
