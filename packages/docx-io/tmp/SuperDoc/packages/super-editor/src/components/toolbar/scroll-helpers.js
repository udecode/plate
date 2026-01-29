function getScrollableParent(element) {
  let currentElement = element;

  while (currentElement) {
    const overflowY = window.getComputedStyle(currentElement).overflowY;
    if (/(auto|scroll)/.test(overflowY) && currentElement.scrollHeight > currentElement.clientHeight) {
      return currentElement;
    }
    currentElement = currentElement.parentElement;
  }

  return document.scrollingElement || document.documentElement;
}

export function scrollToElement(targetElement, options = { behavior: 'smooth', block: 'start' }) {
  if (!targetElement) return;

  const container = getScrollableParent(targetElement);

  const containerRect = container.getBoundingClientRect();
  const targetRect = targetElement.getBoundingClientRect();
  const offsetTop = targetRect.top - containerRect.top + container.scrollTop;

  container.scrollTo({
    top: options.block === 'start' ? offsetTop : offsetTop - container.clientHeight + targetElement.offsetHeight,
    behavior: options.behavior,
  });
}
