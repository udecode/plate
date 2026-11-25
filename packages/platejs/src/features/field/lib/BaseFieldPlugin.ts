import { nanoid } from 'nanoid';

import {
  definePlugin,
  type Descendant,
  documentReplacement,
  ElementApi,
  type ElementOf,
  locateAt,
  type Node,
  type NodeInsertOptions,
  property,
  schema,
  target,
  txLocate,
} from '../../../core';
import {
  claimsHistoryReplay,
  EditorRefusalError,
  type ElementPropertyWrite,
  getActiveEditorUpdateId,
  getActiveEditorUpdateTags,
  getEditorRuntimeOwner,
  getSnapshotVersion,
  readElementPropertyWrites,
  readRootEntries,
  readViewPage,
  registerEditorTransactionGuard,
} from '../../../facade';
import { failInvariant } from '../../../internal/failInvariant';
import {
  carryFieldNames,
  conditionProblem,
  dropFieldNames,
  FIELD_KINDS,
  fieldLinks,
  fieldProblems,
  fitsField,
  holdsFieldNames,
  indexFieldNames,
  isFieldCondition,
  isFieldKind,
  isFieldName,
  isFieldOptions,
  isFieldValue,
  nameProblems,
  sharedFieldLinks,
  sharedFieldNames,
  unfitSettings,
} from './fieldRules.internal';

export { FIELD_TESTS, fillsField, fitsField } from './fieldRules.internal';

/** What a field collects, which fixes the shape of its value. */
export type FieldKind = (typeof FIELD_KINDS)[number];

/** A value a field stores: a string, a finite number or a boolean. */
export type FieldValue = boolean | number | string;

/** One answer a `choice` field offers. A choice stores the `value`. */
export type FieldOption = Readonly<{ label: string; value: string }>;

/** How a condition judges the value of the field it names. */
export type FieldTest =
  | 'above'
  | 'below'
  | 'blank'
  | 'equals'
  | 'filled'
  | 'not-equals';

/**
 * When a field applies: the field whose `fieldId` is `ref` passes `test`.
 * Every test but `filled` and `blank` compares against `value`.
 */
export type FieldCondition = Readonly<{
  ref: string;
  test: FieldTest;
  value?: FieldValue;
}>;

/**
 * What a read finds wrong with a field. `missing-target`: no field holds the
 * id its condition names. `unsupported-test`: the target's kind does not take
 * the condition's test. `invalid-value`: its value, default or options do not
 * fit its kind, or its condition's value does not fit its test or the
 * target's kind. `condition-loop`: its condition names a field whose chain of
 * conditions leads back to it. `name-conflict`: the fields of its role that
 * share its `name` differ in kind, in their options' values, or in condition,
 * or their conditions match only through a name that has this problem or
 * leads back to theirs. `answer-conflict`: the fields of its role that share
 * its `name` hold different stored values, so an empty text and no value
 * differ.
 */
export type FieldProblem =
  | 'answer-conflict'
  | 'condition-loop'
  | 'invalid-value'
  | 'missing-target'
  | 'name-conflict'
  | 'unsupported-test';

const fieldText = ({
  node: { label, options, value },
}: Readonly<{
  node: Readonly<{
    label?: string;
    options?: readonly FieldOption[];
    value?: FieldValue;
  }>;
}>) => {
  const answer =
    options?.find((option) => option.value === value)?.label ??
    String(value ?? '');

  return answer || `[${label ?? ''}]`;
};

const FIELD_TYPE = 'field';

const initialState: {
  /**
   * The role this editor fills as, or null while authoring. While a role is
   * set, the editor refuses a local commit that writes anything besides
   * fitting or cleared answers on that role's fields, the selection, state
   * fields without `persist` and effects that neither persist nor sync to
   * peers. A peer's change always passes.
   */
  fillRole: string | null;
} = { fillRole: null };

