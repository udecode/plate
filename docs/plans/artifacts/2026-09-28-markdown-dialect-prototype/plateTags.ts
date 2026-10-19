// PROTOTYPE — throwaway. See NOTES.md for the question this answers.
//
// CommonMark + registered Plate tags. A micromark construct claims `<name ...>`
// only when `name` is registered; every other `<` falls through to CommonMark
// (autolinks, raw HTML, literal text). A sibling pairing pass turns tag markers
// into MDX-shaped element nodes so the existing feature mappings consume them
// unchanged. Nothing here throws on input.

import { fromMarkdown } from '../../../../node_modules/.pnpm/mdast-util-from-markdown@2.0.3/node_modules/mdast-util-from-markdown/index.js';
import { htmlFlow } from '../../../../node_modules/.pnpm/micromark-core-commonmark@2.0.3/node_modules/micromark-core-commonmark/index.js';
import {
  asciiAlpha,
  asciiAlphanumeric,
  markdownLineEnding,
  markdownSpace,
} from '../../../../node_modules/.pnpm/micromark-util-character@2.1.1/node_modules/micromark-util-character/index.js';

export type PlateTagSpec = Readonly<{ kind: 'block' | 'inline'; void?: boolean }>;
export type PlateTagRegistry = Readonly<Record<string, PlateTagSpec>>;

type AttrValue = string | null | { expression: string };
type TagInfo = {
  attributes: { name: string; value: AttrValue }[];
  closing: boolean;
  name: string;
  selfClosing: boolean;
};

type Code = number | null;
type State = (code: Code) => State | undefined;

const LT = 60;
const GT = 62;
const SLASH = 47;
const EQ = 61;
const DQ = 34;
const SQ = 39;
const BRACE_OPEN = 123;
const BRACE_CLOSE = 125;
const DASH = 45;
const UNDERSCORE = 95;
const COLON = 58;
const DOT = 46;
const GRAVE = 96;

const char = (code: number) =>
  code === -2 ? '\t' : code === -1 ? '' : String.fromCharCode(code);

const decodeRefs = (value: string) =>
  value
    .replaceAll('&quot;', '"')
    .replaceAll('&apos;', "'")
    .replaceAll('&#39;', "'")
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');

