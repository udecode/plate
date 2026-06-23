import type { TriggerComboboxPluginOptions } from '@platejs/combobox';
import {
  type Descendant,
  type EditorUpdateTransaction,
  type Element,
  ElementApi,
  type Point,
  TextApi,
} from '@platejs/plite';
import {
  createEditorPlugin,
  KEYS,
  type NodeEntry,
  type PluginConfig,
  type EditorPlugin,
  type BasePlateEditor,
} from 'platejs';

import { BaseFootnoteInputPlugin } from './BaseFootnoteInputPlugin';
import type { FootnoteElement } from './types';
import { getFootnoteDefinition } from './queries/getFootnoteDefinition';
import {
  getDuplicateFootnoteDefinitions,
  getDuplicateFootnoteIdentifiers,
  getFootnoteDefinitionsByIdentifier,
  getFootnoteIdentifiers,
  hasDuplicateFootnoteDefinitions,
  isDuplicateFootnoteDefinition,
  isFootnoteResolved,
} from './queries/getFootnoteDefinition';
import { getFootnoteDefinitionText } from './queries/getFootnoteDefinitionText';
import { getNextFootnoteIdentifier } from './queries/getNextFootnoteIdentifier';
import { getFootnoteReferences } from './queries/getFootnoteReferences';
import { invalidateFootnoteRegistry } from './registry';

const getDefinitionChildren = (
  editor: BasePlateEditor,
  fragment?: Descendant[]
): Element[] => {
  const paragraphType = editor.getType(KEYS.p);
  const clonedFragment = fragment ? structuredClone(fragment) : [];

  return clonedFragment.length > 0
    ? clonedFragment.map((child) =>
        ElementApi.isElement(child) && child.type === paragraphType
          ? child
          : {
              children: [child],
              type: paragraphType,
            }
      )
    : [{ children: [{ text: '' }], type: paragraphType }];
};

export type FootnoteInsertOptions = NonNullable<
  Parameters<EditorUpdateTransaction['nodes']['insert']>[1]
> & {
  focusDefinition?: boolean;
  identifier?: string;
};

type FootnoteTx = {
  insert: {
    footnote: (options?: FootnoteInsertOptions) => void;
  };
  footnote: {
    createDefinition: (options: {
      focus?: boolean;
      identifier: string;
    }) => number[];
    focusDefinition: (options: { identifier: string }) => boolean;
    focusReference: (options: {
      identifier: string;
      index?: number;
    }) => boolean;
    normalizeDuplicateDefinition: (options: {
      identifier?: string;
      path: number[];
    }) => false | string;
  };
};

const getFootnoteReferenceSelectionPoint = (
  editor: BasePlateEditor,
  path: number[]
) => {
  const parentEntry = editor.api.parent(path);

  let point: Point | undefined;

  if (parentEntry) {
    const [parent, parentPath] = parentEntry;
    const childIndex = path.at(-1) ?? -1;
    const nextSibling = parent.children[childIndex + 1];
    const previousSibling = parent.children[childIndex - 1];

    if (TextApi.isText(nextSibling)) {
      point = {
        offset: 0,
        path: parentPath.concat([childIndex + 1]),
      };
    } else if (TextApi.isText(previousSibling)) {
      point = {
        offset: previousSibling.text.length,
        path: parentPath.concat([childIndex - 1]),
      };
    }
  }

  point ??= editor.api.start(path.concat([0]));

  return point;
};

export type FootnoteConfig = PluginConfig<
  'footnoteReference',
  TriggerComboboxPluginOptions,
  {
    footnote: {
      definition: (options: {
        identifier: string;
      }) => NodeEntry<FootnoteElement> | undefined;
      definitions: (options: {
        identifier: string;
      }) => NodeEntry<FootnoteElement>[];
      definitionText: (options: { identifier: string }) => string | undefined;
      duplicateDefinitions: (options: {
        identifier: string;
      }) => NodeEntry<FootnoteElement>[];
      duplicateIdentifiers: () => string[];
      hasDuplicateDefinitions: (options: { identifier: string }) => boolean;
      identifiers: () => string[];
      isDuplicateDefinition: (options: { path: number[] }) => boolean;
      isResolved: (options: { identifier: string }) => boolean;
      nextId: () => string;
      references: (options: {
        identifier: string;
      }) => NodeEntry<FootnoteElement>[];
    };
  },
  {},
  {},
  FootnoteTx
