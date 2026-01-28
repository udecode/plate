<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { toolbarIcons } from './toolbarIcons.js';
import { useHighContrastMode } from '../../composables/use-high-contrast-mode';
import { TextSelection } from 'prosemirror-state';
import { getMarkRange } from '@/core/helpers/getMarkRange.js';

const props = defineProps({
  showInput: {
    type: Boolean,
    default: true,
  },
  showLink: {
    type: Boolean,
    default: true,
  },
  goToAnchor: {
    type: Function,
    default: () => {},
  },
  editor: {
    type: Object,
    required: true,
  },
  closePopover: {
    type: Function,
    default: () => {},
  },
});
const { isHighContrastMode } = useHighContrastMode();

const urlError = ref(false);

// --- Derive selected text and link href from editor ---
// Three cases:
// 1. Empty selection: return text between link marks (if any - likely empty)
// 2. Non-empty selection: return text between link marks
// 3. No link boundaries involved → return selected text as-is.
const getSelectedText = () => {
  if (!props.editor || !props.editor.state) return '';
  const { state } = props.editor;
  const { selection } = state;

  const linkMark = state.schema.marks.link;

  // 1. If the selection is empty, try to expand to link mark text.
  if (selection.empty) {
    const range = getMarkRange(selection.$from, linkMark);
    return range ? state.doc.textBetween(range.from, range.to, ' ') : '';
  }

  // 2. Non-empty selection: check if either boundary lies inside a link mark. If so, return that full link text.
  const rangeFrom = getMarkRange(selection.$from, linkMark);
  const rangeTo = getMarkRange(selection.$to, linkMark);

  if (rangeFrom || rangeTo) {
    const linkRange = rangeFrom || rangeTo;
    return state.doc.textBetween(linkRange.from, linkRange.to, ' ');
  }

  // 3. No link boundaries involved → return selected text as-is.
  return state.doc.textBetween(selection.from, selection.to, ' ');
};

const getLinkHrefAtSelection = () => {
  if (!props.editor || !props.editor.state) return '';
  const { state } = props.editor;
  const { schema, selection } = state;
  const linkMark = schema.marks.link;
  if (!linkMark) return '';
  let href = '';
  // Check marks at selection
  const { $from, empty } = selection;
  if (empty) {
    const marks = state.storedMarks || $from.marks();
    const link = marks.find((mark) => mark.type === linkMark);
    if (link) href = link.attrs.href;
  } else {
    state.doc.nodesBetween(selection.from, selection.to, (node) => {
      if (node.marks) {
        const link = node.marks.find((mark) => mark.type === linkMark);
        if (link) href = link.attrs.href;
      }
    });
  }
  return href || '';
};

const text = ref('');
const rawUrl = ref('');
const isAnchor = ref(false);

// Prepend http if missing
const url = computed(() => {
  if (!rawUrl.value) return '';
  if (!rawUrl.value.startsWith('http') && !rawUrl.value.startsWith('#')) return 'http://' + rawUrl.value;
  return rawUrl.value;
});

const validUrl = computed(() => {
  // anchors (starting with #) are always considered valid
  if (url.value.startsWith('#')) return true;

  const urlSplit = url.value.split('.').filter(Boolean);
  return url.value.includes('.') && urlSplit.length > 1;
});

// --- CASE LOGIC ---
const isEditing = computed(() => !isAnchor.value && !!getLinkHrefAtSelection());

const isDisabled = computed(() => !validUrl.value);

const openLink = () => {
  window.open(url.value, '_blank');
};

const updateFromEditor = () => {
  text.value = getSelectedText();
  rawUrl.value = getLinkHrefAtSelection();
};

watch(
  () => props.editor?.state?.selection,
  () => {
    updateFromEditor();
  },
  { immediate: true },
);

const focusInput = () => {
  const input = document.querySelector('.link-input-ctn input');
  if (!input) return;
  input.focus();
};

onMounted(() => {
  updateFromEditor();
  isAnchor.value = rawUrl.value.startsWith('#');
  if (props.showInput) focusInput();
});

// --- Link logic moved here ---
const handleSubmit = () => {
  const editor = props.editor;
  if (!editor) return;

  // If the URL is cleared, simply remove the link.
  if (!rawUrl.value) {
    if (editor.commands?.unsetLink) editor.commands.unsetLink();
    props.closePopover();
    return;
  }

  if (!validUrl.value) {
    urlError.value = true;
    return;
  }

  const finalText = text.value || url.value;

  if (editor.commands?.toggleLink) {
    editor.commands.toggleLink({ href: url.value, text: finalText });
  }

  // Move cursor to end of link and refocus editor.
  const endPos = editor.view.state.selection.$to.pos;
  editor.view.dispatch(editor.view.state.tr.setSelection(new TextSelection(editor.view.state.doc.resolve(endPos))));
  setTimeout(() => editor.view.focus(), 100);

  props.closePopover();
};

