import type { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

import type { ExternalTextState } from '../../react/core';
import { createCodeMirrorAdapter } from './createCodeMirrorAdapter';

const cleanups: Array<() => void> = [];

afterEach(() => {
  for (const cleanup of cleanups.splice(0)) cleanup();
});

function mount(options: Parameters<typeof createCodeMirrorAdapter>[0] = {}) {
  const host = document.createElement('div');
  host.setAttribute('aria-label', 'Source');
  document.body.append(host);
  let state: ExternalTextState<{ language?: string }> = {
    config: {},
    decorations: [],
    readOnly: false,
    selection: null,
    text: 'abc',
    version: 1,
  };
  const actions = {
    composition: mock(() => {}),
    deleteOut: mock(() => ({ status: 'applied' as const })),
    dispatch: mock(() => ({ status: 'stale' as const })),
    history: mock(() => true),
    navigateOut: mock(() => ({ status: 'applied' as const })),
    select: mock(() => ({ status: 'applied' as const })),
  };
  const adapter = createCodeMirrorAdapter(options).mount({
    actions,
    host,
    state,
  });
  const view = EditorView.findFromDOM(host.firstElementChild as HTMLElement)!;
  let destroyed = false;
  const destroy = () => {
    if (destroyed) return;
    adapter.destroy();
    destroyed = true;
    host.remove();
  };
  cleanups.push(destroy);

  return {
    actions,
    adapter,
    destroy,
    host,
    set(
      next: Partial<typeof state>,
      changes: Parameters<typeof adapter.update>[0]['changes'] = []
    ) {
      state = { ...state, ...next };
      adapter.update({ changes, state });
    },
    view,
  };
}

test('stale local changes reset to canonical text without a second dispatch', async () => {
  const { actions, host, view } = mount();
  expect(host.querySelector('.cm-content')?.getAttribute('aria-label')).toBe(
    'Source'
  );
  view.dispatch({
    changes: { from: 1, to: 2, insert: 'X' },
    userEvent: 'input.paste',
  });
  expect(actions.dispatch).toHaveBeenCalledWith({
    baseVersion: 1,
    changes: [{ from: 1, insert: 'X', to: 2 }],
    intent: 'paste',
    selection: { anchor: 0, focus: 0 },
  });
  await Promise.resolve();
  expect(view.state.doc.toString()).toBe('abc');
  expect(actions.dispatch).toHaveBeenCalledTimes(1);
});

test('canonical text, read-only and selection updates do not echo to the model', () => {
  const { actions, set, view } = mount();
  set(
    {
      text: 'remote:abc',
      version: 2,
      readOnly: true,
      selection: { anchor: 7, focus: 9, mode: 'native' },
    },
    [{ from: 0, insert: 'remote:', to: 0 }]
  );
  expect(view.state.doc.toString()).toBe('remote:abc');
  expect(view.contentDOM.contentEditable).toBe('false');
  expect(view.state.selection.main.anchor).toBe(7);
  expect(view.state.selection.main.head).toBe(9);
  expect(actions.dispatch).not.toHaveBeenCalled();
  expect(actions.select).not.toHaveBeenCalled();
  set({ text: 'z', version: 3, selection: null }, null);
  expect(view.state.doc.toString()).toBe('z');
});

test('neutral decorations and model selection are painted without duplicate syntax', () => {
  const { host, set } = mount();
  set({
    decorations: [
      {
        key: 'syntax',
        start: 0,
        end: 3,
        attributes: {
          'data-code-block-syntax': '',
          className: 'native-syntax',
        },
      },
      {
        key: 'comment',
        start: -1,
        end: 9,
        attributes: { 'data-comment': 'one', style: { color: 'red' } },
      },
    ],
    selection: { anchor: 0, focus: 2, mode: 'model' },
  });
  expect(host.querySelector('.native-syntax')).toBeNull();
  expect(host.querySelector('[data-comment="one"]')?.textContent).toBe('abc');
  expect(
    host.querySelector('[data-comment="one"]')?.getAttribute('style')
  ).toContain('red');
  expect(
    host.querySelector('[data-code-block-model-selection]')?.textContent
  ).toBe('ab');
});

test('history and boundary deletion use the canonical actions', () => {
  const { actions, view } = mount();
  view.contentDOM.dispatchEvent(
    new InputEvent('beforeinput', {
      bubbles: true,
      cancelable: true,
      inputType: 'historyUndo',
    })
  );
  expect(actions.history).toHaveBeenCalledWith('undo');
  const key = new KeyboardEvent('keydown', {
    key: 'Backspace',
    bubbles: true,
    cancelable: true,
  });
  view.contentDOM.dispatchEvent(key);
  expect(key.defaultPrevented).toBe(true);
  expect(actions.deleteOut).toHaveBeenCalledWith({
    baseVersion: 1,
    direction: 'backward',
  });
  expect(view.state.doc.toString()).toBe('abc');
});

test('pending composition completion is flushed once before disposal', async () => {
  const { actions, destroy, view } = mount();
  view.contentDOM.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true })
  );
  view.contentDOM.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true })
  );
  destroy();
  expect(actions.composition.mock.calls).toEqual([['start'], ['end']]);
  await Promise.resolve();
  expect(actions.composition.mock.calls).toEqual([['start'], ['end']]);
});

