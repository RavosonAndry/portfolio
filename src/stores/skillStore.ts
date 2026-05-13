import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { db } from "../firebase";
import { ref as dbRef, push, onValue, remove, update } from "firebase/database";
import type { Skill } from "../types/skills";

export const useSkillStore = defineStore("skillStore", () => {
  // État (State)
  const skills = ref<Skill[]>([]);
  const isLoading = ref(true);

  // Actions : Charger les données en temps réel
  const fetchSkills = () => {
    const skillsPath = dbRef(db, "skills");
    onValue(skillsPath, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        skills.value = Object.entries(data).map(([id, val]) => ({
          id,
          ...(val as Skill),
        }));
      } else {
        skills.value = [];
      }
      isLoading.value = false;
    });
  };

  // Actions : Ajouter une compétence
  const addSkill = async (newSkill: Skill) => {
    try {
      const skillsPath = dbRef(db, "skills");
      await push(skillsPath, newSkill);
    } catch (error) {
      console.error("Erreur Firebase Ajout:", error);
      throw error;
    }
  };

  const updateSkill = async (id: string, updatedSkill: Skill) => {
    try {
      const skillPath = dbRef(db, `skills/${id}`);
      await update(skillPath, updatedSkill);
    } catch (error) {
      console.error("Erreur Firebase Modification:", error);
      throw error;
    }
  };

  // NOUVELLE ACTION : Supprimer une compétence
  const deleteSkill = async (id: string) => {
    try {
      // On cible le chemin exact : skills/ID_DE_LA_COMPETENCE
      const skillPath = dbRef(db, `skills/${id}`);
      await remove(skillPath);
    } catch (error) {
      console.error("Erreur Firebase Suppression:", error);
      throw error;
    }
  };
  // Getters : Filtrage par catégorie
  const techSkills = computed(() =>
    skills.value.filter((s) => s.category === "tech"),
  );
  const indusSkills = computed(() =>
    skills.value.filter((s) => s.category === "indus"),
  );

  return {
    skills,
    isLoading,
    techSkills,
    indusSkills,
    fetchSkills,
    addSkill,
    deleteSkill,
    updateSkill,
  };
});
