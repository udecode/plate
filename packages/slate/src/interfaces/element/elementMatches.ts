import { Element } from 'slate';

import type { TElement } from './TElement';

export const elementMatches = (element: TElement, props: object) =>
  Element.matches(element, props);
