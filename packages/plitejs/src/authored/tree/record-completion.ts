import {
  createInternalDocumentChange,
  type DocumentChange,
  getInternalDocumentRootChange,
  valueRootIndex,
  valueRootNodes,
} from '../../core/change/document-change';
import type { DocumentIndex, NodeList } from '../../core/change/document-index';
import { type JsonRecord, jsonEqual } from '../../core/change/json';
import {
  RootChange,
  type RootChangeSection,
} from '../../core/change/root-change';
import {
  encodeNodes,
  type JsonEditorValue,
  type JsonNode,
} from '../../core/change/tokens';
import { getEditorSchema } from '../../core/editor-runtime';
import { completeChildrenAt } from '../../core/representation';
import type { AnyEditor as Editor } from '../../interfaces/editor';
import { type Element, ElementApi } from '../../interfaces/element';
import type { Descendant } from '../../interfaces/node';
import { getDefined } from '../../internal/get-defined';
import type { Dependencies } from '../facts/dependencies';
import { isEditingChange } from '../facts/editing';
import { type FormatTag, recordFormats, type Standing } from './layers';
import {
  AUTHORED_MARKS_KEY,
  type AuthoredMark,
  readAuthoredMarks,
  readMembers,
  withMembers,
} from './marks';
import { type ProposedChild, proposedChildren, proposedHost } from './proposed';

type Mark = Readonly<{
  at: number;
  author: string;
  change: string;
  inc?: string;
}>;

export type RecordCompletionInput = Readonly<{
  after: JsonEditorValue;
  before: JsonEditorValue;
  /** The recorded change from `before` to `after`. */
  change: DocumentChange;
  dependencies: Dependencies;
  editor: Editor;
  /** The indexes of `after`, by root. */
  indexes: ReadonlyMap<string, DocumentIndex>;
  mark: Mark;
  standing: Standing;
  commitWriteId: () => string;
}>;

export type RecordCompletion = Readonly<{
  change: DocumentChange;
  /** Built elements an element's maximum leaves no room for beside its struck content. */
  deferred: number;
  indexes: ReadonlyMap<string, DocumentIndex>;
}>;

type Edit =
  | Readonly<{ kind: 'insert'; node: JsonNode; path: readonly number[] }>
  | Readonly<{
      kind: 'keep';
      node: JsonNode;
      path: readonly number[];
      props: JsonRecord;
    }>;

/** A proposed element before the change, where it now starts. */
type Placed = Readonly<{
  beforeIndexOf: number;
  node: JsonNode;
  path: readonly number[];
}>;

const isText = (node: JsonNode) => typeof node.text === 'string';

const nodeAt = (children: NodeList, path: readonly number[]) => {
  let node: JsonNode | undefined;
  let level = children;

  for (const index of path) {
    node = level.at(index);
    level = node?.children ?? [];
  }

  return node;
};

const propsOf = (node: JsonRecord) => {
  const {
    [AUTHORED_MARKS_KEY]: _marks,
    children: _children,
    text: _text,
    ...props
  } = node;

  return props;
};

const withoutMarks = (node: JsonNode) => {
  const { [AUTHORED_MARKS_KEY]: _marks, ...rest } = node;

  return rest;
};

const shapeOf = (nodes: readonly Descendant[]) =>
  JSON.stringify(nodes, (key, value) =>
    key === AUTHORED_MARKS_KEY ? undefined : value
  );

/**
 * The other pending changes whose acceptance a fill of `host` can rest on, as
 * insertions of those changes: `reshapes` holds a change of the host's type,
 * an unwrap the host's children are lifted through and a join among them,
 * and `deletions` holds each other change that deletes some of them. An
 * inserted fill carries each change it rests on, as it carries its ancestors'
 * insertions, so rejecting any of them removes it, and a decision builds
 * whatever the host then lacks.
 */
