import { createEditor, type Range } from '@platejs/plite';
import { getNodeKey, replace } from '@platejs/plite/internal';

import { createPliteAnnotationStore } from '../src/annotation-store';
import { createDecorationSource } from '../src/decoration-source';
import type { PliteViewSourceError } from '../src/view-source';
import { createPliteWidgetStore } from '../src/widget-store';

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

test('optional view sources isolate failures and retry from the last good snapshot', () => {
  const editor = createViewEditor();
  const failures: PliteViewSourceError[] = [];
  let decorationFails = true;
  let annotationFails = true;
  let widgetFails = true;
  const nodeKey = getNodeKey(editor, [0, 0])!;
  const healthy = createDecorationSource(editor, {
    id: 'healthy',
    read: () => [{ key: 'healthy', range }],
  });
  const decoration = createDecorationSource(editor, {
    id: 'flaky-decoration',
    onError: (error) => failures.push(error),
    read: () => {
      if (decorationFails) throw new Error('decoration failed');

      return [{ key: 'flaky', range }];
    },
  });
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

      return [{ anchor: { type: 'selection' }, id: 'toolbar' }];
    },
    null,
    {
      id: 'flaky-widgets',
      onError: (error) => failures.push(error),
    }
  );

  expect(healthy.getRuntimeSnapshot(nodeKey)).toHaveLength(1);
  expect(decoration.getRuntimeSnapshot(nodeKey)).toHaveLength(0);
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
  decoration.retry();
  annotations.retry();
  widgets.retry();

  expect(decoration.getSourceStatus()).toEqual({
    active: true,
    failureCount: 1,
  });
  expect(decoration.getRuntimeSnapshot(nodeKey)).toHaveLength(1);
  expect(annotations.getAnnotation('comment')?.range).toEqual(range);
  expect(widgets.getWidget('toolbar')?.visible).toBe(true);

  healthy.destroy();
  decoration.destroy();
  annotations.destroy();
  widgets.destroy();
  anchor.release();
});

test('destroying a failed view source does not poison a same-id remount', () => {
  const editor = createViewEditor();
  const failed = createDecorationSource(editor, {
    id: 'remountable',
    onError: () => {},
    read: () => {
      throw new Error('failed mount');
    },
  });

  failed.destroy();

  const remounted = createDecorationSource(editor, {
    id: 'remountable',
    read: () => [{ key: 'ready', range }],
  });
  const nodeKey = getNodeKey(editor, [0, 0])!;

  expect(remounted.getSourceStatus()).toEqual({
    active: true,
    failureCount: 0,
  });
  expect(remounted.getRuntimeSnapshot(nodeKey)).toHaveLength(1);

  remounted.destroy();
});

test('a throwing error sink cannot escape the optional source boundary', () => {
  const editor = createViewEditor();
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
  let source!: ReturnType<typeof createDecorationSource>;

  expect(() => {
    source = createDecorationSource(editor, {
      id: 'throwing-error-sink',
      onError: () => {
        throw new Error('sink failed');
      },
      read: () => {
        throw new Error('source failed');
      },
    });
  }).not.toThrow();
  expect(source.getSourceStatus()).toEqual({
    active: false,
    failureCount: 1,
  });
  expect(consoleError).toHaveBeenCalledTimes(1);

  source.destroy();
  consoleError.mockRestore();
});