const handleRemove = () => {
  if (props.editor && props.editor.commands && props.editor.commands.unsetLink) {
    props.editor.commands.unsetLink();
    props.closePopover();
  }
};
</script>

<template>
  <div class="link-input-ctn" :class="{ 'high-contrast': isHighContrastMode }">
    <div class="link-title" v-if="isAnchor">Page anchor</div>
    <div class="link-title" v-else-if="isEditing">Edit link</div>
    <div class="link-title" v-else>Add link</div>

    <div v-if="showInput && !isAnchor" class="link-input-wrapper">
      <!-- Text input -->
      <div class="input-row text-input-row">
        <div class="input-icon text-input-icon">T</div>
        <input type="text" name="text" placeholder="Text" v-model="text" @keydown.enter.stop.prevent="handleSubmit" />
      </div>

      <!-- URL input -->
      <div class="input-row url-input-row">
        <div class="input-icon" v-html="toolbarIcons.linkInput"></div>
        <input
          type="text"
          name="link"
          placeholder="Type or paste a link"
          :class="{ error: urlError }"
          v-model="rawUrl"
          @keydown.enter.stop.prevent="handleSubmit"
          @keydown="urlError = false"
        />

        <div
          class="open-link-icon"
          :class="{ disabled: !validUrl }"
          v-html="toolbarIcons.openLink"
          @click="openLink"
          data-item="btn-link-open"
        ></div>
      </div>
      <div class="input-row link-buttons">
        <button class="remove-btn" @click="handleRemove" v-if="isEditing" data-item="btn-link-remove">
          <div class="remove-btn__icon" v-html="toolbarIcons.removeLink"></div>
          Remove
        </button>
        <button
          class="submit-btn"
          @click="handleSubmit"
          :class="{ 'disable-btn': isDisabled }"
          data-item="btn-link-apply"
        >
          Apply
        </button>
      </div>
    </div>

    <div v-else-if="isAnchor" class="input-row go-to-anchor clickable">
      <a @click.stop.prevent="goToAnchor">Go to {{ rawUrl.startsWith('#_') ? rawUrl.substring(2) : rawUrl }}</a>
    </div>
  </div>
</template>

<style scoped>
.link-input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.link-input-ctn {
  width: 320px;
  display: flex;
  flex-direction: column;
  padding: 1em;
  border-radius: 5px;
  background-color: #fff;
  box-sizing: border-box;

  :deep(svg) {
    width: 100%;
    height: 100%;
    display: block;
    fill: currentColor;
  }

  .input-row {
    align-content: baseline;
    display: flex;
    align-items: center;
    font-size: 16px;

    input {
      font-size: 13px;
      flex-grow: 1;
      padding: 10px;
      border-radius: 8px;
      padding-left: 32px;
      box-shadow: 0 4px 12px 0 rgba(0, 0, 0, 0.15);
      color: #666;
      border: 1px solid #ddd;
      box-sizing: border-box;

      &:active,
      &:focus {
        outline: none;
        border: 1px solid #1355ff;
      }
    }
  }

  .input-icon {
    position: absolute;
    left: 25px;
    width: auto;
    color: #999;
    pointer-events: none;
  }

  .input-icon:not(.text-input-icon) {
    transform: rotate(45deg);
    height: 12px;
  }

  &.high-contrast {
    .input-icon {
      color: #000;
    }

    .input-row input {
      color: #000;
      border-color: #000;
    }
  }
}
.open-link-icon {
  margin-left: 10px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 1px solid transparent;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.open-link-icon:hover {
  color: #1355ff;
  background-color: white;
  border: 1px solid #dbdbdb;
}

.open-link-icon :deep(svg) {
  width: 15px;
  height: 15px;
}

.disabled {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.link-buttons {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.remove-btn__icon {
  display: inline-flex;
  width: 13px;
  height: 13px;
  flex-shrink: 0;
  margin-right: 4px;
}

.link-buttons button {
  margin-left: 5px;
}

.disable-btn {
  opacity: 0.6;
  cursor: not-allowed;
  pointer-events: none;
}

.go-to-anchor a {
  font-size: 14px;
  text-decoration: underline;
}

.clickable {
  cursor: pointer;
}

.link-title {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 10px;
}

.hasBottomMargin {
  margin-bottom: 1em;
}

.remove-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  outline: none;
  background-color: white;
  color: black;
  font-weight: 400;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid #ebebeb;
  box-sizing: border-box;
}

.remove-btn:hover {
  background-color: #dbdbdb;
}

.submit-btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  outline: none;
  border: none;
  background-color: #1355ff;
  color: white;
  font-weight: 400;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-sizing: border-box;
  /* &.high-contrast {
    background-color: black;
  } */
  &:hover {
    background-color: #0d47c1;
  }
}

.error {
  border-color: red !important;
  background-color: #ff00001a;
}

.submit {
  cursor: pointer;
}
</style>
