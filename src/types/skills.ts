export interface Skill {
  id?: string;
  name: string;
  category: "tech" | "indus";
  level: number;
  icon?: string; // Optionnel pour le moment
}
