import { createApp } from 'vue'
import App from './App.vue'
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { faFileWord } from "@fortawesome/free-regular-svg-icons";
import { faFileArrowUp, faFileArrowDown } from "@fortawesome/free-solid-svg-icons";

// add fontawesome icons to the library
library.add(...[
    faFileWord,
    faFileArrowUp,
    faFileArrowDown
]);

createApp(App)
.component("font-awesome-icon", FontAwesomeIcon)
.mount("#app");
