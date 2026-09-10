import type { Editor as PliteEditor } from '../../facade';
import { getEditorRuntimeOwner } from '../../facade';
import type { AnyBasePlugin, EditorShortcut } from '../../lib';
import type { ResolvedInputRulesMeta } from '../../lib/plugins/input-rules/types';
import type { CompiledPlateShortcut } from './compilePlateShortcuts';

export type PlatePluginCache = Readonly<{
  decorate: readonly string[];
  on: Readonly<{
    nodeChange: readonly string[];
    textChange: readonly string[];
  }>;
  inject: Readonly<{
    nodeProps: Readonly<{
      element: readonly string[];
      text: readonly string[];
    }>;
  }>;
  node: Readonly<{
    containerTypes: readonly string[];
    leafAttributeMarks: readonly string[];
    leafRenderers: readonly string[];
    textAttributeMarks: readonly string[];
    textRenderers: readonly string[];
  }>;
  prepareDocument: readonly string[];
  slots: Readonly<{
    afterContainer: readonly string[];
    afterEditable: readonly string[];
    afterNodeChildren: readonly string[];
    beforeContainer: readonly string[];
    beforeEditable: readonly string[];
    wrapContent: readonly string[];
    wrapNode: readonly string[];
    wrapNodeChildren: readonly string[];
    wrapRoot: readonly string[];
  }>;
  rules: Readonly<{ match: readonly string[] }>;
  useViewElementAttributes: readonly string[];
}>;

type PublishedEditorShortcut = Readonly<
  Omit<EditorShortcut, 'keys' | 'scopes' | 'target'> & {
    keys?:
      | ReadonlyArray<ReadonlyArray<{} & string>>
      | readonly string[]
      | string
      | null;
    scopes?: readonly string[] | string;
  }
>;

export type PlateRuntime = Readonly<{
  genericElementToggles: readonly string[];
  inputRules: ResolvedInputRulesMeta;
  pluginCache: PlatePluginCache;
  pluginList: readonly AnyBasePlugin[];
  plugins: Readonly<Record<string, AnyBasePlugin>>;
  shortcutTable: readonly CompiledPlateShortcut[];
  shortcuts: Readonly<
    Record<string, PublishedEditorShortcut | null | undefined>
  >;
  updateMethods: Readonly<Record<string, readonly string[] | undefined>>;
}>;

const CANDIDATE_PLATE_RUNTIMES = new WeakMap<object, PlateRuntime>();

export const getPlateRuntimeOwner = (editor: object): PliteEditor =>
  getEditorRuntimeOwner(editor as PliteEditor);

export const clearPlateRuntimeCandidate = (editor: object) => {
  CANDIDATE_PLATE_RUNTIMES.delete(getPlateRuntimeOwner(editor));
};

export const getPlateRuntimeCandidate = (editor: object) =>
  CANDIDATE_PLATE_RUNTIMES.get(getPlateRuntimeOwner(editor));

export const setPlateRuntimeCandidate = (
  editor: object,
  runtime: PlateRuntime
) => {
  CANDIDATE_PLATE_RUNTIMES.set(getPlateRuntimeOwner(editor), runtime);
};
