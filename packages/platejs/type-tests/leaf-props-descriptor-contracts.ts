import { definePlugin as defineHeadlessPlugin } from 'platejs';
import {
  definePlugin,
  EditorLeaf,
  EditorText,
  toReactPlugin,
  type EditorElementProps,
  type EditorLeafProps,
  type EditorTextProps,
} from 'platejs/react';
import {
  EditorLeaf as StaticEditorLeaf,
  EditorText as StaticEditorText,
  type EditorElementProps as StaticEditorElementProps,
  type EditorLeafProps as StaticEditorLeafProps,
  type EditorTextProps as StaticEditorTextProps,
} from 'platejs/static';

import type { Element, Text } from '../src/core';
import { property } from '../src/core';

const BaseTonePlugin = defineHeadlessPlugin('tone', {
  api: () => ({ value: () => 'tone' as const }),
  schema: { mark: property.string() },
});

const TonePlugin = definePlugin('tone', {
  api: () => ({ value: () => 'tone' as const }),
  schema: { mark: property.string() },
});

const BaseDecoratedPlugin = defineHeadlessPlugin('decorated', {
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

const PlateDecoratedPlugin = definePlugin('decorated', {
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

const StagedDecoratedPlugin = definePlugin('stagedDecorated', {
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

const AdaptedDecoratedPlugin = toReactPlugin(BaseDecoratedPlugin, {
  dependencies: [],
}).extend({ editOnly: true });

declare const plateLeafProps: EditorLeafProps<typeof TonePlugin>;
declare const plateTextProps: EditorTextProps<typeof TonePlugin>;
declare const pliteLeafProps: StaticEditorLeafProps<typeof BaseTonePlugin>;
declare const pliteTextProps: StaticEditorTextProps<typeof BaseTonePlugin>;
declare const baseDecoratedLeafProps: StaticEditorLeafProps<
  typeof BaseDecoratedPlugin
>;
declare const plateDecoratedLeafProps: EditorLeafProps<
  typeof PlateDecoratedPlugin
>;
declare const stagedDecoratedLeafProps: EditorLeafProps<
  typeof StagedDecoratedPlugin
>;
declare const adaptedDecoratedLeafProps: EditorLeafProps<
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

EditorLeaf(plateLeafProps);
EditorText(plateTextProps);
StaticEditorLeaf(pliteLeafProps);
StaticEditorText(pliteTextProps);

// @ts-expect-error Plugin component props require an owning descriptor.
type DirectPlateElementProps = EditorElementProps<Element>;
// @ts-expect-error Plugin component props require an owning descriptor.
type DirectPlateLeafProps = EditorLeafProps<Text>;
// @ts-expect-error Plugin component props require an owning descriptor.
type DirectPlateTextProps = EditorTextProps<Text>;
// @ts-expect-error Static plugin component props require an owning descriptor.
type DirectPliteElementProps = StaticEditorElementProps<Element>;
// @ts-expect-error Static plugin component props require an owning descriptor.
type DirectPliteLeafProps = StaticEditorLeafProps<Text>;
// @ts-expect-error Static plugin component props require an owning descriptor.
type DirectPliteTextProps = StaticEditorTextProps<Text>;

// @ts-expect-error The owning descriptor generic is required.
type MissingPlateElementProps = EditorElementProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPlateLeafProps = EditorLeafProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPlateTextProps = EditorTextProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPliteElementProps = StaticEditorElementProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPliteLeafProps = StaticEditorLeafProps;
// @ts-expect-error The owning descriptor generic is required.
type MissingPliteTextProps = StaticEditorTextProps;

// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPlateElementProps = EditorElementProps<typeof TonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPlateLeafProps = EditorLeafProps<typeof TonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPlateTextProps = EditorTextProps<typeof TonePlugin, never>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPliteElementProps = StaticEditorElementProps<
  typeof BaseTonePlugin,
  never
>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPliteLeafProps = StaticEditorLeafProps<
  typeof BaseTonePlugin,
  never
>;
// @ts-expect-error Plugin context is derived from the descriptor.
type ContextPliteTextProps = StaticEditorTextProps<
  typeof BaseTonePlugin,
  never
>;

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