>;

/** Enables support for inline footnote references. */
const BaseFootnoteReferencePluginBase: EditorPlugin<FootnoteConfig> =
  createEditorPlugin<FootnoteConfig>({
    key: KEYS.footnoteReference,
    options: {
      createComboboxInput: () => ({
        children: [{ text: '' }],
        type: KEYS.footnoteInput,
      }),
      trigger: '^',
      triggerPreviousCharPattern: /^\[$/,
    },
    node: {
      isElement: true,
      isInline: true,
      isVoid: true,
    },
    plugins: [BaseFootnoteInputPlugin],
    render: { as: 'sup' },
  })
    .extendEditorApi<FootnoteConfig['api']>(({ editor }) => ({
      footnote: {
        definition(options: { identifier: string }) {
          return getFootnoteDefinition(editor, options);
        },
        definitions(options: { identifier: string }) {
          return getFootnoteDefinitionsByIdentifier(editor, options);
        },
        definitionText(options: { identifier: string }) {
          return getFootnoteDefinitionText(editor, options);
        },
        duplicateDefinitions(options: { identifier: string }) {
          return getDuplicateFootnoteDefinitions(editor, options);
        },
        duplicateIdentifiers() {
          return getDuplicateFootnoteIdentifiers(editor);
        },
        identifiers() {
          return getFootnoteIdentifiers(editor);
        },
        hasDuplicateDefinitions(options: { identifier: string }) {
          return hasDuplicateFootnoteDefinitions(editor, options);
        },
        isDuplicateDefinition(options: { path: number[] }) {
          return isDuplicateFootnoteDefinition(editor, options);
        },
        isResolved(options: { identifier: string }) {
          return isFootnoteResolved(editor, options);
        },
        nextId() {
          return getNextFootnoteIdentifier(editor);
        },
        references(options: { identifier: string }) {
          return getFootnoteReferences(editor, options);
        },
      },
    }))
    .extendTxGroup(
      'footnote',
      ({ editor }) =>
        (tx: EditorUpdateTransaction) => ({
          createDefinition: ({
            focus: shouldFocusDefinition = true,
            identifier,
          }: {
            focus?: boolean;
            identifier: string;
          }) => {
            const existingDefinition = getFootnoteDefinition(editor, {
              identifier,
            });

            if (existingDefinition) {
              if (shouldFocusDefinition) {
                const point = editor.api.start(
                  existingDefinition[1].concat([0, 0])
                );

                if (point) {
                  tx.selection.set({ anchor: point, focus: point });
                }
              }

              return existingDefinition[1];
            }

            const definitionPath = [editor.children.length];

            tx.nodes.insert<FootnoteElement>(
              {
                children: getDefinitionChildren(editor),
                identifier,
                type: editor.getType(KEYS.footnoteDefinition),
              },
              { at: definitionPath }
            );
            invalidateFootnoteRegistry(editor);

            if (shouldFocusDefinition) {
              const point = { offset: 0, path: definitionPath.concat([0, 0]) };

              tx.selection.set({ anchor: point, focus: point });
            }

            return definitionPath;
          },
          focusDefinition: ({ identifier }: { identifier: string }) => {
            const definition = getFootnoteDefinition(editor, { identifier });

            if (!definition) return false;

            const point = editor.api.start(definition[1].concat([0, 0]));

            if (!point) return false;

            tx.selection.set({ anchor: point, focus: point });

            return true;
          },
          focusReference: ({
            identifier,
            index = 0,
          }: {
            identifier: string;
            index?: number;
          }) => {
            const reference = getFootnoteReferences(editor, { identifier })[
              index
            ];

            if (!reference) return false;

            const point = getFootnoteReferenceSelectionPoint(
              editor,
              reference[1]
            );

            if (!point) return false;

            tx.selection.set({ anchor: point, focus: point });

            return true;
          },
          normalizeDuplicateDefinition: ({
            identifier,
            path,
          }: {
            identifier?: string;
            path: number[];
          }) => {
            const entry = editor.api.node<FootnoteElement>(path);

            if (!entry) return false;

            const [node] = entry;
            const definitionType = editor.getType(KEYS.footnoteDefinition);

            if (node.type !== definitionType) return false;
            if (!isDuplicateFootnoteDefinition(editor, { path })) return false;

            const nextIdentifier =
              identifier ?? getNextFootnoteIdentifier(editor);

            if (!nextIdentifier) return false;
            if (
              nextIdentifier !== node.identifier &&
              getFootnoteDefinitionsByIdentifier(editor, {
                identifier: nextIdentifier,
              }).length > 0
            ) {
              return false;
            }

            tx.nodes.set<FootnoteElement>(
              { identifier: nextIdentifier },
              { at: path }
            );
            invalidateFootnoteRegistry(editor);

            return nextIdentifier;
          },
        })
    )
    .extendTxGroup('insert', ({ editor }) => (tx, _editor, context) => ({
      footnote: ({
        focusDefinition: shouldFocusDefinition = true,
        identifier,
        ...options
      }: FootnoteInsertOptions = {}) => {
        if (!editor.selection) return;

        const selectionBefore = structuredClone(editor.selection);
        const nextIdentifier = identifier ?? getNextFootnoteIdentifier(editor);
        const fragment = editor.api.isExpanded()
          ? (editor.api.fragment(editor.selection) as Descendant[])
          : undefined;
        const referenceType = editor.getType(KEYS.footnoteReference);
        const existingDefinition = getFootnoteDefinition(editor, {
          identifier: nextIdentifier,
        });
        const definitionPath = existingDefinition?.[1] ?? [
          editor.children.length,
        ];
        const selectAfterCommit = (target: {
          anchor: { offset: number; path: number[] };
          focus: { offset: number; path: number[] };
        }) => {
          try {
            context.afterCommit(() => {
              editor.update((tx) => {
                tx.selection.set(target);
              });
            });
          } catch {
            tx.selection.set(target);
          }
        };

        tx.nodes.insert(
          {
            children: [{ text: '' }],
            identifier: nextIdentifier,
            type: referenceType,
          },
          options as Parameters<typeof tx.nodes.insert>[1]
        );

        if (!existingDefinition) {
          tx.nodes.insert(
            {
              children: getDefinitionChildren(editor, fragment),
              identifier: nextIdentifier,
              type: editor.getType(KEYS.footnoteDefinition),
            },
            { at: definitionPath }
          );
        }
        invalidateFootnoteRegistry(editor);

        if (shouldFocusDefinition) {
          const point = { offset: 0, path: definitionPath.concat([0, 0]) };

          selectAfterCommit({
            anchor: point,
            focus: point,
          });

          return;
        }

        const childIndex = selectionBefore?.anchor.path.at(-1);

        if (childIndex === undefined) return;

        const point = {
          offset: 0,
          path: selectionBefore.anchor.path
            .slice(0, -1)
            .concat([childIndex + 2]),
        };

        selectAfterCommit({
          anchor: point,
          focus: point,
        });
      },
    }));

export const BaseFootnoteReferencePlugin: EditorPlugin<FootnoteConfig> & {
  runtimeFootnote: boolean;
  runtimeTriggerCombobox: boolean;
} = Object.assign(BaseFootnoteReferencePluginBase, {
  runtimeFootnote: true,
  runtimeTriggerCombobox: true,
});
