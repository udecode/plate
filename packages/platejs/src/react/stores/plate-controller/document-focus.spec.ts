import { createEditor } from '../../editor';
import { bindDocumentFocus, getDocumentFocus } from './document-focus.internal';

test('nested view focus belongs to the nearest editable', () => {
  const outer = document.createElement('div');
  const inner = document.createElement('div');
  outer.setAttribute('data-plite-editor', 'true');
  inner.setAttribute('data-plite-editor', 'true');
  inner.tabIndex = 0;
  outer.append(inner);
  document.body.append(outer);
  let outerCalls = 0;
  let innerCalls = 0;
  const cleanOuter = bindDocumentFocus(createEditor(), outer, () => {
    outerCalls += 1;
  });
  const cleanInner = bindDocumentFocus(createEditor(), inner, () => {
    innerCalls += 1;
  });
  inner.focus();
  expect(outerCalls).toBe(0);
  expect(innerCalls).toBe(1);
  cleanInner();
  cleanOuter();
  outer.remove();
});

test('a shadow-root view can publish focus and remount while focused', () => {
  const host = document.createElement('div');
  document.body.append(host);
  const shadow = host.attachShadow({ mode: 'open' });
  const element = document.createElement('div');
  element.setAttribute('data-plite-editor', 'true');
  element.tabIndex = 0;
  shadow.append(element);
  const editor = createEditor();
  let calls = 0;
  const cleanup = bindDocumentFocus(editor, element, () => {
    calls += 1;
  });
  element.focus();
  expect(calls).toBe(1);
  cleanup();
  const remount = bindDocumentFocus(editor, element, () => {
    calls += 1;
  });
  expect(calls).toBe(2);
  remount();
  host.remove();
});

test('disposing an older view preserves the same editor in its current view', () => {
  const owner = getDocumentFocus(document);
  const editor = createEditor();
  const oldView = document.createElement('div');
  const currentView = document.createElement('div');
  let wakes = 0;
  const unsubscribe = owner.subscribe(editor, () => {
    wakes += 1;
  });
  owner.focus(editor, oldView);
  owner.focus(editor, currentView);
  owner.dispose(oldView);
  expect(owner.isLast(editor)).toBe(true);
  expect(wakes).toBe(1);
  owner.dispose(currentView);
  expect(owner.isLast(editor)).toBe(false);
  expect(wakes).toBe(2);
  unsubscribe();
});

test('repeated unsubscribe preserves a later subscription for the same editor', () => {
  const owner = getDocumentFocus(document);
  const editor = createEditor();
  const old = owner.subscribe(editor, () => {});
  old();
  let wakes = 0;
  const current = owner.subscribe(editor, () => {
    wakes += 1;
  });
  old();
  const element = document.createElement('div');
  owner.focus(editor, element);
  expect(wakes).toBe(1);
  owner.dispose(element);
  current();
});

test('repeated binding cleanup preserves the replacement binding on the same element', () => {
  const element = document.createElement('div');
  element.setAttribute('data-plite-editor', 'true');
  element.tabIndex = 0;
  document.body.append(element);
  const editor = createEditor();
  const old = bindDocumentFocus(editor, element, () => {});
  element.focus();
  old();
  const current = bindDocumentFocus(editor, element, () => {});
  old();
  expect(getDocumentFocus(document).isLast(editor)).toBe(true);
  current();
  element.remove();
});