const restingChanges = (
  host: JsonNode | null,
  lifted: readonly JsonNode[],
  children: NodeList,
  isOwn: (mark: Readonly<{ change: string }>) => boolean
) => {
  const reshaping = [
    ...readAuthoredMarks(host).filter(
      (mark) =>
        mark.kind === 'format' &&
        mark.key === 'type' &&
        !isEditingChange(mark.change)
    ),
    ...lifted.flatMap((node) =>
      readAuthoredMarks(node).filter((mark) => mark.kind === 'unwrap')
    ),
  ];
  const insertionsOf = (marks: readonly AuthoredMark[]) => {
    const byChange = new Map<string, AuthoredMark>();

    for (const { at, author, change, inc } of marks) {
      if (!isOwn({ change }) && !byChange.has(change)) {
        byChange.set(change, {
          at,
          author,
          change,
          ...(inc === undefined ? {} : { inc }),
          kind: 'insert',
        });
      }
    }

    return [...byChange.values()];
  };
  const deleting: AuthoredMark[] = [];
  const scan = (level: NodeList) => {
    level.forEach((child) => {
      const childMarks = readAuthoredMarks(child);

      deleting.push(...childMarks.filter((mark) => mark.kind === 'delete'));
      reshaping.push(...childMarks.filter((mark) => mark.kind === 'join'));
      if (childMarks.some((mark) => mark.kind === 'unwrap')) {
        scan(child.children ?? []);
      }
    });
  };

  scan(children);

  return {
    deletions: insertionsOf(deleting),
    reshapes: insertionsOf(reshaping),
  };
};

/**
 * Each element whose proposed children the change touched, once, as its path
 * after the change and before it, with the elements whose pending unwraps
 * lift the touched children into it. A changed range keeps the elements open
 * at its ends on both sides, so their paths pair by depth.
 */
const changedHosts = (
  rootChange: RootChange,
  before: DocumentIndex,
  after: DocumentIndex,
  afterChildren: NodeList
) => {
  const hosts = new Map<
    string,
    Readonly<{
      after: readonly number[];
      before: readonly number[] | null;
      lifted: JsonNode[];
    }>
  >([['', { after: [], before: [], lifted: [] }]]);

  rootChange.iterChangedRanges((fromA, toA, fromB, toB) => {
    for (const [positionA, positionB] of [
      [fromA, fromB],
      [toA, toB],
    ] as const) {
      const opened = after
        .openContextAt(Math.min(positionB, after.length))
        .filter((range) => range.kind !== 'text');
      const openedBefore = before
        .openContextAt(Math.min(positionA, before.length))
        .filter((range) => range.kind !== 'text');

      opened.forEach((range, depth) => {
        const path = proposedHost(afterChildren, range.path);

        if (!path) return;

        const lifted = range.path
          .slice(path.length)
          .map((_, at) =>
            nodeAt(afterChildren, range.path.slice(0, path.length + at + 1))
          )
          .filter((node) => node !== undefined);
        const host = hosts.get(path.join('.'));

        if (host) {
          host.lifted.push(
            ...lifted.filter((node) => !host.lifted.includes(node))
          );
        } else {
          hosts.set(path.join('.'), {
            after: path,
            before: openedBefore[depth]?.path.slice(0, path.length) ?? null,
            lifted,
          });
        }
      });
    }
  });

  return [...hosts.values()];
};

/**
 * The fills Editing's completion builds for each element a suggestion
 * shortened, read against the proposed children: the children Editing holds
 * once every pending change is accepted. A removed element of the type a fill
 * needs stays in place, with only its content struck, when keeping it there
 * gives exactly the children Editing's completion gives; any other fill is
 * inserted as part of the change, under the insert marks of the element it
 * fills and that element's ancestors, so rejecting either removes it.
 */
