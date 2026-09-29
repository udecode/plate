import { act, fireEvent, render } from '@testing-library/react';
import {
  ContentSlice,
  defineEditorSchema,
  definePlugin,
  type Descendant,
  type PluginInput,
  schema,
  SelectionApi,
} from 'plitejs';
import {
  type DataTransferDiagnostic,
  type DataTransferFormat,
  dataTransferFormats,
  domCommands,
} from 'plitejs/dom';
import { useState } from 'react';

import {
  createEditor,
  Editable,
  type EditablePasteResult,
  EditorRoot,
} from '../../src/react';
import {
  EditableDOMRuntime,
  findMountedEditableDOMRuntime,
} from '../../src/react/editable/editable-dom-runtime';

// Model a host that dispatches `beforeinput` for rich pastes, so one file can
// drive both the direct paste path and the beforeinput path.
Object.defineProperty(InputEvent.prototype, 'getTargetRanges', {
  configurable: true,
  value: () => [],
});

// Plite recognizes transfer payloads by constructor name across realms.
class DataTransfer {
  data = new Map<string, string>();
  files = [] as unknown as FileList;

  get types() {
    return [...this.data.keys()];
  }

  getData(mimeType: string) {
    return this.data.get(mimeType) ?? '';
  }

  setData(mimeType: string, value: string) {
    this.data.set(mimeType, value);
  }
}

const paragraph = (text: string): Descendant => ({
  children: [{ text }],
  type: 'paragraph',
});

const pasteSchema = defineEditorSchema('schema:editable-paste-result', {
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  id: 'editable-paste-result',
  root: schema.content.group('block', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  roots: {
    header: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
  },
  unknown: 'reject',
  version: 1,
});

const lossy = (message: string): DataTransferDiagnostic => ({
  impact: 'lossy',
  message,
});

const lossless = (message: string): DataTransferDiagnostic => ({
  impact: 'lossless',
  message,
});

// Rich HTML loses an embed; plain text reports only harmless metadata. Later
// registrations decode first, so HTML wins when both payloads exist.
const reportingFormats: readonly DataTransferFormat[] = [
  {
    decode: ({ data, report }) => {
      report(lossless('Dropped source metadata.'));

      return ContentSlice.closed([paragraph(data)]);
    },
    key: 'test-plain-text',
    mimeType: 'text/plain',
  },
  {
    decode: ({ data, report }) => {
      if (data.includes('<video')) {
        report(lossy('Left out an embedded video.'));

        return null;
      }
      report(lossy('Left out an embedded chart.'));

      return ContentSlice.closed([paragraph('rich')]);
    },
    key: 'test-html',
    mimeType: 'text/html',
  },
];

const createPasteEditor = (plugins: readonly PluginInput[] = []) =>
  createEditor({
    plugins: [
      pasteSchema,
      dataTransferFormats('paste-result-formats', reportingFormats),
      ...plugins,
    ],
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    }),
    initialValue: {
      children: [paragraph('')],
      roots: { header: [paragraph('')] },
    },
  });

const createPayload = (payload: Readonly<Record<string, string>>) => {
  const data = new DataTransfer();

  for (const [mimeType, value] of Object.entries(payload)) {
    data.setData(mimeType, value);
  }

  return data;
};

const asHostDataTransfer = (data: DataTransfer) =>
  data as unknown as globalThis.DataTransfer;

const markContentEditable = (element: HTMLElement) => {
  // jsdom does not derive contentEditable state for editing targets.
  Object.defineProperty(element, 'isContentEditable', {
    configurable: true,
    value: true,
  });

  return element;
};

const getEditable = (container: HTMLElement, label: string) =>
  markContentEditable(
    container.querySelector<HTMLElement>(`[aria-label="${label}"]`)!
  );

// Returns whether the paste event stayed uncanceled. Browsers send
// `beforeinput` only after an uncanceled paste.
const paste = async (editable: HTMLElement, data: DataTransfer) => {
  let notCanceled = true;

  await act(async () => {
    notCanceled = fireEvent.paste(editable, { clipboardData: data });
  });

  return notCanceled;
};

