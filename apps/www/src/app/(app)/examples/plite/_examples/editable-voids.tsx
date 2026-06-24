import type { PointerEvent } from 'react';
import { defineEditorExtension } from '@platejs/plite';
import {
  Editable,
  type RenderElementProps,
  type RenderLeafProps,
  type RenderVoidProps,
  Plite,
  useEditor,
  usePliteChildRoot,
  usePliteEditor,
  usePliteRootChrome,
} from '@platejs/plite-react';

import { Button, Icon, Toolbar } from './components';
import type {
  BlockQuoteElement,
  CustomEditor,
  CustomElement,
  CustomText,
  CustomValue,
  EditableVoidElement,
  ParagraphElement as ParagraphElementType,
} from './custom-types.d';

let editableVoidId = 0;

const paragraph = (text: string): ParagraphElementType => ({
  type: 'paragraph',
  children: [{ text }],
});

const nextEditableVoidRoot = () => {
  editableVoidId += 1;

  return `editable-void:${editableVoidId}:body`;
};

const createEditableVoid = (bodyRoot: string): EditableVoidElement => ({
  type: 'editable-void',
  childRoots: { body: bodyRoot },
  children: [{ text: '' }],
});

const createEditableVoidBody = (): CustomValue => [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, much better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  paragraph(
    "Since it's rich text, it can live in a same-runtime child root instead of a nested independent editor."
  ),
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
];

const createEmptyEditableVoidBody = (): CustomValue => [paragraph('')];

const EditableVoidsExample = () => {
  const editor = usePliteEditor({
    extensions: [editableVoid()],
    initialValue: {
      children: [
        {
          type: 'paragraph',
          children: [
            {
              text: 'In addition to nodes that contain editable text, you can insert void nodes, which can also contain editable elements, inputs, or rich same-runtime child roots.',
            },
          ],
        },
        createEditableVoid('editable-void:initial:body'),
        {
          type: 'paragraph',
          children: [
            {
              text: 'The editable void above stores its body in an extra root.',
            },
          ],
        },
      ],
      roots: {
        'editable-void:initial:body': createEditableVoidBody(),
      },
    },
  });

  return (
    <Plite editor={editor}>
      <Toolbar>
        <InsertEditableVoidButton />
      </Toolbar>

      <Editable
        placeholder="Enter some text..."
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        renderVoid={renderVoid}
      />
    </Plite>
  );
};

const editableVoid = () =>
  defineEditorExtension({
    name: 'editable-voids',
    elements: [
      {
        type: 'editable-void',
        contentRoot: { slot: 'body' },
        void: 'editable-island',
      },
    ],
  });

const renderElement = (props: RenderElementProps<CustomElement>) => {
  switch (props.element.type) {
    case 'block-quote':
      return (
        <BlockQuote {...(props as RenderElementProps<BlockQuoteElement>)} />
      );
    case 'paragraph':
      return (
        <ParagraphElement
          {...(props as RenderElementProps<ParagraphElementType>)}
        />
      );
    default:
      return <p {...props.attributes}>{props.children}</p>;
  }
};

const renderVoid = (props: RenderVoidProps<CustomElement>) => {
  switch (props.element.type) {
    case 'editable-void':
      return <EditableVoid element={props.element} />;
    default:
      return null;
  }
};

const renderLeaf = (props: RenderLeafProps<CustomText>) => <Leaf {...props} />;

const Leaf = ({ attributes, children, leaf }: RenderLeafProps<CustomText>) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
  }

  return <span {...attributes}>{children}</span>;
};

const BlockQuote = ({
  attributes,
  children,
}: RenderElementProps<BlockQuoteElement>) => (
  <blockquote {...attributes}>{children}</blockquote>
);

const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElementType>) => (
  <p {...attributes}>{children}</p>
);

const unsetWidthStyle = 'plite-editable-voids-unset-width-style';

const EditableVoid = ({ element }: { element: EditableVoidElement }) => {
  const bodyRoot = usePliteChildRoot(element, 'body');
  const chrome = usePliteRootChrome(bodyRoot);

  return (
    <div className="plite-editable-voids-card">
      <div contentEditable={false}>
        <h4>Name:</h4>
        <input className="plite-editable-voids-input" type="text" />
        <h4>Left or right handed:</h4>
        <input
          className={unsetWidthStyle}
          name="handedness"
          type="radio"
          value="left"
        />{' '}
        Left
        <br />
        <input
          className={unsetWidthStyle}
          name="handedness"
          type="radio"
          value="right"
        />{' '}
        Right
        <h4>Tell us about yourself:</h4>
      </div>
      <div {...chrome.props}>
        <Editable
          aria-label="Editable void rich content"
          className="plite-editable-voids-child-editor"
          placeholder="Tell us about yourself..."
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          root={bodyRoot}
        />
      </div>
    </div>
  );
};

const InsertEditableVoidButton = () => {
  const editor = useEditor<CustomEditor>();
  return (
    <Button
      onClick={() => {
        const bodyRoot = nextEditableVoidRoot();

        editor.update((tx) => {
          tx.roots.create(bodyRoot, createEmptyEditableVoidBody());
          tx.nodes.insert(createEditableVoid(bodyRoot));
        });
      }}
      onPointerDown={(event: PointerEvent<HTMLButtonElement>) => {
        event.preventDefault();
      }}
    >
      <Icon>add</Icon>
    </Button>
  );
};

export default EditableVoidsExample;
