import { createEditor, type Range } from 'plitejs';

import { createPliteAnnotationStore } from '../../src/annotations';
import { getNodeKey, replace } from '../../src/internal';
import type { PliteViewSourceError } from '../../src/internal/view/view-source';
import {
  createPliteDecorationManager,
  type PliteDecorationSource,
} from '../../src/react/decoration-source';
import { createPliteWidgetStore } from '../../src/react/widget-store';

const range: Range = {
  anchor: { path: [0, 0], offset: 0 },
  focus: { path: [0, 0], offset: 3 },
};

const createViewEditor = () => {
  const editor = createEditor();

  replace(editor, {
    children: [{ type: 'paragraph', children: [{ text: 'alpha' }] }],
    selection: { ...range, kind: 'text' },
  });

  return editor;
};

test('optional view sources isolate failures and recover on refresh', () => {
  const editor = createViewEditor();
  const failures: PliteViewSourceError[] = [];
  let decorationFails = true;
  let annotationFails = true;
  let widgetFails = true;
  let refreshDecoration = () => {};
  const nodeKey = getNodeKey(editor, [0, 0])!;
  const healthy: PliteDecorationSource<typeof editor> = {
    id: 'healthy',
    read: ({ entry: [, path] }) =>
      path.length === 2 ? [{ attributes: {}, key: 'healthy', range }] : [],
  };
  const flaky: PliteDecorationSource<typeof editor> = {
    id: 'flaky-decoration',
    observe: ({ refresh }) => {
      refreshDecoration = () => refresh({ nodeKeys: 'all' });

      return () => {};
    },
    read: ({ entry: [, path] }) => {
      if (decorationFails) throw new Error('decoration failed');

      return path.length === 2 ? [{ attributes: {}, key: 'flaky', range }] : [];
    },
  };
  const decorations = createPliteDecorationManager(editor, [healthy, flaky], {
    onError: (error) => failures.push(error),
  });
  const unmountDecorations = decorations.mount();
  const anchor = editor.anchor(range, {
    association: 'inward',
    deletion: 'drop',
  });
  const annotations = createPliteAnnotationStore(
    editor,
    () => {
      if (annotationFails) throw new Error('annotation failed');

      return [{ anchor, id: 'comment' }];
    },
    {
      id: 'flaky-annotations',
      onError: (error) => failures.push(error),
    }
  );
  const widgets = createPliteWidgetStore(
    editor,
    () => {
      if (widgetFails) throw new Error('widget failed');

      return [{ id: 'toolbar', target: { type: 'selection' } }];
    },
    null,
    {
      id: 'flaky-widgets',
      onError: (error) => failures.push(error),
    }
  );

  expect(decorations.getNodeSnapshot(nodeKey)).toHaveLength(1);
  expect(annotations.getSnapshot().allIds).toEqual([]);
  expect(widgets.getSnapshot().allIds).toEqual([]);
  expect(failures.map(({ phase, sourceId }) => ({ phase, sourceId }))).toEqual([
    { phase: 'read', sourceId: 'flaky-decoration' },
    { phase: 'read', sourceId: 'flaky-annotations' },
    { phase: 'read', sourceId: 'flaky-widgets' },
  ]);

  decorationFails = false;
  annotationFails = false;
  widgetFails = false;
  refreshDecoration();
  annotations.retry();
  widgets.retry();

  expect(decorations.getNodeSnapshot(nodeKey)).toHaveLength(2);
  expect(decorations.getMetrics().failureCount).toBe(1);
  expect(annotations.getAnnotation('comment')?.range).toEqual(range);
  expect(widgets.getWidget('toolbar')?.available).toBe(true);

  unmountDecorations();
  decorations.destroy();
  annotations.destroy();
  widgets.destroy();
  anchor.release();
});

test('destroying a failed manager does not poison a same-id remount', () => {
  const editor = createViewEditor();
  const failed = createPliteDecorationManager(
    editor,
    [
      {
        id: 'remountable',
        read: () => {
          throw new Error('failed mount');
        },
      },
    ],
    { onError: () => {} }
  );

  failed.destroy();
  const remounted = createPliteDecorationManager(editor, [
    {
      id: 'remountable',
      read: ({ entry: [, path] }) =>
        path.length === 2 ? [{ attributes: {}, key: 'ready', range }] : [],
    },
  ]);
  const nodeKey = getNodeKey(editor, [0, 0])!;

  expect(remounted.getMetrics().failureCount).toBe(0);
  expect(remounted.getNodeSnapshot(nodeKey)).toHaveLength(1);
  remounted.destroy();
});

test('a throwing error sink cannot escape the optional source boundary', () => {
  const editor = createViewEditor();
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  let manager!: ReturnType<typeof createPliteDecorationManager>;

  expect(() => {
    manager = createPliteDecorationManager(
      editor,
      [
        {
          id: 'throwing-error-sink',
          read: () => {
            throw new Error('source failed');
          },
        },
      ],
      {
        onError: () => {
          throw new Error('sink failed');
        },
      }
    );
  }).not.toThrow();
  expect(manager.getMetrics().failureCount).toBe(1);
  expect(consoleError).toHaveBeenCalledTimes(1);

  manager.destroy();
  consoleError.mockRestore();
});
