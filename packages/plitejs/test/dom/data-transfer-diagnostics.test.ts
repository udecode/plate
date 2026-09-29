import { expect, test } from 'bun:test';

import {
  ContentSlice,
  createEditor,
  defineEditorSchema,
  definePlugin,
  type Descendant,
  editorCommands,
  type EditorLifecycleError,
  type PluginInput,
  schema,
  SelectionApi,
} from 'plitejs';

import {
  dataTransferFormats,
  type DataTransferDiagnostic,
  type DataTransferFormat,
  dom,
  writeDOMFragmentData,
} from '../../src/dom';
import { observeDataTransferInsertion } from '../../src/dom/internal';

class DataTransferStub {
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

const paragraphSchema = defineEditorSchema(
  'schema:data-transfer-diagnostics-test',
  {
    elements: {
      paragraph: {
        content: schema.content.text({ default: 'text', min: 1 }),
      },
    },
    id: 'data-transfer-diagnostics-test',
    root: schema.content.group('block', {
      default: { type: 'paragraph' },
      min: 1,
    }),
    unknown: 'reject',
    version: 1,
  }
);

const lossy = (message: string): DataTransferDiagnostic => ({
  impact: 'lossy',
  message,
});

const lossless = (message: string): DataTransferDiagnostic => ({
  impact: 'lossless',
  message,
});

const createFormatEditor = (
  formats: readonly DataTransferFormat[],
  plugins: readonly PluginInput[] = []
) => {
  const lifecycleErrors: EditorLifecycleError[] = [];
  const editor = createEditor({
    plugins: [
      paragraphSchema,
      dom(),
      dataTransferFormats('diagnostic-formats', formats),
      ...plugins,
    ],
    initialSelection: SelectionApi.text({
      anchor: { offset: 0, path: [0, 0] },
      focus: { offset: 0, path: [0, 0] },
    }),
    initialValue: [paragraph('')],
    lifecycleErrorSink: (error) => {
      lifecycleErrors.push(error);
    },
  });

  return { editor, lifecycleErrors };
};

const createPayload = (payload: Readonly<Record<string, string>>) => {
  const data = new DataTransferStub();

  for (const [mimeType, value] of Object.entries(payload)) {
    data.setData(mimeType, value);
  }

  return data as unknown as DataTransfer;
};

type ObservedPaste = Readonly<{
  diagnostics: readonly DataTransferDiagnostic[];
  inserted: boolean;
  text: string;
}>;

const createObserver = (
  editor: ReturnType<typeof createFormatEditor>['editor']
) => {
  const outcomes: ObservedPaste[] = [];

  return {
    observe: <T>(insert: () => T) =>
      observeDataTransferInsertion(
        editor,
        (inserted, diagnostics) => {
          outcomes.push({
            diagnostics,
            inserted,
            text: editor.read.text.string([]),
          });
        },
        insert
      ),
    outcomes,
  };
};

test('the inserted payload reports reach the observer after its commit', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossless('Dropped document metadata.'));
        report(lossy('Left out an embedded video.'));

        return ContentSlice.closed([paragraph('rich')]);
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  expect(
    observe(() =>
      editor.api.dom.clipboard.insertData(
        createPayload({ 'text/html': '<p>rich</p>' })
      )
    )
  ).toBe(true);
  expect(outcomes).toEqual([
    {
      diagnostics: [
        lossless('Dropped document metadata.'),
        lossy('Left out an embedded video.'),
      ],
      inserted: true,
      text: 'rich',
    },
  ]);
  expect(Object.isFrozen(outcomes[0]?.diagnostics)).toBe(true);
  expect(Object.isFrozen(outcomes[0]?.diagnostics[0])).toBe(true);
});

test('programmatic insertion keeps its boolean without an observer', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossy('Left out an embedded video.'));

        return ContentSlice.closed([paragraph('rich')]);
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);

  expect(
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/html': '<p>rich</p>' })
    )
  ).toBe(true);
  expect(editor.read.text.string([])).toBe('rich');
});

