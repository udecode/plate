import { act, fireEvent, render, waitFor } from '@testing-library/react';
import {
  defineEditorSchema,
  defineExtension,
  defineExtensionSlot,
  property,
  schema,
  setEditorReadOnly,
  TextApi,
} from 'plitejs';
import { getEditorDOMRoot } from 'plitejs/dom';
import { History, history } from 'plitejs/history';
import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';

import { getLastCommit } from '../../src/internal';
import {
  createEditor,
  Editable,
  Plite,
  type PliteDecorationSource,
} from '../../src/react';
import { applyDOMCoverageSelectionPolicy } from '../../src/react/editable/dom-coverage-selection';
import {
  findMountedEditableDOMRuntime,
  getMountedEditableDOMRuntime,
} from '../../src/react/editable/editable-dom-runtime';
import { subscribeSource } from '../../src/react/editable/runtime-editor-api';
import { createRuntimeSelectionChangeHandler } from '../../src/react/editable/runtime-selection-engine';
import { applyEditableDOMSelectionChange } from '../../src/react/editable/selection-controller';
import type {
  ExternalTextActions,
  ExternalTextAdapter,
  ExternalTextChange,
  ExternalTextState,
} from '../../src/react/external-text';

const textSchema = defineEditorSchema('schema:external-text-test', {
  elements: {
    code: { content: schema.content.text({ min: 1, max: 1 }) },
    paragraph: { content: schema.content.text({ min: 0 }) },
  },
  id: 'external-text-test',
  properties: [schema.textProperty('bold', property.boolean())],
  root: schema.content.not(schema.content.text()),
  roots: { notes: schema.content.type('code') },
  version: 1,
});

const createFixture = (text = 'A😀B\nC') =>
  createEditor({
    extensions: [textSchema, history()],
    initialValue: [{ type: 'code', children: [{ text }] }],
  });

const createAdapter = () => {
  const records: Array<{
    actions: ExternalTextActions;
    destroyed: number;
    host: HTMLElement;
    state: ExternalTextState<undefined>;
    updates: Array<readonly ExternalTextChange[] | null>;
  }> = [];
  const adapter: ExternalTextAdapter = {
    mount({ actions, host, state }) {
      const record = {
        actions,
        destroyed: 0,
        host,
        state,
        updates: [] as Array<readonly ExternalTextChange[] | null>,
      };
      records.push(record);
      const input = host.ownerDocument.createElement('textarea');
      input.setAttribute('aria-label', host.getAttribute('aria-label')!);
      input.value = state.text;
      host.append(input);
      return {
        destroy() {
          record.destroyed += 1;
          input.remove();
        },
        focus() {
          input.focus();
        },
        update({ changes, state: next }) {
          record.state = next;
          record.updates.push(changes);
        },
      };
    },
  };
  return { adapter, records };
};

class ProjectionErrorBoundary extends React.Component<
  { children: React.ReactNode; onError: (error: Error) => void },
  { error: Error | null }
> {
  state = { error: null } as { error: Error | null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error) {
    this.props.onError(error);
  }

  render() {
    return this.state.error ? null : this.props.children;
  }
}

const externalRenderer =
  (
    adapter: ExternalTextAdapter
  ): NonNullable<React.ComponentProps<typeof Editable>['renderElement']> =>
  ({ attributes, element, slots }) => (
    <div {...attributes}>
      {element.type === 'code'
        ? slots.externalText({ adapter, ariaLabel: 'Code' })
        : slots.children()}
    </div>
  );

