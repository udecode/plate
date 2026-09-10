import { expect, test } from 'bun:test';

import { JSDOM } from 'jsdom';

import { getSelection } from '../../src/dom/utils/dom';

test('falls back to the owner document when a shadow root has no selection', () => {
  const dom = new JSDOM('<!doctype html><div id="host"></div>');
  const host = dom.window.document.querySelector('#host')!;
  const shadowRoot = host.attachShadow({ mode: 'open' });
  const documentSelection = dom.window.document.getSelection();

  Object.defineProperty(shadowRoot, 'getSelection', {
    configurable: true,
    value: () => null,
  });

  expect(getSelection(shadowRoot)).toBe(documentSelection);
});