test('loss from an abandoned payload survives a fallback to another payload', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossless('Dropped document metadata.'));
        report(lossy('Removed an unsafe image.'));

        return null;
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  // Equal visible text is not evidence that the rich payload was recovered.
  observe(() =>
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/html': '<p>same</p>', 'text/plain': 'same' })
    )
  );

  expect(outcomes).toEqual([
    {
      diagnostics: [lossy('Removed an unsafe image.')],
      inserted: true,
      text: 'same',
    },
  ]);
});

test('a later decoder of the same payload accounts for its own loss', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossless('Kept every heading.'));

        return ContentSlice.closed([paragraph('general')]);
      },
      key: 'general-html',
      mimeType: 'text/html',
    },
    {
      decode: ({ report }) => {
        report(lossy('Word list numbering was left out.'));

        return null;
      },
      key: 'word-html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  observe(() =>
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/html': '<p>general</p>' })
    )
  );

  expect(outcomes).toEqual([
    {
      diagnostics: [lossless('Kept every heading.')],
      inserted: true,
      text: 'general',
    },
  ]);
});

test('ordinary delegation stays quiet', () => {
  const { editor } = createFormatEditor([
    {
      accept: () => false,
      decode: () => ContentSlice.closed([paragraph('skipped')]),
      key: 'skipped-html',
      mimeType: 'text/html',
    },
    {
      decode: () => null,
      key: 'delegating-plain-text',
      mimeType: 'text/plain',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  observe(() =>
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/html': '<p>plain</p>', 'text/plain': 'plain' })
    )
  );

  expect(outcomes).toEqual([
    { diagnostics: [], inserted: true, text: 'plain' },
  ]);
});

test('a throwing attempt keeps the lifecycle error channel and its reports', () => {
  const failure = new Error('decoder bug');
  const { editor, lifecycleErrors } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossy('Partial report before a crash.'));

        throw failure;
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  observe(() =>
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/html': '<p>text</p>', 'text/plain': 'text' })
    )
  );

  expect(lifecycleErrors).toHaveLength(1);
  expect(lifecycleErrors[0]).toMatchObject({
    cause: failure,
    key: 'html',
    phase: 'decode',
    source: 'data-transfer-format',
  });
  expect(outcomes).toEqual([{ diagnostics: [], inserted: true, text: 'text' }]);
});

test('report accepts only complete diagnostics while accept or decode runs', () => {
  let retainedReport: ((diagnostic: DataTransferDiagnostic) => void) | null =
    null;
  const { editor, lifecycleErrors } = createFormatEditor([
    {
      accept: ({ report }) => {
        report(lossless('Accepted a clipboard fragment.'));

        return true;
      },
      decode: ({ report }) => {
        retainedReport = report;

        return ContentSlice.closed([paragraph('kept')]);
      },
      key: 'kept-html',
      mimeType: 'text/html',
    },
    {
      decode: ({ report }) => {
        report({ impact: 'unknown', message: 'Bad impact.' } as never);

        return ContentSlice.closed([paragraph('invalid')]);
      },
      key: 'invalid-markdown',
      mimeType: 'text/markdown',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  observe(() =>
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/html': '<p>kept</p>', 'text/markdown': 'invalid' })
    )
  );

  expect(lifecycleErrors).toHaveLength(1);
  expect(lifecycleErrors[0]).toMatchObject({
    key: 'invalid-markdown',
    phase: 'decode',
  });
  expect(outcomes).toEqual([
    {
      diagnostics: [lossless('Accepted a clipboard fragment.')],
      inserted: true,
      text: 'kept',
    },
  ]);
  expect(() => retainedReport?.(lossy('Too late.'))).toThrow(
    'DataTransfer diagnostics can only be reported while accept or decode runs.'
  );
});

test('a refused paste settles once without insertion', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossless('Dropped document metadata.'));
        report(lossy('Removed the only image.'));

        return null;
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  expect(
    observe(() =>
      editor.api.dom.clipboard.insertData(
        createPayload({ 'text/html': '<img src="javascript:alert(1)">' })
      )
    )
  ).toBe(false);
  expect(outcomes).toEqual([
    {
      diagnostics: [lossy('Removed the only image.')],
      inserted: false,
      text: '',
    },
  ]);
});

