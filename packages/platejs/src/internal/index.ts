export * from '../lib/libs/zustand';
export type {
  AnyBasePlugin,
  AnyBasePluginContext,
  AnyBasePluginPortal,
  AnyInjectNodeProps,
  AnyPluginBase,
} from '../lib/plugin/BasePlugin';
export type {
  AnyBasePluginDefinition,
  NormalizePluginState,
} from '../lib/plugin/PluginDefinition';
export type { InternalPluginDefinitionOf } from '../lib/plugin/pluginDefinitionLookup.internal';
export type {
  InternalEditorDefinitionElementProperties,
  InternalEditorDefinitionOwnedElementProperties,
  InternalEditorDefinitionTextProperties,
} from '../lib/editor/pluginRuntimeTypes';
export type { GeneratedEditorTypeProvider } from './editor/generatedEditorTypes';
export { createPluginContext } from '../lib/plugin/createPluginContext.internal';
export * from '../lib/plugins/html/htmlDom';
export {
  compileEditorApplicationSchema,
  getCompiledPlateContainerTypes,
  getCompiledPlatePlugin,
  getPlateRuntime,
} from './plugin/compilePlateModel';
export { isNominalPluginDescriptor } from './utils/mergePlugins';
export {
  getPlateNodeMappingContributions,
  type NodeMappingContribution,
} from './plugin/collectPlateNodeMappings';
export type { PlatePluginCache, PlateRuntime } from './plugin/plateRuntime';
