import type { DecorationAttributes } from '../facade';
import type { UnknownObject } from '../lib/types/AnyObject';

export const EMPTY_RENDERED_ATTRIBUTES: DecorationAttributes = Object.freeze(
  {}
);

export const clonePlateRenderedAttributes = <T extends DecorationAttributes>(
  attributes: T
): T => {
  const cloned: UnknownObject = {};

  Object.keys(attributes).forEach((name) => {
    const value = (attributes as UnknownObject)[name];

    if (value === undefined) return;
    if (name === 'className' || name === 'placeholder') {
      if (typeof value !== 'string') {
        throw new Error(`Rendered attribute "${name}" must be a string.`);
      }
    } else if (name === 'style') {
      if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        throw new Error('Rendered attribute "style" must be an object.');
      }
      Object.entries(value).forEach(([styleName, styleValue]) => {
        if (
          styleValue !== undefined &&
          typeof styleValue !== 'number' &&
          typeof styleValue !== 'string'
        ) {
          throw new Error(
            `Rendered style "${styleName}" must be a string or number.`
          );
        }
      });
    } else if (!name.startsWith('aria-') && !name.startsWith('data-')) {
      throw new Error(`Unsupported rendered attribute "${name}".`);
    } else if (
      typeof value !== 'boolean' &&
      typeof value !== 'number' &&
      typeof value !== 'string'
    ) {
      throw new Error(
        `Rendered attribute "${name}" must be a primitive value.`
      );
    }

    cloned[name] =
      name === 'style'
        ? Object.freeze({ ...(value as Record<string, unknown>) })
        : value;
  });

  return Object.freeze(cloned) as T;
};

export const mergePlateRenderedAttributes = <
  T extends UnknownObject,
  TAttributes extends DecorationAttributes,
>(
  attributes: T,
  rendered: TAttributes
): T => {
  if (rendered === EMPTY_RENDERED_ATTRIBUTES) return attributes;

  const baseClass =
    typeof attributes.className === 'string' ? attributes.className : '';
  const renderedClass =
    typeof rendered.className === 'string' ? rendered.className : '';
  const className =
    baseClass && renderedClass
      ? `${baseClass} ${renderedClass}`
      : baseClass || renderedClass;
  const baseStyle =
    typeof attributes.style === 'object' && attributes.style !== null
      ? attributes.style
      : undefined;
  const merged = {
    ...attributes,
    ...rendered,
  } as UnknownObject;

  if (className) merged.className = className;
  else delete merged.className;
  if (baseStyle || rendered.style) {
    merged.style = { ...baseStyle, ...rendered.style };
  } else delete merged.style;

  return merged as T;
};
