import { render } from '@testing-library/react';
import React from 'react';
import { expect, test, vi } from 'vitest';

import type { EditorLifecycleError } from '../../src';
import {
  createEditor,
  Editable,
  EditorElement,
  EditorRoot,
} from '../../src/react';
import { replace as editorReplace } from '../../src/testing';

type Editor = ReturnType<typeof createEditor>;
type RenderElement = NonNullable<
  React.ComponentProps<typeof Editable>['renderElement']
>;

(
  globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
).IS_REACT_ACT_ENVIRONMENT = false;

const waitLooks = async (cycles = 5) => {
  for (let cycle = 0; cycle < cycles; cycle++) {
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 0);
      });
    });
  }
};

const createRecordingEditor = () => {
  const reports: Array<EditorLifecycleError<unknown>> = [];
  const editor = createEditor({
    lifecycleErrorSink: (error) => {
      reports.push(error);
    },
  });

  return { editor, reports };
};

const renderElementReports = (
  reports: ReadonlyArray<EditorLifecycleError<unknown>>
) =>
  reports.flatMap((report) =>
    'source' in report && report.source === 'render-element'
      ? [
          {
            childPath: report.childPath,
            path: report.path,
            phase: report.phase,
            type: report.element.type,
          },
        ]
      : []
  );

const paragraph = (text: string) => ({
  type: 'paragraph',
  children: [{ text }],
});

const shellRenderer: RenderElement = ({ children, element }) => (
  <EditorElement>
    {element.type === 'shell' ? 'Shell only' : children}
  </EditorElement>
);

const mountFocused = (
  editor: Editor,
  children: unknown[] = [paragraph('Visible')],
  renderElement: RenderElement = shellRenderer
) => {
  editorReplace(editor, {
    children: children as never,
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });

  return render(
    <EditorRoot editor={editor}>
      <Editable autoFocus renderElement={renderElement} />
    </EditorRoot>
  );
};

const insertAndSelect = async (
  editor: Editor,
  node: unknown,
  path = [1, 0, 0]
) => {
  editor.update((tx) => {
    tx.nodes.insert(node as never, { at: [1] });
    tx.selection.set({ path, offset: 1 });
  });
  await new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
};

test('an omitted child with the selection set into it reports once, from the commit check', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await insertAndSelect(editor, {
    type: 'shell',
    children: [paragraph('Hidden')],
  });
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([
    { childPath: [1, 0], path: [1], phase: 'commit', type: 'shell' },
  ]);
});

test('a child omitted on the first mount reports once', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor, [
    paragraph('Visible'),
    { type: 'shell', children: [paragraph('Hidden')] },
  ]);
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([
    { childPath: [1, 0], path: [1], phase: 'commit', type: 'shell' },
  ]);
});

test('a grandchild omission reports once, against the renderer that omitted it', async () => {
  const { editor, reports } = createRecordingEditor();

  mountFocused(editor);
  await waitLooks();
  await insertAndSelect(
    editor,
    {
      type: 'section',
      children: [{ type: 'shell', children: [paragraph('Hidden')] }],
    },
    [1, 0, 0, 0]
  );
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([
    { childPath: [1, 0, 0], path: [1, 0], phase: 'commit', type: 'shell' },
  ]);
});

test('with no sink and no reportError, the omitted child reaches console.error as one error', async () => {
  const editor = createEditor();
  const errors: unknown[] = [];
  const consoleError = vi
    .spyOn(console, 'error')
    .mockImplementation((error: unknown) => {
      errors.push(error);
    });

  vi.stubGlobal('reportError', undefined);
  try {
    mountFocused(editor);
    await waitLooks();
    await insertAndSelect(editor, {
      type: 'shell',
      children: [paragraph('Hidden')],
    });
    await waitLooks();
  } finally {
    vi.unstubAllGlobals();
    consoleError.mockRestore();
  }

  expect(
    errors.flatMap((error) => (error instanceof Error ? [error.message] : []))
  ).toEqual([
    'Editor render-element commit check failed: renderElement for "shell" at 1 omitted editable child 1.0 without a DOM coverage boundary. Render children or register a DOMCoverage boundary.',
  ]);
});

test('two Editables sharing one editor that both render every child report nothing', async () => {
  const { editor, reports } = createRecordingEditor();

  editorReplace(editor, {
    children: [paragraph('Before'), paragraph('After')] as never,
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 1 },
      focus: { path: [0, 0], offset: 1 },
    },
  });
  render(
    <EditorRoot editor={editor}>
      <Editable id="first-view" renderElement={shellRenderer} />
      <Editable autoFocus id="second-view" renderElement={shellRenderer} />
    </EditorRoot>
  );
  await waitLooks();
  await insertAndSelect(editor, paragraph('Inserted'), [1, 0]);
  await waitLooks();

  expect(renderElementReports(reports)).toEqual([]);
});
