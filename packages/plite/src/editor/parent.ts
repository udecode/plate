import { path as editorPath } from '../interfaces/editor';
import type {
  AnyEditor,
  EditorParentOptions,
  EditorStaticApi,
} from '../interfaces/editor';
import type { Location } from '../interfaces/location';
import type { Ancestor, NodeEntry } from '../interfaces/node';
import { PathApi } from '../interfaces/path';
import { normalizeNodeMatch } from '../utils/node-match';
import { node } from './node';

export const parent = ((
  editor: AnyEditor,
  at: Location,
  options: EditorParentOptions = {}
) => {
  const { match: _match, type: _type, ...pathOptions } = options;
  const path = editorPath(editor, at, pathOptions);
  const parentPath = PathApi.parent(path);
  const entry = node(editor, parentPath) as NodeEntry<Ancestor>;
  const match = normalizeNodeMatch(options.type, options.match);

  return !match || match(entry[0], entry[1]) ? entry : undefined;
}) as EditorStaticApi['parent'];