const beforeInputPaste = async (editable: HTMLElement, data: DataTransfer) => {
  const event = new InputEvent('beforeinput', {
    bubbles: true,
    cancelable: true,
    inputType: 'insertFromPaste',
  });

  Object.defineProperty(event, 'dataTransfer', { value: data });
  await act(async () => {
    editable.dispatchEvent(event);
  });

  return event;
};

describe('Editable onPasteResult', () => {
  test('a direct paste reports once after its commit', async () => {
    const editor = createPasteEditor();
    const results: Array<EditablePasteResult & { text: string }> = [];
    const { container } = render(
      <EditorRoot editor={editor}>
        <Editable
          aria-label="Body"
          onPasteResult={(result) => {
            results.push({ ...result, text: editor.read.text.string([]) });
          }}
        />
      </EditorRoot>
    );

    expect(
      await paste(
        getEditable(container, 'Body'),
        createPayload({ 'text/plain': 'plain' })
      )
    ).toBe(false);
    expect(results).toEqual([
      {
        diagnostics: [lossless('Dropped source metadata.')],
        inserted: true,
        text: 'plain',
      },
    ]);
  });

  test('a rich paste waits for beforeinput and reports only once', async () => {
    const editor = createPasteEditor();
    const onPasteResult = vi.fn();
    const { container } = render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Body" onPasteResult={onPasteResult} />
      </EditorRoot>
    );
    const editable = getEditable(container, 'Body');
    const data = createPayload({
      'text/html': '<p>rich</p>',
      'text/plain': 'rich',
    });

    expect(await paste(editable, data)).toBe(true);
    expect(onPasteResult).not.toHaveBeenCalled();
    expect(editor.read.text.string([])).toBe('');

    const beforeInput = await beforeInputPaste(editable, data);

    expect(beforeInput.defaultPrevented).toBe(true);
    expect(editor.read.text.string([])).toBe('rich');
    expect(onPasteResult).toHaveBeenCalledTimes(1);
    expect(onPasteResult).toHaveBeenCalledWith({
      diagnostics: [lossy('Left out an embedded chart.')],
      inserted: true,
    });
    expect(Object.isFrozen(onPasteResult.mock.calls[0]?.[0])).toBe(true);
  });

  test('a refused paste reports its loss without insertion', async () => {
    const editor = createPasteEditor();
    const onPasteResult = vi.fn();
    const { container } = render(
      <EditorRoot editor={editor}>
        <Editable aria-label="Body" onPasteResult={onPasteResult} />
      </EditorRoot>
    );

    await beforeInputPaste(
      getEditable(container, 'Body'),
      createPayload({ 'text/html': '<video src="clip.mp4"></video>' })
    );

    expect(editor.read.text.string([])).toBe('');
    expect(onPasteResult).toHaveBeenCalledTimes(1);
    expect(onPasteResult).toHaveBeenCalledWith({
      diagnostics: [lossy('Left out an embedded video.')],
      inserted: false,
    });
  });

  test('only the view that received the paste reports it', async () => {
    const editor = createPasteEditor();
    const onBodyPasteResult = vi.fn();
    const onHeaderPasteResult = vi.fn();
    const { container } = render(
      <EditorRoot editor={editor}>
        <Editable
          aria-label="Header"
          onPasteResult={onHeaderPasteResult}
          root="header"
        />
        <Editable aria-label="Body" onPasteResult={onBodyPasteResult} />
      </EditorRoot>
    );

    await paste(
      getEditable(container, 'Body'),
      createPayload({ 'text/plain': 'body' })
    );

    expect(onBodyPasteResult).toHaveBeenCalledTimes(1);
    expect(onHeaderPasteResult).not.toHaveBeenCalled();
  });

  test('the current callback prop receives the result', async () => {
    const editor = createPasteEditor();
    const first = vi.fn();
    const second = vi.fn();
    const tree = (onPasteResult: (result: EditablePasteResult) => void) => (
      <EditorRoot editor={editor}>
        <Editable aria-label="Body" onPasteResult={onPasteResult} />
      </EditorRoot>
    );
    const mounted = render(tree(first));

    mounted.rerender(tree(second));
    await paste(
      getEditable(mounted.container, 'Body'),
      createPayload({ 'text/plain': 'current' })
    );

    expect(first).not.toHaveBeenCalled();
    expect(second).toHaveBeenCalledTimes(1);
  });

  test('pastes handled outside built-in insertion report nothing', async () => {
    const pluginEditor = createPasteEditor([
      definePlugin('owned-paste', {
        commands: ({ handle }) => [
          handle(domCommands.insertData, ({ state }) =>
            state.transaction((tx) => {
              tx.text.insert('owned');
            })
          ),
        ],
      }),
    ]);
    const appEditor = createPasteEditor();
    const onPluginPasteResult = vi.fn();
    const onAppPasteResult = vi.fn();
    const Views = () => {
      const [appPastes, setAppPastes] = useState(0);

      return (
        <>
          <EditorRoot editor={pluginEditor}>
            <Editable aria-label="Plugin" onPasteResult={onPluginPasteResult} />
          </EditorRoot>
          <EditorRoot editor={appEditor}>
            <Editable
              aria-label="App"
              data-app-pastes={appPastes}
              onPaste={() => {
                setAppPastes((count) => count + 1);

                return true;
              }}
              onPasteResult={onAppPasteResult}
            />
          </EditorRoot>
        </>
      );
    };
    const { container } = render(<Views />);

    await paste(
      getEditable(container, 'Plugin'),
      createPayload({ 'text/plain': 'plugin' })
    );
    await paste(
      getEditable(container, 'App'),
      createPayload({ 'text/plain': 'app' })
    );

    expect(pluginEditor.read.text.string([])).toBe('owned');
    expect(onPluginPasteResult).not.toHaveBeenCalled();
    expect(
      container
        .querySelector('[aria-label="App"]')
        ?.getAttribute('data-app-pastes')
    ).toBe('1');
    expect(appEditor.read.text.string([])).toBe('');
    expect(onAppPasteResult).not.toHaveBeenCalled();
  });

  test('an initiator that unmounts before the commit reports to no view', async () => {
    const editor = createPasteEditor();
    const onBodyPasteResult = vi.fn();
    const onHeaderPasteResult = vi.fn();
    const { container } = render(
      <EditorRoot editor={editor}>
        <Editable
          aria-label="Header"
          onPasteResult={onHeaderPasteResult}
          root="header"
        />
        <Editable aria-label="Body" onPasteResult={onBodyPasteResult} />
      </EditorRoot>
    );
    const body = findMountedEditableDOMRuntime(getEditable(container, 'Body'));

    expect(body).toBeInstanceOf(EditableDOMRuntime);

    await act(async () => {
      editor.update(() => {
        body?.runPaste(() =>
          editor.api.dom.clipboard.insertData(
            asHostDataTransfer(createPayload({ 'text/html': '<p>rich</p>' }))
          )
        );
        body?.destroy();
      });
    });

    expect(editor.read.text.string([])).toBe('rich');
    expect(onBodyPasteResult).not.toHaveBeenCalled();
    expect(onHeaderPasteResult).not.toHaveBeenCalled();
  });

  test('a view that gains focus before the commit never receives it', async () => {
    const editor = createPasteEditor();
    const onBodyPasteResult = vi.fn();
    const onHeaderPasteResult = vi.fn();
    const { container } = render(
      <EditorRoot editor={editor}>
        <Editable
          aria-label="Header"
          onPasteResult={onHeaderPasteResult}
          root="header"
        />
        <Editable aria-label="Body" onPasteResult={onBodyPasteResult} />
      </EditorRoot>
    );
    const header = getEditable(container, 'Header');
    const body = findMountedEditableDOMRuntime(getEditable(container, 'Body'));

    await act(async () => {
      editor.update(() => {
        body?.runPaste(() =>
          editor.api.dom.clipboard.insertData(
            asHostDataTransfer(createPayload({ 'text/html': '<p>rich</p>' }))
          )
        );
        header.focus();
        fireEvent.focusIn(header);
      });
    });

    expect(onHeaderPasteResult).not.toHaveBeenCalled();
    expect(onBodyPasteResult).toHaveBeenCalledTimes(1);
    expect(onBodyPasteResult).toHaveBeenCalledWith({
      diagnostics: [lossy('Left out an embedded chart.')],
      inserted: true,
    });
  });
});
