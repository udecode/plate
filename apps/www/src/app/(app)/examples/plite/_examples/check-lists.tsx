import type { ChangeEvent } from 'react';
import {
  defineEditorExtension,
  NodeApi,
  PointApi,
  RangeApi,
  type Element as PliteElement,
} from '@platejs/plite';
import {
  Editable,
  type RenderElementProps,
  Plite,
  useEditor,
  useEditorReadOnly,
  usePliteEditor,
} from '@platejs/plite-react';

import { cn } from '@/utils/cn';

import type {
  CheckListItemElement as CheckListItemType,
  CustomEditor,
  ParagraphElement as ParagraphElementType,
} from './custom-types.d';

const CheckListsExample = () => {
  const editor = usePliteEditor({
    extensions: [checklist()],
    initialValue: [
      {
        type: 'paragraph',
        children: [
          {
            text: 'With Plite you can build complex block types that have their own embedded content and behaviors, like rendering checkboxes inside check list items!',
          },
        ],
      },
      {
        type: 'check-list-item',
        checked: true,
        children: [{ text: 'Slide to the left.' }],
      },
      {
        type: 'check-list-item',
        checked: true,
        children: [{ text: 'Slide to the right.' }],
      },
      {
        type: 'check-list-item',
        checked: false,
        children: [{ text: 'Criss-cross.' }],
      },
      {
        type: 'check-list-item',
        checked: true,
        children: [{ text: 'Criss-cross!' }],
      },
      {
        type: 'check-list-item',
        checked: false,
        children: [{ text: 'Cha cha real smooth…' }],
      },
      {
        type: 'check-list-item',
        checked: false,
        children: [{ text: "Let's go to work!" }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Try it out for yourself!' }],
      },
    ],
  });

  return (
    <Plite editor={editor}>
      <Editable
        autoFocus
        placeholder="Get to work…"
        renderElement={renderElement}
        spellCheck
      />
    </Plite>
  );
};

const checklist = () =>
  defineEditorExtension<CustomEditor>()({
    name: 'checklists',
    transforms: {
      deleteBackward({ next, tx }) {
        const selection = tx.selection.get();

        if (selection && RangeApi.isCollapsed(selection)) {
          const match = tx.nodes.find({
            match: (n) => NodeApi.isElement(n) && n.type === 'check-list-item',
          });

          if (match) {
            const [, path] = match;
            const start = tx.points.start(path);

            if (PointApi.equals(selection.anchor, start)) {
              tx.nodes.set(
                { type: 'paragraph' } satisfies Partial<PliteElement>,
                {
                  match: (n) =>
                    NodeApi.isElement(n) && n.type === 'check-list-item',
                }
              );
              tx.selection.set(start);
              return true;
            }
          }
        }

        return next();
      },
    },
  });

const renderElement = (
  props: RenderElementProps<CheckListItemType | ParagraphElementType>
) => {
  switch (props.element.type) {
    case 'check-list-item':
      return (
        <CheckListItemElement
          {...(props as RenderElementProps<CheckListItemType>)}
        />
      );
    case 'paragraph':
      return (
        <ParagraphElement
          {...(props as RenderElementProps<ParagraphElementType>)}
        />
      );
  }
};

const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps<ParagraphElementType>) => (
  <p {...attributes}>{children}</p>
);

const CheckListItemElement = ({
  attributes,
  children,
  element,
}: RenderElementProps<CheckListItemType>) => {
  const { checked } = element;
  const editor = useEditor<CustomEditor>();
  const readOnly = useEditorReadOnly();
  return (
    <div {...attributes} className="plite-check-lists-item">
      <span className="plite-check-lists-checkbox" contentEditable={false}>
        <input
          checked={checked}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            const path = editor.api.dom.resolvePath(element);

            if (!path) {
              return;
            }

            editor.update((tx) => {
              tx.nodes.set({ checked: event.target.checked }, { at: path });
            });
          }}
          type="checkbox"
        />
      </span>
      <span
        className={cn('plite-check-lists-content', checked && 'is-checked')}
        contentEditable={!readOnly}
        suppressContentEditableWarning
      >
        {children}
      </span>
    </div>
  );
};

export default CheckListsExample;
