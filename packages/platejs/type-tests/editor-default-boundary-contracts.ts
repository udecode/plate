import {
  type DefinitionOf,
  type Editor as HeadlessEditor,
  createEditor as createHeadlessEditor,
  defineBasePlugin,
} from 'platejs';
import {
  type Editor,
  type PlateProps,
  type useEditor,
  createEditor,
  toPlatePlugin,
} from 'platejs/react';
import { property, schema, type Value } from 'plitejs';
import type { DOMEditor } from 'plitejs/dom';
import type { Editor as ReactViewEditor } from 'plitejs/react';

import type { InternalPlateEditorWithInstalledPlugins } from '../src/react/editor/Editor';

const DefaultBoundaryPlugin = defineBasePlugin('defaultBoundary', {
  api: () => ({
    value: () => 'exact' as const,
  }),
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        tone: property.string(),
      },
    },
  },
});

const exactBaseEditor = createHeadlessEditor({
  plugins: [DefaultBoundaryPlugin],
});
const broadBaseEditor: HeadlessEditor = exactBaseEditor;
const exactBaseValue: 'exact' = exactBaseEditor.api.defaultBoundary.value();
declare const defaultBaseBoundary: HeadlessEditor;

// @ts-expect-error Default Base editors expose Core API groups only.
defaultBaseBoundary.api.runtimePlugin.run();
// @ts-expect-error Default Base editors expose Core read groups only.
defaultBaseBoundary.read.runtimePlugin.read();
// @ts-expect-error Default Base editors expose Core update groups only.
defaultBaseBoundary.update.runtimePlugin.write();

// @ts-expect-error Exact editors reject absent capability members.
exactBaseEditor.api.defaultBoundary.missing();
// @ts-expect-error Exact editors reject absent capability groups.
exactBaseEditor.api.missingPlugin.run();

const DefaultBoundaryPlatePlugin = toPlatePlugin(DefaultBoundaryPlugin);
const DefaultBoundarySiblingPlugin = toPlatePlugin(
  defineBasePlugin('defaultBoundarySibling', {
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: {
          level: property.number(),
        },
      },
    },
  })
);
const exactPlateEditor = createEditor({
  plugins: [DefaultBoundaryPlatePlugin, DefaultBoundarySiblingPlugin],
});
const broadPlateEditor: Editor = exactPlateEditor;
const exactPlateValue: 'exact' = exactPlateEditor.api.defaultBoundary.value();
declare const defaultPlateBoundary: Editor;
type ExactPlateDefinition = DefinitionOf<typeof DefaultBoundaryPlatePlugin>;
type ExactInternalPlateEditor = InternalPlateEditorWithInstalledPlugins<
  Value,
  ExactPlateDefinition
>;
declare const exactInternalPlateEditor: ExactInternalPlateEditor;
const broadInternalPlateEditor: Editor = exactInternalPlateEditor;
const exactDOMEditor: DOMEditor = exactInternalPlateEditor;
const exactReactEditor: ReactViewEditor = exactInternalPlateEditor;
type ExactPlateProps = PlateProps<ExactInternalPlateEditor>;
declare const exactPlateProps: ExactPlateProps;
declare const defaultUseEditorReturn: ReturnType<typeof useEditor>;
const broadDOMEditor: DOMEditor<any, any> = defaultUseEditorReturn;
const broadReactEditor: ReactViewEditor<any, any> = defaultUseEditorReturn;
const broadUseEditorReturn: Editor = defaultUseEditorReturn;

// @ts-expect-error Store access is owned by usePlateStore(), not the editor.
defaultUseEditorReturn.store;

// @ts-expect-error Default Plate editors expose Core API groups only.
defaultPlateBoundary.api.runtimePlugin.run();
// @ts-expect-error Default Plate editors expose Core read groups only.
defaultPlateBoundary.read.runtimePlugin.read();
// @ts-expect-error Default Plate editors expose Core update groups only.
defaultPlateBoundary.update.runtimePlugin.write();
const broadPlateElement = defaultPlateBoundary.read.schema.create(
  DefaultBoundaryPlatePlugin
);
const broadPlateElementType: string = broadPlateElement.type;

// @ts-expect-error Exact React editors reject absent capability members.
exactPlateEditor.api.defaultBoundary.missing();
// @ts-expect-error Exact React editors reject absent capability groups.
exactPlateEditor.api.missingPlugin.run();

void broadBaseEditor;
void broadDOMEditor;
void broadInternalPlateEditor;
void broadPlateEditor;
void broadReactEditor;
void broadUseEditorReturn;
void broadPlateElementType;
void exactDOMEditor;
void exactBaseValue;
void exactPlateProps;
void exactPlateValue;
void exactReactEditor;
