'use client';

import type { Value } from 'platejs';
import {
  EditorContent,
  EditorRoot,
  useCreateEditor,
  useEditor,
  useEditorSelector,
} from 'platejs/react';
import { VirtualizedEditorContent } from 'platejs/react/virtualized';
import * as React from 'react';

import { BasicBlocksKit } from '@/registry/components/editor/basic-blocks';
import { ListKit } from '@/registry/components/editor/list';

type ListPerfHarness = {
  insertTop: () => Promise<{
    effectsMs: number;
    effectsToFrameMs: number;
    frameMs: number;
  }>;
  removeTop: () => Promise<void>;
  resolveEveryKeyMs: () => number;
  walkMs: (resolve: boolean) => number;
  starts: (indexes: number[]) => Array<number | null>;
  mountedLists: () => number;
};

declare global {
  interface Window {
    __listPerf?: ListPerfHarness;
  }
}

const block = (index: number, listed: boolean) => ({
  children: [{ text: `Item ${index}` }],
  type: 'paragraph',
  ...(listed ? { indent: 1, listId: 'perf', listType: 'numbered' } : {}),
});

const nextFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
  });

// Layout effects run in tree order, so the gap between these two marks spans
// the commit's layout effects inside the editor content, the list writer's
// included.
const marks = { end: 0, start: 0 };

function CommitStart() {
  const children = useEditorSelector((editor) => editor.read.children());

  React.useLayoutEffect(() => {
    marks.start = performance.now();
  }, [children]);

  return null;
}

function CommitEnd() {
  const children = useEditorSelector((editor) => editor.read.children());

  React.useLayoutEffect(() => {
    marks.end = performance.now();
  }, [children]);

  return null;
}

function Harness({ listed }: { listed: boolean }) {
  const editor = useEditor();

  React.useEffect(() => {
    window.__listPerf = {
      insertTop: async () => {
        const started = performance.now();

        editor.update.nodes.insert(block(-1, listed), { at: [0] });
        await nextFrame();

        const now = performance.now();

        return {
          effectsMs: marks.end - marks.start,
          effectsToFrameMs: now - marks.start,
          frameMs: now - started,
        };
      },
      mountedLists: () =>
        document.querySelectorAll('[data-list-perf] ol').length,
      removeTop: async () => {
        editor.update.nodes.remove({ at: [0] });
        await nextFrame();
      },
      walkMs: (resolve) => {
        const started = performance.now();
        let found = 0;

        for (const list of document.querySelectorAll('[data-list-perf] ol')) {
          const host = list.closest<HTMLElement>('[data-editor-node-key]');

          if (host?.querySelector('ol') !== list) continue;
          if (resolve) {
            const node = editor.api.dom.resolveNode(host);
            const path = node ? editor.read.nodes.path(node as never) : null;

            if (path && editor.key(path)) found += 1;
          } else if (host.dataset.editorNodeKey) {
            found += 1;
          }
        }

        return found > 0 ? performance.now() - started : -1;
      },
      resolveEveryKeyMs: () => {
        const keys = editor.read
          .children()
          .map((_node, index) => editor.key([index]));
        const started = performance.now();

        for (const key of keys) {
          if (key) editor.api.dom.resolveDOMNode(key);
        }

        return performance.now() - started;
      },
      starts: (indexes) =>
        indexes.map((index) => {
          const key = editor.key([index]);
          const list = key
            ? document
                .querySelector(`[data-editor-node-key="${CSS.escape(key)}"]`)
                ?.querySelector('ol')
            : null;

          return list ? list.start : null;
        }),
    };

    return () => {
      window.__listPerf = undefined;
    };
  }, [editor, listed]);

  return null;
}

function ListPerf({ params }: { params: URLSearchParams }) {
  const listed = params.get('arm') !== 'plain';
  const virtual = params.get('virtual') === '1';
  const extraViews = Array.from(
    { length: Number(params.get('views') ?? 1) - 1 },
    (_view, index) => `view-${index + 2}`
  );
  const count = Number(params.get('items') ?? 10_000);
  const [initialValue] = React.useState(
    () =>
      Array.from({ length: count }, (_slot, index) =>
        block(index, listed)
      ) as Value
  );
  const editor = useCreateEditor({
    initialValue,
    plugins: listed ? [...BasicBlocksKit, ...ListKit] : BasicBlocksKit,
  });

  return (
    <EditorRoot editor={editor}>
      <Harness listed={listed} />
      <div className="h-[600px] overflow-auto" data-list-perf>
        <CommitStart />
        {virtual ? <VirtualizedEditorContent /> : <EditorContent />}
        <CommitEnd />
      </div>
      {extraViews.map((view) => (
        <div className="h-[300px] overflow-auto" data-list-view key={view}>
          <EditorContent />
        </div>
      ))}
    </EditorRoot>
  );
}

const noSubscription = () => () => {};

export default function ListPerfPage() {
  const search = React.useSyncExternalStore(
    noSubscription,
    () => window.location.search,
    () => null
  );

  return search === null ? null : (
    <ListPerf params={new URLSearchParams(search)} />
  );
}
