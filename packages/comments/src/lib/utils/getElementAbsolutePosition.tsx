export const getElementAbsolutePosition = (element: HTMLElement) => {
  let left = 0;
  let top = 0;
  let currentElement: HTMLElement | null = element;

  do {
    left += (currentElement.offsetLeft || 0) - currentElement.scrollLeft;
    top += (currentElement.offsetTop || 0) - currentElement.scrollTop;
    currentElement = currentElement.offsetParent as HTMLElement;
  } while (currentElement);

  return {
    left,
    top,
  };
};
