export interface Project {
  id?: string;
  name: string;
  description: string;
  link: string;
  category: "dev" | "indus";
  imageUrl: string; // Pour l'aperçu visuel
}
