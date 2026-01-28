import { TextSelection } from 'prosemirror-state';
import LinkInput from './toolbar/LinkInput.vue';

/**
 * Calculates cursor position based on margin click event
 * @param {MouseEvent} event Mousedown event
 * @param {SuperEditor} editor SuperEditor instance
 */
export const onMarginClickCursorChange = (event, editor) => {
  const y = event.clientY;
  const x = event.clientX;
  const { view } = editor;
  const editorRect = view.dom.getBoundingClientRect();

  let coords = {
    left: 0,
    top: y,
  };
  let isRightMargin = false;

  if (x > editorRect.right) {
    coords.left = editorRect.left + editorRect.width - 1;
    isRightMargin = true;
  } else if (x < editorRect.left) {
    coords.left = editorRect.left;
  }

  const pos = view.posAtCoords(coords)?.pos;
  if (pos) {
    let cursorPos = pos;

    if (isRightMargin) {
      const $pos = view.state.doc.resolve(pos);
      const charOffset = $pos.textOffset;

      const node = view.state.doc.nodeAt(pos);
      const text = node?.text;
      const charAtPos = text?.charAt(charOffset);

      cursorPos = node?.isText && charAtPos !== ' ' ? pos - 1 : pos;
    }

    const transaction = view.state.tr.setSelection(TextSelection.create(view.state.doc, cursorPos));
    view.dispatch(transaction);
    view.focus();
  }
};

/**
 * Checks if the current selection has a parent node of a given type
 * and shows a popover with a link input if it does
 * @param {Editor} editor - The editor instance
 * @param {Object} popoverControls - The popover controls object
 */
export const checkNodeSpecificClicks = (editor, event, popoverControls) => {
  if (!editor) return;

  // Check if the selection has a parent node of a given type
  if (selectionHasNodeOrMark(editor.view.state, 'link', { requireEnds: true })) {
    // Show popover with link input
    popoverControls.component = LinkInput;
    // Calculate the position of the popover relative to the editor
    popoverControls.position = {
      left: `${event.clientX - editor.element.getBoundingClientRect().left}px`,
      top: `${event.clientY - editor.element.getBoundingClientRect().top + 15}px`,
    };
    popoverControls.props = {
      showInput: true,
    };
    popoverControls.visible = true;
  }
};

/**
 * Checks if the current selection is inside a node or mark with the given name.
 * Optionally, can restrict the check to only the start or end of the selection (not anywhere in the range).
 *
 * @param {EditorState} state - The ProseMirror editor state.
 * @param {string} name - The node or mark name to check for (e.g. 'paragraph', 'link').
 * @param {Object} [options] - Optional settings.
 * @param {boolean} [options.requireEnds=false] - If true, only checks if the start or end of the selection has the node/mark, not if it exists anywhere in the selection.
 *
 * This is useful for cases like showing a link popup: you may only want to show the popup if the selection starts or ends with a link, not if a link exists anywhere in the selection.
 *
 * @returns {boolean}
 */
export function selectionHasNodeOrMark(state, name, options = {}) {
  const { requireEnds = false } = options;
  const $from = state.selection.$from;
  const $to = state.selection.$to;

  // 1. Check for node in the parent chain
  if (requireEnds) {
    // Only check parent nodes at start or end
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === name) {
        return true;
      }
    }
    for (let d = $to.depth; d > 0; d--) {
      if ($to.node(d).type.name === name) {
        return true;
      }
    }
  } else {
    // Check anywhere in the parent chain from $from
    for (let d = $from.depth; d > 0; d--) {
      if ($from.node(d).type.name === name) {
        return true;
      }
    }
  }

  // 2. Check for mark at the selection
  const markType = state.schema.marks[name];
  if (markType) {
    const { from, to, empty } = state.selection;
    if (requireEnds) {
      // Only check marks at the start or end
      const fromMarks = markType.isInSet($from.marks());
      const toMarks = markType.isInSet($to.marks());
      if (fromMarks || toMarks) {
        return true;
      }
      // Also check storedMarks if selection is empty
      if (empty && markType.isInSet(state.storedMarks || $from.marks())) {
        return true;
      }
    } else {
      if (empty) {
        // Cursor: check marks at the cursor
        if (markType.isInSet(state.storedMarks || $from.marks())) {
          return true;
        }
      } else {
        // Range: check if any text in the range has the mark
        let hasMark = false;
        state.doc.nodesBetween(from, to, (node) => {
          if (markType.isInSet(node.marks)) {
            hasMark = true;
            return false;
          }
        });
        if (hasMark) return true;
      }
    }
  }

  // Not found as node or mark
  return false;
}

/**
 * Move the editor cursor to the position closest to the mouse event
 * @param {MouseEvent} event
 * @param {Object} editor - The editor instance
 */
export function moveCursorToMouseEvent(event, editor) {
  const { view } = editor;
  const coords = { left: event.clientX, top: event.clientY };
  const pos = view.posAtCoords(coords)?.pos;
  if (typeof pos === 'number') {
    const tr = view.state.tr.setSelection(TextSelection.create(view.state.doc, pos));
    view.dispatch(tr);
    view.focus();
  }
}
