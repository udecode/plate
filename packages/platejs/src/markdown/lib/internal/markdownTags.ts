import type { Root } from 'mdast';
import type {
  MdxJsxAttribute,
  MdxJsxExpressionAttribute,
  MdxJsxFlowElement,
  MdxJsxTextElement,
} from 'mdast-util-mdx';
import type { Processor, Plugin as UnifiedPlugin } from 'unified';
import type { Point, Position } from 'unist';

/**
 * Registered Plate tags: CommonMark + GFM + math plus `<name …>` elements whose
 * names features register. Every other `<` stays CommonMark (autolinks, raw
 * HTML, literal text), so the grammar accepts every string. Tags become
 * `mdxJsxFlowElement` / `mdxJsxTextElement` nodes, the established MDAST shape
 * for JSX-like elements.
 */
export type MarkdownTagKind = 'block' | 'inline';
export type MarkdownTagRegistry = ReadonlyMap<string, MarkdownTagKind>;

export type MarkdownTagRepair = 'misplaced' | 'unclosed' | 'unmatched';

export type MarkdownTagElement = MdxJsxFlowElement | MdxJsxTextElement;

type TagData = {
  markdownTag?: {
    atEnd?: boolean;
    open: Position;
    raw: string;
    repair?: 'unclosed';
  };
  // The closing half of a demoted tag; its opening half carries the report.
  markdownTagClose?: boolean;
  markdownTagRepair?: 'misplaced' | 'unmatched';
};

export const getMarkdownTagRepair = (node: {
  data?: unknown;
}):
  | Readonly<{ atEnd: boolean; repair: MarkdownTagRepair; reported: boolean }>
  | undefined => {
  const data = node.data as TagData | undefined;

  if (data?.markdownTagRepair) {
    return {
      atEnd: false,
      repair: data.markdownTagRepair,
      reported: !data.markdownTagClose,
    };
  }
  if (data?.markdownTag?.repair) {
    return {
      atEnd: data.markdownTag.atEnd ?? false,
      repair: data.markdownTag.repair,
      reported: true,
    };
  }

  return undefined;
};

export const MARKDOWN_TAG_NAME = /^[A-Za-z][\w-]*$/;

const HTML_VOID_TAGS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'source',
  'track',
  'wbr',
]);

// Minimal micromark protocol used by the constructs below.
type Code = number | null;
type State = (code: Code) => State | undefined;
type Token = { plateTag?: TagInfo; type: string };
type Effects = {
  check: (construct: Construct, ok: State, nok: State) => State;
  consume: (code: Code) => void;
  enter: (type: string) => Token;
  exit: (type: string) => Token;
};
type Construct = {
  concrete?: boolean;
  name?: string;
  partial?: boolean;
  resolveTo?: (events: unknown[], context: TokenizeContext) => unknown[];
  tokenize: (
    this: TokenizeContext,
    effects: Effects,
    ok: State,
    nok: State
  ) => State;
};
type TokenizeContext = {
  parser: { constructs: { flow: Record<number, Construct | Construct[]> } };
};

type TagInfo = {
  attributes: Array<{
    name: string;
    value: string | { expression: string } | null;
  }>;
  closing: boolean;
  name: string;
  selfClosing: boolean;
};

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

const isAsciiAlpha = (code: Code) =>
  code !== null && ((code >= 65 && code <= 90) || (code >= 97 && code <= 122));
const isAsciiAlphanumeric = (code: Code) =>
  isAsciiAlpha(code) || (code !== null && code >= 48 && code <= 57);
const isLineEnding = (code: Code) => code !== null && code < -2;
const isSpace = (code: Code) => code === -2 || code === -1 || code === 32;
const isNameContinue = (code: Code) =>
  isAsciiAlphanumeric(code) || code === DASH || code === UNDERSCORE;

// Tabs arrive as -2 followed by -1 virtual spaces.
const charOf = (code: number) =>
  code === -2 ? '\t' : code === -1 ? '' : String.fromCharCode(code);

const ENTITY = /&(?:#(\d+)|#[xX]([\dA-Fa-f]+)|(amp|apos|gt|lt|quot));/g;
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  apos: "'",
  gt: '>',
  lt: '<',
  quot: '"',
};