const tagStates = (
  effects: any,
  ok: State,
  nok: State,
  accept: (name: string) => boolean,
  tokenType: string
): State => {
  const info: TagInfo = {
    attributes: [],
    closing: false,
    name: '',
    selfClosing: false,
  };
  let attrName = '';
  let value = '';
  let quote = 0;
  let depth = 0;

  const consume = (code: Code, next: State) => {
    effects.consume(code);
    return next;
  };

  const start: State = (code) => {
    if (code !== LT) return nok(code);
    effects.enter(tokenType);
    return consume(code, afterLt);
  };
  const afterLt: State = (code) => {
    if (code === SLASH) {
      info.closing = true;
      return consume(code, nameStart);
    }
    return nameStart(code);
  };
  const nameStart: State = (code) => {
    if (code === null || !asciiAlpha(code)) return nok(code);
    info.name += char(code);
    return consume(code, nameInside);
  };
  const nameInside: State = (code) => {
    if (
      code !== null &&
      (asciiAlphanumeric(code) || code === DASH || code === UNDERSCORE)
    ) {
      info.name += char(code);
      return consume(code, nameInside);
    }
    if (!accept(info.name)) return nok(code);
    return info.closing ? closingEnd(code) : between(code);
  };
  const closingEnd: State = (code) => {
    if (markdownSpace(code)) return consume(code, closingEnd);
    if (code === GT) return consume(code, done);
    return nok(code);
  };
  const between: State = (code) => {
    if (code === GT) return consume(code, done);
    if (code === SLASH) return consume(code, selfClose);
    if (markdownSpace(code)) return consume(code, attrStart);
    return nok(code);
  };
  const attrStart: State = (code) => {
    if (markdownSpace(code)) return consume(code, attrStart);
    if (code === GT || code === SLASH) return between(code);
    if (
      code !== null &&
      (asciiAlpha(code) || code === UNDERSCORE || code === COLON)
    ) {
      attrName = char(code);
      return consume(code, attrNameInside);
    }
    return nok(code);
  };
  const attrNameInside: State = (code) => {
    if (
      code !== null &&
      (asciiAlphanumeric(code) ||
        code === UNDERSCORE ||
        code === COLON ||
        code === DOT ||
        code === DASH)
    ) {
      attrName += char(code);
      return consume(code, attrNameInside);
    }
    return attrNameAfter(code);
  };
  const attrNameAfter: State = (code) => {
    if (markdownSpace(code)) return consume(code, attrNameAfter);
    if (code === EQ) return consume(code, valueBefore);
    info.attributes.push({ name: attrName, value: null });
    return code === GT || code === SLASH ? between(code) : attrStart(code);
  };
  const valueBefore: State = (code) => {
    if (markdownSpace(code)) return consume(code, valueBefore);
    value = '';
    if (code === DQ || code === SQ) {
      quote = code;
      return consume(code, quoted);
    }
    if (code === BRACE_OPEN) {
      depth = 1;
      return consume(code, expression);
    }
    if (
      code === null ||
      markdownLineEnding(code) ||
      code === LT ||
      code === EQ ||
      code === GT ||
      code === GRAVE
    ) {
      return nok(code);
    }
    value = char(code);
    return consume(code, unquoted);
  };
  const quoted: State = (code) => {
    if (code === null || markdownLineEnding(code)) return nok(code);
    if (code === quote) {
      info.attributes.push({ name: attrName, value: decodeRefs(value) });
      return consume(code, between);
    }
    value += char(code);
    return consume(code, quoted);
  };
  const expression: State = (code) => {
    if (code === null || markdownLineEnding(code)) return nok(code);
    if (code === BRACE_OPEN) depth++;
    if (code === BRACE_CLOSE && --depth === 0) {
      info.attributes.push({ name: attrName, value: { expression: value } });
      return consume(code, between);
    }
    value += char(code);
    return consume(code, expression);
  };
  const unquoted: State = (code) => {
    if (
      code === null ||
      markdownLineEnding(code) ||
      markdownSpace(code) ||
      code === GT
    ) {
      info.attributes.push({ name: attrName, value: decodeRefs(value) });
      return between(code);
    }
    if (
      code === DQ ||
      code === SQ ||
      code === LT ||
      code === EQ ||
      code === GRAVE
    ) {
      return nok(code);
    }
    value += char(code);
    return consume(code, unquoted);
  };
  const selfClose: State = (code) => {
    if (code !== GT) return nok(code);
    info.selfClosing = true;
    return consume(code, done);
  };
  const done: State = (code) => {
    const token = effects.exit(tokenType);
    token.plateTag = info;
    return ok(code);
  };

  return start;
};

/** Lookahead: `<` or `</` followed by a registered name and a tag boundary. */
const registeredTagAhead = (tags: PlateTagRegistry) => ({
  partial: true,
  tokenize(effects: any, ok: State, nok: State): State {
    let name = '';
    const start: State = (code) => {
      if (code !== LT) return nok(code);
      effects.enter('plateTagProbe');
      effects.consume(code);
      return afterLt;
    };
    const afterLt: State = (code) => {
      if (code === SLASH) {
        effects.consume(code);
        return nameStart;
      }
      return nameStart(code);
    };
    const nameStart: State = (code) => {
      if (code === null || !asciiAlpha(code)) return nok(code);
      name += char(code);
      effects.consume(code);
      return nameInside;
    };
    const nameInside: State = (code) => {
      if (
        code !== null &&
        (asciiAlphanumeric(code) || code === DASH || code === UNDERSCORE)
      ) {
        name += char(code);
        effects.consume(code);
        return nameInside;
      }
      if (!Object.hasOwn(tags, name)) return nok(code);
      if (
        code === null ||
        code === GT ||
        code === SLASH ||
        markdownSpace(code) ||
        markdownLineEnding(code)
      ) {
        effects.exit('plateTagProbe');
        return ok(code);
      }
      return nok(code);
    };
    return start;
  },
});

