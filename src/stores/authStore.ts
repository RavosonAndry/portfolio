import { defineStore } from 'pinia';
import { ref, onMounted } from 'vue';
import { auth, googleProvider } from '../firebase';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';

export const useAuthStore = defineStore('auth', () => {
  const isAdmin = ref(false);
  
  // 🔴 REMPLACE CECI PAR TON UID COPIÉ :
  
  const ADMIN_UID = import.meta.env.VITE_UID_FIREBASE; 

  onMounted(() => {
    onAuthStateChanged(auth, (user) => {
      // On vérifie si l'utilisateur est connecté ET si c'est bien ton UID
      if (user && user.uid === ADMIN_UID) {
        isAdmin.value = true;
      } else {
        isAdmin.value = false;
      }
    });
  });

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Erreur de connexion Google", error);
    }
  };

  const logout = async () => {
    await signOut(auth);
    isAdmin.value = false;
  };

  return { isAdmin, loginWithGoogle, logout };
});
