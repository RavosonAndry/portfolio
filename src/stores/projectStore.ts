import { defineStore } from "pinia";
import { ref } from "vue";
import { db } from "../firebase";
import { ref as dbRef, push, onValue, remove } from "firebase/database"; // Ajout de remove
import type { Project } from "../types/project";

export const useProjectStore = defineStore("projectStore", () => {
  const projects = ref<Project[]>([]);

  const fetchProjects = () => {
    onValue(dbRef(db, "projects"), (snapshot) => {
      const data = snapshot.val();
      projects.value = data
        ? Object.entries(data).map(([id, val]) => ({ id, ...(val as Project) }))
        : [];
    });
  };

  const addProject = async (project: any) => {
    // On ajoute la date de création ici
    await push(dbRef(db, "projects"), {
      ...project,
      createdAt: Date.now(),
    });
  };

  // NOUVELLE ACTION
  const deleteProject = async (id: string) => {
    await remove(dbRef(db, `projects/${id}`));
  };

  return { projects, fetchProjects, addProject, deleteProject };
});
