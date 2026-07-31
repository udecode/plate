import {
  type DefinitionOf,
  type BaseEditor,
  createBaseEditor,
  createBasePlugin,
} from '@platejs/core';
import {
  type InternalPlateEditorWithInstalledPlugins,
  type PlateEditor,
  type PlateEditorWithStore,
  type PlateProps,
  type useEditor,
  createPlateEditor,
  toPlatePlugin,
} from '@platejs/core/react';
import { property, schema, type Value } from '@platejs/plite';
import type { DOMEditor } from '@platejs/plite-dom';
import type { ReactEditor } from '@platejs/plite-react';

const DefaultBoundaryPlugin = createBasePlugin({
  api: () => ({
    value: () => 'exact' as const,
  }),
  name: 'defaultBoundary',
  schema: {
    element: {
      content: schema.content.text({ default: 'text', min: 1 }),
      properties: {
        tone: property.string(),
      },
    },
  },
  type: 'default-boundary',
});

const exactBaseEditor = createBaseEditor({
  plugins: [DefaultBoundaryPlugin],
});
const broadBaseEditor: BaseEditor = exactBaseEditor;
const exactBaseValue: 'exact' = exactBaseEditor.api.defaultBoundary.value();
declare const defaultBaseBoundary: BaseEditor;

defaultBaseBoundary.api.runtimePlugin.run();
defaultBaseBoundary.read.runtimePlugin.read();
defaultBaseBoundary.update.runtimePlugin.write();

// @ts-expect-error Exact editors reject absent capability members.
exactBaseEditor.api.defaultBoundary.missing();
// @ts-expect-error Exact editors reject absent capability groups.
exactBaseEditor.api.missingPlugin.run();

const DefaultBoundaryPlatePlugin = toPlatePlugin(DefaultBoundaryPlugin);
const DefaultBoundarySiblingPlugin = toPlatePlugin(
  createBasePlugin({
    name: 'defaultBoundarySibling',
    schema: {
      element: {
        content: schema.content.text({ default: 'text', min: 1 }),
        properties: {
          level: property.number(),
        },
      },
    },
    type: 'default-boundary-sibling',
  })
);
const exactPlateEditor = createPlateEditor({
  plugins: [DefaultBoundaryPlatePlugin, DefaultBoundarySiblingPlugin],
});
const broadPlateEditor: PlateEditor = exactPlateEditor;
const exactPlateValue: 'exact' = exactPlateEditor.api.defaultBoundary.value();
declare const defaultPlateBoundary: PlateEditor;
type ExactPlateDefinitions =
  | DefinitionOf<typeof DefaultBoundaryPlatePlugin>
  | DefinitionOf<typeof DefaultBoundarySiblingPlugin>;
type ExactInternalPlateEditor = InternalPlateEditorWithInstalledPlugins<
  Value,
  ExactPlateDefinitions
>;
declare const exactInternalPlateEditor: ExactInternalPlateEditor;
const broadInternalPlateEditor: PlateEditor = exactInternalPlateEditor;
const exactDOMEditor: DOMEditor = exactInternalPlateEditor;
const exactReactEditor: ReactEditor = exactInternalPlateEditor;
type ExactPlateProps = PlateProps<ExactInternalPlateEditor>;
type ExactUseEditor = typeof useEditor<ExactInternalPlateEditor>;
declare const exactPlateProps: ExactPlateProps;
declare const exactUseEditor: ExactUseEditor;
declare const plateEditorWithStore: PlateEditorWithStore;
declare const defaultUseEditorReturn: ReturnType<typeof useEditor>;
const broadDOMEditor: DOMEditor = plateEditorWithStore;
const broadReactEditor: ReactEditor = plateEditorWithStore;
const broadUseEditorReturn: PlateEditorWithStore = defaultUseEditorReturn;

defaultPlateBoundary.api.runtimePlugin.run();
defaultPlateBoundary.read.runtimePlugin.read();
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
void exactUseEditor;
