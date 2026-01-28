<script setup>
import { computed, ref, onMounted, onUnmounted, nextTick } from 'vue';
import { writeStreaming, rewriteStreaming, formatDocument } from './ai-helpers';
import { TextSelection } from 'prosemirror-state';
import edit from '@harbour-enterprises/common/icons/edit-regular.svg?raw';
import paperPlane from '@harbour-enterprises/common/icons/paper-plane-regular.svg?raw';

const props = defineProps({
  selectedText: {
    type: String,
    required: true,
  },
  handleClose: {
    type: Function,
    required: true,
  },
  editor: {
    type: Object,
    required: true,
  },
  apiKey: {
    type: String,
  },
  endpoint: {
    type: String,
    required: false,
  },
});

// Store the selection state
const selectionState = ref(null);

// Add click outside handler
const aiWriterRef = ref(null);

const handleClickOutside = (event) => {
  if (aiWriterRef.value && !aiWriterRef.value.contains(event.target)) {
    // Only emit 'remove' if we're not in a loading state
    if (!isLoading.value) {
      props.editor.commands.removeAiMark();
    }
    props.handleClose();
  }
};

// Add ref for the textarea
const editableRef = ref(null);

// Helper functions
const saveSelection = () => {
  if (props.selectedText) {
    // Store the complete selection state
    selectionState.value = {
      ...props.editor.state.selection,
      from: props.editor.state.selection.from,
      to: props.editor.state.selection.to,
    };
    // Store the selection in the editor's state
    props.editor.commands.setMeta('storedSelection', selectionState.value);

    // Emit ai highlight when the writer mounts through the toolbar
    props.editor.commands.insertAiMark();
  }
};

const focusTextarea = () => {
  // Defer focus to after all event handlers (including browser's default)
  setTimeout(() => {
    nextTick(() => {
      if (editableRef.value) {
        editableRef.value.focus();
      }
    });
  }, 0);
};

const addEventListeners = () => {
  document.addEventListener('mousedown', handleClickOutside);
  document.addEventListener('keydown', handleCaptureKeyDown, true);
};

const removeEventListeners = () => {
  document.removeEventListener('mousedown', handleClickOutside);
  document.removeEventListener('keydown', handleCaptureKeyDown, true);
};

// Save selection when component is mounted
onMounted(() => {
  saveSelection();
  focusTextarea();
  addEventListeners();
});

onUnmounted(() => {
  // Only remove the ai mark if we're not in a loading state
  if (!isLoading.value) {
    props.editor.commands.removeAiMark();
  }
  // Remove all event listeners
  removeEventListeners();
});

// Capture phase handler to stop arrow key events from being intercepted in our ai textarea
const handleCaptureKeyDown = (event) => {
  if (
    editableRef.value &&
    event.target === editableRef.value &&
    ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)
  ) {
    event.stopPropagation(); // This prevents ProseMirror from seeing the event
  }
};

// Computed property to determine text based on selection
const placeholderText = computed(() =>
  props.selectedText ? 'Insert prompt to update text' : 'Insert prompt to generate text',
);

const isLoading = ref(false);
const isError = ref('');
const promptText = ref('');
const textProcessingStarted = ref(false);
const previousText = ref('');
const isFormatting = ref(false);
const pendingFormatting = ref(false);

// Computed property to check if editor is in suggesting mode
const isInSuggestingMode = computed(() => {
  return props.editor.isInSuggestingMode?.() || false;
});

// Helper to get document XML from the editor if needed
const getDocumentXml = () => {
  try {
    // Get document content as XML if available
    // This is a placeholder, implement according to your editor's capability
    return props.editor.state.doc.textContent || '';
  } catch (error) {
    console.error('Error getting document XML:', error);
    return '';
  }
};