export const plateTagsSyntax = (tags: PlateTagRegistry) => {
  const isRegistered = (name: string) => Object.hasOwn(tags, name);
  const isBlock = (name: string) =>
    isRegistered(name) && tags[name].kind === 'block';
  const ahead = registeredTagAhead(tags);

  const flow = {
    name: 'plateTagFlow',
    tokenize(this: any, effects: any, ok: State, nok: State): State {
      // Like a thematic break, a registered block tag line may interrupt a
      // paragraph, including on a lazy line (micromark closes containers).
      const start: State = (code) => {
        effects.enter('plateTagFlow');
        return tag(code);
      };
      const tag: State = (code) =>
        tagStates(effects, afterTag, nok, isBlock, 'plateTagFlowTag')(code);
      const afterTag: State = (code) => {
        if (markdownSpace(code)) {
          effects.enter('whitespace');
          return whitespace(code);
        }
        return end(code);
      };
      const whitespace: State = (code) => {
        if (markdownSpace(code)) {
          effects.consume(code);
          return whitespace;
        }
        effects.exit('whitespace');
        return end(code);
      };
      const end: State = (code) => {
        if (code === LT) return tag(code);
        if (code === null || markdownLineEnding(code)) {
          effects.exit('plateTagFlow');
          return ok(code);
        }
        return nok(code);
      };
      return start;
    },
  };

  const text = {
    name: 'plateTagText',
    tokenize(effects: any, ok: State, nok: State): State {
      return tagStates(effects, ok, nok, isRegistered, 'plateTagText');
    },
  };

  // Registered names never open a raw HTML block: CommonMark would otherwise
  // swallow the following lines (`<details>` is an HTML block name).
  const guardedHtmlFlow = {
    concrete: true,
    name: 'plateGuardedHtmlFlow',
    resolveTo: (htmlFlow as any).resolveTo,
    tokenize(this: any, effects: any, ok: State, nok: State): State {
      const run = (htmlFlow as any).tokenize.call(this, effects, ok, nok);
      return (code) => effects.check(ahead, nok, run)(code);
    },
  };

  return {
    disable: { null: ['htmlFlow'] },
    flow: { [LT]: [flow, guardedHtmlFlow] },
    text: { [LT]: text },
  };
};

const toMdxAttributes = (attributes: TagInfo['attributes']) =>
  attributes.map(({ name, value }) => ({
    name,
    type: 'mdxJsxAttribute',
    value:
      value !== null && typeof value === 'object'
        ? { type: 'mdxJsxAttributeValueExpression', value: value.expression }
        : value,
  }));

const isWhitespaceText = (node: any) =>
  node.type === 'text' && node.value.trim() === '';

