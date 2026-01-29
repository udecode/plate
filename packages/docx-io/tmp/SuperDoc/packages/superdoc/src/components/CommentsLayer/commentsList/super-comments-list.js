import EventEmitter from 'eventemitter3';
import { createApp } from 'vue';

import { vClickOutside } from '@harbour-enterprises/common';
import CommentsList from './commentsList.vue';

/**
 * Comments list renderer (not floating comments)
 *
 * This renders a list of comments into an element, connected to main SuperDoc instance
 */
export class SuperComments extends EventEmitter {
  element;

  config = {
    comments: [],
    element: null,
    commentsStore: null,
  };

  constructor(options, superdoc) {
    super();
    this.config = { ...this.config, ...options };
    this.element = this.config.element;
    this.app = null;
    this.superdoc = superdoc;
    this.open();
  }

  createVueApp() {
    this.app = createApp(CommentsList);
    this.app.directive('click-outside', vClickOutside);
    this.app.config.globalProperties.$superdoc = this.superdoc;

    if (!this.element && this.config.selector) {
      this.element = document.getElementById(this.config.selector);
    }

    this.container = this.app.mount(this.element);
  }

  close() {
    if (this.app) {
      this.app.unmount();
      this.app = null;
      this.container = null;
      this.element = null;
    }
  }

  open() {
    if (!this.app) {
      this.createVueApp();
    }
  }
}
