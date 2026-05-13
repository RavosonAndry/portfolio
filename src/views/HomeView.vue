<script setup lang="ts">
import { ref } from 'vue';
import Navbar from '../components/Navbar.vue';
import Hero from '../components/Hero.vue';
import Skills from '../components/Skills.vue';
import Projects from '../components/Projects.vue';
import Contact from '../components/Contact.vue';
import DnaBackground from '../components/DnaBackground.vue';

const activeSection = ref('accueil');
const updateActiveSection = (id: string) => {
  activeSection.value = id;
};
</script>

<template>
  <!-- Ajout de scroll-pt (20 pour mobile, 24 pour desktop) -->
  <div
    class="h-screen w-screen overflow-y-auto snap-y snap-mandatory scroll-smooth bg-transparent scroll-pt-2 md:scroll-pt-2">
    <DnaBackground :activeSection="activeSection" />
    <Navbar @sectionChanged="updateActiveSection" />
    <main>
      <section id="accueil" class="h-screen snap-start">
        <Hero />
      </section>
      <section id="competences" class="h-screen snap-start">
        <Skills />
      </section>
      <section id="projets" class="h-screen snap-start">
        <Projects />
      </section>
      <section id="contact" class="h-screen snap-start">
        <Contact />
      </section>
    </main>
  </div>
</template>