const fieldSchemaPlugin = definePlugin(FIELD_TYPE, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      docx: {
        dropped:
          'Word keeps each field answer and drops its name and settings.',
        text: fieldText,
      },
      html: {
        decode: ({ element, preserve }) => {
          const kind = element.getAttribute('data-field-kind');
          const label = element.getAttribute('data-field-label');
          const role = element.getAttribute('data-field-role');

          if (!isFieldKind(kind) || label === null || role === null) {
            return undefined;
          }

          const fieldId = element.getAttribute('data-field-id');
          const name = element.getAttribute('data-field-name');
          const claimIfValid = <T>(
            attribute: string,
            is: (value: unknown) => value is T
          ) => {
            let value: unknown;

            try {
              value = JSON.parse(element.getAttribute(attribute) ?? '');
            } catch {
              return undefined;
            }
            if (!is(value)) return undefined;

            preserve(attribute);

            return value;
          };
          const condition = claimIfValid(
            'data-field-condition',
            isFieldCondition
          );
          const defaultValue = claimIfValid(
            'data-field-default-value',
            isFieldValue
          );
          const options = claimIfValid('data-field-options', isFieldOptions);
          const required = claimIfValid(
            'data-field-required',
            (value): value is boolean => typeof value === 'boolean'
          );
          const value = claimIfValid('data-field-value', isFieldValue);
          const named = isFieldName(name);

          if (named) preserve('data-field-name');
          preserve(
            'data-field-id',
            'data-field-kind',
            'data-field-label',
            'data-field-role'
          );

          return {
            children: [{ text: '' }],
            ...(condition === undefined ? {} : { condition }),
            ...(defaultValue === undefined ? {} : { defaultValue }),
            ...(fieldId === null ? {} : { fieldId }),
            kind,
            label,
            ...(named ? { name } : {}),
            ...(options === undefined ? {} : { options }),
            ...(required === undefined ? {} : { required }),
            role,
            ...(value === undefined ? {} : { value }),
          };
        },
        encode: ({ content, node, preserve }) => {
          const json = (value: unknown) =>
            value === undefined ? undefined : JSON.stringify(value);

          preserve(
            'condition',
            'defaultValue',
            'fieldId',
            'kind',
            'label',
            'name',
            'options',
            'required',
            'role',
            'value'
          );

          return {
            attributes: {
              'data-field-condition': json(node.condition),
              'data-field-default-value': json(node.defaultValue),
              'data-field-id': node.fieldId,
              'data-field-kind': node.kind,
              'data-field-label': node.label,
              'data-field-name': node.name,
              'data-field-options': json(node.options),
              'data-field-required': json(node.required),
              'data-field-role': node.role,
              'data-field-value': json(node.value),
            },
            children: [content, { text: fieldText({ node }) }],
            tag: 'span',
          };
        },
        match: [{ attributes: { 'data-field-kind': true }, tag: 'span' }],
      },
      markdown: {
        tag: type,
        decode: ({ readTagAttributes, refuse }) => {
          const { attributes, properties } = readTagAttributes();

          if (
            !(
              'kind' in properties &&
              'label' in properties &&
              'role' in properties
            )
          ) {
            return refuse('A field tag needs a kind, a label and a role.');
          }

          return {
            ...properties,
            ...(typeof attributes.fieldId === 'string'
              ? { fieldId: attributes.fieldId }
              : {}),
            children: [{ text: '' }],
            type,
          };
        },
        encode: ({ encodeAttributes, encodeNodeAttributes, node }) => ({
          attributes: [
            ...encodeNodeAttributes(),
            ...encodeAttributes({ fieldId: node.fieldId }),
          ],
          children: [],
          name: type,
          type: 'mdxJsxTextElement',
        }),
      },
      plainText: { encode: fieldText },
    }),
  initialState,
  schema: {
    element: {
      properties: {
        defaultValue: property.json({
          validate: isFieldValue,
          validationVersion: 1,
        }),
        kind: property.enum(FIELD_KINDS, { required: true }),
        label: property.string({ required: true }),
        name: property.string({ validate: isFieldName, validationVersion: 1 }),
        options: property.json({
          validate: isFieldOptions,
          validationVersion: 1,
        }),
        required: property.boolean(),
        role: property.string({ required: true }),
        value: property.json({ validate: isFieldValue, validationVersion: 1 }),
      },
      void: 'inline',
    },
    properties: {
      condition: schema.elementProperty(
        property.json({ validate: isFieldCondition, validationVersion: 1 }),
        {
          references: {
            key: 'fieldId',
            map: (condition, renamed) => ({
              ...condition,
              ref: renamed(condition.ref) ?? condition.ref,
            }),
          },
          target: target.types([FIELD_TYPE]),
          typeChange: 'preserve-if-allowed',
        }
      ),
      fieldId: schema.elementProperty(property.string({ generate: nanoid }), {
        landing: 'preserve',
        role: 'metadata',
        target: target.types([FIELD_TYPE]),
        typeChange: 'preserve-if-allowed',
        unique: true,
      }),
    },
  },
});

/** A field: an inline void that collects one value of its `kind`. */
export type FieldElement = ElementOf<typeof fieldSchemaPlugin>;

