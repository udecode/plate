import type { Editor } from '@platejs/plite';
import { getEditorRuntimeOwner } from '@platejs/plite/internal';

import type { AnyBasePlugin, EditorShortcut, NodeComponents } from '../../lib';
import type { ResolvedInputRulesMeta } from '../../lib/plugins/input-rules/types';
import type { CompiledPlateShortcut } from './compilePlateShortcuts';

export type PlatePluginCache = Readonly<{
  decorate: readonly string[];
  handlers: Readonly<{
    onNodeChange: readonly string[];
    onTextChange: readonly string[];
  }>;
  inject: Readonly<{
    nodeProps: readonly string[];
  }>;
  node: Readonly<{
    containerTypes: readonly string[];
    decoratedMarks: readonly string[];
    textMarks: readonly string[];
    leafProps: readonly string[];
    textProps: readonly string[];
    /** Node types to plugin keys. */
    types: Readonly<Record<string, string>>;
  }>;
  transformInitialValue: readonly string[];
  render: Readonly<{
    aboveEditable: readonly string[];
    aboveNodes: readonly string[];
    abovePlite: readonly string[];
    afterContainer: readonly string[];
    afterEditable: readonly string[];
    beforeContainer: readonly string[];
    beforeEditable: readonly string[];
    belowNodes: readonly string[];
    belowRootNodes: readonly string[];
  }>;
  rules: Readonly<{ match: readonly string[] }>;
  useHooks: readonly string[];
}>;

type PublishedEditorShortcut = Readonly<
  Omit<EditorShortcut, 'keys' | 'scopes' | 'target'> & {
    keys?:
      | readonly (readonly ({} & string)[])[]
      | readonly string[]
      | string
      | null;
    scopes?: readonly string[] | string;
  }
>;

export type PlateRuntime = Readonly<{
  components: Readonly<NodeComponents>;
  inputRules: ResolvedInputRulesMeta;
  pluginCache: PlatePluginCache;
  pluginList: readonly AnyBasePlugin[];
  plugins: Readonly<Record<string, AnyBasePlugin>>;
  shortcutTable: readonly CompiledPlateShortcut[];
  shortcuts: Readonly<
    Record<string, PublishedEditorShortcut | null | undefined>
  >;
}>;

const CANDIDATE_PLATE_RUNTIMES = new WeakMap<object, PlateRuntime>();

export const getPlateRuntimeOwner = (editor: object) =>
  getEditorRuntimeOwner(editor as Editor);

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
