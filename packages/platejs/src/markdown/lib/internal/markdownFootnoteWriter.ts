import type { Nodes, Root } from 'mdast';
import type { Processor, Plugin as UnifiedPlugin } from 'unified';

import { decideUrl } from '../../../internal/utils/urlPolicy';
import type { MarkdownReader } from './markdownSafety';

type Handle = (...args: unknown[]) => string;
type ToMarkdownExtension = {
  extensions?: ToMarkdownExtension[];
  handlers?: Record<string, Handle | undefined>;
};

const DEFINITION_START = /^(\[\^(?:\\.|[^\\\]])*\]:)(?: |\n {4})/;

const definesRefusedUrl = (node: Nodes): boolean =>
  node.type === 'definition'
    ? !decideUrl('navigation', node.url).ok
    : 'children' in node && node.children.some(definesRefusedUrl);

// mdast-util-to-markdown applies nested extensions before the handlers that
// sit beside them, so the last handler found is the one that writes.
const findHandler = (
  extensions: readonly ToMarkdownExtension[],
  name: string
): Handle | undefined => {
  let found: Handle | undefined;

  for (const extension of extensions) {
    found = findHandler(extension.extensions ?? [], name) ?? found;
    found = extension.handlers?.[name] ?? found;
  }

  return found;
};

/**
 * CommonMark without footnotes reads `[^1]: javascript:alert(1)` as a link
 * definition, which turns every `[^1]` into a link to that destination, and
 * the definitions after it, such as a `$$` block's TeX lines, read the same
 * way. A footnote that `read`, the CommonMark reader, reads as defining a URL
 * the navigation policy refuses starts its content after a blank line, which
 * both readers read as the same footnote and CommonMark as indented code.
 */
export const remarkFootnoteDefinitionWriter: UnifiedPlugin<
  [Readonly<{ read: MarkdownReader }>],
  Root
> = function (this: Processor, { read }) {
  const data = this.data() as {
    toMarkdownExtensions?: ToMarkdownExtension[];
  };
  data.toMarkdownExtensions ??= [];
  const extensions = data.toMarkdownExtensions;
  const write = findHandler(extensions, 'footnoteDefinition');

  if (!write) return;
  extensions.push({
    handlers: {
      footnoteDefinition: (...args) => {
        const value = write(...args);
        const start = DEFINITION_START.exec(value);

        if (!start || !definesRefusedUrl(read(value))) return value;

        return `${start[1]}\n\n    ${value.slice(start[0].length)}`;
      },
    },
  });
};
