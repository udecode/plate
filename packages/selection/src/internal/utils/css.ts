const unitify = (val: number | string, unit = 'px'): string => {
  return typeof val === 'number' ? val + unit : val;
};

/**
 * Add css to a DOM-Element or returns the current value of a property.
 *
 * @param el The Element.
 * @param attr The attribute or an object which holds css key-properties.
 * @param val The value for a single attribute.
 * @returns {any}
 */
export function css(
  { style }: HTMLElement,
  attr: Partial<Record<keyof CSSStyleDeclaration, number | string>> | string,
  val?: number | string
): void {
  if (typeof attr === 'object') {
    for (const [key, value] of Object.entries(attr)) {
      value !== undefined && (style[key as any] = unitify(value));
    }
  } else if (val !== undefined) {
    style[attr as any] = unitify(val);
  }
}
