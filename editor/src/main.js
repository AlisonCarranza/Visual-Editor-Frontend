import { createApp } from 'vue'
import App from './App.vue'

import Bootstrap from "bootstrap/dist/css/bootstrap.css";
import styleDrawflow from 'drawflow/dist/drawflow.min.css'


createApp(App, styleDrawflow, Bootstrap).mount('#app')
