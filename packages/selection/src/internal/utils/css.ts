const unitify = (val: number | string, unit = 'px'): string =>
  typeof val === 'number' ? val + unit : val;

const setStyleValue = (
  style: CSSStyleDeclaration,
  key: string,
  value: number | string
) => {
  (style as unknown as Record<string, string>)[key] = unitify(value);
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
      if (value !== undefined) {
        setStyleValue(style, key, value);
      }
    }
  } else if (val !== undefined) {
    setStyleValue(style, attr, val);
  }
}
