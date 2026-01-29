import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { Extension } from '@core/Extension.js';

export const NodeResizerKey = new PluginKey('node-resizer');

/**
 * Plugin key for the resize plugin
 */
const nodeResizer = (nodeNames = ['image'], editor) => {
  // Track the resize state
  let resizeState = {
    dragging: false,
    startX: 0,
    startY: 0,
    startWidth: 0,
    startHeight: 0,
    handle: null,
    pos: null,
    resizableElement: null,
    aspectRatio: 1,
  };

  // Store references to resize handles container and editor view
  let resizeContainer = null;
  let editorView = null;
  let globalClickHandler = null;
  let globalMousedownHandler = null;
  let scrollHandler = null;
  let currentWrapper = null;

  return new Plugin({
    key: NodeResizerKey,

    state: {
      init() {
        return DecorationSet.empty;
      },

      apply(tr, oldState, _, newState) {
        // Skip if the transaction is from this plugin
        if (tr.getMeta(NodeResizerKey)) {
          return oldState;
        }

        if (typeof document === 'undefined' || editor.options.isHeadless) return oldState;

        // If selection is not on a resizable node — keep current decorations
        const { selection } = newState;
        const node = selection.node;
        if (!node || !nodeNames.includes(node.type.name)) {
          return DecorationSet.empty;
        }

        const decorations = [];

        // Only create decoration if one of the resizable nodes is selected
        if (nodeNames.includes(selection.node?.type.name)) {
          decorations.push(
            Decoration.node(selection.from, selection.to, {
              nodeName: 'span',
              class: 'sd-editor-resizable-wrapper',
              'data-pos': selection.from,
            }),
          );
        }

        return DecorationSet.create(newState.doc, decorations);
      },
    },

    props: {
      decorations(state) {
        return this.getState(state);
      },
    },

    view(view) {
      editorView = view;

      // Add global click handler
      globalClickHandler = (event) => {
        if (
          !event.target.closest('.sd-editor-resizable-wrapper') &&
          !event.target.closest('.sd-editor-resize-container')
        ) {
          hideResizeHandles();
        }
      };

      document.addEventListener('click', globalClickHandler);

      // Add global mousedown handler
      globalMousedownHandler = (event) => {
        if (event.target.closest('.sd-editor-resize-handle')) {
          event.preventDefault();
          event.stopPropagation();
          startResize(editorView, event, event.target);
          return true;
        }
      };

      document.addEventListener('mousedown', globalMousedownHandler);

      // Add scroll handler to update handle positions during scroll
      scrollHandler = () => {
        if (currentWrapper && resizeContainer) {
          updateHandlePositions(currentWrapper.firstElementChild);
        }
      };

      // Listen for scroll on both window and editor container
      window.addEventListener('scroll', scrollHandler, true);

      return {
        update(view, prevState) {
          // Show/hide resize handles based on selection changes
          const { selection } = view.state;
          const prevSelection = prevState.selection;

          if (selection.from !== prevSelection.from || selection.to !== prevSelection.to) {
            setTimeout(() => {
              const selectedResizableWrapper = document.querySelector('.sd-editor-resizable-wrapper');
              if (selectedResizableWrapper) {
                showResizeHandles(view, selectedResizableWrapper);
              } else {
                hideResizeHandles();
              }
            }, 10);
          }
        },

        destroy() {
          hideResizeHandles();
          cleanupEventListeners();
          if (globalClickHandler) {
            document.removeEventListener('click', globalClickHandler);
            globalClickHandler = null;
          }
          if (globalMousedownHandler) {
            document.removeEventListener('mousedown', globalMousedownHandler);
            globalMousedownHandler = null;
          }
          if (scrollHandler) {
            window.removeEventListener('scroll', scrollHandler, true);
            scrollHandler = null;
          }
          editorView = null;
        },
      };
    },
  });

  function showResizeHandles(view, wrapper) {
    hideResizeHandles();

    const pos = Number.parseInt(wrapper.getAttribute('data-pos'), 10);

    const node = view.state.doc.nodeAt(pos);
    if (!nodeNames.includes(node?.type.name)) return;

    // Store current wrapper for scroll updates
    currentWrapper = wrapper;

    // Create resize container
    resizeContainer = document.createElement('div');
    resizeContainer.className = 'sd-editor-resize-container';
    resizeContainer.style.position = 'absolute';
    resizeContainer.style.pointerEvents = 'none';
    resizeContainer.style.zIndex = '1000';

    // Create handles
    const handles = ['nw', 'ne', 'sw', 'se'];
    for (const handle of handles) {
      const handleEl = document.createElement('div');
      handleEl.className = `sd-editor-resize-handle sd-editor-resize-handle-${handle}`;
      handleEl.setAttribute('data-handle', handle);
      handleEl.setAttribute('data-pos', pos);
      handleEl.style.pointerEvents = 'auto';
      resizeContainer.appendChild(handleEl);
    }

    // Position the container relative to the resizable element
    document.body.appendChild(resizeContainer);
    updateHandlePositions(wrapper.firstElementChild);
  }

  function hideResizeHandles() {
    if (resizeContainer?.parentNode) {
      resizeContainer.parentNode.removeChild(resizeContainer);
      resizeContainer = null;
    }
    currentWrapper = null; // Clear wrapper reference
  }

  function updateHandlePositions(resizableElement) {
    if (!resizeContainer || !resizableElement) return;

    const rect = resizableElement.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

    resizeContainer.style.left = `${rect.left + scrollLeft}px`;
    resizeContainer.style.top = `${rect.top + scrollTop}px`;
    resizeContainer.style.width = `${rect.width}px`;
    resizeContainer.style.height = `${rect.height}px`;
  }

  function startResize(view, event, handleElement) {
    if (!view.hasFocus()) return;
    const handle = handleElement.getAttribute('data-handle');
    const pos = Number.parseInt(handleElement.getAttribute('data-pos'), 10);
    if (view.state.selection.from !== pos || !nodeNames.includes(view.state.selection.node?.type.name)) return;

    const resizableElement = view.nodeDOM(pos);

    if (!resizableElement) return;

    const rect = resizableElement.getBoundingClientRect();

    resizeState = {
      dragging: true,
      startX: event.clientX,
      startY: event.clientY,
      startWidth: rect.width,
      startHeight: rect.height,
      handle,
      pos,
      resizableElement,
      aspectRatio: rect.width / rect.height,
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = getResizeCursor(handle);
    document.body.style.userSelect = 'none';
  }

  function handleMouseMove(event) {
    if (!resizeState.dragging) return;

    event.preventDefault();
    event.stopPropagation();

    let deltaX = event.clientX - resizeState.startX;

    // Adjust delta based on handle position
    if (resizeState.handle.includes('w')) deltaX = -deltaX;

    // Calculate new dimensions maintaining aspect ratio
    const newWidth = Math.max(20, resizeState.startWidth + deltaX);

    // Apply the new size immediately for visual feedback
    if (resizeState.resizableElement) {
      resizeState.resizableElement.style.width = `${newWidth}px`;
      resizeState.resizableElement.style.height = 'auto';

      // Update handle positions
      updateHandlePositions(resizeState.resizableElement);
    }
  }

  function handleMouseUp(event) {
    if (!resizeState.dragging) return;

    cleanupEventListeners();

    let deltaX = event.clientX - resizeState.startX;

    // Adjust delta based on handle position
    if (resizeState.handle.includes('w')) deltaX = -deltaX;

    // Calculate final dimensions
    const newWidth = Math.max(20, resizeState.startWidth + deltaX);
    const newHeight = newWidth / resizeState.aspectRatio;

    // Update the document
    if (editorView && resizeState.pos < editorView.state.doc.content.size) {
      const tr = editorView.state.tr;
      const node = tr.doc.nodeAt(resizeState.pos);

      if (nodeNames.includes(node?.type.name)) {
        const attrs = {
          ...node.attrs,
          size: {
            ...node.attrs.size,
            width: Math.round(newWidth),
            height: Math.round(newHeight),
          },
        };

        tr.setNodeMarkup(resizeState.pos, null, attrs);
        tr.setMeta(NodeResizerKey, { action: 'resize' });
        editorView.dispatch(tr);
      }
    }

    // Reset resize state
    resizeState = {
      dragging: false,
      startX: 0,
      startY: 0,
      startWidth: 0,
      startHeight: 0,
      handle: null,
      pos: null,
      resizableElement: null,
      aspectRatio: 1,
    };
  }

  function cleanupEventListeners() {
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  function getResizeCursor(handle) {
    switch (handle) {
      case 'nw':
      case 'se':
        return 'nwse-resize';
      case 'ne':
      case 'sw':
        return 'nesw-resize';
      default:
        return 'default';
    }
  }
};

export const NodeResizer = Extension.create({
  name: 'nodeResizer',

  addPmPlugins() {
    const isHeadless = this.editor.options.isHeadless;
    const hasDocument = typeof document !== 'undefined';
    if (isHeadless || !hasDocument) return [];
    return [nodeResizer(['image'], this.editor)];
  },
});
