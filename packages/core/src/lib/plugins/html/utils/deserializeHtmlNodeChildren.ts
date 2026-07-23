import { deserializeHtmlNodeChildrenWithParserRuntime } from '../../../../internal/plugin/html-parser-runtime';
import { withPreparedParserRuntime } from '../../../../internal/plugin/prepareParserRegistry';
import type { DeserializeHtmlChildren } from '../types';
import type { BaseEditor } from '../../../editor';

export const deserializeHtmlNodeChildren = (
  editor: BaseEditor,
  node: ChildNode | HTMLElement,
  isPliteParent = false
): DeserializeHtmlChildren[] =>
  withPreparedParserRuntime(editor, (runtime) =>
    deserializeHtmlNodeChildrenWithParserRuntime(runtime, node, isPliteParent)
  );
