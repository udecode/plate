import { defineBasePlugin } from '@platejs/core';
import {
  definePlatePlugin,
  type PlateElementProps,
  PlateLeaf,
  PlateText,
  type PlateLeafProps,
  type PlateTextProps,
  toPlatePlugin,
} from '@platejs/core/react';
import {
  PliteLeaf,
  type PliteElementProps,
  PliteText,
  type PliteLeafProps,
  type PliteTextProps,
} from '@platejs/core/static';
import type { Element, Text } from '@platejs/plite';
import { property } from '@platejs/plite';

const BaseTonePlugin = defineBasePlugin('tone', {
  api: () => ({ value: () => 'tone' as const }),
  schema: { mark: property.string() },
});

const TonePlugin = definePlatePlugin('tone', {
  api: () => ({ value: () => 'tone' as const }),
  schema: { mark: property.string() },
});

const BaseDecoratedPlugin = defineBasePlugin('decorated', {
  decorate: () => [
    {
      anchor: { offset: 0, path: [0] },
      className: 'token',
      focus: { offset: 1, path: [0] },
      token: true as const,
    },
  ],
  schema: { mark: property.boolean() },
});

const PlateDecoratedPlugin = definePlatePlugin('decorated', {
  decorate: () => [
    {
      anchor: { offset: 0, path: [0] },
      className: 'token',
      focus: { offset: 1, path: [0] },
      token: true as const,
    },
  ],
  schema: { mark: property.boolean() },
});

const StagedDecoratedPlugin = defineBasePlugin('stagedDecorated', {
  schema: { mark: property.boolean() },
}).extend(() => ({
  decorate: () => [
    {
      anchor: { offset: 0, path: [0] },
      focus: { offset: 1, path: [0] },
      transientScore: 1,
    },
  ],
}));

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
const baseDecorationClassName: string | undefined =
  baseDecoratedLeafProps.leaf.className;
const plateDecorationClassName: string | undefined =
  plateDecoratedLeafProps.leaf.className;
const plateDecorationToken: true | undefined =
  plateDecoratedLeafProps.leaf.token;
const stagedDecorationScore: number | undefined =
  stagedDecoratedLeafProps.leaf.transientScore;
const adaptedDecorationClassName: string | undefined =
  adaptedDecoratedLeafProps.leaf.className;

type DecorationLeaksIntoText =
  'className' extends keyof typeof plateDecoratedLeafProps.text ? true : false;
const decorationStaysLeafOnly: DecorationLeaksIntoText = false;

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
void baseDecorationClassName;
void adaptedDecorationClassName;
void decorationStaysLeafOnly;
void plateDecorationClassName;
void plateDecorationToken;
void stagedDecorationScore;
void plateTextTone;
void pliteLeafTone;
void pliteTextTone;
