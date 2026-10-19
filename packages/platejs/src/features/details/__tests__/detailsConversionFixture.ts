import {
  BaseParagraphPlugin,
  createEditor,
  definePlugin,
  type EditorUpdateTransaction,
  schema,
} from '../../../core';
import { BaseCodeBlockPlugin } from '../../code-block/lib/BaseCodeBlockPlugin';
import { BaseListPlugin } from '../../list/lib/BaseListPlugin';
import { BaseDetailsPlugin } from '../lib/BaseDetailsPlugin';

export const section = (
  title: string,
  body: Array<Record<string, unknown>> = [
    { type: 'paragraph', children: [{ text: `${title} body` }] },
  ],
  props: Record<string, unknown> = {}
) => ({
  ...props,
  type: 'details',
  children: [{ type: 'summary', children: [{ text: title }] }, ...body],
});

export const holder = (
  name: string,
  { max, types = ['details', 'paragraph'] }: { max?: number; types?: string[] }
) =>
  definePlugin(name, {
    dependencies: [BaseParagraphPlugin, BaseDetailsPlugin],
    schema: {
      element: {
        blockContent: true,
        content: schema.content.any(
          types.map((type) => schema.content.type(type).allowed),
          { default: { type: 'paragraph' }, min: 1, ...(max ? { max } : {}) }
        ),
      },
    },
  });

export const NoteHolder = definePlugin('listNoteHolder', {
  dependencies: [BaseParagraphPlugin, BaseDetailsPlugin],
  schema: ({ plugins }) => ({
    element: {
      blockContent: true,
      contentRoots: {
        body: {
          content: schema.content.any([plugins.blockContent().allowed], {
            default: { type: 'paragraph' },
            min: 1,
          }),
          ownership: 'exclusive',
        },
      },
      void: 'block',
    },
  }),
});

// A Details in the named document `note`, beside a main document of one
// paragraph that holds the caret.
export const noteEditor = () =>
  createEditor({
    plugins: [
      BaseDetailsPlugin,
      NoteHolder,
      BaseCodeBlockPlugin,
      BaseListPlugin.configure({
        targetPlugins: [BaseParagraphPlugin, BaseDetailsPlugin],
      }),
    ],
    initialValue: {
      children: [
        { type: 'paragraph', children: [{ text: 'Main' }] },
        {
          type: 'listNoteHolder',
          childRoots: { body: 'note' },
          children: [{ text: '' }],
        },
      ],
      roots: {
        note: [
          section('Title', [
            { type: 'paragraph', children: [{ text: 'Body' }] },
          ]),
        ],
      },
    },
    selection: {
      kind: 'text',
      anchor: { path: [0, 0], offset: 0 },
      focus: { path: [0, 0], offset: 0 },
    },
  });

export const added = { type: 'paragraph', children: [{ text: 'Added' }] };

// Converts inside an update that first writes an unrelated block, so a refusal
// must leave exactly that write.
export const convertAfterWrite = (
  editor: ReturnType<typeof createEditor>,
  convert: (tx: EditorUpdateTransaction) => boolean | undefined
) => {
  let result: boolean | undefined;

  editor.update((tx) => {
    tx.nodes.insert(added, { at: [editor.read.children().length] });
    result = convert(tx);
  });

  return result;
};
