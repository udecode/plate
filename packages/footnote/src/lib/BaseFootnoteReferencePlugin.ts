import {
  type TriggerComboboxPluginOptions,
  withTriggerCombobox,
} from '@platejs/combobox';
import {
  type PlatePluginTxGroup,
  type InferConfig,
  type PluginConfig,
  createBasePlugin,
} from '@platejs/core';
import {
  property,
  type NodeEntry,
  type NodeInsertNodesOptions,
  type Path,
} from '@platejs/plite';
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

type FootnoteContract = PluginConfig<
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

const defaultOptions: TriggerComboboxPluginOptions = {
  createComboboxInput: () => ({
    children: [{ text: '' }],
    type: KEYS.footnoteInput,
  }),
  trigger: '^',
  triggerPreviousCharPattern: /^\[$/,
};
/** Enables support for inline footnote references. */
export const BaseFootnoteReferencePlugin = createBasePlugin({
  key: KEYS.footnoteReference,
  dependencies: [BaseFootnoteInputPlugin],
  options: defaultOptions,
  schema: {
    element: {
      properties: { identifier: property.string() },
      void: 'inline',
    },
  },

  render: { as: 'sup' },
  extension: (context) => ({
    ...withTriggerCombobox(context),
    api: {
      footnote: {
        definition: (options) => getFootnoteDefinition(context.editor, options),
        definitions: (options) =>
          getFootnoteDefinitionsByIdentifier(context.editor, options),
        definitionText: (options) =>
          getFootnoteDefinitionText(context.editor, options),
        duplicateDefinitions: (options) =>
          getDuplicateFootnoteDefinitions(context.editor, options),
        duplicateIdentifiers: () =>
          getDuplicateFootnoteIdentifiers(context.editor),
        hasDuplicateDefinitions: (options) =>
          hasDuplicateFootnoteDefinitions(context.editor, options),
        identifiers: () => getFootnoteIdentifiers(context.editor),
        isDuplicateDefinition: (options) =>
          isDuplicateFootnoteDefinition(context.editor, options),
        isResolved: (options) => isFootnoteResolved(context.editor, options),
        nextId: () => getNextFootnoteIdentifier(context.editor),
        references: (options) => getFootnoteReferences(context.editor, options),
      },
    } satisfies FootnoteContract['api'],
    onTransactionChange({ after, before, changed }) {
      if (
        shouldInvalidateFootnoteRegistry(context.editor, before, after, changed)
      ) {
        invalidateFootnoteRegistry(context.editor);
      }
    },
    tx: {
      footnote: (tx) => ({
        createDefinition: (options) =>
          createFootnoteDefinition(context.editor, tx, options),
        focusDefinition: (options) =>
          focusFootnoteDefinition(context.editor, tx, options),
        focusReference: (options) =>
          focusFootnoteReference(context.editor, tx, options),
        normalizeDuplicateDefinition: (options) =>
          normalizeDuplicateFootnoteDefinition(context.editor, tx, options),
      }),
      insert: (tx) => ({
        footnote: (options = {}) =>
          insertFootnote(context.editor, tx, context.type, options),
      }),
    } satisfies {
      footnote: PlatePluginTxGroup<FootnoteContract['tx']['footnote']>;
      insert: PlatePluginTxGroup<FootnoteContract['tx']['insert']>;
    },
  }),
});

export type FootnoteConfig = InferConfig<typeof BaseFootnoteReferencePlugin>;
