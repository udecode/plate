import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import {
  createTSlatePlugin,
  type InsertNodesOptions,
  KEYS,
  type NodeEntry,
  type PluginConfig,
  type TElement,
} from 'platejs';

import { BaseFootnoteInputPlugin } from './BaseFootnoteInputPlugin';
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
import {
  invalidateFootnoteRegistry,
  shouldInvalidateFootnoteRegistry,
} from './registry';
import { createFootnoteDefinition } from './transforms/createFootnoteDefinition';
import { focusFootnoteDefinition } from './transforms/focusFootnoteDefinition';
import { focusFootnoteReference } from './transforms/focusFootnoteReference';
import { insertFootnote } from './transforms/insertFootnote';
import { normalizeDuplicateFootnoteDefinition } from './transforms/normalizeDuplicateFootnoteDefinition';

export type FootnoteConfig = PluginConfig<
  'footnoteReference',
  TriggerComboboxPluginOptions,
  {
    footnote: {
      definition: (options: {
        identifier: string;
      }) => NodeEntry<TElement> | undefined;
      definitions: (options: { identifier: string }) => NodeEntry<TElement>[];
      definitionText: (options: { identifier: string }) => string | undefined;
      duplicateDefinitions: (options: {
        identifier: string;
      }) => NodeEntry<TElement>[];
      duplicateIdentifiers: () => string[];
      hasDuplicateDefinitions: (options: { identifier: string }) => boolean;
      identifiers: () => string[];
      isDuplicateDefinition: (options: { path: number[] }) => boolean;
      isResolved: (options: { identifier: string }) => boolean;
      nextId: () => string;
      references: (options: { identifier: string }) => NodeEntry<TElement>[];
    };
  },
  {
    insert: {
      footnote: (
        options?: InsertNodesOptions & {
          focusDefinition?: boolean;
          identifier?: string;
        }
      ) => void;
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
  }
>;

/** Enables support for inline footnote references. */
export const BaseFootnoteReferencePlugin = createTSlatePlugin<FootnoteConfig>({
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
  .overrideEditor(({ editor, getOptions, tf: { apply, insertText }, type }) => {
    const comboboxEditor = withTriggerCombobox({
      editor,
      getOptions,
      tf: { insertText },
      type,
    } as any);

    return {
      transforms: {
        apply(operation) {
          if (shouldInvalidateFootnoteRegistry(editor, operation)) {
            invalidateFootnoteRegistry(editor);
          }

          apply(operation);
        },
        insertText:
          comboboxEditor.transforms?.insertText ??
          ((text: string, options: any) => insertText(text, options)),
      },
    };
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
  .extendEditorTransforms<FootnoteConfig['transforms']>(({ editor }) => ({
    footnote: {
      createDefinition: (options) => createFootnoteDefinition(editor, options),
      focusDefinition: (options) => focusFootnoteDefinition(editor, options),
      focusReference: (options) => focusFootnoteReference(editor, options),
      normalizeDuplicateDefinition: (options) =>
        normalizeDuplicateFootnoteDefinition(editor, options),
    },
    insert: {
      footnote: (options) => insertFootnote(editor, options),
    },
  }));