/** Decode the character references the attribute writer emits. */
export const decodeMarkdownTagAttribute = (value: string) =>
  value.replace(ENTITY, (match, decimal, hex, named) => {
    if (named) return NAMED_ENTITIES[named] ?? match;
    const codePoint = decimal
      ? Number.parseInt(decimal, 10)
      : Number.parseInt(hex, 16);

    return codePoint > 0 && codePoint <= 0x10_ff_ff
      ? String.fromCodePoint(codePoint)
      : match;
  });

/** Escape a quoted attribute value. Tags never span lines. */
export const escapeMarkdownTagAttribute = (value: string) =>
  value
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('\n', '&#10;')
    .replaceAll('\r', '&#13;');

const tagStates = (
  effects: Effects,
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
  let attributeName = '';
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
    if (code === null || !isAsciiAlpha(code)) return nok(code);
    info.name += charOf(code);

    return consume(code, nameInside);
  };
  const nameInside: State = (code) => {
    if (code !== null && isNameContinue(code)) {
      info.name += charOf(code);

      return consume(code, nameInside);
    }
    if (!accept(info.name)) return nok(code);

    return info.closing ? closingEnd(code) : between(code);
  };
  const closingEnd: State = (code) => {
    if (isSpace(code)) return consume(code, closingEnd);
    if (code === GT) return consume(code, done);

    return nok(code);
  };
  const between: State = (code) => {
    if (code === GT) return consume(code, done);
    if (code === SLASH) return consume(code, selfClose);
    if (isSpace(code)) return consume(code, attributeStart);

    return nok(code);
  };
  const attributeStart: State = (code) => {
    if (isSpace(code)) return consume(code, attributeStart);
    if (code === GT || code === SLASH) return between(code);
    if (
      code !== null &&
      (isAsciiAlpha(code) || code === UNDERSCORE || code === COLON)
    ) {
      attributeName = charOf(code);

      return consume(code, attributeNameInside);
    }

    return nok(code);
  };
  const attributeNameInside: State = (code) => {
    if (
      code !== null &&
      (isNameContinue(code) || code === COLON || code === DOT)
    ) {
      attributeName += charOf(code);

      return consume(code, attributeNameInside);
    }

    return attributeNameAfter(code);
  };
  const attributeNameAfter: State = (code) => {
    if (isSpace(code)) return consume(code, attributeNameAfter);
    if (code === EQ) return consume(code, valueBefore);
    info.attributes.push({ name: attributeName, value: null });

    return code === GT || code === SLASH ? between(code) : attributeStart(code);
  };
  const valueBefore: State = (code) => {
    if (isSpace(code)) return consume(code, valueBefore);
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
      isLineEnding(code) ||
      code === LT ||
      code === EQ ||
      code === GT ||
      code === GRAVE
    ) {
      return nok(code);
    }
    value = charOf(code);

    return consume(code, unquoted);
  };
  const quoted: State = (code) => {
    if (code === null || isLineEnding(code)) return nok(code);
    if (code === quote) {
      info.attributes.push({
        name: attributeName,
        value: decodeMarkdownTagAttribute(value),
      });

      return consume(code, between);
    }
    value += charOf(code);

    return consume(code, quoted);
  };
  // Legacy `name={…}` values from older MDX output.
  const expression: State = (code) => {
    if (code === null || isLineEnding(code)) return nok(code);
    if (code === BRACE_OPEN) depth += 1;
    if (code === BRACE_CLOSE) depth -= 1;
    if (code === BRACE_CLOSE && depth === 0) {
      info.attributes.push({
        name: attributeName,
        value: { expression: value },
      });

      return consume(code, between);
    }
    value += charOf(code);

    return consume(code, expression);
  };
  const unquoted: State = (code) => {
    if (code === null || isLineEnding(code) || isSpace(code) || code === GT) {
      info.attributes.push({
        name: attributeName,
        value: decodeMarkdownTagAttribute(value),
      });

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
    value += charOf(code);

    return consume(code, unquoted);
  };
  const selfClose: State = (code) => {
    if (code !== GT) return nok(code);
    info.selfClosing = true;

    return consume(code, done);
  };
  const done: State = (code) => {
    effects.exit(tokenType).plateTag = info;

    return ok(code);
  };

  return start;
};