export const plateTagsFromMarkdown = (tags: PlateTagRegistry) => {
  const marker = (flow: boolean) =>
    function (this: any, token: any) {
      this.enter(
        {
          flow,
          raw: this.sliceSerialize(token),
          tag: token.plateTag as TagInfo,
          type: 'plateTagMarker',
        },
        token
      );
    };
  const exit = function (this: any, token: any) {
    this.exit(token);
  };

  const demoteBlocksInPhrasing = (node: any) => {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.flatMap((child: any) => {
      demoteBlocksInPhrasing(child);
      if (
        child.type !== 'mdxJsxTextElement' ||
        tags[child.name]?.kind !== 'block'
      ) {
        return [child];
      }
      const open = { data: { plateDemotedTag: true }, type: 'html', value: child.data.plateRaw };
      const close = child.data.plateUnclosed
        ? []
        : [{ data: { plateDemotedTag: true }, type: 'html', value: `</${child.name}>` }];
      return [open, ...child.children, ...close];
    });
  };

  const closeUnclosed = (element: any) => {
    element.data = { ...element.data, plateUnclosed: true };
    const last = element.children.at(-1);
    if (last?.position) element.position.end = { ...last.position.end };
  };

  const pairChildren = (parent: any) => {
    if (!Array.isArray(parent.children)) return;
    const out: any[] = [];
    const stack: any[] = [];
    const current = () => (stack.length > 0 ? stack.at(-1).children : out);

    for (const child of parent.children) {
      if (child.type !== 'plateTagMarker') {
        pairChildren(child);
        current().push(child);
        continue;
      }
      const { flow, raw, tag } = child;
      const position = child.position;

      if (tag.closing) {
        const index = stack.findLastIndex(
          (element) => element.name === tag.name
        );

        if (index === -1) {
          current().push({
            data: { plateStrayClosingTag: true },
            position,
            type: 'html',
            value: raw,
          });
          continue;
        }
        while (stack.length - 1 > index) closeUnclosed(stack.pop());
        stack.pop().position.end = { ...position.end };
        continue;
      }

      const element = {
        attributes: toMdxAttributes(tag.attributes),
        children: [],
        data: { plateRaw: raw },
        name: tag.name,
        position: { end: { ...position.end }, start: { ...position.start } },
        type: flow ? 'mdxJsxFlowElement' : 'mdxJsxTextElement',
      };
      current().push(element);
      if (!tag.selfClosing && !tags[tag.name]?.void) stack.push(element);
    }
    while (stack.length > 0) closeUnclosed(stack.pop());

    parent.children = out;
  };

  // A line holding only a registered block element is a block, even inside a
  // paragraph (`<summary>Title</summary>` followed by body text). A block tag
  // anywhere else in phrasing is literal source, never a block in a paragraph.
  const isBlockElement = (node: any) =>
    node?.type === 'mdxJsxTextElement' && tags[node.name]?.kind === 'block';
  const toFlow = (element: any) => ({
    ...element,
    children:
      element.children.length > 0
        ? [{ children: element.children, position: element.position, type: 'paragraph' }]
        : [],
    type: 'mdxJsxFlowElement',
  });
  const trimText = (node: any, side: 'start' | 'end') =>
    node?.type === 'text'
      ? { ...node, value: side === 'start' ? node.value.replace(/^\n/, '') : node.value.replace(/\n$/, '') }
      : node;

  const splitParagraph = (paragraph: any): any[] => {
    const kids = paragraph.children;
    const startsLine = (i: number) =>
      kids.slice(0, i).every(isWhitespaceText) ||
      (kids[i - 1]?.type === 'text' && /\n[ \t]*$/.test(kids[i - 1].value));
    const endsLine = (i: number) =>
      kids.slice(i + 1).every(isWhitespaceText) ||
      (kids[i + 1]?.type === 'text' && /^[ \t]*\n/.test(kids[i + 1].value));
    const result: any[] = [];
    let buffer: any[] = [];
    const flush = () => {
      if (buffer.length > 0) buffer[buffer.length - 1] = trimText(buffer.at(-1), 'end');
      const kept = buffer.filter((child) => !(child.type === 'text' && child.value === ''));
      if (kept.some((child) => !isWhitespaceText(child))) {
        result.push({ ...paragraph, children: kept });
      }
      buffer = [];
    };
    let dropLeadingNewline = false;
    kids.forEach((child: any, i: number) => {
      if (isBlockElement(child) && startsLine(i) && endsLine(i)) {
        flush();
        result.push(toFlow(child));
        dropLeadingNewline = true;
        return;
      }
      buffer.push(dropLeadingNewline ? trimText(child, 'start') : child);
      dropLeadingNewline = false;
    });
    flush();
    return result;
  };

  const normalizeBlocks = (node: any) => {
    if (!Array.isArray(node.children)) return;
    node.children = node.children.flatMap((child: any) =>
      child.type === 'paragraph' ? splitParagraph(child) : [child]
    );
    for (const child of node.children) {
      if (child.type === 'paragraph' || child.type === 'heading' || child.type === 'tableCell') {
        demoteBlocksInPhrasing(child);
      } else {
        normalizeBlocks(child);
      }
    }
  };

  return {
    enter: { plateTagFlowTag: marker(true), plateTagText: marker(false) },
    exit: { plateTagFlowTag: exit, plateTagText: exit },
    transforms: [
      (tree: any) => {
        pairChildren(tree);
        normalizeBlocks(tree);
      },
    ],
  };
};

// Writer: blank lines around block children and no indentation, so nesting
// never reaches CommonMark's four-space indented-code threshold.
const serializeAttributes = (attributes: any[]) =>
  attributes
    .map((attribute) => {
      if (attribute.type !== 'mdxJsxAttribute') return '';
      const { name, value } = attribute;
      if (value === null || value === undefined) return ` ${name}`;
      if (typeof value === 'object') return ` ${name}="${escapeAttr(value.value)}"`;
      return ` ${name}="${escapeAttr(String(value))}"`;
    })
    .join('');

const escapeAttr = (value: string) =>
  value.replaceAll('&', '&amp;').replaceAll('"', '&quot;');

