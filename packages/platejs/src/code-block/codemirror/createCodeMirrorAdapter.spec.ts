import {
  EditorSelection,
  EditorState,
  type Extension,
} from '@codemirror/state';
import { Decoration, EditorView, keymap, WidgetType } from '@codemirror/view';

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

const textLeft = (view: EditorView) => {
  const line = view.contentDOM.querySelector('.cm-line')!;
  const style = getComputedStyle(line);

  return (
    line.getBoundingClientRect().left +
    (Number.parseFloat(style.borderLeftWidth) || 0) +
    (Number.parseFloat(style.paddingLeft) || 0)
  );
};

const ORIGIN_X = 100;
const COLUMN_WIDTH = 10;
const CARET_HEIGHT = 14;
const columnX = (column: number) => ORIGIN_X + COLUMN_WIDTH * column;

const stubCaretRects = (
  view: EditorView,
  {
    mirror = false,
    rise = () => 0,
  }: { mirror?: boolean; rise?: (column: number) => number } = {}
) => {
  const original = Range.prototype.getClientRects;
  const columnOf = (target: Text, offset: number) => {
    let column = 0;
    const line = target.parentElement!.closest('.cm-line')!;
    const walker = document.createTreeWalker(line, NodeFilter.SHOW_ALL);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node === target) return column + offset;
      const element =
        node.nodeType === 1 ? (node as Element) : node.parentElement!;
      const widget = element.closest('[contenteditable="false"]');
      if (node === widget) column += 1;
      else if (node.nodeType === 3 && !(widget && line.contains(widget))) {
        column += (node as Text).length;
      }
    }
    return column;
  };
  Range.prototype.getClientRects = function getClientRects(this: Range) {
    if (
      this.startContainer.nodeType !== 3 ||
      !view.contentDOM.contains(this.startContainer)
    ) {
      return original.call(this);
    }
    const column = columnOf(this.startContainer as Text, this.startOffset);
    const width = view.state.doc.lineAt(
      view.posAtDOM(this.startContainer, this.startOffset)
    ).length;
    const left = columnX(mirror ? width - column : column);
    const top = -rise(column);
    const bottom = CARET_HEIGHT;
    return [
      { bottom, height: bottom - top, left, right: left, top, width: 0 },
    ] as unknown as DOMRectList;
  };
  cleanups.push(() => {
    Range.prototype.getClientRects = original;
  });
};

test('stale local changes reset before dispatch returns', () => {
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
  expect(view.state.doc.toString()).toBe('abc');
  expect(actions.dispatch).toHaveBeenCalledTimes(1);
});

test('synchronous canonical feedback cannot overwrite a later projection', () => {
  const { actions, set, view } = mount();
  actions.dispatch.mockImplementation(() => {
    set({ text: 'abc', version: 2 }, null);

    return { status: 'applied' as const };
  });

  view.dispatch({
    changes: { from: 1, insert: 'X', to: 1 },
    userEvent: 'input.type',
  });
  expect(view.state.doc.toString()).toBe('abc');
  set({ text: 'aXbc', version: 3 }, null);
  expect(view.state.doc.toString()).toBe('aXbc');
});

test('notifies extension observers before applying canonical feedback', () => {
  const observed: string[] = [];
  const mounted = mount({
    extensions: EditorView.updateListener.of((update) => {
      if (update.docChanged) observed.push(update.state.doc.toString());
    }),
  });
  mounted.actions.dispatch.mockImplementation(() => {
    mounted.set({ text: 'abcgood', version: 2 }, null);

    return { status: 'applied' as const };
  });

  mounted.view.dispatch({
    changes: { from: 3, insert: 'bad' },
    userEvent: 'input.type',
  });

  expect(observed).toEqual(['abcbad', 'abcgood']);
});

test('publishes transaction batches in their starting coordinates', () => {
  const { actions, view } = mount();
  actions.dispatch.mockReturnValue({ status: 'applied' as const });
  const first = view.state.update({ changes: { from: 1, insert: 'X' } });
  const second = first.state.update({
    changes: { from: 3, insert: 'Y', to: 4 },
  });

  view.dispatch([first, second]);

  expect(view.state.doc.toString()).toBe('aXbY');
  expect(actions.dispatch).toHaveBeenCalledWith({
    baseVersion: 1,
    changes: [
      { from: 1, insert: 'X', to: 1 },
      { from: 2, insert: 'Y', to: 3 },
    ],
    intent: 'input',
    selection: { anchor: 0, focus: 0 },
  });
});

