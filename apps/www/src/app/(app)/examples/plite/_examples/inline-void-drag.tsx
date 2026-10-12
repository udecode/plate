'use client';

import {
  defineEditorSchema,
  property,
  schema,
  type SchemaElementFor,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  EditorRoot,
  type RenderElementProps,
  useEditor,
} from 'plitejs/react';

const ChipSchema = defineEditorSchema('schema:inline-void-drag', {
  elements: {
    chip: { properties: { label: property.string() }, void: 'inline' },
    paragraph: {
      content: schema.content.any(
        [schema.content.text(), schema.content.type('chip')],
        { default: 'text', min: 1 }
      ),
    },
  },
  root: schema.content.type('paragraph', {
    default: { type: 'paragraph' },
    min: 1,
  }),
  unknown: 'reject',
});

type ChipValueElement = SchemaElementFor<typeof ChipSchema>;

const renderElement = ({
  attributes,
  children,
  element,
}: RenderElementProps<ChipValueElement>) =>
  element.type === 'chip' ? (
    <span
      {...attributes}
      className="mx-0.5 cursor-grab rounded-full bg-secondary px-2 py-0.5 text-sm"
      contentEditable={false}
      data-chip={element.label}
      draggable
    >
      {element.label}
      {children}
    </span>
  ) : (
    <p {...attributes}>{children}</p>
  );

const InlineVoidDragExample = () => {
  const editor = useEditor({
    initialValue: [
      {
        children: [
          { text: 'One ' },
          { children: [{ text: '' }], label: 'Alpha', type: 'chip' },
          { text: ' two ' },
          { children: [{ text: '' }], label: 'Beta', type: 'chip' },
          { text: '' },
          { children: [{ text: '' }], label: 'Gamma', type: 'chip' },
          { text: ' three' },
        ],
        type: 'paragraph',
      },
    ],
    plugins: [history(), ChipSchema],
  });

  return (
    <EditorRoot editor={editor}>
      <Editable
        aria-label="Inline void drag editor"
        className="rounded border p-3 outline-none"
        renderElement={renderElement}
      />
    </EditorRoot>
  );
};

export default InlineVoidDragExample;