// Handler for processing text chunks from the stream
const handleTextChunk = async (text) => {
  try {
    // Remove the loader node when we start receiving text
    props.editor.commands.removeAiNode('aiLoaderNode');

    // If this is the first chunk and we're rewriting, handle the selection
    if (props.selectedText && !textProcessingStarted.value) {
      props.editor.commands.removeAiMark();

      // Clear the pulsing animation when we start inserting text
      props.editor.commands.clearAiHighlightStyle();

      // Check if we have a valid stored selection
      if (selectionState.value) {
        // Apply the stored selection using the TextSelection API
        const { state } = props.editor;
        const { from, to } = selectionState.value;

        // Create a transaction to set the selection
        const tr = state.tr.setSelection(TextSelection.create(state.doc, from, to));

        // Dispatch the transaction to update the editor state
        props.editor.view.dispatch(tr);
      } else {
        console.warn('[AIWriter] No stored selection to restore');
      }

      // Now delete the selection
      props.editor.commands.deleteSelection();

      // Mark as processed
      textProcessingStarted.value = true;
    }

    // If the text is null, undefined or empty, don't process it
    if (text === null || text === undefined || text === '') {
      return;
    }

    // Convert to string in case it's not already a string
    const textStr = String(text);

    // Wrap the raw content in a span with our animation class and unique ID
    const wrappedContent = {
      type: 'text',
      marks: [
        {
          type: 'aiAnimationMark',
          attrs: {
            class: 'sd-ai-text-appear',
            dataMarkId: `ai-animation-${Date.now()}`,
          },
        },
      ],
      text: textStr,
    };

    // Insert the raw content with animation mark
    props.editor.commands.insertContent(wrappedContent);

    // Prevent race conditions - do not call formatDocument if we are already formatting
    pendingFormatting.value = true;
    if (!isFormatting.value) {
      await runSafeFormat();
    }

    // Hide the AI Writer after content is received
    props.handleClose();
  } catch (error) {
    console.error('Error handling text chunk:', error);
  }
};

/**
 * Run formatting when it's safe (no other formatting is in progress)
 * Recursively call itself if we are still needing to process raw requests from
 * pendingFormatting.value
 */
const runSafeFormat = async () => {
  if (isFormatting.value) return;

  try {
    isFormatting.value = true;
    pendingFormatting.value = false;

    await nextTick();

    formatDocument(props.editor);

    // Check if more formatting requests arrived while we were formatting
    if (pendingFormatting.value) {
      pendingFormatting.value = false;
      await runSafeFormat();
    }
  } finally {
    isFormatting.value = false;
  }
};

/**
 * Handler for when the stream is done
 *
 * We need to make sure we're not currently running any formatting before our final call
 *
 * We can do this by using a short recursive polling system to wait.
 */
const handleDone = async () => {
  if (pendingFormatting.value || isFormatting.value) {
    pendingFormatting.value = true;
    await new Promise((resolve) => {
      const checkFormatting = () => {
        if (!isFormatting.value && !pendingFormatting.value) {
          resolve();
        } else {
          setTimeout(checkFormatting, 100);
        }
      };
      checkFormatting();
    });
  }

  await runSafeFormat();

  // If we are done we can remove the animation mark
  // We need to wait for the animation to finish before removing the mark
  setTimeout(() => {
    props.editor.commands.removeAiMark('aiAnimationMark');
    props.editor.commands.removeAiMark();
  }, 1000);
};

