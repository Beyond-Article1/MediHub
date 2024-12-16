import {createApp} from 'vue'
import App from './App.vue'
import router from "@/router/index.js";
import axios from "axios";
import {createPinia} from "pinia";
import './styles/reset.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

const app = createApp(App);
const pinia = createPinia();

axios.defaults.baseURL = 'http://localhost:8088';
app.use(router).use(pinia).mount("#app");