test('a second composition starts after the preceding completion', async () => {
  const { actions, view } = mount();
  view.contentDOM.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true })
  );
  view.contentDOM.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true })
  );
  view.contentDOM.dispatchEvent(
    new CompositionEvent('compositionstart', { bubbles: true })
  );
  await Promise.resolve();
  expect(actions.composition.mock.calls).toEqual([
    ['start'],
    ['end'],
    ['start'],
  ]);
  view.contentDOM.dispatchEvent(
    new CompositionEvent('compositionend', { bubbles: true })
  );
  await Promise.resolve();
  expect(actions.composition.mock.calls).toEqual([
    ['start'],
    ['end'],
    ['start'],
    ['end'],
  ]);
});

test('the latest language request wins across A to B to A changes', async () => {
  const pending: Array<{
    resolve: (extension: Extension) => void;
    reject: (error: Error) => void;
  }> = [];
  const { host, set, view } = mount({
    loadLanguage: () =>
      new Promise((resolve, reject) => {
        pending.push({ resolve, reject });
      }),
  });
  set({ config: { language: 'a' } });
  set({ config: { language: 'b' } });
  set({ config: { language: 'a' } });
  pending[2].resolve(
    EditorView.contentAttributes.of({ 'data-language-version': 'current' })
  );
  await Promise.resolve();
  pending[0].reject(new Error('old a'));
  pending[1].resolve(
    EditorView.contentAttributes.of({ 'data-language-version': 'old' })
  );
  await Promise.resolve();
  expect(view.contentDOM.getAttribute('data-language-version')).toBe('current');
  expect(host.dataset.codeBlockLanguageError).toBeUndefined();
});

test('language failure is cleared by reconfiguration and disposed loads stay inert', async () => {
  let resolve!: (extension: Extension) => void;
  const { destroy, host, set } = mount({
    loadLanguage(name) {
      if (name === 'failed') throw new Error('unavailable');
      return new Promise((resolveLanguage) => {
        resolve = resolveLanguage;
      });
    },
  });
  set({ config: { language: 'failed' } });
  expect(host.dataset.codeBlockLanguageError).toBe('unavailable');
  set({ config: { language: 'pending' } });
  expect(host.dataset.codeBlockLanguageError).toBeUndefined();
  destroy();
  resolve(EditorView.contentAttributes.of({ 'data-language-version': 'late' }));
  await Promise.resolve();
  expect(host.childElementCount).toBe(0);
  expect(host.dataset.codeBlockLanguageError).toBeUndefined();
});
