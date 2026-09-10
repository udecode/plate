'use client';

import {
  defineEditorSchema,
  type PliteDecorationSource,
  schema,
  TextApi,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  type ExternalTextAdapter,
  type ExternalTextSelection,
  Plite,
  type RenderElementProps,
  useEditor,
  useEditorState,
  usePliteHistory,
} from 'plitejs/react';
import { StrictMode, useMemo, useState } from 'react';

const textSchema = defineEditorSchema('schema:external-text-example', {
  elements: {
    'external-text': { content: schema.content.text({ min: 1, max: 1 }) },
    paragraph: { content: schema.content.text({ min: 0 }) },
  },
  id: 'external-text-example',
  root: schema.content.types(['paragraph', 'external-text'], {
    default: { type: 'paragraph' },
    min: 1,
  }),
  roots: {
    notes: schema.content.types(['paragraph', 'external-text'], {
      default: { type: 'paragraph' },
      min: 1,
    }),
  },
  version: 1,
});

const readSelection = (input: HTMLTextAreaElement): ExternalTextSelection =>
  input.selectionDirection === 'backward'
    ? { anchor: input.selectionEnd, focus: input.selectionStart }
    : { anchor: input.selectionStart, focus: input.selectionEnd };

// A textarea is a small protocol example, not a large-document editor.
const textareaAdapter: ExternalTextAdapter = {
  mount({ actions, host, state }) {
    const input = host.ownerDocument.createElement('textarea');
    const controller = new AbortController();
    const options = { signal: controller.signal };
    let current = state;
    let composing = false;
    let applying = false;
    input.rows = 6;
    input.spellcheck = false;
    input.className =
      'w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-sm outline-none focus:border-ring focus:ring-2 focus:ring-ring/30';
    input.value = state.text;

    const writeSelection = (selection: ExternalTextSelection) => {
      const native = readSelection(input);
      if (
        native.anchor === selection.anchor &&
        native.focus === selection.focus
      ) {
        return;
      }
      input.setSelectionRange(
        Math.min(selection.anchor, selection.focus),
        Math.max(selection.anchor, selection.focus),
        selection.anchor > selection.focus ? 'backward' : 'forward'
      );
    };
    const syncSelection = () => {
      if (applying || input.ownerDocument.activeElement !== input) return;
      const selection = readSelection(input);
      if (
        selection.anchor === current.selection?.anchor &&
        selection.focus === current.selection?.focus
      ) {
        return;
      }
      actions.select({ baseVersion: current.version, selection });
    };
    const paintState = () => {
      input.setAttribute(
        'aria-label',
        host.getAttribute('aria-label') ?? 'External text'
      );
      input.readOnly = current.readOnly;
      input.dataset.selectionMode = current.selection?.mode ?? 'none';
      input.dataset.selectionAnchor = String(current.selection?.anchor ?? -1);
      input.dataset.selectionFocus = String(current.selection?.focus ?? -1);
      input.dataset.decorations = String(current.decorations.length);
      input.dataset.version = String(current.version);
      input.style.backgroundColor =
        current.selection?.mode === 'model'
          ? 'color-mix(in srgb, Highlight 12%, Canvas)'
          : '';
      if (current.selection?.mode === 'native') {
        writeSelection(current.selection);
      }
    };
    const dispatchInput = (
      intent: 'composition' | 'cut' | 'drop' | 'input' | 'paste'
    ) => {
      if (applying || input.value === current.text) return;
      if (current.readOnly) {
        input.value = current.text;
        return;
      }
      const before = current.text;
      const after = input.value;
      let from = 0;
      let to = before.length;
      let end = after.length;
      // Native textarea input exposes values, not patches. This demo diff belongs
      // to the adapter; Plite derives its outbound patches from canonical changes.
      while (from < to && from < end && before[from] === after[from]) from += 1;
      while (to > from && end > from && before[to - 1] === after[end - 1]) {
        to -= 1;
        end -= 1;
      }
      actions.dispatch({
        baseVersion: current.version,
        changes: [{ from, to, insert: after.slice(from, end) }],
        intent,
        selection: readSelection(input),
      });
    };
    const insert = (text: string, intent: 'cut' | 'drop' | 'paste') => {
      if (current.readOnly) return;
      input.setRangeText(text, input.selectionStart, input.selectionEnd, 'end');
      dispatchInput(intent);
    };

    input.addEventListener('focus', syncSelection, options);
    input.addEventListener('select', syncSelection, options);
    input.addEventListener('keyup', syncSelection, options);
    input.addEventListener('mouseup', syncSelection, options);
    input.addEventListener(
      'input',
      (event) =>
        dispatchInput(composing || event.isComposing ? 'composition' : 'input'),
      options
    );
    input.addEventListener(
      'beforeinput',
      (event) => {
        if (
          event.inputType === 'historyUndo' ||
          event.inputType === 'historyRedo'
        ) {
          event.preventDefault();
          actions.history(event.inputType === 'historyUndo' ? 'undo' : 'redo');
        }
      },
      options
    );
    input.addEventListener(
      'compositionstart',
      () => {
        composing = true;
        actions.composition('start');
      },
      options
    );
    input.addEventListener(
      'compositionend',
      () => {
        dispatchInput('composition');
        composing = false;
        actions.composition('end');
      },
      options
    );
    input.addEventListener(
      'keydown',
      (event) => {
        if (
          (event.metaKey || event.ctrlKey) &&
          !event.altKey &&
          event.key.toLowerCase() === 'z'
        ) {
          event.preventDefault();
          actions.history(event.shiftKey ? 'redo' : 'undo');
          return;
        }
        if (
          composing ||
          event.isComposing ||
          event.metaKey ||
          event.ctrlKey ||
          event.altKey
        ) {
          return;
        }
        const selection = readSelection(input);
        const backward =
          event.key === 'ArrowLeft' ||
          event.key === 'ArrowUp' ||
          event.key === 'Backspace';
        const forward =
          event.key === 'ArrowRight' ||
          event.key === 'ArrowDown' ||
          event.key === 'Delete';
        const atStart = selection.focus === 0;
        const atEnd = selection.focus === input.value.length;
        if (!(backward && atStart) && !(forward && atEnd)) return;
        const direction = backward ? 'backward' : 'forward';
        if (event.key === 'Backspace' || event.key === 'Delete') {
          if (selection.anchor !== selection.focus || current.readOnly) return;
          event.preventDefault();
          syncSelection();
          actions.deleteOut({ baseVersion: current.version, direction });
        } else if (selection.anchor === selection.focus || event.shiftKey) {
          event.preventDefault();
          syncSelection();
          actions.navigateOut({
            baseVersion: current.version,
            direction,
            extend: event.shiftKey,
          });
        }
      },
      options
    );
    input.addEventListener(
      'copy',
      (event) => {
        event.preventDefault();
        event.clipboardData?.setData(
          'text/plain',
          current.text.slice(input.selectionStart, input.selectionEnd)
        );
      },
      options
    );
    input.addEventListener(
      'cut',
      (event) => {
        event.preventDefault();
        event.clipboardData?.setData(
          'text/plain',
          current.text.slice(input.selectionStart, input.selectionEnd)
        );
        insert('', 'cut');
      },
      options
    );
    input.addEventListener(
      'paste',
      (event) => {
        event.preventDefault();
        insert(event.clipboardData?.getData('text/plain') ?? '', 'paste');
      },
      options
    );
    input.addEventListener(
      'dragstart',
      (event) => {
        if (event.dataTransfer) event.dataTransfer.effectAllowed = 'copy';
      },
      options
    );
    input.addEventListener(
      'dragover',
      (event) => {
        if (current.readOnly) return;
        event.preventDefault();
        if (event.dataTransfer) event.dataTransfer.dropEffect = 'copy';
      },
      options
    );
    input.addEventListener(
      'drop',
      (event) => {
        event.preventDefault();
        insert(event.dataTransfer?.getData('text/plain') ?? '', 'drop');
      },
      options
    );
    host.append(input);
    paintState();
    return {
      destroy() {
        controller.abort();
        input.remove();
      },
      focus({ edge } = {}) {
        if (current.selection) writeSelection(current.selection);
        else if (edge) {
          writeSelection({
            anchor: edge === 'end' ? input.value.length : 0,
            focus: edge === 'end' ? input.value.length : 0,
          });
        }
        input.focus({ preventScroll: true });
      },
      update({ changes, state: next }) {
        applying = true;
        try {
          if (changes === null) {
            composing = false;
            input.value = next.text;
          } else {
            for (const change of [...changes].reverse()) {
              input.setRangeText(
                change.insert,
                change.from,
                change.to,
                'preserve'
              );
            }
          }
          current = next;
          paintState();
        } finally {
          applying = false;
        }
      },
    };
  },
};