const findHtmlFlow = (context: TokenizeContext) => {
  const constructs = context.parser.constructs.flow[LT];
  const htmlFlow = (Array.isArray(constructs) ? constructs : [constructs]).find(
    (construct) => construct?.name === 'htmlFlow'
  );

  if (!htmlFlow) {
    throw new Error(
      'Markdown tag grammar requires the CommonMark htmlFlow construct.'
    );
  }

  return htmlFlow;
};

const createSyntax = (tags: MarkdownTagRegistry) => {
  const isRegistered = (name: string) => tags.has(name);
  const isBlock = (name: string) => tags.get(name) === 'block';

  // Lookahead: `<` or `</`, a registered name, then a tag boundary.
  const registeredTagAhead: Construct = {
    partial: true,
    tokenize(effects, ok, nok) {
      let name = '';
      const nameInside: State = (code) => {
        if (code !== null && isNameContinue(code)) {
          name += charOf(code);
          effects.consume(code);

          return nameInside;
        }
        if (
          !isRegistered(name) ||
          !(
            code === null ||
            code === GT ||
            code === SLASH ||
            isSpace(code) ||
            isLineEnding(code)
          )
        ) {
          return nok(code);
        }
        effects.exit('markdownTagProbe');

        return ok(code);
      };
      const nameStart: State = (code) =>
        isAsciiAlpha(code) ? nameInside(code) : nok(code);
      const afterLt: State = (code) => {
        if (code !== SLASH) return nameStart(code);
        effects.consume(code);

        return nameStart;
      };

      return (code) => {
        effects.enter('markdownTagProbe');
        effects.consume(code);

        return afterLt;
      };
    },
  };

  // A line of only registered block tags is flow. Like a thematic break it
  // may interrupt a paragraph, lazy lines included.
  const flow: Construct = {
    name: 'markdownTagFlow',
    tokenize(effects, ok, nok) {
      const tag: State = (code) =>
        tagStates(effects, afterTag, nok, isBlock, 'markdownTagFlowTag')(code);
      const end: State = (code) => {
        if (code === LT) return tag(code);
        if (code === null || isLineEnding(code)) {
          effects.exit('markdownTagFlow');

          return ok(code);
        }

        return nok(code);
      };
      const whitespace: State = (code) => {
        if (isSpace(code)) {
          effects.consume(code);

          return whitespace;
        }
        effects.exit('whitespace');

        return end(code);
      };
      const afterTag: State = (code) => {
        if (!isSpace(code)) return end(code);
        effects.enter('whitespace');

        return whitespace(code);
      };

      return (code) => {
        effects.enter('markdownTagFlow');

        return tag(code);
      };
    },
  };

  const text: Construct = {
    name: 'markdownTagText',
    tokenize(effects, ok, nok) {
      return tagStates(effects, ok, nok, isRegistered, 'markdownTagText');
    },
  };

  // Registered names never open a raw HTML block, which would otherwise
  // swallow the following lines (`details` and `summary` are HTML block names).
  const guardedHtmlFlow: Construct = {
    concrete: true,
    name: 'markdownTagGuardedHtmlFlow',
    resolveTo(events, context) {
      const htmlFlow = findHtmlFlow(context);

      return htmlFlow.resolveTo ? htmlFlow.resolveTo(events, context) : events;
    },
    tokenize(effects, ok, nok) {
      const run = findHtmlFlow(this).tokenize.call(this, effects, ok, nok);

      return (code) => effects.check(registeredTagAhead, nok, run)(code);
    },
  };

  return {
    disable: { null: ['htmlFlow'] },
    flow: { [LT]: [flow, guardedHtmlFlow] },
    text: { [LT]: text },
  };
};

type Marker = {
  flow: boolean;
  position: Position;
  raw: string;
  tag: TagInfo;
  type: 'markdownTagMarker';
};
type AnyNode = {
  children?: AnyNode[];
  data?: TagData;
  position?: Position;
  type: string;
  value?: string;
};

