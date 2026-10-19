'use client';

import { defineEditorSchema, property, schema } from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  EditorRoot,
  type RenderElementProps,
  type RenderLeafProps,
  useEditor,
  useEditorContext,
} from 'plitejs/react';

import type { CustomElement, ParagraphElement } from './custom-types.d';

const c = schema.content;

const ContentCompletion = defineEditorSchema(
  'schema:content-completion-proof',
  {
    elements: {
      'block-quote': { content: c.any([c.text(), c.type('paragraph')]) },
      paragraph: { content: c.text() },
      title: { content: c.text() },
    },
    id: 'content-completion-proof',
    properties: [schema.textProperty('bold', property.boolean())],
    root: c.prefix(
      [{ element: 'title' }],
      c.any([c.type('title'), c.type('paragraph'), c.type('block-quote')], {
        default: { type: 'paragraph' },
        min: 1,
      })
    ),
    unknown: 'reject',
    version: 1,
  }
);

const paragraph = (text: string, bold?: boolean): ParagraphElement => ({
  children: [bold ? { bold, text } : { text }],
  type: 'paragraph',
});

const initialValue: CustomElement[] = [
  { children: [{ text: 'Title' }], type: 'title' },
  paragraph('Remove my text node'),
  {
    children: [{ text: 'Lead' }, paragraph('Block'), { text: 'Tail' }],
    type: 'block-quote',
  },
  paragraph('bold', true),
  paragraph('bold', true),
  paragraph('Other line'),
];

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps<CustomElement>) => {
  if (element.type === 'title') return <h1 {...attributes}>{children}</h1>;
  if (element.type === 'block-quote') {
    return (
      <section {...attributes} className="border-l-2 pl-3">
        {children}
      </section>
    );
  }

  return <p {...attributes}>{children}</p>;
};

const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => (
  <span {...attributes}>
    {leaf.bold ? <strong>{children}</strong> : children}
  </span>
);

const Commands = () => {
  const editor = useEditorContext();
  const command = (label: string, run: () => void) => (
    <button
      className="rounded border px-3 py-1"
      onClick={run}
      onMouseDown={(event) => event.preventDefault()}
      type="button"
    >
      {label}
    </button>
  );

  return (
    <div className="flex flex-wrap gap-2" contentEditable={false}>
      {command('Remove the text node of line 2', () => {
        editor.update((tx) => {
          tx.nodes.remove({ at: [1, 0] });
        });
      })}
      {command('Insert a heading above the title', () => {
        editor.update((tx) => {
          tx.nodes.insert(
            { children: [{ text: 'New' }], type: 'title' },
            { at: [0] }
          );
        });
      })}
    </div>
  );
};

const ContentCompletionExample = () => {
  const editor = useEditor({
    initialValue,
    plugins: [ContentCompletion, history()],
  });

  return (
    <EditorRoot editor={editor}>
      <div className="flex flex-col gap-4" id="content-completion-surface">
        <Commands />
        <Editable
          aria-label="Content completion editor"
          id="content-completion"
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </div>
    </EditorRoot>
  );
};

export default ContentCompletionExample;
