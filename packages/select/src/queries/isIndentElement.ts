import { isDefined, isElement, TElement, Value } from '@udecode/plate-common';

export const isIndentElement = <V extends Value>(element: TElement) => {
  return isElement(element) && isDefined(element.listStyleType);
};
