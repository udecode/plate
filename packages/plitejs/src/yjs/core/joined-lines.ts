import * as Y from 'yjs';

import { YJS_JOINED_AFTER_KEY, YJS_JOINED_END_KEY } from './keys';

type JoinedLineKey = typeof YJS_JOINED_AFTER_KEY | typeof YJS_JOINED_END_KEY;

type JoinedLines = {
  /** How far each client's structs have been read. */
  readonly clocks: Map<number, number>;
  readonly lines: Map<string, Set<Y.XmlElement>>;
  readonly ends: Map<string, Set<Y.XmlElement>>;
  readonly named: string[];
  /** Whether a transaction ended since the structs were last read. */
  stale: boolean;
};

const joinedLinesByDoc = new WeakMap<Y.Doc, JoinedLines>();

const linesBy = (
  known: JoinedLines,
  key: JoinedLineKey
): Map<string, Set<Y.XmlElement>> =>
  key === YJS_JOINED_AFTER_KEY ? known.lines : known.ends;

const noteLine = (
  known: JoinedLines,
  line: Y.XmlElement,
  key: JoinedLineKey,
  id: string
): void => {
  const byId = linesBy(known, key);
  const lines = byId.get(id);

  if (lines?.has(line)) return;
  if (lines) lines.add(line);
  else byId.set(id, new Set([line]));
  known.named.push(id);
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
        (struct.parentSub !== YJS_JOINED_AFTER_KEY &&
          struct.parentSub !== YJS_JOINED_END_KEY) ||
        !(struct.parent instanceof Y.XmlElement)
      ) {
        continue;
      }

      const id = struct.parent.getAttribute(struct.parentSub);

      if (typeof id === 'string') {
        noteLine(known, struct.parent, struct.parentSub, id);
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
      ends: new Map(),
      lines: new Map(),
      named: [],
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
  key: JoinedLineKey,
  id: string
): void => {
  if (line.doc !== null) noteLine(joinedLinesOf(line.doc), line, key, id);
};

const readJoinedYjsLines = (doc: Y.Doc): JoinedLines => {
  const known = joinedLinesOf(doc);

  if (known.stale) {
    readNewStructs(doc, known);
    known.stale = false;
  }

  return known;
};

export const hasJoinedYjsLines = (doc: Y.Doc | null): boolean => {
  if (doc === null) return false;

  const known = readJoinedYjsLines(doc);

  return known.lines.size > 0 || known.ends.size > 0;
};

type AppendOnlyIds = Readonly<{
  length: number;
  [index: number]: string;
}>;

export const joinedYjsIds = (doc: Y.Doc): AppendOnlyIds =>
  readJoinedYjsLines(doc).named;

const liveJoinedYjsLines = (
  doc: Y.Doc | null,
  key: JoinedLineKey,
  id: string
): Y.XmlElement[] => {
  if (doc === null) return [];

  const byId = linesBy(readJoinedYjsLines(doc), key);
  const lines = byId.get(id);

  if (lines === undefined) return [];

  const live: Y.XmlElement[] = [];

  for (const line of lines) {
    if (line.getAttribute(key) === id && line._item?.deleted !== true) {
      live.push(line);
    } else {
      lines.delete(line);
    }
  }
  if (lines.size === 0) byId.delete(id);

  return live;
};

export const getJoinedYjsLines = (
  doc: Y.Doc | null,
  anchorId: string
): Y.XmlElement[] => liveJoinedYjsLines(doc, YJS_JOINED_AFTER_KEY, anchorId);

export const getYjsLinesJoinedAtEnd = (
  doc: Y.Doc | null,
  lineId: string
): Y.XmlElement[] => liveJoinedYjsLines(doc, YJS_JOINED_END_KEY, lineId);