export const completeProposed = (
  input: RecordCompletionInput
): RecordCompletion | null => {
  const schema = getEditorSchema(input.editor);
  const changes = new Map<string, RootChange>();
  const indexes = new Map(input.indexes);
  const insertMark: AuthoredMark = { ...input.mark, kind: 'insert' };
  const isOwn = (mark: Readonly<{ change: string }>) =>
    mark.change === input.mark.change;
  let deferred = 0;

  for (const [root, index] of input.indexes) {
    const rootChange = getInternalDocumentRootChange(input.change, root);

    if (!rootChange || rootChange.empty) continue;

    const afterChildren = valueRootNodes(input.after, root);
    const beforeChildren = valueRootNodes(input.before, root);
    const beforeIndex = valueRootIndex(input.before, root);
    const startAfter = (path: readonly number[]) =>
      rootChange.mapPos(beforeIndex.nodeRange(path).from, 1, 'after');
    const edits: Edit[] = [];

    for (const {
      after: hostPath,
      before: beforeHostPath,
      lifted,
    } of changedHosts(rootChange, beforeIndex, index, afterChildren)) {
      const host =
        hostPath.length === 0 ? null : nodeAt(afterChildren, hostPath);
      const content = host
        ? schema.getElementContent(String(host.type))
        : schema.getRootContent(root);

      // Without a prefix, completion builds an element only below a
      // minimum; an empty text it builds is the resolver's.
      if (!content || (!content.prefix && content.min === 0)) continue;

      const hostChildren = host?.children ?? afterChildren;

      // A host the change created holds what Editing inserted; a host it kept
      // still starts where it started.
      if (
        !beforeHostPath ||
        (hostPath.length > 0 &&
          startAfter(beforeHostPath) !== index.nodeRange(hostPath).from)
      ) {
        continue;
      }

      // Blocks never merge, so a block host's minimum and prefix are known
      // from its first children.
      const limit =
        content.allowsText || content.allowsUnknownElements
          ? Number.POSITIVE_INFINITY
          : Math.max(content.min, content.prefix?.length ?? 0) + 1;
      const after = proposedChildren(afterChildren, hostPath, limit);
      const beforeEntries = proposedChildren(
        beforeChildren,
        beforeHostPath,
        limit
      );
      const before = beforeEntries.map(({ node }) => node);
      // Where each proposed element now starts, or null once the change
      // deleted it outright.
      const moved = beforeEntries.map(
        ({ node, path }, beforeIndexOf): Placed | null | undefined => {
          if (isText(node)) return undefined;

          const at = startAfter(path);
          const entry = at === null ? null : index.nodeStartingAt(at);
          const now = entry ? nodeAt(afterChildren, entry.path) : undefined;

          return entry && now
            ? { beforeIndexOf, node: now, path: entry.path }
            : null;
        }
      );
      const ownMark = (node: JsonNode, kind: 'delete' | 'join') =>
        readAuthoredMarks(node).some(
          (mark) => mark.kind === kind && isOwn(mark)
        );
      const markedNow = (
        item: Placed | null | undefined,
        kind: 'delete' | 'join'
      ): item is Placed =>
        !!item &&
        ownMark(item.node, kind) &&
        !ownMark(getDefined(before[item.beforeIndexOf]), kind);
      // The elements this transaction struck, where they stay, a child a
      // pending unwrap lifts included: an element struck by an earlier
      // transaction of the same change is not a shell.
      const struckNow = moved.filter((item) => markedNow(item, 'delete'));
      // Typing, Enter and marks remove no proposed child: a removal deletes
      // a child element outright or marks one deleted or joined, or leaves
      // fewer runs of text, which count toward a minimum as one child each.
      const removes =
        struckNow.length > 0 ||
        textRuns(after.map(({ node }) => node)) <
          textRuns(beforeEntries.map(({ node }) => node)) ||
        moved.includes(null) ||
        moved.some((item) => markedNow(item, 'join'));

      if (!removes) continue;

      const site = hostPath
        .map((_, depth) => nodeAt(afterChildren, hostPath.slice(0, depth + 1)))
        .filter((node): node is Element => ElementApi.isElement(node))
        .reverse();
      // A text's marks are not formatting, so they must not keep it from
      // merging with its neighbours.
      const entryOf = new Map<Descendant, ProposedChild>();
      const inputs = after.map((entry) => {
        const node = (
          isText(entry.node) ? withoutMarks(entry.node) : entry.node
        ) as Descendant;

        entryOf.set(node, entry);

        return node;
      });
      const complete = (
        children: readonly Descendant[],
        vacated?: (slot: number, candidate: Descendant) => boolean
      ) => completeChildrenAt(input.editor, site, children, root, vacated);
      const beforeNodes = before as readonly Descendant[];
      // As Editing's local pass, a prefix candidate the change moved up from
      // a later child takes a fresh slot.
      const vacated = (slot: number, candidate: Descendant) =>
        beforeNodes[slot] !== candidate &&
        beforeNodes.includes(candidate, slot + 1);
      const completion = complete(inputs, vacated);

      if (completion.built.length === 0) continue;

      const used = new Set<JsonNode>();
      const { deletions, reshapes } = restingChanges(
        host ?? null,
        lifted,
        hostChildren,
        isOwn
      );
      const ancestorMarks = site.flatMap((node) =>
        input.dependencies.marks(node).filter((mark) => mark.kind === 'insert')
      );
      const proposedWith = (placed: readonly ProposedChild[]) => {
        const nodes = [...inputs];

        for (const item of [...placed].sort((a, b) =>
          comparePaths(b.path, a.path)
        )) {
          const ahead = after.findIndex(
            (entry) => comparePaths(entry.path, item.path) > 0
          );

          nodes.splice(
            ahead === -1 ? inputs.length : ahead,
            0,
            (isText(item.node)
              ? withoutMarks(item.node)
              : item.node) as Descendant
          );
        }

        return nodes;
      };
      const keeps = (shell: Placed, node: Descendant) =>
        shapeOf(
          complete(proposedWith([{ node, path: shell.path }])).children
        ) === shapeOf(completion.children);
      let inserted = 0;

      for (const built of completion.built) {
        const node = built.node as JsonNode;
        const prefix = built.slot !== null;
        const rests = prefix ? reshapes : [...reshapes, ...deletions];
        // A kept element cannot depend on another change, so a fill that
        // rests on one is inserted.
        const shell =
          rests.length === 0
            ? struckNow.find(
                (item) => !used.has(item.node) && item.node.type === node.type
              )
            : undefined;
        if (shell && keeps(shell, built.node)) {
          used.add(shell.node);
          // A fill placed after this one goes after the kept element.
          entryOf.set(getDefined(completion.sources[built.index]), {
            node: shell.node,
            path: shell.path,
          });
          edits.push({
            kind: 'keep',
            node: shell.node,
            path: shell.path,
            props: propsOf(node),
          });
          continue;
        }
        if (
          content.max !== null &&
          hostChildren.length + inserted + 1 > content.max
        ) {
          deferred += 1;
          continue;
        }

        const [own, ...others] = [
          insertMark,
          ...ancestorMarks,
          ...rests,
        ].filter(
          (mark, at, all) =>
            all.findIndex((other) => other.change === mark.change) === at
        );

        inserted += 1;
        edits.push({
          kind: 'insert',
          node: input.dependencies.throughout(withoutMarks(node), [
            ...others,
            getDefined(own),
          ]),
          path: insertionPath(
            completion.sources,
            built.index,
            entryOf,
            hostPath,
            hostChildren.length,
            prefix
          ),
        });
      }
    }

    if (edits.length === 0) continue;

    const kept = new Map(
      edits.flatMap((edit) =>
        edit.kind === 'keep'
          ? [
              [
                edit,
                keptShell(edit.node, edit.props, {
                  isOwn,
                  mark: input.mark,
                  standing: input.standing,
                  commitWriteId: input.commitWriteId,
                }),
              ] as const,
            ]
          : []
      )
    );
    const sections: RootChangeSection[] = edits.map((edit) =>
      edit.kind === 'keep'
        ? {
            from: index.nodeRange(edit.path).from,
            properties: getDefined(kept.get(edit)).delta,
          }
        : {
            from: index.childPosition(
              edit.path.slice(0, -1),
              edit.path.at(-1) ?? 0
            ),
            insert: encodeNodes([edit.node]).slice,
          }
    );
    // Editing the index in place skips the rebuild applying the change does,
    // and the deepest, latest insertion goes first so earlier paths hold;
    // of two at one path, the later goes first, so the earlier ends ahead
    // of it as the change places them.
    let edited = index;

    for (const [edit, shell] of kept) {
      edited = edited.withExactNodeProperties(edit.path, shell.props);
    }
    for (const edit of edits
      .filter((item) => item.kind === 'insert')
      .sort(
        (a, b) =>
          comparePaths(b.path, a.path) || edits.indexOf(b) - edits.indexOf(a)
      )) {
      edited = edited.withInsertedNode(edit.path, edit.node);
    }
    changes.set(root, RootChange.create(index, sections));
    indexes.set(root, edited);
  }

  if (changes.size === 0 && deferred === 0) return null;

  return { change: createInternalDocumentChange(changes), deferred, indexes };
};