/** What `insert` takes: a field's kind, role and label, with its settings. */
export type FieldSettings = Omit<FieldElement, 'children' | 'fieldId' | 'type'>;

/**
 * What `update` changes. An optional setting given as `undefined` is removed.
 */
export type FieldPatch = Partial<FieldSettings>;

/**
 * A field as the plugin reads it, with what the read finds wrong with it.
 * `applies` says whether the field applies under its condition, as the field's
 * own role sees the answers the document holds. It is `null` while that
 * depends on an answer another role has not given yet, and `true` for a field
 * with no condition or with a condition that has a problem or is in a loop. A
 * condition whose target does not apply tests it as having no answer, an
 * answer that does not fit its field's kind counts as none, and an unanswered
 * checkbox of the field's own role reads as `false` while it applies.
 */
export type FieldRead = Readonly<{
  applies: boolean | null;
  fieldId: string;
  node: FieldElement;
  problems: readonly FieldProblem[];
}>;

/** One role's field values, keyed by `fieldId`. */
export type FieldSubmission = Readonly<{
  role: string;
  values: Readonly<Record<string, FieldValue>>;
}>;

const refusal = (reason: string) =>
  new TypeError(`Field write refused: ${reason}.`);

const UNKNOWN_FILL_MODE = Symbol('unknown fill mode');

/**
 * Fields: inline voids that each collect one value of a kind and hold a
 * document-wide unique `fieldId`. A field's `condition` names another field
 * by that id, so a paste that copies both names the copy.
 */
