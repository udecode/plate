import type { Path } from '../../interfaces/path';
import { getDefined } from '../../internal/get-defined';
import type { DocumentIndex } from './document-index';
import { applyPropertyModifications, type RootChange } from './root-change';
import {
  isElementNode,
  isTextNode,
  type JsonNode,
  type JsonToken,
  PreparedTokenSlice,
  tokensEqual,
} from './tokens';
import type { PropertyModification } from './transform';

export type Retraction = Readonly<{
  blocks: readonly number[];
  characters: ReadonlyArray<Readonly<{ from: number; path: Path; to: number }>>;
  elements: readonly Path[];
}>;

export type EmptyTextRead = (
  ancestors: ReadonlyArray<Readonly<Record<string, unknown>>>
) => Readonly<Record<string, unknown>> | null;

const blockAt = (base: DocumentIndex, position: number) => {
  let low = 0;
  let high = base.size - 1;

  while (low < high) {
    const middle = (low + high + 1) >> 1;

    if (base.childPosition([], middle) <= position) low = middle;
    else high = middle - 1;
  }

  return low;
};

const pathKey = (path: Path) => path.join(',');

const parentAt = (base: DocumentIndex, position: number): Path => {
  const last = base.openContextAt(position).at(-1);

  if (!last) return [];

  return last.kind === 'element' && last.from < position && position < last.to
    ? last.path
    : last.path.slice(0, -1);
};

const holdsLetterOrElement = (tokens: readonly JsonToken[]) =>
  tokens.some((token) =>
    token.kind === 'text' ? token.text.length > 0 : token.nodeKind !== 'text'
  );

export const retractionOf = (
  base: DocumentIndex,
  change: RootChange,
  readEmpty: EmptyTextRead
): Retraction | null => {
  const modified = new Map<number, readonly PropertyModification[]>();
  let from = 0;

  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);

    if (change.sections[index + 1] === -2) {
      modified.set(
        from,
        change.data[index / 2] as readonly PropertyModification[]
      );
    }
    from += length;
  }

  const propsAt = (path: Path) => {
    const { children: _children, ...props } = base.node(path);
    const modifications = modified.get(base.nodeRange(path).from);

    return modifications
      ? applyPropertyModifications(props, modifications)
      : props;
  };
  const storesText = (insert: PreparedTokenSlice, position: number) => {
    if (!insert.tokens.some((token) => token.kind === 'open')) return true;

    const parent = parentAt(base, position);

    if (parent.length === 0) return false;

    const node = base.node(parent);

    if (isElementNode(node) && node.children.some(isTextNode)) return true;

    const read = readEmpty(
      parent.map((_, depth) => propsAt(parent.slice(0, parent.length - depth)))
    );
    const expected = read && PreparedTokenSlice.fromNodes([read as JsonNode]);

    return (
      !!expected &&
      expected.tokens.length === insert.tokens.length &&
      expected.tokens.every((token, at) =>
        tokensEqual(token, getDefined(insert.tokens[at]))
      )
    );
  };

  const elements: Path[] = [];
  const characters: Array<{ from: number; path: Path; to: number }> = [];
  const touched = new Set<number>();

  from = 0;
  for (let index = 0; index < change.sections.length; index += 2) {
    const length = getDefined(change.sections[index]);
    const inserted = getDefined(change.sections[index + 1]);

    if (inserted !== -1) {
      if (base.size === 0) return null;
      const last = blockAt(base, Math.max(from, from + length - 1));

      for (let block = blockAt(base, from); block <= last; block += 1) {
        touched.add(block);
      }
    }
    if (inserted >= 0) {
      const insert =
        (change.data[index / 2] as PreparedTokenSlice | null) ??
        PreparedTokenSlice.empty;

      if (holdsLetterOrElement(insert.tokens) || !storesText(insert, from)) {
        return null;
      }

      const open: number[] = [];
      let at = from;

      for (const token of length > 0
        ? base.slice(from, from + length).tokens
        : []) {
        if (token.kind === 'text') {
          if (open.length === 0 && token.text.length > 0) {
            const text = getDefined(base.textAt(at));
            const offset = at - text.contentFrom;
            const previous = characters.at(-1);

            if (
              previous &&
              previous.to === offset &&
              pathKey(previous.path) === pathKey(text.path)
            ) {
              previous.to += token.text.length;
            } else {
              characters.push({
                from: offset,
                path: text.path,
                to: offset + token.text.length,
              });
            }
          }
          at += token.text.length;
          continue;
        }
        if (token.nodeKind === 'element') {
          if (token.kind === 'open') open.push(at);
          else {
            const opened = open.pop();

            if (opened === undefined) return null;
            if (open.length === 0) {
              elements.push(getDefined(base.nodeStartingAt(opened)).path);
            }
          }
        }
        at += 1;
      }
      if (open.length > 0) return null;
    }
    from += length;
  }

  return {
    blocks: [...touched].sort((left, right) => left - right),
    characters,
    elements,
  };
};