/**
 * Where a built element goes in the review tree: a prefix fill right after
 * the proposed child completion puts before it, any other fill right before
 * the proposed child completion puts after it.
 */
const insertionPath = (
  completed: readonly Descendant[],
  at: number,
  entryOf: ReadonlyMap<Descendant, ProposedChild>,
  hostPath: readonly number[],
  hostLength: number,
  prefix: boolean
): readonly number[] => {
  if (prefix) {
    const previous = completed
      .slice(0, at)
      .reverse()
      .map((node) => entryOf.get(node))
      .find((entry) => entry !== undefined);

    return previous
      ? [...previous.path.slice(0, -1), (previous.path.at(-1) ?? -1) + 1]
      : [...hostPath, 0];
  }

  const next = completed
    .slice(at + 1)
    .map((node) => entryOf.get(node))
    .find((entry) => entry !== undefined);

  return next ? next.path : [...hostPath, hostLength];
};

/** How many text nodes `nodes` hold once neighbouring texts merge. */
const textRuns = (nodes: readonly JsonNode[]) =>
  nodes.filter(
    (node, at) => isText(node) && !(at > 0 && isText(getDefined(nodes[at - 1])))
  ).length;

const comparePaths = (a: readonly number[], b: readonly number[]) => {
  for (let depth = 0; depth < Math.min(a.length, b.length); depth += 1) {
    const order = getDefined(a[depth]) - getDefined(b[depth]);

    if (order !== 0) return order;
  }

  return a.length - b.length;
};