test('restores canonical feedback before a dispatch error escapes', () => {
  const mounted = mount();
  mounted.actions.dispatch.mockImplementation(() => {
    mounted.set({ text: 'abc', version: 2 }, null);
    throw new Error('canonical transaction failed');
  });

  expect(() =>
    mounted.view.dispatch({ changes: { from: 3, insert: 'bad' } })
  ).toThrow('canonical transaction failed');
  expect(mounted.view.state.doc.toString()).toBe('abc');
});

test('rejects recursive dispatch from an update listener before mutation', () => {
  const errors: unknown[] = [];
  let attempted = false;
  const mounted = mount({
    extensions: [
      EditorView.exceptionSink.of((error) => errors.push(error)),
      EditorView.updateListener.of((update) => {
        if (!update.docChanged || attempted) return;
        attempted = true;
        update.view.dispatch({ changes: { from: 0, insert: 'R' } });
      }),
    ],
  });
  mounted.actions.dispatch.mockReturnValue({ status: 'applied' as const });

  mounted.view.dispatch({ changes: { from: 3, insert: 'bad' } });

  expect(mounted.view.state.doc.toString()).toBe('abcbad');
  expect(mounted.actions.dispatch).toHaveBeenCalledTimes(1);
  expect(errors).toHaveLength(1);
  expect(String(errors[0])).toContain('update listeners');
});

test('accepts an in-flight focus refresh that needs no view mutation', () => {
  const mountedRef: { current?: ReturnType<typeof mount> } = {};
  const mounted = mount({
    extensions: EditorView.updateListener.of((update) => {
      if (!update.selectionSet || update.docChanged) return;
      const selection = update.state.selection.main;

      mountedRef.current!.set({
        selection: {
          anchor: selection.anchor,
          focus: selection.head,
          mode: 'native',
        },
        version: 2,
      });
    }),
  });
  mountedRef.current = mounted;
  mounted.actions.select.mockReturnValue({ status: 'applied' as const });

  mounted.view.dispatch({ selection: { anchor: 1 } });

  expect(mounted.actions.select).toHaveBeenCalledWith({
    baseVersion: 2,
    selection: { anchor: 1, focus: 1 },
  });
});

test('rejects a non-monotonic no-op refresh during listener delivery', () => {
  const errors: unknown[] = [];
  let refreshes = 0;
  const mountedRef: { current?: ReturnType<typeof mount> } = {};
  const mounted = mount({
    extensions: [
      EditorView.exceptionSink.of((error) => errors.push(error)),
      EditorView.updateListener.of((update) => {
        if (!update.selectionSet || update.docChanged) return;
        const selection = update.state.selection.main;

        refreshes += 1;
        mountedRef.current!.set({
          selection: {
            anchor: selection.anchor,
            focus: selection.head,
            mode: 'native',
          },
          version: 2,
        });
      }),
    ],
  });
  mountedRef.current = mounted;
  mounted.actions.select.mockReturnValue({ status: 'applied' as const });

  mounted.view.dispatch({ selection: { anchor: 1 } });
  mounted.view.dispatch({ selection: { anchor: 2 } });

  expect(refreshes).toBe(2);
  expect(errors).toHaveLength(1);
  expect(String(errors[0])).toContain('update listeners');
  expect(mounted.actions.select).toHaveBeenLastCalledWith({
    baseVersion: 2,
    selection: { anchor: 2, focus: 2 },
  });
});

test('canonical text, read-only and selection updates do not echo to the model', () => {
  const { actions, set, view } = mount({
    extensions: EditorState.transactionFilter.of((transaction) =>
      transaction.docChanged ? [] : transaction
    ),
  });
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

test.each(['backward', 'forward'] as const)(
  '%s boundary navigation precedes consumer editing commands',
  (direction) => {
    const { actions, set, view } = mount({
      extensions: keymap.of([
        {
          key: direction === 'backward' ? 'ArrowLeft' : 'ArrowRight',
          run: () => true,
          shift: () => true,
        },
      ]),
    });
    const offset = direction === 'backward' ? 0 : 3;
    set({ selection: { anchor: offset, focus: offset, mode: 'native' } });
    const event = new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: direction === 'backward' ? 'ArrowLeft' : 'ArrowRight',
      shiftKey: true,
    });
    view.contentDOM.dispatchEvent(event);
    expect(actions.navigateOut).toHaveBeenCalledWith(
      expect.objectContaining({ baseVersion: 1, direction, extend: true })
    );
    expect(event.defaultPrevented).toBe(true);
    expect(actions.dispatch).not.toHaveBeenCalled();
  }
);

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