export const plateTagsToMarkdown = () => ({
  handlers: {
    mdxJsxFlowElement(node: any, _parent: any, state: any, info: any) {
      const open = `<${node.name}${serializeAttributes(node.attributes)}`;
      if (node.children.length === 0) return `${open} />`;
      const exit = state.enter('mdxJsxFlowElement');
      const body = state.containerFlow(node, info);
      exit();
      return `${open}>\n\n${body}\n\n</${node.name}>`;
    },
    mdxJsxTextElement(node: any, _parent: any, state: any, info: any) {
      const open = `<${node.name}${serializeAttributes(node.attributes)}`;
      if (node.children.length === 0) return `${open} />`;
      const exit = state.enter('mdxJsxTextElement');
      const tracker = state.createTracker(info);
      tracker.move(`${open}>`);
      const body = state.containerPhrasing(node, {
        ...tracker.current(),
        after: '<',
        before: '>',
      });
      exit();
      return `${open}>${body}</${node.name}>`;
    },
  },
});

// Legacy MDX output indents children two spaces per nesting level, so depth-2
// content crosses CommonMark's indented-code threshold. MDX never produces
// indented code and the writer above never indents, so an indented code block
// directly inside a registered block element is re-read as Markdown.
const isIndentedCode = (node: any, source: string) =>
  node.type === 'code' &&
  !/^\s{0,3}(`{3}|~{3})/.test(source.slice(node.position.start.offset));

const rereadLegacyIndentation = (tree: any, source: string, data: any) => {
  const lineStarts = [0];
  for (let i = 0; i < source.length; i++) {
    if (source[i] === '\n') lineStarts.push(i + 1);
  }
  const lineText = (line: number) =>
    source.slice(lineStarts[line - 1], (lineStarts[line] ?? source.length + 1) - 1);

  const reread = (code: any) => {
    const { end, start } = code.position;
    const prefix = start.column - 1;
    const removed = new Map<number, number>();
    const lines: string[] = [];
    for (let line = start.line; line <= end.line; line++) {
      const rest = lineText(line).slice(prefix);
      const indent = /^ {0,4}/.exec(rest)![0].length;
      removed.set(line, prefix + indent);
      lines.push(rest.slice(indent));
    }
    const fragment = fromMarkdown(lines.join('\n'), {
      extensions: data.micromarkExtensions,
      mdastExtensions: data.fromMarkdownExtensions,
    });
    const remap = (node: any) => {
      if (node.position) {
        for (const point of [node.position.start, node.position.end]) {
          const line = start.line + point.line - 1;
          point.line = line;
          point.column += removed.get(line) ?? prefix;
          point.offset = lineStarts[line - 1] + point.column - 1;
        }
      }
      node.children?.forEach(remap);
    };
    fragment.children.forEach(remap);
    return fragment.children;
  };

  const visit = (node: any) => {
    if (!Array.isArray(node.children)) return;
    if (node.type === 'mdxJsxFlowElement') {
      node.children = node.children.flatMap((child: any) =>
        isIndentedCode(child, source) ? reread(child) : [child]
      );
    }
    node.children.forEach(visit);
  };
  visit(tree);
};

/** Streaming only: hide a trailing `<…` that may still become a registered tag. */
export const trimIncompleteTagTail = (source: string, tags: PlateTagRegistry) => {
  const lt = source.lastIndexOf('<');
  if (lt === -1 || source.includes('>', lt) || source.includes('\n', lt)) {
    return source;
  }
  const match = /^<\/?([A-Za-z][\w-]*)?/.exec(source.slice(lt))!;
  const name = match[1] ?? '';
  const typingName = match[0].length === source.length - lt;
  const couldBeTag = typingName
    ? Object.keys(tags).some((tag) => tag.startsWith(name))
    : Object.hasOwn(tags, name);
  return couldBeTag ? source.slice(0, lt) : source;
};

/** Remark plugin. */
export function remarkPlateTags(this: any, options: { tags: PlateTagRegistry }) {
  const data = this.data();
  (data.micromarkExtensions ??= []).push(plateTagsSyntax(options.tags));
  (data.fromMarkdownExtensions ??= []).push(
    plateTagsFromMarkdown(options.tags)
  );
  (data.toMarkdownExtensions ??= []).push(plateTagsToMarkdown());
  return (tree: any, file: any) =>
    rereadLegacyIndentation(tree, String(file.value), data);
}
