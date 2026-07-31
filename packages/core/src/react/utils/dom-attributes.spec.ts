import type { DOMHandlerProp } from '../plugin/DOMHandlers';

import { DOM_HANDLERS } from './dom-attributes';

type ListedDOMHandler = (typeof DOM_HANDLERS)[number];

it('lists every DOM handler prop exactly once', () => {
  const hasNoMissingHandlers: [
    Exclude<DOMHandlerProp, ListedDOMHandler>,
  ] extends [never]
    ? true
    : false = true;
  const hasNoExtraHandlers: [
    Exclude<ListedDOMHandler, DOMHandlerProp>,
  ] extends [never]
    ? true
    : false = true;

  expect(hasNoMissingHandlers).toBe(true);
  expect(hasNoExtraHandlers).toBe(true);
  expect(DOM_HANDLERS).toHaveLength(155);
  expect(new Set(DOM_HANDLERS).size).toBe(155);
});