const renderExternal = ({ attributes, element, slots }: RenderElementProps) =>
  element.type === 'external-text' ? (
    <div {...attributes} className="my-3">
      {slots.externalText({
        adapter: textareaAdapter,
        ariaLabel: 'External text',
      })}
    </div>
  ) : (
    <p {...attributes}>{slots.children()}</p>
  );
const renderNative = ({ attributes, element, slots }: RenderElementProps) =>
  element.type === 'external-text' ? (
    <pre
      {...attributes}
      className="my-3 rounded-md border p-3 font-mono text-sm whitespace-pre-wrap"
    >
      {slots.children()}
    </pre>
  ) : (
    <p {...attributes}>{slots.children()}</p>
  );

const Status = () => {
  const snapshot = useEditorState((state) =>
    JSON.stringify(
      {
        selection: state.selection(),
        value: state.value(),
      },
      null,
      2
    )
  );
  const commands = usePliteHistory({ focusPolicy: 'preserve' });
  return (
    <>
      <div className="flex gap-2">
        <button
          className="rounded border px-3 py-1"
          disabled={!commands.canUndo}
          onClick={commands.undo}
          type="button"
        >
          Undo
        </button>
        <button
          className="rounded border px-3 py-1"
          disabled={!commands.canRedo}
          onClick={commands.redo}
          type="button"
        >
          Redo
        </button>
      </div>
      <details className="mt-4 text-sm">
        <summary>Canonical value and selection</summary>
        <pre
          className="mt-2 overflow-auto rounded bg-muted p-3 text-xs"
          data-test-id="external-text-state"
        >
          {snapshot}
        </pre>
      </details>
    </>
  );
};

