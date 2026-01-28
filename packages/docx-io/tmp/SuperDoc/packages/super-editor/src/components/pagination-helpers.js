/**
 * Adjusts pagination breaks based on editor zoom/positioning
 *
 * @param {HTMLElement} editorElem The editor container element
 * @param {Object} editor The editor instance
 * @returns {void}
 */
export function adjustPaginationBreaks(editorElem, editor) {
  if (!editorElem.value || !editor?.value?.options?.scale) return;

  const zoom = editor.value.options.scale;
  const bounds = editorElem.value.getBoundingClientRect();

  // Find all `.pagination-break-wrapper` nodes and adjust them
  const breakNodes = editorElem.value.querySelectorAll('.pagination-break-wrapper');
  let firstLeft;

  // We align all nodes to the first one, which is guaranteed to be in the right place
  // since its the original header and is not generated inside any document node
  breakNodes.forEach((node) => {
    const nodeBounds = node.getBoundingClientRect();
    const left = ((nodeBounds.left - bounds.left) / zoom) * -1 + 1;
    if (!firstLeft) firstLeft = left;
    if (left !== firstLeft) {
      const diff = left - firstLeft;
      // Note: elements with "position: fixed" do not work correctly with transform style.
      // node.style.left = `${diff}px`;
      node.style.transform = `translateX(${diff}px)`;
    }
  });
}
