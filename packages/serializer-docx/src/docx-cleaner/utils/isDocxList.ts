export const isDocxList = (element: Element): boolean => {
  const styleAttribute = element.getAttribute('style');

  if (!styleAttribute) {
    return false;
  }

  const hasMsoListInStyle = /mso-list:\s*l/i.test(styleAttribute);

  if (!hasMsoListInStyle) {
    return false;
  }

  const hasMsoListIgnoreChild = Boolean(
    element.querySelector('[style="mso-list:Ignore"]')
  );

  if (hasMsoListIgnoreChild) {
    return true;
  }

  return element.outerHTML.includes('<!--[if !supportLists]-->');
};