const toMdxAttributes = (
  attributes: TagInfo['attributes']
): MdxJsxAttribute[] =>
  attributes.map(({ name, value }) => ({
    name,
    type: 'mdxJsxAttribute',
    value:
      value !== null && typeof value === 'object'
        ? { type: 'mdxJsxAttributeValueExpression', value: value.expression }
        : value,
  }));

const createFromMarkdown = () => {
  type CompileContext = {
    enter: (node: unknown, token: Token) => void;
    exit: (token: Token) => void;
    sliceSerialize: (token: Token) => string;
  };
  const marker = (flow: boolean) =>
    function enterMarker(this: CompileContext, token: Token) {
      this.enter(
        {
          flow,
          raw: this.sliceSerialize(token),
          tag: token.plateTag,
          type: 'markdownTagMarker',
        },
        token
      );
    };
  const exit = function (this: CompileContext, token: Token) {
    this.exit(token);
  };

  const closeUnclosed = (element: AnyNode) => {
    const tag = element.data?.markdownTag;
    const last = element.children?.at(-1);

    if (tag) tag.repair = 'unclosed';
    if (last?.position && element.position) {
      element.position = {
        end: { ...last.position.end },
        start: element.position.start,
      };
    }
  };

  // Tags pair among siblings of one container, so an unbalanced tag can never
  // escape its paragraph, list item or block quote.
  const pair = (parent: AnyNode) => {
    if (!parent.children) return;
    const out: AnyNode[] = [];
    const stack: AnyNode[] = [];
    const current = () => stack.at(-1)?.children ?? out;

    for (const child of parent.children) {
      if (child.type !== 'markdownTagMarker') {
        pair(child);
        current().push(child);
        continue;
      }
      const { flow, position, raw, tag } = child as unknown as Marker;

      if (tag.closing) {
        const index = stack.findLastIndex(
          (element) =>
            (element as unknown as MarkdownTagElement).name === tag.name
        );

        if (index === -1) {
          current().push({
            data: { markdownTagRepair: 'unmatched' },
            position,
            type: 'html',
            value: raw,
          });
          continue;
        }
        for (const inner of stack.splice(index + 1).reverse()) {
          closeUnclosed(inner);
        }
        const element = stack.pop();

        if (element?.position) {
          element.position = {
            end: { ...position.end },
            start: element.position.start,
          };
        }
        continue;
      }

      const element = {
        attributes: toMdxAttributes(tag.attributes),
        children: [],
        data: { markdownTag: { open: position, raw } },
        name: tag.name,
        position: { end: { ...position.end }, start: { ...position.start } },
        type: flow ? 'mdxJsxFlowElement' : 'mdxJsxTextElement',
      } as AnyNode;

      current().push(element);
      if (!tag.selfClosing && !HTML_VOID_TAGS.has(tag.name.toLowerCase())) {
        stack.push(element);
      }
    }
    for (const open of stack.reverse()) closeUnclosed(open);
    parent.children = out;
  };

  return {
    enter: { markdownTagFlowTag: marker(true), markdownTagText: marker(false) },
    exit: { markdownTagFlowTag: exit, markdownTagText: exit },
    transforms: [(tree: Root) => void pair(tree as unknown as AnyNode)],
  };
};

const createSourceIndex = (source: string) => {
  const lineStarts = [0];

  for (let index = 0; index < source.length; index++) {
    if (source[index] === '\n') lineStarts.push(index + 1);
  }

  const lineOf = (offset: number) => {
    let low = 0;
    let high = lineStarts.length - 1;

    while (low < high) {
      const middle = Math.ceil((low + high) / 2);

      if ((lineStarts[middle] ?? 0) <= offset) low = middle;
      else high = middle - 1;
    }

    return low;
  };

  return {
    lineEnd: (line: number) => {
      const next = lineStarts[line];

      return next === undefined ? source.length : next - 1;
    },
    lineStart: (line: number) => lineStarts[line - 1] ?? source.length,
    pointAt: (offset: number): Point => {
      const line = lineOf(offset);

      return {
        column: offset - (lineStarts[line] ?? 0) + 1,
        line: line + 1,
        offset,
      };
    },
  };
};

type SourceIndex = ReturnType<typeof createSourceIndex>;