export const BaseFieldPlugin = fieldSchemaPlugin.extend(
  ({ editor, schema: { properties, type }, store }) => {
    const isField = (node: Node): node is FieldElement =>
      ElementApi.isElement(node) && node.type === type;
    const writesOnlyFieldValues = (
      writes: readonly ElementPropertyWrite[] | null
    ) =>
      writes !== null &&
      writes.every(
        ({ element, modifications }) =>
          isField(element) && modifications.every(({ key }) => key === 'value')
      );
    let topStep: {
      mode: string | null | typeof UNKNOWN_FILL_MODE;
      version: number;
    } = { mode: null, version: -1 };
    let openWrite: {
      mode: string | null;
      switched: boolean;
      updateId: ReturnType<typeof getActiveEditorUpdateId>;
    } | null = null;
    const openWriteOfThisUpdate = () =>
      openWrite?.updateId === getActiveEditorUpdateId(editor)
        ? openWrite
        : null;

    return {
      activate({ onCleanup }) {
        topStep = {
          mode: store.get('fillRole') ?? null,
          version: getSnapshotVersion(editor),
        };
        onCleanup(
          registerEditorTransactionGuard(
            editor,
            ({ before, commit, effects }) => {
              const role = store.get('fillRole') ?? null;
              const write = openWriteOfThisUpdate();
              const refuse = (message: string) =>
                new EditorRefusalError({ reason: 'field-fill', role }, message);
              const { tags } = commit;
              const collaboration = tags.includes('collaboration');
              const switched =
                write !== null && (write.switched || write.mode !== role);

              if (switched && !collaboration) {
                throw refuse(
                  `The fill role changed from ${JSON.stringify(write.mode)} to ${JSON.stringify(role)} inside one update.`
                );
              }

              const replaces =
                commit.annotations[documentReplacement.key] === true;
              const changesTopStep =
                tags.includes('historic') ||
                replaces ||
                (!tags.includes('history-skip') &&
                  (!commit.changes.empty ||
                    commit.effects.some(
                      ({ type: effect }) => effect.history !== 'skip'
                    )));
              const publish = changesTopStep
                ? () => {
                    if (commit.version <= topStep.version) return;

                    const mode =
                      write === null ||
                      switched ||
                      tags.includes('historic') ||
                      replaces
                        ? UNKNOWN_FILL_MODE
                        : tags.includes('history-push') ||
                            write.mode === topStep.mode
                          ? write.mode
                          : UNKNOWN_FILL_MODE;

                    topStep = { mode, version: commit.version };
                  }
                : undefined;
              const from = getSnapshotVersion(editor);
              const writesOnlyValues = holdsFieldNames(editor)
                ? writesOnlyFieldValues(
                    readElementPropertyWrites(editor, { before, commit })
                  )
                : undefined;
              const settle =
                writesOnlyValues === undefined
                  ? publish
                  : () => {
                      publish?.();
                      if (writesOnlyValues) {
                        carryFieldNames(editor, from, commit.version);
                      } else {
                        dropFieldNames(editor, from);
                      }
                    };

              if (role === null || collaboration) return settle;
              if (replaces) {
                throw refuse(
                  `A fill as ${JSON.stringify(role)} cannot replace the document.`
                );
              }

              const writes =
                claimsHistoryReplay(commit) ||
                effects.some(
                  ({ type: effect }) =>
                    effect.collab === 'shared' || effect.persist
                )
                  ? null
                  : readElementPropertyWrites(editor, { before, commit });

              if (
                writes?.every(
                  ({ element, modifications }) =>
                    isField(element) &&
                    element.role === role &&
                    modifications.every(
                      (modification) =>
                        modification.key === 'value' &&
                        (modification.type === 'unset' ||
                          (modification.type === 'set' &&
                            fitsField(element, modification.value)))
                    )
                )
              ) {
                return settle;
              }

              throw refuse(
                `A fill as ${JSON.stringify(role)} changes only the values of that role's fields.`
              );
            }
          )
        );
      },
      corrections: [
        {
          event: 'properties',
          query: { type },
          correct: ({ tx }) => {
            const mode = store.get('fillRole') ?? null;
            const write = openWriteOfThisUpdate();

            if (write) {
              write.switched ||= write.mode !== mode;
            } else {
              openWrite = {
                mode,
                switched: false,
                updateId: getActiveEditorUpdateId(editor),
              };
            }
            if (
              mode !== topStep.mode &&
              !getActiveEditorUpdateTags(editor).some((tag) =>
                [
                  'collaboration',
                  'historic',
                  'history-merge',
                  'history-skip',
                ].includes(tag)
              )
            ) {
              tx.tags.add('history-push');
            }
          },
        },
      ],
      read: ({ editor: reader, state }) => {
        const held = (fieldId: string) => {
          const holder = state.unique.holder('fieldId', fieldId);
          const node = holder && state.nodes.get(holder.key)?.[0];

          return node && isField(node) ? node : undefined;
        };
        const fieldsIn = (nodes: readonly Descendant[]): FieldElement[] =>
          nodes.flatMap((node) => {
            if (isField(node)) return [node];

            return ElementApi.isElement(node) ? fieldsIn(node.children) : [];
          });
        const roots = () =>
          getActiveEditorUpdateId(reader)
            ? readRootEntries(reader)
            : reader.read.roots();
        const page = () => readViewPage(state) ?? state.children();
        const drafted = () => {
          if (!getActiveEditorUpdateId(reader)) return false;

          const committed = getEditorRuntimeOwner(reader).read;
          const drafts = roots();

          return (
            page() !== committed.children() ||
            drafts.length !== committed.roots().length ||
            drafts.some(({ root }) => state.root(root) !== committed.root(root))
          );
        };
        const names = (nodes: () => readonly FieldElement[]) =>
          drafted()
            ? indexFieldNames(nodes())
            : sharedFieldNames(reader, nodes);
        const listed = () => {
          const nodes = [
            page(),
            ...roots().map(({ root }) => state.root(root)),
          ].flatMap(fieldsIn);
          const byId = new Map<string, FieldElement>();
          const repeated = new Set<string>();

          for (const node of nodes) {
            if (typeof node.fieldId !== 'string') continue;
            if (byId.has(node.fieldId)) repeated.add(node.fieldId);
            else byId.set(node.fieldId, node);
          }

          const lookup = (id: string) =>
            repeated.has(id) ? held(id) : byId.get(id);

          return { lookup, nodes };
        };

        return {
          /**
           * The field whose `fieldId` is `fieldId`, in any root, or null when
           * no field holds it. Looks up the field, then one field for each
           * condition it follows along the chain.
           */
          field: (fieldId: string): FieldRead | null => {
            const node = held(fieldId);

            if (!node) return null;

            const link = sharedFieldLinks(reader).link(node, held);

            return {
              applies: link.applies,
              fieldId,
              node,
              problems: [
                ...fieldProblems(node, link),
                ...(node.name === undefined
                  ? []
                  : nameProblems(
                      node,
                      names(() => listed().nodes),
                      held
                    )),
              ],
            };
          },
          /** Every field of the document, in reading order. */
          fields: (): FieldRead[] => {
            const { lookup, nodes } = listed();
            const links = fieldLinks();
            const index = nodes.some(({ name }) => name !== undefined)
              ? names(() => nodes)
              : undefined;

            return nodes.map((node) => {
              const link =
                lookup(node.fieldId) === node
                  ? links.link(node, lookup)
                  : links.linkCopy(node, lookup);

              return {
                applies: link.applies,
                fieldId: node.fieldId,
                node,
                problems: [
                  ...fieldProblems(node, link),
                  ...(index ? nameProblems(node, index, lookup) : []),
                ],
              };
            });
          },
          /**
           * The `value` of each field of `role` that holds one, keyed by
           * `fieldId` and read from the field that id names, to pass to
           * `applyFieldValues`.
           */
          submission: (role: string): FieldSubmission => {
            const { lookup, nodes } = listed();
            const values: Record<string, FieldValue> = Object.create(null);

            for (const node of nodes) {
              if (
                node.role === role &&
                isFieldValue(node.value) &&
                lookup(node.fieldId) === node
              ) {
                values[node.fieldId] = node.value;
              }
            }

            return { role, values };
          },
        };
      },
      update: ({ tx }) => {
        const held = (fieldId: string) => {
          const holder = tx.unique.holder('fieldId', fieldId);
          const node = holder && tx.nodes.get(holder.key)?.[0];

          return node && isField(node) ? ([node, holder.key] as const) : [];
        };
        const checkCondition = (
          condition: FieldCondition,
          self?: FieldElement
        ) => {
          const problem = conditionProblem(
            condition,
            condition.ref === self?.fieldId ? self : held(condition.ref)[0]
          );

          if (problem) throw refusal(`its condition has ${problem}`);
        };

        return {
          /**
           * Insert a field and return its new `fieldId`. Throws when a value,
           * default or options do not fit `kind`, or the condition names no
           * field, or a test or value the named field's kind does not take,
           * or the settings name a `fieldId`, or a `name` that is empty, has
           * whitespace at either end, or holds a control character, a line or
           * paragraph separator or a lone surrogate.
           */
          insert: txLocate(
            locateAt(1),
            (settings: FieldSettings, options: NodeInsertOptions = {}) => {
              if ('fieldId' in settings) {
                throw refusal('fieldId is not a setting');
              }

              const [unfit] = unfitSettings(settings);

              if (unfit) {
                throw refusal(`${unfit} does not fit a ${settings.kind} field`);
              }
              if (settings.condition) checkCondition(settings.condition);

              const field = tx.schema.create(type, settings);

              tx.nodes.insert(field, options);

              return (
                tx.schema.getProperty(field, properties.fieldId) ??
                failInvariant('A created field holds no fieldId.')
              );
            }
          ),
          /**
           * Change the settings or value of the field whose `fieldId` is
           * `fieldId`. A new kind or new options drop each value, default or
           * options the patch leaves out and the field no longer fits. Throws,
           * and changes nothing, when no field holds `fieldId`, a setting the
           * patch names does not fit the field's kind, the patch removes `kind`,
           * `role` or `label`, names `fieldId` or gives a `name` that `insert`
           * refuses, or its condition names no field, a test or value the
           * named field's kind does not take, or a
           * field it did not name before whose chain of conditions leads back
           * to this one. While a fill role is set, a missing field or a
           * setting that does not fit refuses the whole update instead, which
           * then returns `undefined`.
           */
          update: txLocate(false, (fieldId: string, patch: FieldPatch) => {
            if ('fieldId' in patch) throw refusal('fieldId is not a setting');

            const role = store.get('fillRole');
            const refusalForRole = (reason: string) =>
              role == null
                ? refusal(reason)
                : new EditorRefusalError(
                    { reason: 'field-fill', role },
                    `A fill as ${JSON.stringify(role)} refused: ${reason}.`
                  );
            const [field, key] = held(fieldId);

            if (!field) {
              throw refusalForRole(`no field holds ${JSON.stringify(fieldId)}`);
            }

            const next = { ...field, ...patch };
            const unfit = unfitSettings(next);
            const named = unfit.find((setting) => setting in patch);

            if (named) {
              throw refusalForRole(
                `${named} does not fit a ${next.kind} field`
              );
            }
            if (patch.condition) {
              checkCondition(patch.condition, next);

              if (
                patch.condition.ref !== field.condition?.ref &&
                fieldLinks().link(next, (id) =>
                  id === fieldId ? next : held(id)[0]
                ).loop
              ) {
                throw refusal('its condition closes a loop');
              }
            }

            const reshaped = 'kind' in patch || 'options' in patch;

            tx.nodes.set(
              {
                ...patch,
                ...(reshaped
                  ? Object.fromEntries(
                      unfit.map((setting) => [setting, undefined])
                    )
                  : {}),
              },
              { at: key }
            );
          }),
        };
      },
    };
  }
);
