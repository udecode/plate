import { defineEditorSchema, NodeApi, schema } from 'plitejs';
import { history } from 'plitejs/history';
import {
  Editable,
  type RenderElementProps,
  EditorRoot,
  useEditor,
  useEditorComposing,
  useElementSelected,
  useNodeSelector,
} from 'plitejs/react';

import type {
  CustomElement,
  ParagraphElement,
  TitleElement,
} from './custom-types.d';

const ForcedLayoutSchema = defineEditorSchema('schema:forced-layout-example', {
  elements: {
    paragraph: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
    title: {
      content: schema.content.text({ default: 'text', min: 1 }),
    },
  },
  root: schema.content.prefix(
    [{ element: 'title' }, { element: 'paragraph' }],
    schema.content.group('block')
  ),
  unknown: 'reject',
});

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'title': {
      return <Title {...(props as RenderElementProps<TitleElement>)} />;
    }
    case 'paragraph': {
      return <Paragraph {...(props as RenderElementProps<ParagraphElement>)} />;
    }
    default: {
      return null;
    }
  }
};

const ForcedLayoutExample = () => {
  const editor = useEditor({
    plugins: [history(), ForcedLayoutSchema],
    initialValue: [
      {
        type: 'title',
        children: [{ text: 'Enforce Your Layout!' }],
      },
      {
        type: 'paragraph',
        children: [
          {
            text: 'This example shows how to enforce your layout with domain-specific constraints. This document will always have a title block at the top and at least one paragraph in the body. Try deleting them and see what happens!',
          },
        ],
      },
    ],
  });
  return (
    <EditorRoot editor={editor}>
      <Editable autoFocus renderElement={renderElement} spellCheck />
    </EditorRoot>
  );
};

const Title = ({ attributes, children }: RenderElementProps<TitleElement>) => {
  const composing = useEditorComposing();
  const selected = useElementSelected();
  const empty = useNodeSelector(
    ({ node }) => !!node && NodeApi.string(node) === ''
  );

  return (
    <h2
      {...attributes}
      className="relative before:pointer-events-none before:absolute before:text-muted-foreground data-[placeholder]:before:content-[attr(data-placeholder)]"
      data-placeholder={
        empty && !(composing && selected) ? 'Enter a title…' : undefined
      }
    >
      {children}
    </h2>
  );
};

const Paragraph = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElement>) => <p {...attributes}>{children}</p>;

export default ForcedLayoutExample;