// Legacy MDX output indents children two spaces per nesting level, so depth-2
// content reaches CommonMark's indented-code threshold. Dialect law: the body
// of a registered block element admits fenced code only; an indented code
// block directly inside one is Markdown.
const isIndentedCode = (node: AnyNode, source: string) =>
  node.type === 'code' &&
  node.position?.start.offset !== undefined &&
  !/^[ \t]{0,3}(?:`{3}|~{3})/.test(source.slice(node.position.start.offset));

const stripIndent = (text: string) => {
  let column = 0;
  let index = 0;

  while (index < text.length && column < 4) {
    if (text[index] === ' ') column += 1;
    else if (text[index] === '\t') column += 4 - (column % 4);
    else break;
    index += 1;
  }

  return index;
};

const rereadLegacyIndentation = (
  tree: AnyNode,
  source: string,
  index: SourceIndex,
  parse: (text: string) => Root
) => {
  const reread = (code: AnyNode): AnyNode[] => {
    if (!code.position) return [code];
    const { end, start } = code.position;
    const prefix = start.column - 1;
    const lines: Array<{ removed: number; start: number }> = [];
    const texts: string[] = [];

    for (let { line } = start; line <= end.line; line += 1) {
      const lineStart = index.lineStart(line);
      const rest = source.slice(lineStart + prefix, index.lineEnd(line));
      const removed = prefix + stripIndent(rest);

      lines.push({ removed, start: lineStart });
      texts.push(source.slice(lineStart + removed, index.lineEnd(line)));
    }

    const fragment = parse(texts.join('\n')) as unknown as AnyNode;
    const fragmentStarts = [0];

    for (const text of texts.slice(0, -1)) {
      fragmentStarts.push((fragmentStarts.at(-1) ?? 0) + text.length + 1);
    }
    const remapPoint = (point: Point): Point => {
      const offset = point.offset ?? 0;
      let line = fragmentStarts.length - 1;

      while (line > 0 && (fragmentStarts[line] ?? 0) > offset) line -= 1;
      const origin = lines[line] ?? { removed: prefix, start: 0 };

      return index.pointAt(
        origin.start + origin.removed + (offset - (fragmentStarts[line] ?? 0))
      );
    };
    const remap = (node: AnyNode) => {
      if (node.position) {
        node.position = {
          end: remapPoint(node.position.end),
          start: remapPoint(node.position.start),
        };
      }
      const tagData = node.data?.markdownTag;

      if (tagData) {
        tagData.open = {
          end: remapPoint(tagData.open.end),
          start: remapPoint(tagData.open.start),
        };
      }
      node.children?.forEach(remap);
    };
    const children = fragment.children ?? [];

    children.forEach(remap);

    return children;
  };

  const visit = (node: AnyNode) => {
    if (!node.children) return;
    if (node.type === 'mdxJsxFlowElement') {
      node.children = node.children.flatMap((child) =>
        isIndentedCode(child, source) ? reread(child) : [child]
      );
    }
    node.children.forEach(visit);
  };

  visit(tree);
};

const isWhitespaceText = (node: AnyNode) =>
  node.type === 'text' && (node.value ?? '').trim() === '';

const LEADING_LINE_ENDING = /^[ \t]*\r?\n/;
const TRAILING_LINE_ENDING = /\r?\n[ \t]*$/;

// A line holding only a registered block element is a block, even inside a
// paragraph (`<summary>Title</summary>` followed by body text). A block tag
// anywhere else in phrasing is literal source, never a block in a paragraph.
const normalizeBlocks = (
  tree: AnyNode,
  tags: MarkdownTagRegistry,
  index: SourceIndex
) => {
  const isBlockElement = (node: AnyNode | undefined) =>
    node?.type === 'mdxJsxTextElement' &&
    tags.get((node as unknown as MarkdownTagElement).name ?? '') === 'block';

  const trimText = (node: AnyNode, side: 'end' | 'start'): AnyNode | null => {
    if (node.type !== 'text') return node;
    const text = node.value ?? '';
    const pattern =
      side === 'start' ? LEADING_LINE_ENDING : TRAILING_LINE_ENDING;
    const match = pattern.exec(text);

    if (!match) return node;
    const value =
      side === 'start'
        ? text.slice(match[0].length)
        : text.slice(0, match.index);

    if (!value) return null;
    if (!node.position) return { ...node, value };
    const { end, start } = node.position;

    return {
      ...node,
      position:
        side === 'start'
          ? { end, start: index.pointAt((start.offset ?? 0) + match[0].length) }
          : { end: index.pointAt((end.offset ?? 0) - match[0].length), start },
      value,
    };
  };

  const toFlow = (element: AnyNode): AnyNode => ({
    ...element,
    children:
      (element.children?.length ?? 0) > 0
        ? [
            {
              children: element.children,
              position: element.position,
              type: 'paragraph',
            },
          ]
        : [],
    type: 'mdxJsxFlowElement',
  });

  const splitParagraph = (paragraph: AnyNode): AnyNode[] => {
    const kids = paragraph.children ?? [];
    const startsLine = (at: number) => {
      const previous = kids[at - 1];

      return (
        previous === undefined ||
        (previous.type === 'text' && /\n[ \t]*$/.test(previous.value ?? '')) ||
        (at > 0 && kids.slice(0, at).every(isWhitespaceText))
      );
    };
    const endsLine = (at: number) => {
      const next = kids[at + 1];

      return (
        next === undefined ||
        (next.type === 'text' && /^[ \t]*\r?\n/.test(next.value ?? '')) ||
        kids.slice(at + 1).every(isWhitespaceText)
      );
    };

    if (!kids.some(isBlockElement)) return [paragraph];

    const result: AnyNode[] = [];
    let buffer: AnyNode[] = [];
    let dropLeading = false;
    const flush = () => {
      const tail = buffer.at(-1);

      if (tail) {
        const last = trimText(tail, 'end');

        buffer = last ? [...buffer.slice(0, -1), last] : buffer.slice(0, -1);
      }
      const first = buffer[0]?.position;
      const final = buffer.at(-1)?.position;

      if (buffer.some((child) => !isWhitespaceText(child))) {
        result.push({
          children: buffer,
          position:
            first && final ? { end: final.end, start: first.start } : undefined,
          type: 'paragraph',
        });
      }
      buffer = [];
    };

    kids.forEach((child, at) => {
      if (isBlockElement(child) && startsLine(at) && endsLine(at)) {
        flush();
        result.push(toFlow(child));
        dropLeading = true;

        return;
      }
      const kept = dropLeading ? trimText(child, 'start') : child;

      dropLeading = false;
      if (kept) buffer.push(kept);
    });
    flush();

    return result;
  };

  const demote = (node: AnyNode) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) => {
      demote(child);
      const tag = child.data?.markdownTag;

      if (!isBlockElement(child) || !tag) return [child];
      const open: AnyNode = {
        data: { markdownTagRepair: 'misplaced' },
        position: tag.open,
        type: 'html',
        value: tag.raw,
      };
      const close: AnyNode[] =
        tag.repair === 'unclosed'
          ? []
          : [
              {
                data: {
                  markdownTagClose: true,
                  markdownTagRepair: 'misplaced',
                },
                type: 'html',
                value: `</${(child as unknown as MarkdownTagElement).name}>`,
              },
            ];

      return [open, ...(child.children ?? []), ...close];
    });
  };

  const visit = (node: AnyNode) => {
    if (!node.children) return;
    node.children = node.children.flatMap((child) =>
      child.type === 'paragraph' ? splitParagraph(child) : [child]
    );
    for (const child of node.children) {
      if (
        child.type === 'paragraph' ||
        child.type === 'heading' ||
        child.type === 'tableCell'
      ) {
        demote(child);
      } else {
        visit(child);
      }
    }
  };

  visit(tree);
};

const markUnclosedAtEnd = (tree: AnyNode, source: string) => {
  const end = source.trimEnd().length;
  const visit = (node: AnyNode) => {
    const tag = node.data?.markdownTag;

    if (tag?.repair === 'unclosed' && (node.position?.end.offset ?? 0) >= end) {
      tag.atEnd = true;
    }
    node.children?.forEach(visit);
  };

  visit(tree);
};

type ToMarkdownState = {
  containerFlow: (node: unknown, info: unknown) => string;
  handle: (
    node: unknown,
    parent: unknown,
    state: ToMarkdownState,
    info: unknown
  ) => string;
  containerPhrasing: (node: unknown, info: unknown) => string;
  createTracker: (info: unknown) => {
    current: () => Record<string, unknown>;
    move: (value: string) => string;
  };
  enter: (construct: string) => () => void;
};

const serializeAttributes = (
  attributes: ReadonlyArray<MdxJsxAttribute | MdxJsxExpressionAttribute>
) =>
  attributes
    .map((attribute) => {
      if (attribute.type !== 'mdxJsxAttribute') return '';
      const { name, value } = attribute;

      if (value === null || value === undefined) return ` ${name}`;
      const text = typeof value === 'object' ? value.value : value;

      return ` ${name}="${escapeMarkdownTagAttribute(text)}"`;
    })
    .join('');

// Blank lines around block children and no indentation, so nesting never
// reaches CommonMark's indented-code threshold. A block holding one
// single-line paragraph stays on one line (`<summary>Title</summary>`); the
// reader's line rule reads it back as a block.
const toMarkdown = {
  handlers: {
    mdxJsxFlowElement(
      node: MdxJsxFlowElement,
      _parent: unknown,
      state: ToMarkdownState,
      info: unknown
    ) {
      const open = `<${node.name}${serializeAttributes(node.attributes)}`;

      if (node.children.length === 0) return `${open} />`;
      const exit = state.enter('mdxJsxFlowElement');
      const [only] = node.children;

      if (node.children.length === 1 && only?.type === 'paragraph') {
        const line = state.handle(only, node, state, {
          ...(info as object),
          after: '<',
          before: '>',
        });

        if (!line.includes('\n')) {
          exit();

          return `${open}>${line}</${node.name}>`;
        }
      }
      const body = state.containerFlow(node, info);

      exit();

      return `${open}>\n\n${body}\n\n</${node.name}>`;
    },
    mdxJsxTextElement(
      node: MdxJsxTextElement,
      _parent: unknown,
      state: ToMarkdownState,
      info: unknown
    ) {
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
};

/**
 * Remark plugin installing registered Plate tags. The Markdown runtime
 * installs it with the registry compiled from feature mappings.
 */
export const remarkMarkdownTags: UnifiedPlugin<
  [Readonly<{ tags: MarkdownTagRegistry }>],
  Root
> = function (this: Processor, { tags }) {
  const data = this.data() as {
    fromMarkdownExtensions?: unknown[];
    micromarkExtensions?: unknown[];
    toMarkdownExtensions?: unknown[];
  };
  (data.micromarkExtensions ??= []).push(createSyntax(tags));
  (data.fromMarkdownExtensions ??= []).push(createFromMarkdown());
  (data.toMarkdownExtensions ??= []).push(toMarkdown);

  return (tree, file) => {
    const source = String(file.value);
    const index = createSourceIndex(source);

    rereadLegacyIndentation(
      tree as unknown as AnyNode,
      source,
      index,
      (text) => this.parse(text) as Root
    );
    normalizeBlocks(tree as unknown as AnyNode, tags, index);
    markUnclosedAtEnd(tree as unknown as AnyNode, source);
  };
};

/**
 * Serialize-side counterpart of `remarkMarkdownTags`: installs only the tag
 * writer, so parse-only normalization never rewrites encoder output.
 */
export const remarkMarkdownTagWriter: UnifiedPlugin<[], Root> = function (
  this: Processor
) {
  const data = this.data() as { toMarkdownExtensions?: unknown[] };

  (data.toMarkdownExtensions ??= []).push(toMarkdown);
};

/** Streaming preview only: hide a trailing `<…` that may still become a tag. */
export const trimIncompleteMarkdownTag = (
  source: string,
  tags: MarkdownTagRegistry
) => {
  const lt = source.lastIndexOf('<');

  if (lt === -1 || source.includes('>', lt) || source.includes('\n', lt)) {
    return source;
  }
  const match = /^<\/?([A-Za-z][\w-]*)?/.exec(source.slice(lt));

  if (!match) return source;
  const name = match[1] ?? '';
  const typingName = match[0].length === source.length - lt;
  const couldBeTag = typingName
    ? [...tags.keys()].some((tag) => tag.startsWith(name))
    : tags.has(name);

  return couldBeTag ? source.slice(0, lt) : source;
};
