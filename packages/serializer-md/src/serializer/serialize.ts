import { MARK_BOLD, MARK_CODE, MARK_ITALIC } from '@udecode/plate-basic-marks';
import {
  type PlateEditor,
  type Value,
  getPluginType,
} from '@udecode/plate-common/server';

import type { BlockType, LeafType, NodeTypes } from './types';

interface Options {
  nodeTypes: NodeTypes;
  ignoreParagraphNewline?: boolean;
  listDepth?: number;
}

const isLeafNode = (node: BlockType | LeafType): node is LeafType => {
  return typeof (node as LeafType).text === 'string';
};

const VOID_ELEMENTS: (keyof NodeTypes)[] = ['thematic_break', 'image'];

const BREAK_TAG = '<br/>';

export function serialize<V extends Value>(
  editor: PlateEditor<V>,
  chunk: BlockType | LeafType,
  opts: Options
) {
  const {
    ignoreParagraphNewline = false,
    listDepth = 0,
    nodeTypes: userNodeTypes,
  } = opts;

  const text = (chunk as LeafType).text || '';
  let type = (chunk as BlockType).type || '';

  const nodeTypes: NodeTypes = {
    ...userNodeTypes,
    heading: {
      ...userNodeTypes.heading,
    },
  };

  const LIST_TYPES = [nodeTypes.ul_list, nodeTypes.ol_list];

  let children = text;

  if (!isLeafNode(chunk)) {
    children = chunk.children
      .map((c: BlockType | LeafType, index, all) => {
        const isList = isLeafNode(c)
          ? false
          : (LIST_TYPES as string[]).includes(c.type || '');

        const selfIsList = (LIST_TYPES as string[]).includes(chunk.type || '');

        // Links can have the following shape
        // In which case we don't want to surround
        // with break tags
        // {
        //  type: 'paragraph',
        //  children: [
        //    { text: '' },
        //    { type: 'link', children: [{ text: foo.com }]}
        //    { text: '' }
        //  ]
        // }
        let childrenHasLink = false;

        if (!isLeafNode(chunk) && Array.isArray(chunk.children)) {
          childrenHasLink = chunk.children.some(
            (f) => !isLeafNode(f) && f.type === nodeTypes.link
          );
        }

        const listProps =
          isList || selfIsList
            ? {
                index,
                length: all.length,
              }
            : {};

        return serialize(
          editor,
          {
            ...c,
            parent: {
              type,
              ...listProps,
            },
          },
          {
            // to respect neighboring paragraphs
            ignoreParagraphNewline:
              (ignoreParagraphNewline ||
                isList ||
                selfIsList ||
                childrenHasLink) &&
              // if we have c.break, never ignore empty paragraph new line
              !(c as BlockType).break,
            // WOAH.
            // what we're doing here is pretty tricky, it relates to the block below where
            // we check for ignoreParagraphNewline and set type to paragraph.
            // We want to strip out empty paragraphs sometimes, but other times we don't.
            // If we're the descendant of a list, we know we don't want a bunch
            // of whitespace. If we're parallel to a link we also don't want
            // track depth of nested lists so we can add proper spacing
            listDepth: (LIST_TYPES as string[]).includes(
              (c as BlockType).type || ''
            )
              ? listDepth + 1
              : listDepth,

            nodeTypes,
          }
        );
      })
      .join('');
  }
  // This is pretty fragile code, check the long comment where we iterate over children
  if (
    !ignoreParagraphNewline &&
    (text === '' || text === '\n') &&
    chunk.parent?.type === nodeTypes.paragraph
  ) {
    type = nodeTypes.paragraph;
    children = BREAK_TAG;
  }
  if (children === '' && !VOID_ELEMENTS.some((k) => nodeTypes[k] === type))
    return;
  // Never allow decorating break tags with rich text formatting,
  // this can malform generated markdown
  // Also ensure we're only ever applying text formatting to leaf node
  // level chunks, otherwise we can end up in a situation where
  // we try applying formatting like to a node like this:
  // "Text foo bar **baz**" resulting in "**Text foo bar **baz****"
  // which is invalid markup and can mess everything up
  if (children !== BREAK_TAG && isLeafNode(chunk)) {
    const markedChunk = chunk as any;
    const boldMark = getPluginType(editor, MARK_BOLD);
    const italicMark = getPluginType(editor, MARK_ITALIC);
    const codeMark = getPluginType(editor, MARK_CODE);

    if (
      chunk.strikeThrough &&
      markedChunk[boldMark] &&
      markedChunk[italicMark]
    ) {
      children = retainWhitespaceAndFormat(children, '~~***');
    } else if (markedChunk[boldMark] && markedChunk[italicMark]) {
      children = retainWhitespaceAndFormat(children, '***');
    } else {
      if (markedChunk[boldMark]) {
        children = retainWhitespaceAndFormat(children, '**');
      }
      if (markedChunk[italicMark]) {
        children = retainWhitespaceAndFormat(children, '_');
      }
      if (chunk.strikeThrough) {
        children = retainWhitespaceAndFormat(children, '~~');
      }
      if (markedChunk[codeMark]) {
        children = retainWhitespaceAndFormat(children, '`');
      }
    }
  }

  switch (type) {
    case nodeTypes.heading[1]: {
      return `# ${children}\n`;
    }
    case nodeTypes.heading[2]: {
      return `## ${children}\n`;
    }
    case nodeTypes.heading[3]: {
      return `### ${children}\n`;
    }
    case nodeTypes.heading[4]: {
      return `#### ${children}\n`;
    }
    case nodeTypes.heading[5]: {
      return `##### ${children}\n`;
    }
    case nodeTypes.heading[6]: {
      return `###### ${children}\n`;
    }
    case nodeTypes.block_quote: {
      // For some reason, marked is parsing blockquotes w/ one new line
      // as contiued blockquotes, so adding two new lines ensures that doesn't
      // happen
      return `> ${children}\n\n`;
    }
    case nodeTypes.code_block: {
      return `\`\`\`${
        (chunk as BlockType).language || ''
      }\n${children}\n\`\`\`\n`;
    }
    case nodeTypes.link: {
      return `[${children}](${(chunk as BlockType).url || ''})`;
    }
    case nodeTypes.image: {
      const caption = (chunk as BlockType).caption
        ?.map((c: BlockType | LeafType) => serialize(editor, c, opts))
        .join('') as string;

      return `![${caption}](${(chunk as BlockType).url || ''})`;
    }
    case nodeTypes.ul_list:
    case nodeTypes.ol_list: {
      const newLineAfter = listDepth === 0 ? '\n' : '';

      return `${children}${newLineAfter}`;
    }
    case nodeTypes.listItem: {
      const isOL = chunk && chunk.parent?.type === nodeTypes.ol_list;

      let spacer = '';

      for (let k = 0; listDepth > k; k++) {
        // https://github.com/remarkjs/remark-react/issues/65
        spacer += isOL ? '   ' : '  ';
      }

      const isNewLine =
        chunk &&
        (chunk.parent?.type === nodeTypes.ol_list ||
          chunk.parent?.type === nodeTypes.ul_list);
      const emptyBefore = isNewLine ? '\n' : '';

      //   const isLastItem =
      //     chunk.parent &&
      //     chunk.parent.length! - 1 === chunk.parent.index &&
      //     (chunk as BlockType).children.length === 1;
      //   const emptyAfter = isLastItem && listDepth === 0 ? '\n' : '';

      return `${emptyBefore}${spacer}${isOL ? '1.' : '-'} ${children}`;
    }
    case nodeTypes.paragraph: {
      return `\n${children}\n`;
    }
    case nodeTypes.thematic_break: {
      return '\n---\n';
    }

    default: {
      return children;
    }
  }
}

// This function handles the case of a string like this: "   foo   "
// Where it would be invalid markdown to generate this: "**   foo   **"
// We instead, want to trim the whitespace out, apply formatting, and then
// bring the whitespace back. So our returned string looks like this: "   **foo**   "
function retainWhitespaceAndFormat(string: string, format: string) {
  // we keep this for a comparison later
  const frozenString = string.trim();

  // children will be mutated
  const children = frozenString;

  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const fullFormat = `${format}${children}${reverseStr(format)}`;

  // This conditions accounts for no whitespace in our string
  // if we don't have any, we can return early.
  if (children.length === string.length) {
    return fullFormat;
  }

  // if we do have whitespace, let's add our formatting around our trimmed string
  // We reverse the right side formatting, to properly handle bold/italic and strikeThrough
  // formats, so we can create ~~***FooBar***~~
  const formattedString = format + children + reverseStr(format);

  // and replace the non-whitespace content of the string
  return string.replace(frozenString, formattedString);
}

const reverseStr = (string: string) => string.split('').reverse().join('');
