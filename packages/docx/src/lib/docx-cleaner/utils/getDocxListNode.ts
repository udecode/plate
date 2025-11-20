export const getDocxListNode = (element: Element): Node | null =>
  element.querySelector('[style="mso-list:Ignore"]') ||
  element.querySelector('span[lang]');
