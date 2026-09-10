import type { PliteDecorationAttributes } from '../facade';
import type { UnknownObject } from '../lib/types/AnyObject';

export const EMPTY_RENDERED_ATTRIBUTES: PliteDecorationAttributes =
  Object.freeze({});

export const mergePlateRenderedAttributes = <
  T extends UnknownObject,
  TAttributes extends PliteDecorationAttributes,
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
