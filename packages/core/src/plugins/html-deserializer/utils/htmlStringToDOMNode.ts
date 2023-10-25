/**
 * Convert HTML string into HTML element with custom white-space handling.
 */
export const htmlStringToDOMNode = (
  rawHtml: string,
  stripWhitespace = true,
  preElementBehavior = true
) => {
  const node = document.createElement('body');
  node.innerHTML = rawHtml;
  const computedStyle = window.getComputedStyle(node);
  // Process based on the specified white-space value
  switch (computedStyle.whiteSpace) {
    case 'normal': {
      if (stripWhitespace) {
        // Collapse spaces and tabs, wrap text, remove end-of-line spaces
        node.innerHTML = node.innerHTML.replaceAll(/[\t\r]*\n[\t\r ]*/g, ' ');
      }
      break;
    }
    case 'nowrap': {
      if (stripWhitespace) {
        // Collapse spaces and tabs, no text wrap, remove end-of-line spaces
        node.innerHTML = node.innerHTML.replaceAll(/[\t\r]*\n[\t\r ]*/g, ' ');
      }
      break;
    }
    case 'pre': {
      // Preserve spaces and tabs, no text wrap, preserve end-of-line spaces
      break;
    }
    case 'pre-wrap': {
      // Preserve spaces and tabs, wrap text, preserve end-of-line spaces
      break;
    }
    case 'pre-line': {
      if (stripWhitespace) {
        // Preserve spaces, collapse tabs, wrap text, remove end-of-line spaces
        node.innerHTML = node.innerHTML.replaceAll('\t', ' ');
      }
      break;
    }
    case 'break-spaces': {
      // Preserve spaces and tabs, wrap text, wrap end-of-line spaces
      node.innerHTML = node.innerHTML.replaceAll(/[\t\r ]/g, ' ');
      break;
    }
    default: {
      // Use 'normal' behavior if the specified value is not recognized
      break;
    }
  }
  if (preElementBehavior) {
    // Check if the first element within the body is a PRE element
    const firstElement = node.firstElementChild;
    if (
      firstElement &&
      firstElement.tagName === 'PRE' &&
      rawHtml.startsWith('\n')
    ) {
      // Remove the leading newline character as per the HTML spec
      firstElement.textContent = rawHtml.slice(1);
    }
  }
  return node;
};
