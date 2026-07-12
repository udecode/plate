import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import {
  type PlatePluginTxGroup,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import type { NodeEntry, NodeInsertNodesOptions, Path } from '@platejs/plite';
import { KEYS } from '@platejs/utils';

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
import type { TFootnoteElement } from './types';

export type FootnoteConfig = PluginConfig<
  'footnoteReference',
  TriggerComboboxPluginOptions,
  {
    footnote: {
      definition: (options: {
        identifier: string;
      }) => NodeEntry<TFootnoteElement> | undefined;
      definitions: (options: {
        identifier: string;
      }) => NodeEntry<TFootnoteElement>[];
      definitionText: (options: { identifier: string }) => string | undefined;
      duplicateDefinitions: (options: {
        identifier: string;
      }) => NodeEntry<TFootnoteElement>[];
      duplicateIdentifiers: () => string[];
      hasDuplicateDefinitions: (options: { identifier: string }) => boolean;
      identifiers: () => string[];
      isDuplicateDefinition: (options: { path: Path }) => boolean;
      isResolved: (options: { identifier: string }) => boolean;
      nextId: () => string;
      references: (options: {
        identifier: string;
      }) => NodeEntry<TFootnoteElement>[];
    };
  },
  {
    insert: {
      footnote: (
        options?: NodeInsertNodesOptions<TFootnoteElement> & {
          focusDefinition?: boolean;
          identifier?: string;
        }
      ) => void;
    };
    footnote: {
      createDefinition: (options: {
        focus?: boolean;
        identifier: string;
      }) => Path;
      focusDefinition: (options: { identifier: string }) => boolean;
      focusReference: (options: {
        identifier: string;
        index?: number;
      }) => boolean;
      normalizeDuplicateDefinition: (options: {
        identifier?: string;
        path: Path;
      }) => false | string;
    };
  }
>;

/** Enables support for inline footnote references. */
export const BaseFootnoteReferencePlugin = createBasePlugin<FootnoteConfig>({
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
  .extendExtension(withTriggerCombobox)
  .extendExtension(({ editor }) => ({
    operations: {
      apply({ next, operation }) {
        if (shouldInvalidateFootnoteRegistry(editor, operation)) {
          invalidateFootnoteRegistry(editor);
        }

        next(operation);
      },
    },
  }))
  .extendEditorApi<FootnoteConfig['api']>(({ editor }) => ({
    footnote: {
      definition(options) {
        return getFootnoteDefinition(editor, options);
      },
      definitions(options) {
        return getFootnoteDefinitionsByIdentifier(editor, options);
      },
      definitionText(options) {
        return getFootnoteDefinitionText(editor, options);
      },
      duplicateDefinitions(options) {
        return getDuplicateFootnoteDefinitions(editor, options);
      },
      duplicateIdentifiers() {
        return getDuplicateFootnoteIdentifiers(editor);
      },
      identifiers() {
        return getFootnoteIdentifiers(editor);
      },
      hasDuplicateDefinitions(options) {
        return hasDuplicateFootnoteDefinitions(editor, options);
      },
      isDuplicateDefinition(options) {
        return isDuplicateFootnoteDefinition(editor, options);
      },
      isResolved(options) {
        return isFootnoteResolved(editor, options);
      },
      nextId() {
        return getNextFootnoteIdentifier(editor);
      },
      references(options) {
        return getFootnoteReferences(editor, options);
      },
    },
  }))
  .extendTxGroup<
    'footnote',
    PlatePluginTxGroup<FootnoteConfig['tx']['footnote']>
  >('footnote', ({ editor }) => (tx) => ({
    createDefinition: (options) =>
      createFootnoteDefinition(editor, tx, options),
    focusDefinition: (options) => focusFootnoteDefinition(editor, tx, options),
    focusReference: (options) => focusFootnoteReference(editor, tx, options),
    normalizeDuplicateDefinition: (options) =>
      normalizeDuplicateFootnoteDefinition(editor, tx, options),
  }))
  .extendTxGroup<'insert', PlatePluginTxGroup<FootnoteConfig['tx']['insert']>>(
    'insert',
    ({ editor, type }) =>
      (tx) => ({
        footnote: (options) => insertFootnote(editor, tx, type, options),
      })
  );
