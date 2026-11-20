import { nanoid } from 'nanoid';

import {
  definePlugin,
  type Descendant,
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
import { failInvariant } from '../../../internal/failInvariant';

const FIELD_KINDS = [
  'checkbox',
  'choice',
  'date',
  'number',
  'signature',
  'text',
] as const;

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
 * target's kind.
 */
export type FieldProblem =
  | 'invalid-value'
  | 'missing-target'
  | 'unsupported-test';

/**
 * The tests a condition may use on a field of each kind. `insert` and `update`
 * refuse any other test, and a read reports it as `unsupported-test`.
 */
export const FIELD_TESTS: Readonly<Record<FieldKind, readonly FieldTest[]>> = {
  checkbox: ['equals', 'not-equals'],
  choice: ['filled', 'blank', 'equals', 'not-equals'],
  date: ['filled', 'blank', 'equals', 'not-equals', 'above', 'below'],
  number: ['filled', 'blank', 'equals', 'not-equals', 'above', 'below'],
  signature: ['filled', 'blank'],
  text: ['filled', 'blank', 'equals', 'not-equals'],
};

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

const isIsoDate = (value: string) => {
  if (!ISO_DATE_PATTERN.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  // A day past its month's end parses to a later date.
  return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
};

const isFieldValue = (value: unknown): value is FieldValue =>
  typeof value === 'string' ||
  typeof value === 'boolean' ||
  (typeof value === 'number' && Number.isFinite(value));

const isFieldOptions = (value: unknown): value is readonly FieldOption[] =>
  Array.isArray(value) &&
  value.every(
    (option) =>
      typeof option?.label === 'string' && typeof option.value === 'string'
  ) &&
  new Set(value.map((option) => option.value)).size === value.length;

const isFieldCondition = (value: unknown): value is FieldCondition => {
  if (!value || typeof value !== 'object') return false;

  const { ref, test, value: compared } = value as Record<string, unknown>;

  return (
    typeof ref === 'string' &&
    Object.values(FIELD_TESTS).some((tests) =>
      tests.some((known) => known === test)
    ) &&
    (compared === undefined || isFieldValue(compared))
  );
};

const isFieldKind = (value: unknown): value is FieldKind =>
  FIELD_KINDS.some((kind) => kind === value);

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

const fieldSchemaPlugin = definePlugin(FIELD_TYPE, {
  formats: ({ defineFormats, schema: { type } }) =>
    defineFormats({
      docx: {
        dropped: 'Word keeps each field answer and drops its settings.',
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
  schema: {
    element: {
      properties: {
        defaultValue: property.json({
          validate: isFieldValue,
          validationVersion: 1,
        }),
        kind: property.enum(FIELD_KINDS, { required: true }),
        label: property.string({ required: true }),
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

/** A field as the plugin reads it, with what the read finds wrong with it. */
export type FieldRead = Readonly<{
  fieldId: string;
  node: FieldElement;
  problems: readonly FieldProblem[];
}>;

type FieldShape = Pick<
  FieldSettings,
  'defaultValue' | 'kind' | 'options' | 'value'
>;

const SHAPED_SETTINGS = ['defaultValue', 'options', 'value'] as const;

/**
 * Whether a value fits a field's kind: a boolean for a checkbox, one of its
 * options' values for a choice, an ISO date string for a date, a finite number
 * for a number, and a string for a text or signature field.
 */
export const fitsField = (
  { kind, options = [] }: FieldShape,
  value: unknown
): value is FieldValue => {
  switch (kind) {
    case 'checkbox': {
      return typeof value === 'boolean';
    }
    case 'choice': {
      return options.some((option) => option.value === value);
    }
    case 'date': {
      return typeof value === 'string' && isIsoDate(value);
    }
    case 'number': {
      return typeof value === 'number' && Number.isFinite(value);
    }
    default: {
      return typeof value === 'string';
    }
  }
};

const fitsSetting = (
  field: FieldShape,
  setting: (typeof SHAPED_SETTINGS)[number]
) =>
  field[setting] === undefined ||
  (setting === 'options'
    ? field.kind === 'choice'
    : fitsField(field, field[setting]));

const conditionProblem = (
  { test, value }: FieldCondition,
  named: FieldShape | undefined
): FieldProblem | undefined => {
  if (!named) return 'missing-target';
  if (!FIELD_TESTS[named.kind].includes(test)) return 'unsupported-test';

  const fits =
    test === 'filled' || test === 'blank'
      ? value === undefined
      : fitsField(named, value);

  return fits ? undefined : 'invalid-value';
};

const fieldProblems = (
  field: FieldElement,
  targetOf: (fieldId: string) => FieldShape | undefined
): FieldProblem[] => {
  const own: FieldProblem[] = SHAPED_SETTINGS.every((setting) =>
    fitsSetting(field, setting)
  )
    ? []
    : ['invalid-value'];
  const conditioned =
    field.condition &&
    conditionProblem(field.condition, targetOf(field.condition.ref));

  return conditioned && !own.includes(conditioned)
    ? [...own, conditioned]
    : own;
};

const refusal = (reason: string) =>
  new TypeError(`Field write refused: ${reason}.`);

/**
 * Fields: inline voids that each collect one value of a kind and hold a
 * document-wide unique `fieldId`. A field's `condition` names another field
 * by that id, so a paste that copies both names the copy.
 */
export const BaseFieldPlugin = fieldSchemaPlugin.extend(
  ({ schema: { properties, type } }) => {
    const isField = (node: Node): node is FieldElement =>
      ElementApi.isElement(node) && node.type === type;

    return {
      read: ({ state }) => {
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

        return {
          /**
           * The field whose `fieldId` is `fieldId`, in any root, or null when
           * no field holds it. Looks up the field and the field its condition
           * names.
           */
          field: (fieldId: string): FieldRead | null => {
            const node = held(fieldId);

            return node
              ? { fieldId, node, problems: fieldProblems(node, held) }
              : null;
          },
          /** Every field of the document, in reading order. */
          fields: (): FieldRead[] => {
            const fields = new Map(
              [
                state.children(),
                ...state.roots().map(({ root }) => state.root(root)),
              ]
                .flatMap(fieldsIn)
                .map((node) => [node.fieldId, node] as const)
            );

            return [...fields].map(([fieldId, node]) => ({
              fieldId,
              node,
              problems: fieldProblems(node, (id) => fields.get(id)),
            }));
          },
        };
      },
      update: ({ tx }) => {
        const held = (fieldId: string) => {
          const holder = tx.unique.holder('fieldId', fieldId);
          const node = holder && tx.nodes.get(holder.key)?.[0];

          return node && isField(node) ? ([node, holder.key] as const) : [];
        };
        const checkCondition = (condition: FieldCondition) => {
          const problem = conditionProblem(condition, held(condition.ref)[0]);

          if (problem) throw refusal(`its condition has ${problem}`);
        };

        return {
          /**
           * Insert a field and return its new `fieldId`. Throws when a value,
           * default or options do not fit `kind`, or the condition names no
           * field, or a test or value the named field's kind does not take.
           */
          insert: txLocate(
            locateAt(1),
            (settings: FieldSettings, options: NodeInsertOptions = {}) => {
              const unfit = SHAPED_SETTINGS.find(
                (setting) => !fitsSetting(settings, setting)
              );

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
           * `role` or `label`, or its condition names
           * the field itself, no field, or a test or value the named field's
           * kind does not take.
           */
          update: txLocate(false, (fieldId: string, patch: FieldPatch) => {
            const [field, key] = held(fieldId);

            if (!field) throw refusal(`no field holds "${fieldId}"`);

            const next = { ...field, ...patch };
            const unfit = SHAPED_SETTINGS.filter(
              (setting) => !fitsSetting(next, setting)
            );
            const named = unfit.find((setting) => setting in patch);

            if (named) {
              throw refusal(`${named} does not fit a ${next.kind} field`);
            }
            if (patch.condition) {
              if (patch.condition.ref === fieldId) {
                throw refusal('its condition names the field itself');
              }

              checkCondition(patch.condition);
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