/**
 * A removed element kept as a fill: the change withdraws its own deletion of
 * the element, leaving its content struck, and records a format tag for each
 * property the built element holds differently. Returns that property delta
 * and the element's properties after it.
 */
const keptShell = (
  shell: JsonNode,
  props: JsonRecord,
  options: Readonly<{
    isOwn: (mark: Readonly<{ change: string }>) => boolean;
    mark: Mark;
    standing: Standing;
    commitWriteId: () => string;
  }>
) => {
  const marks = readAuthoredMarks(shell);
  const ownDeletes = marks.filter(
    (mark) => mark.kind === 'delete' && options.isOwn(mark)
  );
  const previous = propsOf(shell);
  const keys = [
    ...new Set([...Object.keys(previous), ...Object.keys(props)]),
  ].filter((key) => key !== 'type' && !jsonEqual(previous[key], props[key]));
  const existing = marks.filter(
    (mark): mark is FormatTag => mark.kind === 'format'
  );
  const written = recordFormats({
    keys,
    next: props,
    ownInsertion: false,
    previous,
    source: 'command',
    standing: options.standing,
    tags: existing,
    writer: {
      ...options.mark,
      isOwn: options.isOwn,
      commitWriteId: options.commitWriteId,
    },
  });
  const tags = written.filter((tag) => !existing.includes(tag));
  const withdrawn = new Set<unknown>([
    ...ownDeletes,
    ...existing.filter((tag) => !written.includes(tag)),
  ]);
  const set: Record<string, unknown> = {};
  const unset: string[] = [];

  for (const key of keys) {
    if (props[key] === undefined) unset.push(key);
    else set[key] = props[key];
  }

  return {
    delta: {
      ...(tags.length > 0 ? { add: { [AUTHORED_MARKS_KEY]: tags } } : {}),
      remove: { [AUTHORED_MARKS_KEY]: [...withdrawn] },
      ...(Object.keys(set).length > 0 ? { set: set as JsonRecord } : {}),
      ...(unset.length > 0 ? { unset } : {}),
    },
    props: withMembers(
      Object.fromEntries(
        Object.entries({ ...previous, ...set }).filter(
          ([key]) => !unset.includes(key)
        )
      ),
      [
        ...readMembers(shell).filter((member) => !withdrawn.has(member)),
        ...tags,
      ]
    ),
  };
};
