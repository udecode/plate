import './dev/style.css';
import { createApp } from 'vue';
import { vClickOutside } from '@harbour-enterprises/common';
import DeveloperPlayground from './dev/components/DeveloperPlayground.vue';

const app = createApp(DeveloperPlayground);
app.directive('click-outside', vClickOutside);
app.mount('#app');
