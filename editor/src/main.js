import { createApp } from 'vue';
import App from './App.vue';
import store from "./store";

import Bootstrap from "bootstrap/dist/css/bootstrap.css";
import styleDrawflow from 'drawflow/dist/drawflow.min.css';
import 'animate.css';
import './assets/style.css';



createApp(App, styleDrawflow, Bootstrap).use(store).mount('#app')