describe('external text views', () => {
  test('resolves the surviving mounted DOM owner after the focused third view unmounts', async () => {
    const editor = createEditor({
      extensions: [textSchema, history()],
      initialValue: [
        {
          type: 'paragraph',
          children: [{ text: 'Before the external view.' }],
        },
        { type: 'code', children: [{ text: 'One canonical text.' }] },
        { type: 'paragraph', children: [{ text: 'After the external view.' }] },
      ],
    });
    const { adapter } = createAdapter();
    const nativeView = <Editable id="retirement-native" />;
    const primaryView = (
      <Editable
        id="retirement-primary"
        renderElement={externalRenderer(adapter)}
      />
    );
    const tree = (third: boolean) => (
      <React.StrictMode>
        <Plite editor={editor}>
          {nativeView}
          {primaryView}
          {third && (
            <Editable
              id="retirement-secondary"
              renderElement={externalRenderer(adapter)}
            />
          )}
        </Plite>
      </React.StrictMode>
    );
    const errors: unknown[][] = [];
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation((...args) => {
        errors.push(args);
      });
    const view = render(tree(true));
    try {
      const native =
        view.container.querySelector<HTMLElement>('#retirement-native')!;
      const secondary = view.container.querySelector<HTMLElement>(
        '#retirement-secondary'
      )!;
      const survivorRuntime = findMountedEditableDOMRuntime(native)!;
      const removedRuntime = findMountedEditableDOMRuntime(secondary)!;
      const { dom } = survivorRuntime.editor.api;
      await act(async () => secondary.focus());
      expect(getEditorDOMRoot(editor)).toBe(secondary);
      expect(dom.editable()).toBe(secondary);
      expect(errors).toEqual([]);

      view.rerender(tree(false));
      expect(removedRuntime.connected).toBe(false);
      expect(survivorRuntime.connected).toBe(true);
      await act(async () => native.focus());
      expect(getEditorDOMRoot(editor)).toBe(native);
      expect.soft(dom.editable()).toBe(native);
      expect.soft(dom.root()).toBe(native);
      expect.soft(dom.resolveDOMNode(survivorRuntime.editor)).toBe(native);
      expect.soft(() => dom.hasEditableTarget(native)).not.toThrow();
      expect(dom.resolveDOMNode(editor.read.nodes.get([0])![0])).toBe(
        native.querySelector('[data-plite-path="0"]')
      );
      expect(
        native.contains(dom.resolveDOMPoint({ path: [0, 0], offset: 0 })![0])
      ).toBe(true);
      expect(errors).toEqual([]);
    } finally {
      view.unmount();
      consoleError.mockRestore();
    }
  });

  test.each([1, 100])(
    'validates %i mounted projections in one DOM pass',
    (count) => {
      const editor = createEditor({
        extensions: [textSchema],
        initialValue: Array.from({ length: count }, (_, index) => ({
          type: 'code',
          children: [{ text: `code ${index}` }],
        })),
      });
      const { adapter, records } = createAdapter();
      const query = Element.prototype.querySelectorAll;
      let visited = 0;
      const spy = vi
        .spyOn(Element.prototype, 'querySelectorAll')
        .mockImplementation(function spy(this: Element, selector) {
          const result = query.call(this, selector);
          if (selector === '[data-plite-external-text-path]') {
            visited += result.length;
          }
          return result;
        });
      try {
        const view = render(
          <Plite editor={editor}>
            <Editable renderElement={externalRenderer(adapter)} />
          </Plite>
        );
        expect(records).toHaveLength(count);
        expect(visited).toBe(count);
        view.unmount();
        expect(records.every((record) => record.destroyed === 1)).toBe(true);
      } finally {
        spy.mockRestore();
      }
    }
  );

  test('delivers the current selection before focus requested by an earlier commit listener', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const focusedSelections: unknown[] = [];
    let runtime: ReturnType<typeof getMountedEditableDOMRuntime>;
    const stop = subscribeSource(editor, 'commit', () => {
      runtime?.externalText.focusSelection();
    });
    const view = render(
      <Plite editor={editor}>
        <Editable
          renderElement={externalRenderer({
            mount(options) {
              const projection = adapter.mount(options);
              return {
                ...projection,
                focus() {
                  focusedSelections.push(records[0].state.selection);
                  projection.focus();
                },
              };
            },
          })}
        />
      </Plite>
    );
    runtime = getMountedEditableDOMRuntime(editor);
    act(() => {
      view.container.querySelector<HTMLElement>('[data-plite-editor]')!.focus();
      editor.update.selection.set({
        anchor: { path: [0, 0], offset: 2 },
        focus: { path: [0, 0], offset: 2 },
      });
    });
    expect(focusedSelections[0]).toMatchObject({ anchor: 2, focus: 2 });
    stop();
  });

  test('mounts only the external projection without preparing native text children', () => {
    const editor = createFixture('x'.repeat(100_000));
    const { adapter, records } = createAdapter();
    const nativeText = vi.fn(() => null);
    const view = render(
      <Plite editor={editor}>
        <Editable
          renderText={nativeText}
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    expect(records).toHaveLength(1);
    expect(records[0].state.text).toHaveLength(100_000);
    expect(records[0].updates).toHaveLength(0);
    expect(nativeText).not.toHaveBeenCalled();
    expect(view.container.querySelector('[data-plite-node="text"]')).toBeNull();
    expect(
      view.container.querySelectorAll('[data-plite-external-text]')
    ).toHaveLength(1);
    view.unmount();
    expect(records[0].destroyed).toBe(1);
  });

  test('keeps the children getter lazy through React and preserves renderer hooks', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const Renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = ({ attributes, slots }) => {
      const [count, setCount] = React.useState(0);
      return (
        <div {...attributes}>
          <button
            contentEditable={false}
            onClick={() => setCount(count + 1)}
            type="button"
          >
            {count}
          </button>
          {slots.externalText({ adapter, ariaLabel: 'Code' })}
        </div>
      );
    };
    const view = render(
      <Plite editor={editor}>
        <Editable renderElement={Renderer} />
      </Plite>
    );
    act(() => view.getByRole('button').click());
    expect(view.getByRole('button').textContent).toBe('1');
    expect(records).toHaveLength(1);
  });

  test('keeps one external projection when a renderer child rerenders alone', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const Projection = ({
      renderProjection,
    }: {
      renderProjection: () => React.ReactNode;
    }) => {
      const [count, setCount] = React.useState(0);

      return (
        <>
          <button
            contentEditable={false}
            onClick={() => setCount(count + 1)}
            type="button"
          >
            {count}
          </button>
          {renderProjection()}
        </>
      );
    };
    const Renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = ({ attributes, slots }) => (
      <div {...attributes}>
        <Projection
          renderProjection={() =>
            slots.externalText({ adapter, ariaLabel: 'Code' })
          }
        />
      </div>
    );
    const view = render(
      <Plite editor={editor}>
        <Editable renderElement={Renderer} />
      </Plite>
    );

    expect(records).toHaveLength(1);
    expect(() => act(() => view.getByRole('button').click())).not.toThrow();
    expect(view.getByRole('button').textContent).toBe('1');
    expect(records).toHaveLength(1);
    expect(records[0].destroyed).toBe(0);
  });

  test('does not claim native text when an intermediary copies unrendered children', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const Renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = (props) => {
      const copied = { ...props };

      return (
        <div {...copied.attributes}>
          {copied.slots.externalText({ adapter, ariaLabel: 'Code' })}
        </div>
      );
    };

    expect(() =>
      render(
        <Plite editor={editor}>
          <Editable renderElement={Renderer} />
        </Plite>
      )
    ).not.toThrow();
    expect(records).toHaveLength(1);
  });

  test('rejects two projections before mounting an adapter', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const errors: unknown[] = [];

    render(
      <ProjectionErrorBoundary onError={(error) => errors.push(error)}>
        <Plite editor={editor}>
          <Editable
            renderElement={({ slots }) => (
              <div>
                {slots.children()}
                {slots.externalText({ adapter, ariaLabel: 'Code' })}
              </div>
            )}
          />
        </Plite>
      </ProjectionErrorBoundary>
    );

    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.every(
        (error) =>
          error instanceof Error && /one.*projection/i.test(error.message)
      )
    ).toBe(true);
    expect(records).toHaveLength(0);
  });

  test('rejects two external projections before mounting either adapter', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const errors: unknown[] = [];

    render(
      <ProjectionErrorBoundary onError={(error) => errors.push(error)}>
        <Plite editor={editor}>
          <Editable
            renderElement={({ slots }) => (
              <div>
                {slots.externalText({ adapter, ariaLabel: 'First code' })}
                {slots.externalText({ adapter, ariaLabel: 'Second code' })}
              </div>
            )}
          />
        </Plite>
      </ProjectionErrorBoundary>
    );

    expect(errors.length).toBeGreaterThan(0);
    expect(
      errors.every(
        (error) =>
          error instanceof Error && /one.*projection/i.test(error.message)
      )
    ).toBe(true);
    expect(records).toHaveLength(0);
  });

  test('requires an exact-one-Text grammar, not merely a currently single leaf', () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: [{ type: 'paragraph', children: [{ text: 'native' }] }],
    });
    const { adapter, records } = createAdapter();
    expect(() =>
      render(
        <Plite editor={editor}>
          <Editable
            renderElement={({ slots }) => (
              <div>{slots.externalText({ adapter, ariaLabel: 'Code' })}</div>
            )}
          />
        </Plite>
      )
    ).toThrow(/exactly one Text/i);
    expect(records).toHaveLength(0);
  });

  test('invalidates the external binding when schema reconfiguration changes its domain', () => {
    const slot = defineExtensionSlot('external-text-schema');
    const createSchema = (max: number, version: number) =>
      defineEditorSchema('schema:external-text-reconfiguration', {
        elements: { code: { content: schema.content.text({ min: 1, max }) } },
        id: 'external-text-reconfiguration',
        root: schema.content.type('code'),
        version,
      });
    const editor = createEditor({
      extensions: [slot.of(createSchema(1, 1))],
      initialValue: [{ type: 'code', children: [{ text: 'canonical' }] }],
    });
    const { adapter, records } = createAdapter();
    const view = render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, element, slots }) => (
            <div {...attributes}>
              {editor.read(
                (state) => state.schema.element(element.type)?.content?.max
              ) === 1
                ? slots.externalText({ adapter, ariaLabel: 'Code' })
                : slots.children()}
            </div>
          )}
        />
      </Plite>
    );
    const original = records[0];
    const value = editor.read.value();
    act(() => editor.update.extensions.reconfigure(slot, createSchema(2, 2)));
    expect(original.destroyed).toBe(1);
    expect(
      view.container.querySelector('[data-plite-external-text]')
    ).toBeNull();
    expect(
      view.container.querySelector('[data-plite-node="text"]')
    ).not.toBeNull();
    act(() =>
      expect(
        original.actions.dispatch({
          baseVersion: original.state.version,
          changes: [{ from: 0, to: 0, insert: 'stale' }],
          intent: 'input',
          selection: { anchor: 5, focus: 5 },
        }).status
      ).toBe('stale')
    );
    expect(editor.read.value()).toEqual(value);
    act(() => editor.update.extensions.reconfigure(slot, createSchema(1, 3)));
    expect(records).toHaveLength(2);
    expect(records[1].state.text).toBe('canonical');
    view.unmount();
    expect(records.map((record) => record.destroyed)).toEqual([1, 1]);
  });

  test('publishes text and directed selection once, acknowledges origin, and patches its sibling', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const commits = vi.fn();
    const stop = editor.subscribeCommit(commits);
    const renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = ({ attributes, slots }) => (
      <div {...attributes}>
        {slots.externalText({ adapter, ariaLabel: 'Code' })}
      </div>
    );
    render(
      <Plite editor={editor}>
        <Editable renderElement={renderer} />
        <Editable renderElement={renderer} />
      </Plite>
    );
    const [origin, sibling] = records;
    expect(records).toHaveLength(2);
    expect(origin.destroyed).toBe(0);
    expect(origin.host.isConnected).toBe(true);
    act(() => {
      expect(
        origin.actions.dispatch({
          baseVersion: origin.state.version,
          changes: [{ from: 1, to: 3, insert: '🚀' }],
          intent: 'input',
          selection: { anchor: 3, focus: 1 },
        }).status
      ).toBe('applied');
    });
    expect(commits).toHaveBeenCalledTimes(1);
    expect(editor.read.children()[0].children[0].text).toBe('A🚀B\nC');
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 3 },
      focus: { offset: 1 },
    });
    expect(origin.updates.at(-1)).toEqual([]);
    expect(sibling.updates.at(-1)).toEqual([{ from: 1, to: 3, insert: '🚀' }]);
    expect(sibling.state.selection).toMatchObject({
      anchor: 3,
      focus: 1,
      mode: 'model',
    });
    stop();
  });

  test('rejects stale and read-only writes without changing canonical text', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = ({ attributes, slots }) => (
      <div {...attributes}>
        {slots.externalText({ adapter, ariaLabel: 'Code' })}
      </div>
    );
    const view = render(
      <Plite editor={editor}>
        <Editable renderElement={renderer} />
      </Plite>
    );
    const record = records[0];
    expect(record.destroyed).toBe(0);
    const oldVersion = record.state.version;
    act(() =>
      editor.update.text.insert('!', { at: { path: [0, 0], offset: 0 } })
    );
    const input = {
      baseVersion: oldVersion,
      changes: [{ from: 0, to: 0, insert: 'bad' }],
      intent: 'input' as const,
      selection: { anchor: 3, focus: 3 },
    };
    act(() => expect(record.actions.dispatch(input).status).toBe('stale'));
    expect(record.updates.at(-1)).toBeNull();
    view.rerender(
      <Plite editor={editor}>
        <Editable readOnly renderElement={renderer} />
      </Plite>
    );
    act(() =>
      expect(
        record.actions.dispatch({ ...input, baseVersion: record.state.version })
          .status
      ).toBe('read-only')
    );
    expect(editor.read.children()[0].children[0].text).toBe('!A😀B\nC');
  });

  test('keeps every foreign event family out of outer handlers, including foreign contenteditable', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const outer = vi.fn();
    render(
      <Plite editor={editor}>
        <Editable
          onBeforeInput={outer}
          onDOMBeforeInput={outer}
          onInput={outer}
          onKeyDown={outer}
          onCopy={outer}
          onCut={outer}
          onPaste={outer}
          onCompositionStart={outer}
          onCompositionUpdate={outer}
          onCompositionEnd={outer}
          onDragStart={outer}
          onDragOver={outer}
          onDrop={outer}
          onFocus={outer}
          onBlur={outer}
          onClick={outer}
          onMouseDown={outer}
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    const foreign = document.createElement('div');
    foreign.contentEditable = 'true';
    foreign.tabIndex = 0;
    records[0].host.append(foreign);
    act(() => {
      foreign.focus();
      fireEvent.mouseDown(foreign);
      fireEvent.click(foreign);
      fireEvent.keyDown(foreign, { key: 'Enter' });
      fireEvent.copy(foreign);
      fireEvent.cut(foreign);
      fireEvent.paste(foreign);
      fireEvent.compositionStart(foreign);
      fireEvent.compositionUpdate(foreign, { data: 'あ' });
      fireEvent.compositionEnd(foreign, { data: 'あ' });
      foreign.dispatchEvent(
        new InputEvent('beforeinput', {
          bubbles: true,
          inputType: 'insertText',
          data: 'bad',
        })
      );
      fireEvent.input(foreign, { inputType: 'insertText', data: 'bad' });
      fireEvent.dragStart(foreign);
      fireEvent.dragOver(foreign);
      fireEvent.drop(foreign);
      foreign.blur();
    });
    expect(outer).not.toHaveBeenCalled();
    expect(editor.read.children()[0].children[0].text).toBe('A😀B\nC');
    expect(editor.read.view.isComposing()).toBe(false);
  });

  test('only the focused view receives native selection; DOM selection import cannot clear it', () => {
    const editor = createFixture();
    const { adapter, records } = createAdapter();
    const renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = ({ attributes, slots }) => (
      <div {...attributes}>
        {slots.externalText({ adapter, ariaLabel: 'Code' })}
      </div>
    );
    render(
      <Plite editor={editor}>
        <Editable renderElement={renderer} />
        <Editable renderElement={renderer} />
      </Plite>
    );
    const [first, second] = records;
    act(() => {
      first.host.querySelector('textarea')!.focus();
      first.actions.select({
        baseVersion: first.state.version,
        selection: { anchor: 5, focus: 1 },
      });
      document.dispatchEvent(new Event('selectionchange'));
    });
    expect(first.state.selection).toEqual({
      anchor: 5,
      focus: 1,
      mode: 'native',
    });
    expect(second.state.selection).toEqual({
      anchor: 5,
      focus: 1,
      mode: 'model',
    });
    expect(editor.read.selection()).toMatchObject({
      anchor: { offset: 5 },
      focus: { offset: 1 },
    });
    act(() => second.host.querySelector('textarea')!.focus());
    expect(first.state.selection?.mode).toBe('model');
    expect(second.state.selection?.mode).toBe('native');
  });

  test("an unfocused sibling cannot import another view's partial DOM selection", () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: [
        { type: 'paragraph', children: [{ text: 'before' }] },
        { type: 'code', children: [{ text: 'canonical' }] },
      ],
    });
    const { adapter, records } = createAdapter();
    const view = render(
      <Plite editor={editor}>
        <Editable id="native-sibling" />
        <Editable
          id="external-owner"
          renderElement={externalRenderer(adapter)}
        />
      </Plite>
    );
    const native = getMountedEditableDOMRuntime(
      editor,
      view.container.querySelector('#native-sibling')!
    )!;
    act(() => {
      records[0].host.querySelector('textarea')!.focus();
      records[0].actions.select({
        baseVersion: records[0].state.version,
        selection: { anchor: 0, focus: 0 },
      });
      records[0].actions.navigateOut({
        baseVersion: records[0].state.version,
        direction: 'backward',
        extend: true,
      });
    });
    const canonical = editor.read.selection();
    const before = view.container.querySelector(
      '#external-owner [data-plite-path="0"]'
    )!;
    const text = document
      .createTreeWalker(before, NodeFilter.SHOW_TEXT)
      .nextNode()!;
    const handler = createRuntimeSelectionChangeHandler({
      androidInputManagerRef: native.androidInputManagerRef,
      domRepairQueueRef: native.domRepairQueueRef,
      editor: native.editor,
      inputController: native.inputController,
      processing: native.processing,
      readOnly: false,
      rootRef: native.rootRef,
    });
    try {
      act(() => {
        document.getSelection()!.setBaseAndExtent(text, 0, text, 0);
        handler();
        handler.flush();
      });
      expect(editor.read.selection()).toEqual(canonical);
    } finally {
      handler.cancel();
    }
  });

  test.each(['forward', 'backward'] as const)(
    'preserves visible %s anchor text when the selection focus is external',
    (direction) => {
      const editor = createEditor({
        extensions: [textSchema],
        initialValue: [
          { type: 'paragraph', children: [{ text: 'before' }] },
          { type: 'code', children: [{ text: 'canonical' }] },
          { type: 'paragraph', children: [{ text: 'after' }] },
        ],
      });
      const { adapter } = createAdapter();
      const view = render(
        <Plite editor={editor}>
          <Editable renderElement={externalRenderer(adapter)} />
        </Plite>
      );
      const root = view.container.querySelector<HTMLElement>(
        '[data-plite-editor]'
      )!;
      const runtime = getMountedEditableDOMRuntime(editor, root)!;
      const selection = {
        anchor: { path: [direction === 'forward' ? 0 : 2, 0], offset: 2 },
        focus: { path: [1, 0], offset: 3 },
      };
      act(() => {
        applyDOMCoverageSelectionPolicy({
          coverage: runtime.domCoverage,
          domSelection: document.getSelection()!,
          editor: runtime.editor,
          editorElement: root,
          selection,
        });
      });
      expect(document.getSelection()!.toString()).toBe(
        direction === 'forward' ? 'fore' : 'af'
      );
      expect(document.getSelection()!.anchorOffset).toBe(2);
      expect(document.getSelection()!.focusOffset).toBe(
        direction === 'forward' ? 6 : 0
      );
    }
  );

  test('updates every native view alongside the external view', async () => {
    const editor = createFixture('native and external');
    const { adapter, records } = createAdapter();
    const rendered = render(
      <Plite editor={editor}>
        <Editable id="native-first" />
        <Editable id="native-second" />
        <Editable
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    await act(async () => {
      records[0].actions.dispatch({
        baseVersion: records[0].state.version,
        changes: [{ from: 7, to: 10, insert: 'with' }],
        intent: 'input',
        selection: { anchor: 11, focus: 11 },
      });
    });
    for (const id of ['native-first', 'native-second']) {
      expect(rendered.container.querySelector(`#${id}`)?.textContent).toBe(
        'native with external'
      );
    }
    expect(records[0].state.text).toBe('native with external');
  });

  test('uses exact patches for remote changes and one Plite history stack', () => {
    const editor = createFixture('abcd');
    const source = createFixture('abcd');
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    const view = records[0];
    act(() =>
      source.update.text.insert('🌍', { at: { path: [0, 0], offset: 2 } })
    );
    act(() =>
      editor.update({ tags: ['remote'] }, (tx) =>
        tx.changes.apply(getLastCommit(source)!.changes)
      )
    );
    expect(view.updates.at(-1)).toEqual([{ from: 2, to: 2, insert: '🌍' }]);
    act(() => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 0, to: 1, insert: 'A' }],
        intent: 'input',
        selection: { anchor: 1, focus: 1 },
      });
    });
    act(() => expect(view.actions.history('undo')).toBe(true));
    expect(view.state.text).toBe('ab🌍cd');
    expect(view.updates.at(-1)).toEqual([{ from: 0, to: 1, insert: 'a' }]);
    act(() => expect(view.actions.history('redo')).toBe(true));
    expect(view.state.text).toBe('Ab🌍cd');
    expect(view.updates.every((change) => change !== null)).toBe(true);
  });

  test('unrelated blocks receive zero updates and retain a valid observed version', () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: [
        { type: 'code', children: [{ text: 'first' }] },
        { type: 'code', children: [{ text: 'second' }] },
      ],
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    const [first, second] = records;
    const count = first.updates.length;
    const { version } = first.state;
    act(() =>
      editor.update.text.insert('!', { at: { path: [1, 0], offset: 6 } })
    );
    expect(second.state.text).toBe('second!');
    expect(first.updates).toHaveLength(count);
    act(() =>
      expect(
        first.actions.dispatch({
          baseVersion: version,
          changes: [{ from: 5, to: 5, insert: '?' }],
          intent: 'input',
          selection: { anchor: 6, focus: 6 },
        }).status
      ).toBe('applied')
    );
    expect(first.state.text).toBe('first?');
  });

  test('copies only inserted ranges and performs no whole-string scan in the external substrate', () => {
    const editor = createFixture('x'.repeat(100_000));
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const counters = {
      fullStringCopies: 0,
      fullStringDiffs: 0,
      insertedCodeUnits: 0,
      observedSlices: 0,
    };
    const methods = [
      'slice',
      'substring',
      'substr',
      'split',
      'indexOf',
      'lastIndexOf',
      'includes',
      'match',
      'matchAll',
      'replace',
      'replaceAll',
      'search',
    ] as const;
    const prototype = String.prototype as unknown as Record<
      string,
      (...args: unknown[]) => unknown
    >;
    const spies = methods.map((name) => {
      const method = prototype[name];
      return vi
        .spyOn(prototype, name)
        .mockImplementation(function observeStringOperation(
          this: string,
          ...args: unknown[]
        ) {
          if (this.length >= 100_000) {
            const owner =
              new Error('Capture string-operation owner').stack
                ?.split('\n')
                .find((line) => line.includes('/src/')) ?? '';
            if (
              /\/(?:external-text-runtime|external-text-binding|text-splices)\.ts:/.test(
                owner
              )
            ) {
              if (name === 'slice') {
                const from = Number(args[0] ?? 0);
                const to = Number(args[1] ?? this.length);
                counters.observedSlices += 1;
                counters.insertedCodeUnits += to - from;
                if (from === 0 && to >= this.length) {
                  counters.fullStringCopies += 1;
                }
              } else counters.fullStringDiffs += 1;
            }
          }
          return Reflect.apply(method, this, args);
        });
    });
    try {
      const view = records[0];
      act(() => {
        view.actions.dispatch({
          baseVersion: view.state.version,
          changes: [{ from: 50_000, to: 50_000, insert: '!' }],
          intent: 'input',
          selection: { anchor: 50_001, focus: 50_001 },
        });
      });
      act(() => {
        view.actions.history('undo');
      });
      act(() => {
        view.actions.history('redo');
      });
      act(() =>
        editor.update({ tags: ['remote'] }, (tx) =>
          tx.text.insert('R', { at: { path: [0, 0], offset: 50_000 } })
        )
      );
      expect(counters.observedSlices).toBeGreaterThan(0);
      expect(counters.insertedCodeUnits).toBeLessThanOrEqual(4);
      expect(counters.fullStringCopies).toBe(0);
      expect(counters.fullStringDiffs).toBe(0);
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  });

  test('rejects invalid coordinates and detached actions without canonical mutation', () => {
    const editor = createFixture('abcd');
    const { adapter, records } = createAdapter();
    const rendered = render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    const view = records[0];
    const invalid = [
      [{ from: -1, to: 0, insert: 'x' }],
      [{ from: 0, to: 5, insert: 'x' }],
      [{ from: 2, to: 1, insert: 'x' }],
      [{ from: Number.NaN, to: 0, insert: 'x' }],
      [
        { from: 0, to: 3, insert: 'x' },
        { from: 2, to: 4, insert: 'y' },
      ],
    ];
    for (const changes of invalid) {
      act(() =>
        expect(
          view.actions.dispatch({
            baseVersion: view.state.version,
            changes,
            intent: 'input',
            selection: { anchor: 0, focus: 0 },
          }).status
        ).toBe('stale')
      );
    }
    expect(editor.read.children()[0].children[0].text).toBe('abcd');
    const runtime = getMountedEditableDOMRuntime(editor)!;
    expect(runtime.externalText.metrics().staleWrites).toBe(invalid.length);
    rendered.unmount();
    expect(
      view.actions.select({
        baseVersion: view.state.version,
        selection: { anchor: 1, focus: 1 },
      }).status
    ).toBe('stale');
    expect(runtime.externalText.metrics().viewCount).toBe(0);
  });

  test('groups one composition epoch, updates native siblings, and separates subsequent typing', async () => {
    const editor = createFixture('');
    const { adapter, records } = createAdapter();
    const rendered = render(
      <Plite editor={editor}>
        <Editable id="native-ime-sibling" />
        <Editable
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    const view = records[0];
    act(() => {
      view.actions.select({
        baseVersion: view.state.version,
        selection: { anchor: 0, focus: 0 },
      });
    });
    act(() => view.actions.composition('start'));
    await act(async () => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 0, to: 0, insert: 'a' }],
        intent: 'composition',
        selection: { anchor: 1, focus: 1 },
      });
    });
    await act(async () => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 0, to: 1, insert: 'あ' }],
        intent: 'composition',
        selection: { anchor: 1, focus: 1 },
      });
    });
    expect(
      rendered.container.querySelector('#native-ime-sibling')?.textContent
    ).toBe('あ');
    act(() => view.actions.composition('end'));
    expect(editor.read.view.isComposing()).toBe(false);
    expect(editor.read.history.undos()).toHaveLength(1);
    act(() => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 1, to: 1, insert: '!' }],
        intent: 'input',
        selection: { anchor: 2, focus: 2 },
      });
    });
    expect(editor.read.history.undos()).toHaveLength(2);
    act(() => {
      view.actions.history('undo');
    });
    expect(view.state.text).toBe('あ');
    act(() => {
      view.actions.history('undo');
    });
    expect(view.state.text).toBe('');
    expect(view.updates.every((change) => change !== null)).toBe(true);
  });

  test('resets an unreconciled remote composition once and rejects late composition input', () => {
    const editor = createFixture('abcd');
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable
          renderElement={({ attributes, slots }) => (
            <div {...attributes}>
              {slots.externalText({ adapter, ariaLabel: 'Code' })}
            </div>
          )}
        />
      </Plite>
    );
    const view = records[0];
    const runtime = getMountedEditableDOMRuntime(editor)!;
    act(() => view.actions.composition('start'));
    act(() =>
      editor.update({ tags: ['collaboration'] }, (tx) =>
        tx.text.insert('R', { at: { path: [0, 0], offset: 0 } })
      )
    );
    expect(view.state.text).toBe('Rabcd');
    expect(runtime.externalText.metrics().resets).toBe(1);
    expect(editor.read.view.isComposing()).toBe(false);
    act(() =>
      expect(
        view.actions.dispatch({
          baseVersion: view.state.version,
          changes: [{ from: 0, to: 0, insert: 'late' }],
          intent: 'composition',
          selection: { anchor: 4, focus: 4 },
        }).status
      ).toBe('stale')
    );
    expect(editor.read.children()[0].children[0].text).toBe('Rabcd');
  });

  test('updates inferred configuration without remounting the adapter', () => {
    const editor = createFixture();
    const Config = React.createContext({ language: 'text' });
    const mounted = vi.fn();
    const updated = vi.fn();
    const destroyed = vi.fn();
    const adapter: ExternalTextAdapter<{ language: string }> = {
      mount({ state }) {
        mounted(state.config.language);
        return {
          destroy: destroyed,
          focus() {},
          update({ state: next }) {
            updated(next.config.language);
          },
        };
      },
    };
    const Renderer: NonNullable<
      React.ComponentProps<typeof Editable>['renderElement']
    > = ({ attributes, slots }) => {
      const config = React.useContext(Config);
      return (
        <div {...attributes}>
          {slots.externalText({
            adapter,
            ariaLabel: 'Configured code',
            config,
          })}
        </div>
      );
    };
    const tree = (config: { language: string }) => (
      <Config.Provider value={config}>
        <Plite editor={editor}>
          <Editable renderElement={Renderer} />
        </Plite>
      </Config.Provider>
    );
    const rendered = render(tree({ language: 'text' }));
    rendered.rerender(tree({ language: 'typescript' }));
    expect(mounted.mock.calls).toEqual([['text']]);
    expect(updated).toHaveBeenLastCalledWith('typescript');
    expect(destroyed).not.toHaveBeenCalled();
    rendered.unmount();
    expect(destroyed).toHaveBeenCalledTimes(1);
  });

  test('preserves whole-Text marks across offset edits', () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: [
        { type: 'code', children: [{ bold: true, text: 'marked' }] },
      ],
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const view = records[0];
    act(() => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 3, to: 3, insert: 'X' }],
        intent: 'input',
        selection: { anchor: 4, focus: 4 },
      });
    });
    expect(editor.read.children()[0].children).toEqual([
      { bold: true, text: 'marXked' },
    ]);
    expect(view.updates.at(-1)).toEqual([]);
  });

  test('isolates named roots and independent editors', () => {
    const editor = createEditor({
      extensions: [textSchema, history()],
      initialValue: {
        children: [{ type: 'code', children: [{ text: 'main' }] }],
        roots: { notes: [{ type: 'code', children: [{ text: 'notes' }] }] },
      },
    });
    const independent = createFixture('separate');
    const { adapter, records } = createAdapter();
    const renderer = externalRenderer(adapter);
    render(
      <>
        <Plite editor={editor}>
          <Editable renderElement={renderer} />
          <Editable renderElement={renderer} root="notes" />
        </Plite>
        <Plite editor={independent}>
          <Editable renderElement={renderer} />
        </Plite>
      </>
    );
    const main = records.find((record) => record.state.text === 'main')!;
    const notes = records.find((record) => record.state.text === 'notes')!;
    const separate = records.find(
      (record) => record.state.text === 'separate'
    )!;
    act(() => {
      notes.actions.dispatch({
        baseVersion: notes.state.version,
        changes: [{ from: 5, to: 5, insert: '!' }],
        intent: 'input',
        selection: { anchor: 6, focus: 6 },
      });
    });
    expect(notes.state.text).toBe('notes!');
    expect(main.state.text).toBe('main');
    expect(separate.state.text).toBe('separate');
    expect(editor.read.value().roots?.notes[0].children[0].text).toBe('notes!');
    expect(main.updates).toHaveLength(0);
    expect(separate.updates).toHaveLength(0);
    act(() => {
      notes.actions.history('undo');
    });
    expect(notes.state.text).toBe('notes');
    expect(main.updates).toHaveLength(0);
  });

  test.each([0, 1])(
    'keeps sibling coverage and actions alive when view %s unmounts first',
    (removed) => {
      const editor = createFixture();
      const { adapter, records } = createAdapter();
      const renderer = externalRenderer(adapter);
      const tree = (visible: number[]) => (
        <Plite editor={editor}>
          {visible.map((index) => (
            <Editable key={index} renderElement={renderer} />
          ))}
        </Plite>
      );
      const rendered = render(tree([0, 1]));
      const survivor = records[1 - removed];
      rendered.rerender(tree([1 - removed]));
      expect(records[removed].destroyed).toBe(1);
      expect(survivor.destroyed).toBe(0);
      act(() =>
        expect(
          survivor.actions.dispatch({
            baseVersion: survivor.state.version,
            changes: [{ from: 0, to: 0, insert: '!' }],
            intent: 'input',
            selection: { anchor: 1, focus: 1 },
          }).status
        ).toBe('applied')
      );
      expect(survivor.state.text).toBe('!A😀B\nC');
      rendered.unmount();
      expect(records.map((record) => record.destroyed)).toEqual([1, 1]);
    }
  );

  test('retains a moved owner and destroys removed owners exactly once', () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: [
        { type: 'code', children: [{ text: 'first' }] },
        { type: 'code', children: [{ text: 'second' }] },
      ],
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const second = records[1];
    act(() => editor.update.nodes.move({ at: [1], to: [0] }));
    expect(records).toHaveLength(2);
    expect(second.destroyed).toBe(0);
    act(() => {
      second.actions.dispatch({
        baseVersion: second.state.version,
        changes: [{ from: 6, to: 6, insert: '!' }],
        intent: 'input',
        selection: { anchor: 7, focus: 7 },
      });
    });
    expect(editor.read.children()[0].children[0].text).toBe('second!');
    act(() => editor.update.nodes.remove({ at: [0] }));
    expect(second.destroyed).toBe(1);
    expect(second.actions.history('undo')).toBe(false);
    expect(records[0].destroyed).toBe(0);
  });

  test('rebinds coverage and resets once when the sole Text identity is replaced', () => {
    const editor = createFixture('old');
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const view = records[0];
    const previousKey = editor.key([0, 0]);
    act(() =>
      editor.update((tx) => {
        tx.nodes.remove({ at: [0, 0] });
        tx.nodes.insert({ text: 'replacement' }, { at: [0, 0] });
      })
    );
    expect(editor.key([0, 0])).not.toBe(previousKey);
    expect(records).toHaveLength(1);
    expect(view.updates).toEqual([null]);
    const boundaries =
      getMountedEditableDOMRuntime(editor)!.domCoverage.getBoundaries();
    expect(boundaries).toHaveLength(1);
    expect(boundaries[0].coveredRuntimeRanges).toEqual([
      { anchor: editor.key([0, 0]), focus: editor.key([0, 0]) },
    ]);
    act(() =>
      expect(
        view.actions.dispatch({
          baseVersion: view.state.version,
          changes: [{ from: 11, to: 11, insert: '!' }],
          intent: 'input',
          selection: { anchor: 12, focus: 12 },
        }).status
      ).toBe('applied')
    );
    expect(editor.read.text.string([0])).toBe('replacement!');
  });

  test.each(['backward', 'forward'] as const)(
    'boundary deletion %s keeps the resulting selection usable',
    async (direction) => {
      const editor = createEditor({
        extensions: [textSchema, history()],
        initialValue: [
          { type: 'paragraph', children: [{ text: 'before' }] },
          { type: 'code', children: [{ text: 'code' }] },
          { type: 'paragraph', children: [{ text: 'after' }] },
        ],
      });
      const { adapter, records } = createAdapter();
      const rendered = render(
        <Plite editor={editor}>
          <Editable />
          <Editable
            id="delete-owner"
            renderElement={externalRenderer(adapter)}
          />
        </Plite>
      );
      const view = records[0];
      act(() => {
        view.host.querySelector('textarea')!.focus();
        const offset = direction === 'backward' ? 0 : 4;
        view.actions.select({
          baseVersion: view.state.version,
          selection: { anchor: offset, focus: offset },
        });
      });
      await act(async () => {
        expect(
          view.actions.deleteOut({ baseVersion: view.state.version, direction })
            .status
        ).toBe('applied');
      });
      expect(editor.read.children()).toHaveLength(2);
      expect(editor.read.text.string([direction === 'backward' ? 0 : 1])).toBe(
        direction === 'backward' ? 'beforecode' : 'codeafter'
      );
      expect(
        rendered.container
          .querySelector('#delete-owner')!
          .contains(document.activeElement)
      ).toBe(true);
      act(() => editor.update.text.insert('!'));
      expect(editor.read.text.string([direction === 'backward' ? 0 : 1])).toBe(
        direction === 'backward' ? 'before!code' : 'code!after'
      );
    }
  );

  test('restores serialized canonical history into a fresh external view', () => {
    const source = createFixture('before');
    const fixture = createAdapter();
    render(
      <Plite editor={source}>
        <Editable renderElement={externalRenderer(fixture.adapter)} />
      </Plite>
    );
    const origin = fixture.records[0];
    act(() => {
      origin.actions.dispatch({
        baseVersion: origin.state.version,
        changes: [{ from: 0, to: 6, insert: 'after' }],
        intent: 'input',
        selection: { anchor: 5, focus: 5 },
      });
    });
    const saved = JSON.parse(JSON.stringify(History.toJSON(source)));
    const restored = createEditor({
      extensions: [textSchema, history()],
      initialValue: source.read.value(),
    });
    const next = createAdapter();
    render(
      <Plite editor={restored}>
        <Editable renderElement={externalRenderer(next.adapter)} />
      </Plite>
    );
    act(() =>
      restored.update((tx) =>
        tx.history.restore(History.fromJSON(restored, saved))
      )
    );
    const view = next.records[0];
    act(() => expect(view.actions.history('undo')).toBe(true));
    expect(view.state.text).toBe('before');
    act(() => expect(view.actions.history('redo')).toBe(true));
    expect(view.state.text).toBe('after');
    expect(origin.state.text).toBe('after');
    expect(view.updates.every((changes) => changes !== null)).toBe(true);
  });

  test.each(['mount', 'focus'] as const)(
    'contains %s failures without mutating the document or leaking coverage',
    (phase) => {
      const errors = vi.fn();
      const editor = createEditor({
        extensions: [textSchema],
        initialValue: [{ type: 'code', children: [{ text: 'secret' }] }],
        lifecycleErrorSink: errors,
      });
      const fixture = createAdapter();
      const adapter: ExternalTextAdapter = {
        mount(context) {
          if (phase === 'mount') throw new Error('mount failed');
          const view = fixture.adapter.mount(context);
          return {
            ...view,
            focus() {
              throw new Error('focus failed');
            },
          };
        },
      };
      const rendered = render(
        <Plite editor={editor}>
          <Editable renderElement={externalRenderer(adapter)} />
        </Plite>
      );
      const runtime = getMountedEditableDOMRuntime(editor)!;
      if (phase === 'focus') {
        act(() => {
          runtime.rootElement!.focus();
          editor.update.selection.set({
            anchor: { path: [0, 0], offset: 0 },
            focus: { path: [0, 0], offset: 0 },
          });
          runtime.externalText.focusSelection();
        });
      }
      expect(errors).toHaveBeenCalledWith(
        expect.objectContaining({ phase, source: 'external-text' })
      );
      expect(editor.read.text.string([0])).toBe('secret');
      expect(
        Object.values(runtime.externalText.metrics()).every(
          (value) => typeof value === 'number' && Number.isFinite(value)
        )
      ).toBe(true);
      expect(JSON.stringify(runtime.externalText.metrics())).not.toContain(
        'secret'
      );
      rendered.unmount();
      expect(runtime.externalText.metrics().viewCount).toBe(0);
      expect(runtime.domCoverage.getBoundaries()).toHaveLength(0);
    }
  );

  test('isolates adapter failures from canonical publication and recovers only after reset', () => {
    const errors = vi.fn();
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: [{ type: 'code', children: [{ text: 'abcd' }] }],
      lifecycleErrorSink: errors,
    });
    const fixture = createAdapter();
    let fail = true;
    const adapter: ExternalTextAdapter = {
      mount(context) {
        const view = fixture.adapter.mount(context);
        return {
          ...view,
          update(update) {
            if (fail) throw new Error('broken adapter');
            view.update(update);
          },
          destroy() {
            view.destroy();
            throw new Error('broken cleanup');
          },
        };
      },
    };
    const rendered = render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const record = fixture.records[0];
    const runtime = getMountedEditableDOMRuntime(editor)!;
    act(() =>
      editor.update.text.insert('!', { at: { path: [0, 0], offset: 0 } })
    );
    expect(editor.read.text.string([0])).toBe('!abcd');
    expect(errors).toHaveBeenCalledWith(
      expect.objectContaining({ phase: 'update', source: 'external-text' })
    );
    act(() =>
      expect(
        record.actions.dispatch({
          baseVersion: record.state.version,
          changes: [{ from: 0, to: 0, insert: 'bad' }],
          intent: 'input',
          selection: { anchor: 3, focus: 3 },
        }).status
      ).toBe('stale')
    );
    expect(editor.read.text.string([0])).toBe('!abcd');
    fail = false;
    act(() =>
      expect(
        record.actions.select({
          baseVersion: record.state.version,
          selection: { anchor: 1, focus: 1 },
        }).status
      ).toBe('stale')
    );
    expect(record.updates.at(-1)).toBeNull();
    act(() =>
      expect(
        record.actions.select({
          baseVersion: record.state.version,
          selection: { anchor: 1, focus: 1 },
        }).status
      ).toBe('applied')
    );
    rendered.unmount();
    expect(record.destroyed).toBe(1);
    expect(runtime.externalText.metrics().viewCount).toBe(0);
    expect(runtime.domCoverage.getBoundaries()).toHaveLength(0);
    expect(errors).toHaveBeenCalledWith(
      expect.objectContaining({ phase: 'destroy', source: 'external-text' })
    );
  });

  test('runs canonical corrections and resets the originating prediction when they change it', () => {
    const correction = defineExtension('external-text-correction', {
      corrections: [
        {
          event: 'content',
          correct({ entry: [node, path], tx }) {
            if (TextApi.isText(node) && node.text.includes('bad')) {
              const offset = node.text.indexOf('bad');
              tx.text.insert('good', {
                at: {
                  anchor: { path, offset },
                  focus: { path, offset: offset + 3 },
                },
              });
            }
          },
        },
      ],
    });
    const editor = createEditor({
      extensions: [textSchema, correction],
      initialValue: [{ type: 'code', children: [{ text: 'a' }] }],
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const view = records[0];
    act(() => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 1, to: 1, insert: 'bad' }],
        intent: 'input',
        selection: { anchor: 4, focus: 4 },
      });
    });
    expect(editor.read.text.string([0])).toBe('agood');
    expect(view.state.text).toBe('agood');
    expect(view.updates.filter((change) => change === null)).toHaveLength(1);
  });

  test.each(['prop', 'view state'])(
    'ends composition on read-only through %s and rejects its later writes',
    async (source) => {
      const editor = createFixture();
      const { adapter, records } = createAdapter();
      const renderer = externalRenderer(adapter);
      const rendered = render(
        <Plite editor={editor}>
          <Editable renderElement={renderer} />
        </Plite>
      );
      const view = records[0];
      act(() => view.actions.composition('start'));
      expect(editor.read.view.isComposing()).toBe(true);
      if (source === 'prop') {
        rendered.rerender(
          <Plite editor={editor}>
            <Editable readOnly renderElement={renderer} />
          </Plite>
        );
      } else {
        await act(async () => setEditorReadOnly(editor, true));
      }
      expect(view.state.readOnly).toBe(true);
      expect(editor.read.view.isComposing()).toBe(false);
      act(() =>
        expect(
          view.actions.dispatch({
            baseVersion: view.state.version,
            changes: [{ from: 0, to: 0, insert: 'bad' }],
            intent: 'composition',
            selection: { anchor: 3, focus: 3 },
          }).status
        ).toBe('read-only')
      );
      expect(editor.read.text.string([0])).toBe('A😀B\nC');
    }
  );

  test('resets a rejected transaction prediction and ends its composition epoch', () => {
    const correction = defineExtension('reject-external-text', {
      corrections: [
        {
          event: 'content',
          correct({ entry: [node] }) {
            if (TextApi.isText(node) && node.text.includes('bad')) {
              throw new Error('Rejected text');
            }
          },
        },
      ],
    });
    const editor = createEditor({
      extensions: [textSchema, correction, history()],
      initialValue: [{ type: 'code', children: [{ text: 'a' }] }],
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const view = records[0];
    act(() => view.actions.composition('start'));
    act(() =>
      expect(() =>
        view.actions.dispatch({
          baseVersion: view.state.version,
          changes: [{ from: 1, to: 1, insert: 'bad' }],
          intent: 'composition',
          selection: { anchor: 4, focus: 4 },
        })
      ).toThrow('Rejected text')
    );
    expect(editor.read.text.string([0])).toBe('a');
    expect(view.state.text).toBe('a');
    expect(view.updates.at(-1)).toBeNull();
    expect(editor.read.view.isComposing()).toBe(false);
    act(() =>
      expect(
        view.actions.dispatch({
          baseVersion: view.state.version,
          changes: [{ from: 1, to: 1, insert: 'late' }],
          intent: 'composition',
          selection: { anchor: 5, focus: 5 },
        }).status
      ).toBe('stale')
    );
    expect(editor.read.history.undos()).toHaveLength(0);
  });

  test('ends a stale composition before accepting a new input epoch', () => {
    const editor = createFixture('a');
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const view = records[0];
    act(() => view.actions.composition('start'));
    act(() => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 1, to: 1, insert: 'あ' }],
        intent: 'composition',
        selection: { anchor: 2, focus: 2 },
      });
    });
    act(() =>
      expect(
        view.actions.dispatch({
          baseVersion: -1,
          changes: [],
          intent: 'composition',
          selection: { anchor: 2, focus: 2 },
        }).status
      ).toBe('stale')
    );
    expect(editor.read.view.isComposing()).toBe(false);
    act(() => {
      view.actions.dispatch({
        baseVersion: view.state.version,
        changes: [{ from: 2, to: 2, insert: '!' }],
        intent: 'input',
        selection: { anchor: 3, focus: 3 },
      });
    });
    expect(editor.read.history.undos()).toHaveLength(2);
    act(() => {
      view.actions.history('undo');
    });
    expect(view.state.text).toBe('aあ');
  });

  test('rejects adapter callback reentrancy without interrupting publication', () => {
    const editor = createFixture('abcd');
    const results: string[] = [];
    const fixture = createAdapter();
    const adapter: ExternalTextAdapter = {
      mount(context) {
        results.push(
          context.actions.select({
            baseVersion: context.state.version,
            selection: { anchor: 0, focus: 0 },
          }).status
        );
        const view = fixture.adapter.mount(context);
        return {
          ...view,
          update(update) {
            results.push(
              context.actions.dispatch({
                baseVersion: update.state.version,
                changes: [{ from: 0, to: 0, insert: 'bad' }],
                intent: 'input',
                selection: { anchor: 3, focus: 3 },
              }).status
            );
            view.update(update);
          },
        };
      },
    };
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    act(() =>
      editor.update.text.insert('!', { at: { path: [0, 0], offset: 0 } })
    );
    expect(results).toEqual(['stale', 'stale']);
    expect(editor.read.text.string([0])).toBe('!abcd');
    expect(fixture.records[0].state.text).toBe('!abcd');
  });

  test('keeps read-only view state separate from shared canonical bindings', () => {
    const editor = createFixture('abcd');
    const { adapter, records } = createAdapter();
    const renderer = externalRenderer(adapter);
    render(
      <Plite editor={editor}>
        <Editable readOnly renderElement={renderer} />
        <Editable renderElement={renderer} />
      </Plite>
    );
    const [locked, writable] = records;
    expect(locked.state.readOnly).toBe(true);
    expect(writable.state.readOnly).toBe(false);
    act(() =>
      expect(
        locked.actions.dispatch({
          baseVersion: locked.state.version,
          changes: [{ from: 0, to: 0, insert: 'bad' }],
          intent: 'input',
          selection: { anchor: 3, focus: 3 },
        }).status
      ).toBe('read-only')
    );
    act(() =>
      expect(
        writable.actions.dispatch({
          baseVersion: writable.state.version,
          changes: [{ from: 0, to: 0, insert: '!' }],
          intent: 'input',
          selection: { anchor: 1, focus: 1 },
        }).status
      ).toBe('applied')
    );
    expect(locked.state.text).toBe('!abcd');
    expect(locked.state.readOnly).toBe(true);
  });

  test('allows directed selection in a read-only named view without changing its document', () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: {
        children: [{ type: 'code', children: [{ text: 'main' }] }],
        roots: { notes: [{ type: 'code', children: [{ text: 'notes' }] }] },
      },
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable
          readOnly
          root="notes"
          renderElement={externalRenderer(adapter)}
        />
      </Plite>
    );
    const view = records[0];
    const before = editor.read.value();
    act(() =>
      expect(
        view.actions.select({
          baseVersion: view.state.version,
          selection: { anchor: 4, focus: 1 },
        }).status
      ).toBe('applied')
    );
    expect(editor.read.selection()).toMatchObject({
      anchor: { root: 'notes', path: [0, 0], offset: 4 },
      focus: { root: 'notes', path: [0, 0], offset: 1 },
    });
    expect(editor.read.value()).toEqual(before);
    act(() =>
      expect(
        view.actions.dispatch({
          baseVersion: view.state.version,
          changes: [{ from: 0, to: 0, insert: 'bad' }],
          intent: 'input',
          selection: { anchor: 3, focus: 3 },
        }).status
      ).toBe('read-only')
    );
  });

  test('deselects a read-only named view through the selection owner', () => {
    const editor = createEditor({
      extensions: [textSchema],
      initialValue: {
        children: [{ type: 'code', children: [{ text: 'main' }] }],
        roots: { notes: [{ type: 'code', children: [{ text: 'notes' }] }] },
      },
    });
    const { adapter } = createAdapter();
    const view = render(
      <Plite editor={editor}>
        <Editable
          readOnly
          root="notes"
          renderElement={externalRenderer(adapter)}
        />
      </Plite>
    );
    const root = view.container.querySelector<HTMLElement>(
      '[data-plite-editor]'
    )!;
    const runtime = findMountedEditableDOMRuntime(root)!;
    const before = editor.read.value();
    act(() => {
      root.focus();
      document.getSelection()!.removeAllRanges();
      expect(() =>
        applyEditableDOMSelectionChange({
          androidInputManager: null,
          editor: runtime.editor,
          inputController: runtime.inputController,
          processing: runtime.processing,
          readOnly: true,
          rerunOnDirtyNodeMap: vi.fn(),
        })
      ).not.toThrow();
    });
    expect(editor.read.value()).toEqual(before);
    expect(editor.read.selection()).toBeNull();
  });

  test('inherits read-only ancestors and refreshes their facts after structural changes', () => {
    const nestedSchema = defineEditorSchema('schema:external-nested', {
      elements: {
        code: { content: schema.content.text({ min: 1, max: 1 }) },
        locked: {
          content: schema.content.type('code', { min: 0 }),
          readOnly: true,
        },
        unlocked: { content: schema.content.type('code', { min: 0 }) },
      },
      id: 'external-nested',
      root: schema.content.types(['locked', 'unlocked']),
      version: 1,
    });
    const editor = createEditor({
      extensions: [nestedSchema],
      initialValue: [
        {
          type: 'locked',
          children: [{ type: 'code', children: [{ text: 'locked text' }] }],
        },
        {
          type: 'unlocked',
          children: [{ type: 'code', children: [{ text: 'open text' }] }],
        },
      ],
    });
    const { adapter, records } = createAdapter();
    render(
      <Plite editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    expect(records[0].state.readOnly).toBe(true);
    expect(records[1].state.readOnly).toBe(false);
    act(() =>
      expect(
        records[0].actions.dispatch({
          baseVersion: records[0].state.version,
          changes: [{ from: 0, to: 0, insert: 'bad' }],
          intent: 'input',
          selection: { anchor: 3, focus: 3 },
        }).status
      ).toBe('read-only')
    );
    act(() => editor.update.nodes.move({ at: [0, 0], to: [1, 1] }));
    const moved = records.find(
      (record) => record.destroyed === 0 && record.state.text === 'locked text'
    )!;
    expect(moved.state.readOnly).toBe(false);
    act(() =>
      expect(
        moved.actions.dispatch({
          baseVersion: moved.state.version,
          changes: [{ from: 0, to: 0, insert: '!' }],
          intent: 'input',
          selection: { anchor: 1, focus: 1 },
        }).status
      ).toBe('applied')
    );
    expect(moved.state.text).toBe('!locked text');
  });

  test('hydrates empty external hosts across distinct editors and balances StrictMode resources', async () => {
    const { adapter, records } = createAdapter();
    const renderer = externalRenderer(adapter);
    const tree = (editor: ReturnType<typeof createFixture>) => (
      <React.StrictMode>
        <Plite editor={editor}>
          <Editable renderElement={renderer} />
        </Plite>
      </React.StrictMode>
    );
    const server = tree(createFixture('canonical-only'));
    const container = document.createElement('div');
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});
    const recoverable = vi.fn();
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      container.innerHTML = renderToString(server);
      expect(container.textContent).toBe('');
      expect(records).toHaveLength(0);
      document.body.append(container);
      await act(async () => {
        root = hydrateRoot(container, tree(createFixture('canonical-only')), {
          onRecoverableError: recoverable,
        });
      });
      expect(recoverable).not.toHaveBeenCalled();
      expect(consoleError).not.toHaveBeenCalled();
      expect(records.filter((record) => record.destroyed === 0)).toHaveLength(
        1
      );
      await act(async () => root!.unmount());
      root = undefined;
      expect(records.every((record) => record.destroyed === 1)).toBe(true);
    } finally {
      if (root) await act(async () => root!.unmount());
      container.remove();
      consoleError.mockRestore();
    }
  });

  test('leaves adapter-owned DOM mutations outside canonical repair and input routing', async () => {
    const editor = createFixture('canonical');
    const { adapter, records } = createAdapter();
    const outerInput = vi.fn();
    render(
      <Plite editor={editor}>
        <Editable
          onInput={outerInput}
          renderElement={externalRenderer(adapter)}
        />
      </Plite>
    );
    const runtime = getMountedEditableDOMRuntime(editor)!;
    await act(async () => {});
    const before = runtime.domIntegrityDiagnostics();
    const foreign = document.createElement('span');
    foreign.contentEditable = 'true';
    await act(async () => {
      records[0].host.append(foreign);
      foreign.textContent = 'private adapter DOM';
      foreign.dispatchEvent(
        new InputEvent('input', {
          bubbles: true,
          inputType: 'insertText',
          data: 'private',
        })
      );
    });
    act(() => runtime.domPhaseScheduler.flush());
    expect(foreign.isConnected).toBe(true);
    expect(foreign.textContent).toBe('private adapter DOM');
    expect(outerInput).not.toHaveBeenCalled();
    expect(editor.read.text.string([0])).toBe('canonical');
    expect(runtime.domIntegrityDiagnostics().repairPasses).toBe(
      before.repairPasses
    );
    expect(records).toHaveLength(1);
  });

  test('delivers overlapping decoration ranges without internal selection attributes', () => {
    const editor = createFixture('abcdefgh');
    const { adapter, records } = createAdapter();
    const decorations: Array<PliteDecorationSource<typeof editor>> = [
      {
        id: 'external-ranges',
        read: ({ entry: [node, path] }) =>
          TextApi.isText(node)
            ? [
                {
                  key: 'first',
                  attributes: { 'data-annotation': 'first' },
                  range: {
                    anchor: { path, offset: 0 },
                    focus: { path, offset: 5 },
                  },
                },
                {
                  key: 'second',
                  attributes: { 'data-annotation': 'second' },
                  range: {
                    anchor: { path, offset: 2 },
                    focus: { path, offset: 8 },
                  },
                },
                {
                  key: 'internal',
                  attributes: { 'data-plite-inactive-selection': true },
                  range: {
                    anchor: { path, offset: 1 },
                    focus: { path, offset: 3 },
                  },
                },
              ]
            : [],
      },
    ];
    render(
      <Plite decorations={decorations} editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const ranges = records[0].state.decorations;
    expect(ranges).toHaveLength(2);
    expect(ranges.map(({ start, end }) => [start, end])).toEqual([
      [0, 5],
      [2, 8],
    ]);
    expect(
      ranges.every(
        ({ attributes }) => !('data-plite-inactive-selection' in attributes)
      )
    ).toBe(true);
  });

  test('delivers canonical text and its mapped decorations together once per commit', () => {
    const editor = createFixture('abc');
    const { adapter, records } = createAdapter();
    const decorations: Array<PliteDecorationSource<typeof editor>> = [
      {
        id: 'length-range',
        read: ({ entry: [node, path] }) =>
          TextApi.isText(node)
            ? [
                {
                  key: 'whole',
                  attributes: { 'data-annotation': true },
                  range: {
                    anchor: { path, offset: 0 },
                    focus: { path, offset: node.text.length },
                  },
                },
              ]
            : [],
      },
    ];
    render(
      <Plite decorations={decorations} editor={editor}>
        <Editable renderElement={externalRenderer(adapter)} />
      </Plite>
    );
    const record = records[0];
    record.updates.length = 0;
    act(() =>
      editor.update.text.insert('!', { at: { path: [0, 0], offset: 1 } })
    );
    expect(record.updates).toHaveLength(1);
    expect(record.updates[0]).toEqual([{ from: 1, to: 1, insert: '!' }]);
    expect(record.state.text).toBe('a!bc');
    expect(record.state.decorations[0].end).toBe(4);
  });

  test.each(['staged', 'virtualized'] as const)(
    'balances adapter lifetimes when %s document coverage changes',
    async (strategy) => {
      const editor = createEditor({
        extensions: [textSchema],
        initialValue: Array.from({ length: 600 }, (_, index) => ({
          type: 'code',
          children: [{ text: `block-${index}` }],
        })),
      });
      const { adapter, records } = createAdapter();
      const rendered = render(
        <Plite editor={editor}>
          <Editable
            domStrategy={
              strategy === 'virtualized'
                ? {
                    type: 'virtualized',
                    threshold: 1,
                    overscan: 0,
                    estimatedBlockSize: 24,
                  }
                : 'staged'
            }
            renderElement={externalRenderer(adapter)}
            style={{ height: 48, overflowY: 'auto' }}
          />
        </Plite>
      );
      await act(async () =>
        editor.update.selection.set({
          anchor: { path: [500, 0], offset: 0 },
          focus: { path: [500, 0], offset: 0 },
        })
      );
      await waitFor(() =>
        expect(
          records.some(
            (record) => !record.destroyed && record.state.text === 'block-500'
          )
        ).toBe(true)
      );
      act(() =>
        editor.update.text.insert('!', { at: { path: [0, 0], offset: 7 } })
      );
      await act(async () =>
        editor.update.selection.set({
          anchor: { path: [0, 0], offset: 8 },
          focus: { path: [0, 0], offset: 8 },
        })
      );
      await waitFor(() =>
        expect(
          records.some(
            (record) => !record.destroyed && record.state.text === 'block-0!'
          )
        ).toBe(true)
      );
      rendered.unmount();
      expect(records.length).toBeGreaterThan(1);
      expect(records.every((record) => record.destroyed === 1)).toBe(true);
    }
  );
});
