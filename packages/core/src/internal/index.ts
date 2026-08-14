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
  pipePreparedInsertDataQuery,
  prepareHtmlPluginContext,
  prepareHtmlRegistry,
} from '../lib/plugins/html/HtmlPlugin';
export {
  compileEditorApplicationSchema,
  getCompiledPlateContainerTypes,
  getCompiledPlatePlugin,
  getPlateRuntime,
  getResolvedPluginTargetTypes,
} from './plugin/compilePlateModel';
export { isNominalPluginDescriptor } from './utils/mergePlugins';
export {
  getPlateNodeCodecContributions,
  type PlateNodeCodecContribution,
} from './plugin/collectPlateNodeCodecs';
export type {
  PlatePluginCache,
  PlateRuntime,
} from './plugin/plateRuntime';
