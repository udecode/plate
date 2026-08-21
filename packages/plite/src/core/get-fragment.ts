import { NodeApi } from '../interfaces';
import type {
  AnyEditor as Editor,
  EditorFragmentReadOptions,
} from '../interfaces/editor';
import type { Descendant } from '../interfaces/node';
import { getLiveSelection } from './public-state';

const unwrapFragmentNodes = (
  nodes: readonly Descendant[],
  types: ReadonlySet<string>,
  result: Descendant[] = []
) => {
  for (const node of nodes) {
    if (
      NodeApi.isElement(node) &&
      typeof node.type === 'string' &&
      types.has(node.type)
    ) {
      unwrapFragmentNodes(node.children, types, result);
    } else {
      result.push(node);
    }
  }

  return result;
};

export const getFragment = (
  editor: Editor,
  options: EditorFragmentReadOptions = {}
) => {
  const selection = options.at ?? getLiveSelection(editor);

  if (selection) {
    const fragment = NodeApi.fragment(editor, selection);

    if (options.unwrap && options.unwrap.length > 0) {
      return unwrapFragmentNodes(fragment, new Set(options.unwrap));
    }

    return fragment;
  }
  return [];
};
