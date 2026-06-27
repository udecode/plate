/** Return the CSS class used to mark Plate plugin-rendered nodes in HTML. */
export const getPluginNodeClass = (type?: string) =>
  type ? `plite-${type}` : '';

/** Return true when the element carries the plugin node class. */
export const isPluginNodeClass = (element: HTMLElement, pluginKey: string) =>
  element.classList.contains(getPluginNodeClass(pluginKey));

/** Return true when a Plite element boundary carries the plugin node class. */
export const isPluginElementClass = (element: HTMLElement, pluginKey: string) =>
  element.dataset.pliteNode === 'element' &&
  isPluginNodeClass(element, pluginKey);