// Refactored handleSubmit function
const handleSubmit = async () => {
  // Reset state
  isError.value = '';
  textProcessingStarted.value = false;
  previousText.value = '';
  isLoading.value = true;

  try {
    // Close the AI Writer immediately and transition to loading states
    props.handleClose();

    // If there is selected text, update the ai highlight style to start pulsing animation
    if (props.selectedText) {
      props.editor.commands.updateAiHighlightStyle('sd-ai-highlight-pulse');
      props.editor.commands.removeSelectionAfterAiPulse();
    } else {
      // Insert the loader node at the current cursor position
      props.editor.commands.insertContent({
        type: 'aiLoaderNode',
      });
    }

    // Enable track changes if in suggesting mode
    if (isInSuggestingMode.value) {
      props.editor.commands.enableTrackChanges();
    }

    // Get document content for context
    const documentXml = getDocumentXml();

    // Common options for API calls
    const options = {
      // @todo: implement grabbing document text
      docText: '',
      documentXml: documentXml,
      config: {
        // Pass the aiApiKey to the AI helper functions
        apiKey: props.apiKey,
        endpoint: props.endpoint,
      },
    };

    // Always use streaming approach
    if (props.selectedText) {
      // Use rewriteStreaming for selected text
      await rewriteStreaming(props.selectedText, promptText.value, options, handleTextChunk, handleDone);
    } else {
      // Use writeStreaming for generating new text
      await writeStreaming(promptText.value, options, handleTextChunk, handleDone);
    }
  } catch (error) {
    console.error('AI generation error:', error);
    isError.value = error.message || 'An error occurred';
  } finally {
    // Clear the input after submission
    promptText.value = '';
    // Only disable track changes if we enabled it (in suggesting mode)
    if (isInSuggestingMode.value) {
      props.editor.commands.disableTrackChanges();
    }
    isLoading.value = false;
    // Ensure textProcessingStarted is reset for next operation
    textProcessingStarted.value = false;
  }
};

// New handler for keydown
const handleKeyDown = (event) => {
  // For Enter key, submit the form instead of adding a new line
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    handleSubmit();
  }
};

// Updated handler for input to work with textarea
const handleInput = (event) => {
  if (isError.value) {
    isError.value = '';
  }
  // Textarea provides value instead of textContent
  promptText.value = event.target.value;
};
</script>

<template>
  <div class="ai-writer prosemirror-isolated" ref="aiWriterRef" @mousedown.stop>
    <div class="ai-user-input-field">
      <span class="ai-textarea-icon" v-html="edit"></span>
      <textarea
        ref="editableRef"
        class="ai-textarea"
        :placeholder="placeholderText"
        @keydown="handleKeyDown"
        @input="handleInput"
        v-model="promptText"
        rows="4"
      ></textarea>
    </div>
    <div class="ai-loader">
      <span
        v-if="promptText"
        class="ai-textarea-icon ai-submit-button"
        @click.stop="handleSubmit"
        v-html="paperPlane"
      />
    </div>
  </div>
</template>

<style scoped>
/* Add isolation styles */
.prosemirror-isolated {
  /* Make sure the component is above ProseMirror in z-index */
  z-index: 100;
  position: relative;
}

.ai-writer {
  background-color: white;
  display: flex;
  flex-direction: column;
  width: 300px;
  border-radius: 5px;
  overflow-y: scroll;
  /* Firefox */
  scrollbar-width: none;
  /* Internet Explorer and Edge */
  -ms-overflow-style: none;

  padding: 0.75rem;
  box-shadow: 0 0 2px 2px #7715b366;
  border: 1px solid #7715b3;
}

/* Chrome, Safari, and Opera */
.ai-writer::-webkit-scrollbar {
  display: none;
}

/* Replace .ai-editable with .ai-textarea */
.ai-textarea {
  padding-left: 8px;
  width: 100%;
  color: #47484a;
  font-size: 12px;
  border: none;
  background: transparent;
  outline: none;
  resize: none;
  overflow: hidden;
  height: 100%;
  font-family: Inter, sans-serif;
}

/* Add specific styles for textarea placeholder */
.ai-textarea::placeholder {
  color: #666;
  font-weight: 400;
}

.ai-user-input-field {
  line-height: 13px;
  display: flex;
  flex-direction: row;
  min-height: 50px;
  resize: none;
  border: none;
  border-radius: 8px;
  margin-bottom: 10px;
}

.ai-textarea-icon {
  display: block;
  font-weight: 800;
  font-size: 14px;
  width: 16px;
  height: 16px;
}

.ai-textarea-icon svg {
  height: 16px;
  width: 16px;
}

.ai-textarea-icon.loading {
  animation: spin 2s linear infinite;
}

.loading i {
  display: flex;
}

.error {
  fill: #ed4337;
}

.ai-submit-button {
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
}

.ai-submit-button:hover {
  opacity: 0.8;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.ai-loader {
  display: flex;
  height: 14px;
  justify-content: flex-end;
  align-items: center;
}
</style>
