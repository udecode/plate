'use client';

import {
  defineEditorSchema,
  property,
  schema,
  type SchemaElementFor,
} from 'plitejs';
import { history } from 'plitejs/history';
import {
  EditorContent,
  EditorRoot,
  type RenderElementProps,
  useCreateEditor,
  useEditorFocused,
  useElementSelected,
} from 'plitejs/react';

const ChipSchema = defineEditorSchema('inlineVoidDragSchema', {
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

const Chip = ({
  attributes,
  children,
  element,
}: RenderElementProps<Extract<ChipValueElement, { type: 'chip' }>>) => {
  const focused = useEditorFocused();
  const selected = useElementSelected();
  const isSelected = selected && focused;

  return (
    <span
      {...attributes}
      className={`mx-0.5 inline-block cursor-grab rounded-full bg-secondary px-2 py-0.5 text-sm${isSelected ? ' ring-2 ring-ring' : ''}`}
      contentEditable={false}
      data-chip={element.label}
      data-selected={isSelected ? 'true' : undefined}
      draggable
    >
      {element.label}
      {children}
    </span>
  );
};

const renderElement = (props: RenderElementProps<ChipValueElement>) =>
  props.element.type === 'chip' ? (
    <Chip {...props} element={props.element} />
  ) : (
    <p {...props.attributes}>{props.children}</p>
  );

const InlineVoidDragExample = () => {
  const editor = useCreateEditor({
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
      <EditorContent
        aria-label="Inline void drag editor"
        className="rounded border p-3 outline-none"
        renderElement={renderElement}
      />
    </EditorRoot>
  );
};

export default InlineVoidDragExample;