const ExternalTextExample = () => {
  const editor = useEditor({
    extensions: [textSchema, history()],
    initialValue: {
      children: [
        {
          type: 'paragraph',
          children: [{ text: 'Before the external view.' }],
        },
        {
          type: 'external-text',
          children: [
            { text: 'One canonical text.\nEdit either view.\nUndo is shared.' },
          ],
        },
        { type: 'paragraph', children: [{ text: 'After the external view.' }] },
      ],
      roots: {
        notes: [
          {
            type: 'external-text',
            children: [{ text: 'An independently addressed note.' }],
          },
        ],
      },
    },
  });
  const [readOnly, setReadOnly] = useState(false);
  const [second, setSecond] = useState(false);
  const [showDecorations, setShowDecorations] = useState(false);
  const [root, setRoot] = useState<'notes' | undefined>();
  const [outerEvents, setOuterEvents] = useState(0);
  const outerEvent = () => {
    setOuterEvents((count) => count + 1);
  };
  const decorations = useMemo<Array<PliteDecorationSource<typeof editor>>>(
    () =>
      showDecorations
        ? [
            {
              id: 'external-text-example-decorations',
              read: ({ entry: [node, path] }) =>
                TextApi.isText(node) && node.text.length > 0
                  ? [0, 1].map((index) => ({
                      key: `decoration:${path.join('.')}:${index}`,
                      attributes: {
                        'data-example-decoration': index,
                        style: {
                          backgroundColor: index ? '#bbf7d0' : '#fef08a',
                        },
                      },
                      range: {
                        anchor: { path, offset: index },
                        focus: { path, offset: Math.min(node.text.length, 10) },
                      },
                    }))
                  : [],
            },
          ]
        : [],
    [showDecorations]
  );
  return (
    <StrictMode>
      <Plite decorations={decorations} editor={editor}>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            One Plite document, two rendering engines. The textarea demonstrates
            the adapter contract; it is not a large-code editor.
          </p>
          <div className="flex flex-wrap items-center gap-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                checked={readOnly}
                onChange={(event) => setReadOnly(event.target.checked)}
                type="checkbox"
              />
              Read-only
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={second}
                onChange={(event) => setSecond(event.target.checked)}
                type="checkbox"
              />
              Second external view
            </label>
            <label className="flex items-center gap-2">
              <input
                checked={showDecorations}
                onChange={(event) => setShowDecorations(event.target.checked)}
                type="checkbox"
              />
              Show decorations
            </label>
            <label>
              Root{' '}
              <select
                aria-label="View root"
                className="rounded border p-1"
                onChange={(event) =>
                  setRoot(event.target.value === 'notes' ? 'notes' : undefined)
                }
                value={root ?? 'document'}
              >
                <option value="document">Document</option>
                <option value="notes">Notes</option>
              </select>
            </label>
            <span>
              Outer input events:{' '}
              <output data-test-id="external-text-outer-events">
                {outerEvents}
              </output>
            </span>
          </div>
          {showDecorations && (
            <p className="text-sm text-muted-foreground">
              Native Plite paints decoration ranges. The textarea receives the
              same ranges, but cannot style text inside its input.
            </p>
          )}
          <div className="grid gap-6 md:grid-cols-2">
            <section className="min-w-0">
              <h3 className="mb-2 font-medium">Native Plite</h3>
              <Editable
                aria-label="Native document"
                className="min-h-48 rounded-md border p-4"
                id="external-text-native"
                readOnly={readOnly}
                renderElement={renderNative}
                root={root}
              />
            </section>
            <section className="min-w-0">
              <h3 className="mb-2 font-medium">External text view</h3>
              <Editable
                aria-label="External document"
                className="min-h-48 rounded-md border p-4"
                id="external-text-primary"
                onDOMBeforeInput={outerEvent}
                onInput={outerEvent}
                onKeyDown={outerEvent}
                onCopy={outerEvent}
                onCut={outerEvent}
                onPaste={outerEvent}
                onDrop={outerEvent}
                readOnly={readOnly}
                renderElement={renderExternal}
                root={root}
              />
            </section>
            {second && (
              <section className="min-w-0">
                <h3 className="mb-2 font-medium">Second external view</h3>
                <Editable
                  aria-label="Second external document"
                  className="min-h-48 rounded-md border p-4"
                  id="external-text-secondary"
                  readOnly={readOnly}
                  renderElement={renderExternal}
                  root={root}
                />
              </section>
            )}
          </div>
          <Status />
        </div>
      </Plite>
    </StrictMode>
  );
};

export default ExternalTextExample;
