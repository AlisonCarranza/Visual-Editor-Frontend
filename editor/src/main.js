import { createApp } from 'vue';
import App from './App.vue';
import store from "./store";

import Bootstrap from "bootstrap/dist/css/bootstrap.css";
import styleDrawflow from 'drawflow/dist/drawflow.min.css';
import 'animate.css';
import './assets/style.css';

/* import the fontawesome core */
import { library } from '@fortawesome/fontawesome-svg-core'

/* import font awesome icon component */
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

/* import specific icons */
import { faMagnifyingGlassPlus, faMagnifyingGlassMinus, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

/* add icons to the library */
library.add(faMagnifyingGlassPlus,faMagnifyingGlassMinus,faMagnifyingGlass)

createApp(App, styleDrawflow, Bootstrap).use(store).component('font-awesome-icon', FontAwesomeIcon).mount('#app')
