import { Descendant, Node } from 'slate';
import { jsx } from 'slate-hyperscript';

export const deserializeFragment = ({
  el,
  children,
}: {
  el: HTMLElement;
  children: (Node | null)[];
}): Descendant[] | undefined => {
  if (el.nodeName === 'BODY') {
    return jsx('fragment', {}, children);
  }
};
