import { createApp } from 'vue';
import { Plugin, PluginKey } from 'prosemirror-state';
import { Extension } from '@core/Extension.js';
import tippy from 'tippy.js';

import Mentions from '@/components/popovers/Mentions.vue';

const popoverPluginKey = new PluginKey('popoverPlugin');
export const PopoverPlugin = Extension.create({
  name: 'popoverPlugin',

  addPmPlugins() {
    const popover = new Plugin({
      key: popoverPluginKey,
      state: {
        init: () => {
          return {};
        },
        apply: (tr, value) => {
          let newValue = { ...value };

          if (tr.docChanged) {
            newValue.shouldUpdate = true;
          } else {
            newValue.shouldUpdate = false;
          }
          return newValue;
        },
      },
      view: (view) => {
        const popover = new Popover(view, this.editor);
        return {
          update: (view, lastState) => {
            const pluginState = popoverPluginKey.getState(view.state);
            if (!pluginState.shouldUpdate) return;
            popover.update(view, lastState);
          },
          destroy: () => {
            popover.destroy();
          },
        };
      },
    });
    return [popover];
  },
});

class Popover {
  constructor(view, editor) {
    this.editor = editor;
    this.view = view;
    this.popover = document.createElement('div');
    this.popover.className = 'sd-editor-popover';
    document.body.appendChild(this.popover);

    this.tippyInstance = tippy(this.popover, {
      trigger: 'manual',
      placement: 'bottom-start',
      interactive: true,
      appendTo: document.body,
      arrow: false,
      onShow: (instance) => {
        instance.setProps({ getReferenceClientRect: () => this.popoverRect });
        this.bindKeyDownEvents();
      },
      onHide: () => {
        this.unbindKeyDownEvents();
      },
      theme: 'sd-editor-popover',
    });
  }

  bindKeyDownEvents() {
    this.view.dom.addEventListener('keydown', this.handleKeyDown);
  }

  unbindKeyDownEvents() {
    this.view.dom.removeEventListener('keydown', this.handleKeyDown);
  }

  handleKeyDown = (event) => {
    const isArrow = event.key === 'ArrowDown' || event.key === 'ArrowUp';
    if (this.tippyInstance.state.isVisible && isArrow) {
      event.preventDefault();
      this.popover.firstChild.focus();
    }
  };

  mountVueComponent(component, props = {}) {
    if (this.app) this.app.unmount();
    this.app = createApp(component, props);
    this.app.mount(this.popover);
    this.tippyInstance.setContent(this.popover);
  }

  update(view) {
    this.state = view.state;
    const showPopover = this.isShowMentions;

    let popoverContent = { component: null, props: null };
    if (this.isShowMentions) {
      const { from } = this.state.selection;
      const atMention = this.getMentionText(from);
      popoverContent = {
        component: Mentions,
        props: {
          users: this.editor.users,
          mention: atMention,
          inserMention: (user) => {
            const { $from } = this.state.selection;
            const length = atMention.length;
            const attributes = { ...user };
            const mentionNode = this.editor.schema.nodes.mention.create(attributes);
            const tr = this.state.tr.replaceWith($from.pos - length, $from.pos, mentionNode);
            this.editor.view.dispatch(tr);
            this.editor.view.focus();
          },
        },
      };
    }

    if (showPopover && popoverContent.component) {
      const { to } = this.state.selection;
      const { component, props } = popoverContent;
      this.mountVueComponent(component, props);
      this.showPopoverAtPosition(to);
    } else this.tippyInstance.hide();
  }

  showPopoverAtPosition(pos) {
    const end = this.view.coordsAtPos(pos);
    this.popoverRect = {
      width: 0,
      height: 0,
      top: end.bottom,
      left: end.left,
      bottom: end.bottom,
      right: end.left,
    };

    this.tippyInstance.show();
  }

  getMentionText(from) {
    const maxLookBehind = 20;
    const startPos = Math.max(0, from - maxLookBehind);
    const textBefore = this.state.doc.textBetween(startPos, from, '\n', '\0');

    // Return only the text after the last @
    const atIndex = textBefore.lastIndexOf('@');
    if (atIndex !== -1) return textBefore.substring(atIndex);

    return '';
  }

  get isShowMentions() {
    const { from } = this.state.selection;

    // Ensure we're not out of bounds
    if (from < 1) return false;

    const textBefore = this.getMentionText(from);

    // Use regex to match "@" followed by word characters and no space
    const mentionPattern = /(?:^|\s)@[\w]*$/;
    const match = textBefore.match(mentionPattern);

    return match && this.state.selection.empty;
  }

  destroy() {
    this.tippyInstance.destroy();
    this.popover.remove();
  }
}