test('a horizontal exit sends no x, and a vertical exit sends the goal column', () => {
  const { actions, set, view } = mount();
  view.coordsAtPos = () => ({ bottom: 10, left: 42, right: 42, top: 0 });
  set({ selection: { anchor: 3, focus: 3, mode: 'native' } });
  view.contentDOM.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowRight',
    })
  );
  expect(actions.navigateOut).toHaveBeenLastCalledWith(
    expect.objectContaining({ direction: 'forward', x: undefined })
  );
  const { left } = view.contentDOM.getBoundingClientRect();
  view.dispatch({
    selection: EditorSelection.create([
      EditorSelection.cursor(3, 0, undefined, 30),
    ]),
  });
  view.contentDOM.dispatchEvent(
    new KeyboardEvent('keydown', {
      bubbles: true,
      cancelable: true,
      key: 'ArrowDown',
    })
  );
  expect(actions.navigateOut).toHaveBeenLastCalledWith(
    expect.objectContaining({ direction: 'forward', x: left + 30 })
  );
});

test('the estimate picks the nearer side of a tab', () => {
  const { adapter, set, view } = mount();
  set({ text: '\tb' }, null);
  const width = view.defaultCharacterWidth;
  const left = textLeft(view);
  expect(adapter.offsetAt!({ edge: 'start', x: left + width * 1.5 })).toBe(0);
  expect(adapter.offsetAt!({ edge: 'start', x: left + width * 2.5 })).toBe(1);
  expect(adapter.offsetAt!({ edge: 'start', x: left + width * 4.6 })).toBe(2);
});

test('offsetAt leaves a pending measure, the scroll and the DOM alone', () => {
  const { adapter, host, view } = mount();
  let wrote = false;
  view.requestMeasure({
    read: () => null,
    write: () => {
      wrote = true;
    },
  });
  const observer = new MutationObserver(() => {});
  observer.observe(host, {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  });
  const { scrollTop } = view.scrollDOM;
  adapter.offsetAt!({ edge: 'end', x: 5 });
  expect(observer.takeRecords()).toEqual([]);
  observer.disconnect();
  expect(wrote).toBe(false);
  expect(view.scrollDOM.scrollTop).toBe(scrollTop);
});

test('the entry keeps its answered goal through its own update and a repeated focus', () => {
  const { adapter, set, view } = mount();
  const { left } = view.contentDOM.getBoundingClientRect();
  const x = textLeft(view) + view.defaultCharacterWidth * 2;
  const offset = adapter.offsetAt!({ edge: 'start', x });
  expect(offset).toBe(2);
  set({ selection: { anchor: 2, focus: 2, mode: 'model' } });
  adapter.focus();
  expect(view.state.selection.main.head).toBe(2);
  expect(view.state.selection.main.goalColumn).toBe(x - left);
  adapter.focus();
  expect(view.state.selection.main.goalColumn).toBe(x - left);
});

test('an update between the answer and focus that changes text or moves elsewhere drops the goal', () => {
  const edited = mount();
  edited.adapter.offsetAt!({ edge: 'start', x: 20 });
  edited.set(
    { selection: { anchor: 2, focus: 2, mode: 'model' }, text: 'abcd' },
    [{ from: 3, insert: 'd', to: 3 }]
  );
  edited.adapter.focus();
  expect(edited.view.state.selection.main.goalColumn).toBeUndefined();

  const moved = mount();
  moved.adapter.offsetAt!({ edge: 'start', x: 20 });
  moved.set({ selection: { anchor: 1, focus: 1, mode: 'model' } });
  moved.adapter.focus();
  expect(moved.view.state.selection.main.goalColumn).toBeUndefined();
});

test('the estimate starts at the line text inset, not the content box edge', () => {
  const { adapter, set, view } = mount();
  set({ text: 'abcd' }, null);
  const line = view.contentDOM.querySelector<HTMLElement>('.cm-line')!;
  line.style.paddingLeft = '40px';
  const x = textLeft(view) + view.defaultCharacterWidth * 2.2;
  expect(adapter.offsetAt!({ edge: 'start', x })).toBe(2);
});

