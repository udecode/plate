import type { Element, NodeEntry, Path } from '@platejs/slate';

import { ElementApi, NodeApi, PathApi } from '@platejs/slate';
import type { SlateEditor } from 'platejs';

import { isDefined, KEYS } from 'platejs';

import type { GetSiblingListOptions } from '../queries/getSiblingList';

import { normalizeListNotIndented } from './normalizeListNotIndented';
import { normalizeListStart } from './normalizeListStart';

const isPath = (value: NodeEntry<Element> | Path): value is Path =>
  typeof value[0] === 'number';

const getElementEntry = (
  editor: SlateEditor,
  path: Path
): NodeEntry<Element> | undefined => {
  const node = NodeApi.getIf(editor as any, path);

  if (!ElementApi.isElement(node)) return;

  return [node, path];
};

const getNextElementEntry = <N extends Element = Element>(
  editor: SlateEditor,
  entry: NodeEntry<Element>,
  options?: Partial<GetSiblingListOptions<N>>
): NodeEntry<Element> | undefined => {
  const nextEntry = options?.getNextEntry?.(entry);

  if (nextEntry && ElementApi.isElement(nextEntry[0])) {
    return nextEntry as NodeEntry<Element>;
  }

  return getElementEntry(editor, PathApi.next(entry[1]));
};

const isListCandidate = (node: Element) => {
  const nodeProps = node as Record<string, unknown>;

  return (
    isDefined(nodeProps[KEYS.indent]) ||
    isDefined(nodeProps[KEYS.listChecked]) ||
    isDefined(nodeProps[KEYS.listStart]) ||
    isDefined(nodeProps[KEYS.listType])
  );
};

export const normalizeListSequence = <N extends Element = Element>(
  editor: SlateEditor,
  start: NodeEntry<Element> | Path,
  options?: Partial<GetSiblingListOptions<N>>
) => {
  let entry = isPath(start) ? getElementEntry(editor, start) : start;

  while (entry && isListCandidate(entry[0])) {
    normalizeListNotIndented(editor, entry);

    const currentEntry = getElementEntry(editor, entry[1]) ?? entry;

    normalizeListStart(editor, currentEntry, options);

    entry = getNextElementEntry(editor, currentEntry, options);
  }
};
