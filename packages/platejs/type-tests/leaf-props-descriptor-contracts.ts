import { defineBasePlugin } from 'platejs';
import {
  definePlatePlugin,
  PlateLeaf,
  PlateText,
  toPlatePlugin,
  type PlateElementProps,
  type PlateLeafProps,
  type PlateTextProps,
} from 'platejs/react';
import {
  PliteLeaf,
  PliteText,
  type PliteElementProps,
  type PliteLeafProps,
  type PliteTextProps,
} from 'platejs/static';

import type { Element, Text } from '../src/core';
import { property } from '../src/core';

const BaseTonePlugin = defineBasePlugin('tone', {
  api: () => ({ value: () => 'tone' as const }),
  schema: { mark: property.string() },
});

const TonePlugin = definePlatePlugin('tone', {
  api: () => ({ value: () => 'tone' as const }),
  schema: { mark: property.string() },
});

const BaseDecoratedPlugin = defineBasePlugin('decorated', {
  decorate: {
    read: ({ entry }) => [
      {
        attributes: { className: 'token', 'data-token': true },
        key: `decorated:${entry[1].join('.')}`,
        range: {
          anchor: { offset: 0, path: entry[1] },
          focus: { offset: 1, path: entry[1] },
        },
      },
    ],
  },
  schema: { mark: property.boolean() },
});

const PlateDecoratedPlugin = definePlatePlugin('decorated', {
  decorate: {
    read: ({ entry }) => [
      {
        attributes: { className: 'token', 'data-token': true },
        key: `decorated:${entry[1].join('.')}`,
        range: {
          anchor: { offset: 0, path: entry[1] },
          focus: { offset: 1, path: entry[1] },
        },
      },
    ],
  },
  schema: { mark: property.boolean() },
});

const StagedDecoratedPlugin = defineBasePlugin('stagedDecorated', {
  schema: { mark: property.boolean() },
}).extend({
  decorate: {
    read: ({ entry }) => [
      {
        attributes: { 'data-staged': true },
        key: `staged:${entry[1].join('.')}`,
        range: {
          anchor: { offset: 0, path: entry[1] },
          focus: { offset: 1, path: entry[1] },
        },
      },
    ],
  },
});

const AdaptedDecoratedPlugin = toPlatePlugin(BaseDecoratedPlugin, {
  dependencies: [],
}).extend({ editOnly: true });

declare const plateLeafProps: PlateLeafProps<typeof TonePlugin>;
declare const plateTextProps: PlateTextProps<typeof TonePlugin>;
declare const pliteLeafProps: PliteLeafProps<typeof BaseTonePlugin>;
declare const pliteTextProps: PliteTextProps<typeof BaseTonePlugin>;
declare const baseDecoratedLeafProps: PliteLeafProps<
  typeof BaseDecoratedPlugin
>;
declare const plateDecoratedLeafProps: PlateLeafProps<
  typeof PlateDecoratedPlugin
>;
declare const stagedDecoratedLeafProps: PliteLeafProps<
  typeof StagedDecoratedPlugin
>;
declare const adaptedDecoratedLeafProps: PlateLeafProps<
  typeof AdaptedDecoratedPlugin
>;

const plateLeafTone: string | undefined = plateLeafProps.leaf.tone;
const plateTextTone: string | undefined = plateTextProps.text.tone;
const pliteLeafTone: string | undefined = pliteLeafProps.leaf.tone;
const pliteTextTone: string | undefined = pliteTextProps.text.tone;
const baseDecorationMark: boolean | undefined =
  baseDecoratedLeafProps.leaf.decorated;
const plateDecorationMark: boolean | undefined =
  plateDecoratedLeafProps.leaf.decorated;
const stagedDecorationMark: boolean | undefined =
  stagedDecoratedLeafProps.leaf.stagedDecorated;
const adaptedDecorationMark: boolean | undefined =
  adaptedDecoratedLeafProps.leaf.decorated;

const exactPlateApi: 'tone' = plateLeafProps.api.value();
const exactBaseApi: 'tone' = pliteLeafProps.api.value();

PlateLeaf(plateLeafProps);
PlateText(plateTextProps);
PliteLeaf(pliteLeafProps);
PliteText(pliteTextProps);

// @ts-expect-error Plugin component props require an owning descriptor.
type DirectPlateElementProps = PlateElementProps<Element>;
// @ts-expect-error Plugin component props require an owning descriptor.
type DirectPlateLeafProps = PlateLeafProps<Text>;
// @ts-expect-error Plugin component props require an owning descriptor.
type DirectPlateTextProps = PlateTextProps<Text>;
// @ts-expect-error Static plugin component props require an owning descriptor.
type DirectPliteElementProps = PliteElementProps<Element>;
// @ts-expect-error Static plugin component props require an owning descriptor.
type DirectPliteLeafProps = PliteLeafProps<Text>;
// @ts-expect-error Static plugin component props require an owning descriptor.
type DirectPliteTextProps = PliteTextProps<Text>;

// @ts-expect-error The owning descriptor generic is required.
type MissingPlateElementProps = PlateElementProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPlateLeafProps = PlateLeafProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPlateTextProps = PlateTextProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPliteElementProps = PliteElementProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPliteLeafProps = PliteLeafProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPliteTextProps = PliteTextProps;

// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPlateElementProps = PlateElementProps<typeof TonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPlateLeafProps = PlateLeafProps<typeof TonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPlateTextProps = PlateTextProps<typeof TonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPliteElementProps = PliteElementProps<typeof BaseTonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPliteLeafProps = PliteLeafProps<typeof BaseTonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPliteTextProps = PliteTextProps<typeof BaseTonePlugin, never>;

// @ts-expect-error Unknown fields stay unknown instead of widening to any.
const missingToneField: string = plateLeafProps.leaf.missing;

void (0 as unknown as DirectPlateElementProps);
void (0 as unknown as DirectPlateLeafProps);
void (0 as unknown as DirectPlateTextProps);
void (0 as unknown as DirectPliteElementProps);
void (0 as unknown as DirectPliteLeafProps);
void (0 as unknown as DirectPliteTextProps);
void (0 as unknown as MissingPlateElementProps);
void (0 as unknown as MissingPlateLeafProps);
void (0 as unknown as MissingPlateTextProps);
void (0 as unknown as MissingPliteElementProps);
void (0 as unknown as MissingPliteLeafProps);
void (0 as unknown as MissingPliteTextProps);
void (0 as unknown as ContextPlateElementProps);
void (0 as unknown as ContextPlateLeafProps);
void (0 as unknown as ContextPlateTextProps);
void (0 as unknown as ContextPliteElementProps);
void (0 as unknown as ContextPliteLeafProps);
void (0 as unknown as ContextPliteTextProps);
void exactBaseApi;
void exactPlateApi;
void missingToneField;
void plateLeafTone;
void baseDecorationMark;
void plateDecorationMark;
void stagedDecorationMark;
void adaptedDecorationMark;
void plateTextTone;
void pliteLeafTone;
void pliteTextTone;
