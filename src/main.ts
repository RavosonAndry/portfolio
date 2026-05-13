import { createApp } from "vue";
import { createPinia } from "pinia"; // 1. Importe createPinia
import "./style.css";
import App from "./App.vue";
import router from "./router";

const app = createApp(App);
const pinia = createPinia(); // 2. Crée l'instance
app.use(router);
app.use(pinia); // 3. Utilise Pinia AVANT de monter l'application
app.mount("#app");
