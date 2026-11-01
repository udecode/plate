import * as Y from 'yjs';

import { YJS_JOINED_AFTER_KEY } from './keys';

type JoinedLines = {
  /** How far each client's structs have been read. */
  readonly clocks: Map<number, number>;
  readonly lines: Map<string, Set<Y.XmlElement>>;
  /** Whether a transaction ended since the structs were last read. */
  stale: boolean;
};

const joinedLinesByDoc = new WeakMap<Y.Doc, JoinedLines>();

const noteLine = (
  known: JoinedLines,
  line: Y.XmlElement,
  anchorId: string
): void => {
  const lines = known.lines.get(anchorId);

  if (lines) lines.add(line);
  else known.lines.set(anchorId, new Set([line]));
};

const readNewStructs = (doc: Y.Doc, known: JoinedLines): void => {
  for (const [client, structs] of doc.store.clients) {
    const from = known.clocks.get(client) ?? 0;
    const to = Y.getState(doc.store, client);

    if (from >= to) continue;
    for (let i = Y.findIndexSS(structs, from); i < structs.length; i++) {
      const struct = structs[i];

      if (
        !(struct instanceof Y.Item) ||
        struct.parentSub !== YJS_JOINED_AFTER_KEY ||
        !(struct.parent instanceof Y.XmlElement)
      ) {
        continue;
      }

      const anchorId = struct.parent.getAttribute(YJS_JOINED_AFTER_KEY);

      if (typeof anchorId === 'string') {
        noteLine(known, struct.parent, anchorId);
      }
    }
    known.clocks.set(client, to);
  }
};

const joinedLinesOf = (doc: Y.Doc): JoinedLines => {
  let known = joinedLinesByDoc.get(doc);

  if (known === undefined) {
    const created: JoinedLines = {
      clocks: new Map(),
      lines: new Map(),
      stale: true,
    };

    // A peer's update, an undo or a load can write the attribute, and each
    // runs in a transaction whose observers read only after this event.
    doc.on('beforeObserverCalls', () => {
      created.stale = true;
    });
    joinedLinesByDoc.set(doc, created);
    known = created;
  }

  return known;
};

/**
 * Notes a line this binding marks inside an open transaction, which a read
 * before that transaction ends must see.
 */
export const noteJoinedYjsLine = (
  line: Y.XmlElement,
  anchorId: string
): void => {
  if (line.doc !== null) noteLine(joinedLinesOf(line.doc), line, anchorId);
};

const readJoinedYjsLines = (doc: Y.Doc): JoinedLines => {
  const known = joinedLinesOf(doc);

  if (known.stale) {
    readNewStructs(doc, known);
    known.stale = false;
  }

  return known;
};

/**
 * Whether an element of `doc` may carry `yjs:joined-after`. A read that finds
 * every line of an anchor gone forgets that anchor.
 */
export const hasJoinedYjsLines = (doc: Y.Doc | null): boolean =>
  doc !== null && readJoinedYjsLines(doc).lines.size > 0;

/**
 * The live elements of `doc` whose `yjs:joined-after` names `anchorId`. Each
 * write of the attribute adds a struct, so a read after a transaction ended
 * reads only the structs added since the last read.
 */
export const getJoinedYjsLines = (
  doc: Y.Doc | null,
  anchorId: string
): Y.XmlElement[] => {
  if (doc === null) return [];

  const known = readJoinedYjsLines(doc);
  const lines = known.lines.get(anchorId);

  if (lines === undefined) return [];

  const live: Y.XmlElement[] = [];

  for (const line of lines) {
    if (
      line.getAttribute(YJS_JOINED_AFTER_KEY) === anchorId &&
      line._item?.deleted !== true
    ) {
      live.push(line);
    } else {
      lines.delete(line);
    }
  }
  if (lines.size === 0) known.lines.delete(anchorId);

  return live;
};
