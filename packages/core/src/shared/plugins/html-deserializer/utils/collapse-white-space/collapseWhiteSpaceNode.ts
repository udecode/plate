import type { CollapseWhiteSpaceState } from './types';

import { isHtmlElement } from '../isHtmlElement';
import { isHtmlText } from '../isHtmlText';
import { collapseWhiteSpaceChildren } from './collapseWhiteSpaceChildren';
import { collapseWhiteSpaceElement } from './collapseWhiteSpaceElement';
import { collapseWhiteSpaceText } from './collapseWhiteSpaceText';

export const collapseWhiteSpaceNode = (
  node: Node,
  state: CollapseWhiteSpaceState
) => {
  if (isHtmlElement(node)) {
    collapseWhiteSpaceElement(node as HTMLElement, state);

    return;
  }
  if (isHtmlText(node)) {
    collapseWhiteSpaceText(node as Text, state);

    return;
  }

  collapseWhiteSpaceChildren(node, state);
};
