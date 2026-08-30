import { parseAsStringLiteral, useQueryState } from 'nuqs';
import {
  defineExtension,
  editorCommands,
  NodeApi,
  PointApi,
  RangeApi,
  type Element as PliteElement,
} from 'plitejs';
import {
  Editable,
  type RenderElementProps,
  Plite,
  useEditorContext,
  useEditorReadOnly,
  useEditor,
} from 'plitejs/react';
import type { ChangeEvent } from 'react';

import { cn } from '@/utils/cn';

import type {
  CheckListItemElement as CheckListItemType,
  ParagraphElement as ParagraphElementType,
} from './custom-types.d';
import { replaceQueryOptions } from './query-controls';

const checklistExampleCases = ['default', 'leading-item'] as const;

type ChecklistExampleCase = (typeof checklistExampleCases)[number];

const createInitialValue = (
  exampleCase: ChecklistExampleCase
): Array<CheckListItemType | ParagraphElementType> => {
  if (exampleCase === 'leading-item') {
    return [
      {
        type: 'check-list-item',
        checked: false,
        children: [{ text: 'Start here.' }],
      },
      {
        type: 'check-list-item',
        checked: true,
        children: [{ text: 'Keep going.' }],
      },
      {
        type: 'paragraph',
        children: [{ text: 'Finish here.' }],
      },
    ];
  }

  return [
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
  ];
};

const CheckListsExample = () => {
  const [exampleCase] = useQueryState(
    'case',
    parseAsStringLiteral(checklistExampleCases)
      .withDefault('default')
      .withOptions(replaceQueryOptions)
  );

  return <CheckListsEditor exampleCase={exampleCase} key={exampleCase} />;
};

const CheckListsEditor = ({
  exampleCase,
}: {
  exampleCase: ChecklistExampleCase;
}) => {
  const editor = useEditor({
    extensions: [checklist()],
    initialValue: createInitialValue(exampleCase),
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
  defineExtension('checklists', {
    commands: ({ handle }) => [
      handle(editorCommands.delete, ({ input, state }) => {
        if (input.direction !== 'backward') return false;

        const selection = state.selection();

        if (selection && RangeApi.isCollapsed(selection)) {
          const match = state.nodes.find({
            match: (n) => NodeApi.isElement(n) && n.type === 'check-list-item',
          });

          if (match) {
            const [, path] = match;
            const start = state.points.start(path);

            if (start && PointApi.equals(selection.anchor, start)) {
              return state.transaction((tx) => {
                tx.nodes.set(
                  { type: 'paragraph' } satisfies Partial<PliteElement>,
                  {
                    match: (n) =>
                      NodeApi.isElement(n) && n.type === 'check-list-item',
                  }
                );
                tx.selection.set(start);
              });
            }
          }
        }

        return false;
      }),
    ],
  });

const renderElement = (
  props: RenderElementProps<CheckListItemType | ParagraphElementType>
) => {
  switch (props.element.type) {
    case 'check-list-item': {
      return (
        <CheckListItemElement
          {...(props as RenderElementProps<CheckListItemType>)}
        />
      );
    }
    case 'paragraph': {
      return (
        <ParagraphElement
          {...(props as RenderElementProps<ParagraphElementType>)}
        />
      );
    }
  }

  return undefined;
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
  const editor = useEditorContext();
  const readOnly = useEditorReadOnly();
  return (
    <div {...attributes} className="plite-check-lists-item">
      <span className="plite-check-lists-checkbox" contentEditable={false}>
        <input
          checked={checked}
          onChange={(event: ChangeEvent<HTMLInputElement>) => {
            editor.update.nodes.set(
              { checked: event.target.checked },
              { at: element }
            );
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