test('an accepted insertion that commits nothing settles without insertion', () => {
  const { editor } = createFormatEditor(
    [
      {
        decode: ({ report }) => {
          report(lossy('Left out a chart.'));

          return ContentSlice.closed([paragraph('placed nowhere')]);
        },
        key: 'html',
        mimeType: 'text/html',
      },
    ],
    [
      definePlugin('no-op-placement', {
        commands: ({ around }) => [
          around(editorCommands.replaceSlice, ({ state }) =>
            state.transaction(() => {})
          ),
        ],
      }),
    ]
  );
  const { observe, outcomes } = createObserver(editor);

  expect(
    observe(() =>
      editor.api.dom.clipboard.insertData(
        createPayload({ 'text/html': '<p>placed nowhere</p>' })
      )
    )
  ).toBe(true);
  expect(outcomes).toEqual([
    {
      diagnostics: [lossy('Left out a chart.')],
      inserted: false,
      text: '',
    },
  ]);
});

test('an insertion inside an open update settles on that commit', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossy('Left out a chart.'));

        return ContentSlice.closed([paragraph('nested')]);
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  editor.update(() => {
    observe(() =>
      editor.api.dom.clipboard.insertData(
        createPayload({ 'text/html': '<p>nested</p>' })
      )
    );

    expect(outcomes).toEqual([]);
  });

  expect(outcomes).toEqual([
    {
      diagnostics: [lossy('Left out a chart.')],
      inserted: true,
      text: 'nested',
    },
  ]);
});

test('a rolled-back insertion settles nothing', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        report(lossy('Left out a chart.'));

        return ContentSlice.closed([paragraph('rolled back')]);
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  expect(() =>
    editor.update(() => {
      observe(() =>
        editor.api.dom.clipboard.insertData(
          createPayload({ 'text/html': '<p>rolled back</p>' })
        )
      );

      throw new Error('rollback');
    })
  ).toThrow('rollback');
  expect(outcomes).toEqual([]);
  expect(editor.read.text.string([])).toBe('');
});

test('the exact editor fragment settles without format diagnostics', () => {
  let decoded = 0;
  const { editor } = createFormatEditor([
    {
      decode: ({ report }) => {
        decoded += 1;
        report(lossy('Should not run.'));

        return null;
      },
      key: 'html',
      mimeType: 'text/html',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);
  const data = new DataTransferStub();

  writeDOMFragmentData(data, {
    html: '<p>exact</p>',
    slice: ContentSlice.closed([paragraph('exact')]),
  });
  observe(() =>
    editor.api.dom.clipboard.insertData(data as unknown as DataTransfer)
  );

  expect(decoded).toBe(0);
  expect(outcomes).toEqual([
    { diagnostics: [], inserted: true, text: 'exact' },
  ]);
});

test('an observation settles only the first insertion under it', () => {
  const { editor } = createFormatEditor([
    {
      decode: ({ data, report }) => {
        report(lossy(`Left out part of ${data}.`));

        return ContentSlice.closed([paragraph(data)]);
      },
      key: 'markdown',
      mimeType: 'text/markdown',
    },
  ]);
  const { observe, outcomes } = createObserver(editor);

  observe(() => {
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/markdown': 'first' })
    );
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/markdown': 'second' })
    );
  });

  expect(outcomes).toEqual([
    {
      diagnostics: [lossy('Left out part of first.')],
      inserted: true,
      text: 'first',
    },
  ]);
  expect(editor.read.text.string([])).toBe('firstsecond');
});

test('observations stay with their own editor runtime', () => {
  const format: DataTransferFormat = {
    decode: ({ data, report }) => {
      report(lossy(`Left out part of ${data}.`));

      return ContentSlice.closed([paragraph(data)]);
    },
    key: 'markdown',
    mimeType: 'text/markdown',
  };
  const { editor } = createFormatEditor([format]);
  const { editor: other } = createFormatEditor([format]);
  const { observe, outcomes } = createObserver(editor);

  observe(() => {
    other.api.dom.clipboard.insertData(
      createPayload({ 'text/markdown': 'other' })
    );
    editor.api.dom.clipboard.insertData(
      createPayload({ 'text/markdown': 'own' })
    );
  });

  expect(outcomes).toEqual([
    {
      diagnostics: [lossy('Left out part of own.')],
      inserted: true,
      text: 'own',
    },
  ]);
  expect(other.read.text.string([])).toBe('other');
});