test('an undrawn edge line answers from the estimate', () => {
  const { adapter, set, view } = mount();
  set({ text: 'abcd' }, null);
  const x = textLeft(view) + view.defaultCharacterWidth * 2.2;
  Object.defineProperty(view, 'visibleRanges', { value: [] });
  expect(adapter.offsetAt!({ edge: 'end', x })).toBe(2);
});

test('the estimate takes its inset from a drawn caret when one exists', () => {
  const { adapter, set, view } = mount();
  set({ text: 'abcd' }, null);
  stubCaretRects(view);
  Object.defineProperty(view, 'visibleRanges', { value: [] });
  const x = columnX(0) + view.defaultCharacterWidth * 2.2;
  expect(adapter.offsetAt!({ edge: 'end', x })).toBe(2);
});

test('a read-only view still measures its drawn carets', () => {
  const { adapter, set, view } = mount();
  set({ readOnly: true, text: 'abcd' }, null);
  expect(view.contentDOM.getAttribute('contenteditable')).toBe('false');
  stubCaretRects(view);
  expect(adapter.offsetAt!({ edge: 'start', x: columnX(2) + 1 })).toBe(2);
});

class Folded extends WidgetType {
  toDOM() {
    const span = document.createElement('span');
    span.textContent = '…';
    return span;
  }
}

test('a short replaced range is skipped, not measured as the text after it', () => {
  const { adapter, set, view } = mount({
    extensions: EditorView.decorations.of(
      Decoration.set(Decoration.replace({ widget: new Folded() }).range(6, 10))
    ),
  });
  set({ text: 'abcdefghijklmnop' }, null);
  stubCaretRects(view);
  expect(adapter.offsetAt!({ edge: 'start', x: columnX(7) + 1 })).toBe(10);
});

test('the caret just before a replaced range stays a candidate', () => {
  const { adapter, set, view } = mount({
    extensions: EditorView.decorations.of(
      Decoration.set(Decoration.replace({ widget: new Folded() }).range(6, 10))
    ),
  });
  set({ text: 'abcdefghijklmnop' }, null);
  stubCaretRects(view);
  expect(adapter.offsetAt!({ edge: 'start', x: columnX(6) + 1 })).toBe(6);
});

test('a taller glyph does not split an unwrapped line into rows', () => {
  const { adapter, set, view } = mount();
  set({ text: 'abcdefghij' }, null);
  stubCaretRects(view, { rise: (column) => (column < 2 ? 12 : 0) });
  expect(adapter.offsetAt!({ edge: 'start', x: columnX(5) + 1 })).toBe(5);
});

test('a wrapped edge line lands at its edge and still installs the goal', () => {
  const { adapter, set, view } = mount({ extensions: EditorView.lineWrapping });
  set({ text: 'x'.repeat(200) }, null);
  stubCaretRects(view);
  const { left } = view.contentDOM.getBoundingClientRect();
  const x = columnX(3) + 1;
  expect(adapter.offsetAt!({ edge: 'start', x })).toBe(0);
  set({ selection: { anchor: 0, focus: 0, mode: 'model' } });
  adapter.focus();
  expect(view.state.selection.main.goalColumn).toBe(x - left);
});

test('a blank wrapped edge line answers its only offset and keeps the goal', () => {
  const { adapter, set, view } = mount({ extensions: EditorView.lineWrapping });
  set({ text: '\nabcdefghij' }, null);
  const { left } = view.contentDOM.getBoundingClientRect();
  const x = left + 40;
  expect(adapter.offsetAt!({ edge: 'start', x })).toBe(0);
  set({ selection: { anchor: 0, focus: 0, mode: 'model' } });
  adapter.focus();
  expect(view.state.selection.main.goalColumn).toBe(40);
});

test('a fully drawn right-to-left line answers its nearest caret past either side', () => {
  const { adapter, set, view } = mount();
  set({ text: 'אבגד' }, null);
  stubCaretRects(view, { mirror: true });
  expect(adapter.offsetAt!({ edge: 'start', x: columnX(0) - 5 })).toBe(4);
  expect(adapter.offsetAt!({ edge: 'start', x: columnX(4) + 5 })).toBe(0);
});
