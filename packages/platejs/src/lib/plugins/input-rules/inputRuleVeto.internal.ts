import {
  type Editor,
  type EditorStateView,
  getPluginContributions,
} from '../../../facade';
import { getPlateRuntime } from '../../../internal/plugin/compilePlateModel';
import { inputRuleVeto } from './inputRuleVeto';

const vetoTypesByRules = new WeakMap<object, readonly string[]>();

export const isInputRuleVetoed = (
  editor: Editor,
  state: Pick<EditorStateView, 'nodes'>
) => {
  const { inputRules } = getPlateRuntime(editor);
  let types = vetoTypesByRules.get(inputRules);

  if (!types) {
    types = [...new Set(getPluginContributions(editor, inputRuleVeto))];
    vetoTypesByRules.set(inputRules, types);
  }

  return types.length > 0 && state.nodes.some({ type: types });
};
