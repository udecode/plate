import { editorCommands, schema } from '../core';
import { createEditor } from '../lib/editor';
import { definePlugin } from '../lib/plugin';
import { ElementIdPlugin } from '../lib/plugins/element-id/ElementIdPlugin';
import { authoredTestApi } from './__tests__/authoredTestApi';
import { AuthoredPlugin, projectAuthoredDocument } from './index';

const LinkPlugin = definePlugin('elementIdLink', {
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      inline: true,
    },
  },
});

describe('ElementIdPlugin under Suggesting', () => {
  type Node = Readonly<{
    authored?: unknown;
    children?: readonly Node[];
    id?: string;
    text?: string;
    type?: string;
  }>;
  type Point = Readonly<{ offset: number; path: number[] }>;

  const QuotePlugin = definePlugin('elementIdQuote', {
    schema: {
      element: { content: schema.content.type('paragraph', { min: 1 }) },
    },
  });
  const line = (text: string): Node => ({
    children: [{ text }],
    id: 'p1',
    type: 'paragraph',
  });
  const linked = (): Node => ({
    children: [
      { text: '' },
      { children: [{ text: 'ab' }], id: 'l1', type: 'elementIdLink' },
      { text: 'cd' },
    ],
    id: 'p1',
    type: 'paragraph',
  });
  const sites: Record<string, Readonly<{ at: Point; value: Node[] }>> = {
    'a line’s end': { at: { offset: 4, path: [0, 0] }, value: [line('abcd')] },
    'a line’s middle': {
      at: { offset: 2, path: [0, 0] },
      value: [line('abcd')],
    },
    'a line’s start': {
      at: { offset: 0, path: [0, 0] },
      value: [line('abcd')],
    },
    'a link': { at: { offset: 1, path: [0, 1, 0] }, value: [linked()] },
    'a quote line': {
      at: { offset: 2, path: [0, 0, 0] },
      value: [{ children: [line('abcd')], id: 'q1', type: 'elementIdQuote' }],
    },
    'the text after a link': {
      at: { offset: 1, path: [0, 2] },
      value: [linked()],
    },
  };

  let calls = 0;
  const editorOf = (value: unknown) =>
    createEditor({
      initialValue: structuredClone(value) as never,
      plugins: [
        LinkPlugin,
        QuotePlugin,
        ElementIdPlugin.configure({
          initialState: { generateId: () => `g${(calls += 1)}` },
        }),
        AuthoredPlugin,
      ],
      userId: 'carol',
    });
  const enter = (editor: ReturnType<typeof editorOf>, at: Point) =>
    editor.update((tx) => {
      tx.selection.set({ anchor: at, focus: at });
      tx.command(editorCommands.insertBreak);
    });
  const unmarked = (nodes: unknown): Node[] =>
    JSON.parse(
      JSON.stringify(nodes, (key, field) =>
        key === 'authored' ? undefined : field
      )
    );
  const idsOf = (nodes: readonly Node[]): string[] =>
    nodes.flatMap(({ children = [], id }) => [
      ...(id === undefined ? [] : [id]),
      ...idsOf(children),
    ]);
  const freshIdsNumbered = (
    nodes: readonly Node[],
    kept: ReadonlySet<string>
  ) => {
    const fresh = new Map<string, string>();
    const frame = ({ children, id, ...rest }: Node): Node => {
      if (id !== undefined && !kept.has(id) && !fresh.has(id)) {
        fresh.set(id, `new ${fresh.size + 1}`);
      }

      return {
        ...rest,
        ...(id === undefined ? {} : { id: fresh.get(id) ?? id }),
        ...(children ? { children: children.map(frame) } : {}),
      };
    };

    return nodes.map(frame);
  };

  for (const [site, { at, value }] of Object.entries(sites)) {
    it(`records a suggested Enter in ${site} as Editing's split with fresh ids, which previews, projections and decisions show without generating more`, () => {
      const editing = editorOf(value);

      enter(editing, at);

      const carol = editorOf(value);

      authoredTestApi(carol).setIntent('propose');
      enter(carol, at);

      const stored = carol.read.value();
      const changes = carol.read.authored.changes().items.map(({ id }) => id);
      const [reader, accepter, rejecter] = [1, 2, 3].map(() =>
        editorOf(stored)
      );
      const before = calls;
      const projections = [1, 2].map(() =>
        projectAuthoredDocument(reader.read.value(), {
          editor: reader,
          projection: 'proposed',
        })
      );

      reader.api.authored.setView({ preview: 'proposed' });

      const previews = [1, 2].map(() => unmarked(reader.read.children()));
      const decided = (decider: typeof reader, action: 'accept' | 'reject') => {
        authoredTestApi(decider).decide({ action, changes });

        return unmarked(decider.read.children());
      };
      const accepted = decided(accepter, 'accept');
      const rejected = decided(rejecter, 'reject');
      const generated = calls - before;
      const [proposed] = projections;
      const shown = proposed.ok
        ? (proposed.document.children as readonly Node[])
        : [];
      const ids = idsOf(stored.children);
      const kept = new Set(idsOf(value));

      expect({
        accepted,
        frame: freshIdsNumbered(shown, kept),
        generated,
        previews,
        projections,
        rejected,
        unique: new Set(ids).size === ids.length,
      }).toEqual({
        accepted: shown,
        frame: freshIdsNumbered(
          editing.read.children() as readonly Node[],
          kept
        ),
        generated: 0,
        previews: [shown, shown],
        projections: [proposed, proposed],
        rejected: value,
        unique: true,
      });
    });
  }
});
