/** Return the CSS class used to mark Plate plugin-rendered nodes in HTML. */
export function getPluginNodeClass(type: string): string;
export function getPluginNodeClass(type?: string): string | undefined;
export function getPluginNodeClass(type?: string) {
  return type ? `editor-${type}` : undefined;
}

/** Return true when the element carries the plugin node class. */
export const isPluginNodeClass = (element: HTMLElement, type: string) =>
  element.classList.contains(getPluginNodeClass(type));

/** Return true when an editor element boundary carries the plugin node class. */
export const isPluginElementClass = (element: HTMLElement, type: string) =>
  element.dataset.editorNode === 'element' && isPluginNodeClass(element, type);
