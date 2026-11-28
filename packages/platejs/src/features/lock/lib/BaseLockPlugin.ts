import {
  BaseParagraphPlugin,
  definePlugin,
  definePluginPoint,
  defineUpdateAnnotation,
  documentReplacement,
  editorCommands,
  ElementApi,
  locateAt,
  nodeWriteVeto,
  PathApi,
  property,
  RangeApi,
  schema,
  screenReaderAnnouncementEffect,
  SelectionApi,
  target,
  transferVeto,
  txLocate,
  type Descendant,
  type EditorDocumentValue,
  type Element,
  type Location,
  type NodeKey,
  type Path,
  type RootKey,
} from '../../../core';
import {
  type AnyEditor,
  authoredDirectProperties,
  canPlaceBlocksAtPath,
  claimsHistoryReplay,
  EditorRefusalError,
  getEditorCommitSnapshot,
  getEditorRuntimeOwner,
  getPluginContributions,
  MAIN_ROOT_KEY,
  nonWritableContent,
  nonWritableRoot,
  publishEditorRefusal,
  readCommitRootIndex,
  registerEditorTransactionGuard,
  resolveLocationRoot,
  skipHistoryIfOnlyProperties,
  subscribeEditorRefusals,
  visitDocumentChangeSections,
} from '../../../facade';

const LOCK_KEY = 'locked' as const;
const LOCK_ANNOUNCEMENT_COOLDOWN_MS = 800;
const LOCK_ANNOUNCEMENT_TEXT =
  'This block is locked. Unlock it to make changes.';

const ACTIVE_LOCK_NONCES = new Set<string>();
let nextLockNonceId = 0;

const createLockNonce = (): string => {
  nextLockNonceId += 1;
  const nonce = `lock:${nextLockNonceId}:${Math.random().toString(36).slice(2)}`;
  ACTIVE_LOCK_NONCES.add(nonce);
  return nonce;
};

type LockAuthorityEntry = Readonly<{
  key: NodeKey;
  nonce: string;
  root: RootKey;
}>;

const lockAuthority = defineUpdateAnnotation<readonly LockAuthorityEntry[]>({
  combine: (previous, next) => [...previous, ...next],
  key: 'lock.authority',
});

/** Options selecting the target block for a lock, unlock, or toggle command. */
export type LockTargetOptions = Readonly<{
  /** Target location or node key. Defaults to the current selection. */
  at?: Location | NodeKey;
}>;

/** Property-write context passed to a `lockWriteExemption` contributor. */
export type LockWriteExemptionInput = Readonly<{
  /** Document value before the commit applied. */
  before: EditorDocumentValue;
  /** Target element receiving the property modifications. */
  element: Element;
  /** Non-lock property modifications applied to `element` in this section. */
  modifications: ReadonlyArray<
    Readonly<{
      key: string;
      type: string;
      value?: unknown;
    }>
  >;
  /** Path of `element` inside `root`. */
  path: Path;
  /** Root key containing `element`. */
  root: RootKey;
}>;

/** Predicate approving validated property writes on elements inside locked blocks. */
export type LockWriteExemption = (input: LockWriteExemptionInput) => boolean;

/**
 * Plugin point allowing features (such as inline fields) to approve validated
 * element-property writes inside locked blocks without weakening the lock guard.
 */
export const lockWriteExemption = definePluginPoint<LockWriteExemption>(
  'lock.write.exemption'
);

const EMPTY_ROOT_SET: ReadonlySet<RootKey> = new Set();

const LOCK_ROOT_CACHE = new WeakMap<object, ReadonlySet<RootKey>>();

const isOwnLockedElement = (node: unknown): boolean =>
  ElementApi.isElement(node) && node.locked === true;

const hasLockedDescendant = (node: Element): boolean => {
  for (const child of node.children) {
    if (
      ElementApi.isElement(child) &&
      (child.locked === true || hasLockedDescendant(child))
    ) {
      return true;
    }
  }

  return false;
};

const rootChildrenOf = (
  value: EditorDocumentValue,
  root: RootKey
): readonly Descendant[] =>
  root === MAIN_ROOT_KEY ? value.children : (value.roots?.[root] ?? []);

const hasLockedElementAtOrAbovePath = (
  value: EditorDocumentValue,
  root: RootKey,
  path: Path
): boolean => {
  let siblings = rootChildrenOf(value, root);

  for (const index of path) {
    const node = siblings[index];

    if (!ElementApi.isElement(node)) return false;
    if (node.locked === true) return true;
    siblings = node.children;
  }

  return false;
};

const hasLockedProperAncestor = (
  value: EditorDocumentValue,
  root: RootKey,
  path: Path
): boolean =>
  path.length > 1 &&
  hasLockedElementAtOrAbovePath(value, root, path.slice(0, -1));

const treeContainsLocked = (children: readonly Descendant[]): boolean => {
  for (const child of children) {
    if (!ElementApi.isElement(child)) continue;
    if (child.locked === true || treeContainsLocked(child.children)) {
      return true;
    }
  }

  return false;
};

const valueContainsLocked = (value: EditorDocumentValue): boolean => {
  if (treeContainsLocked(value.children)) return true;
  if (!value.roots) return false;

  for (const rootChildren of Object.values(value.roots)) {
    if (treeContainsLocked(rootChildren)) return true;
  }

  return false;
};

const computeLockedRootsFromValue = (
  value: EditorDocumentValue
): ReadonlySet<RootKey> => {
  const { roots } = value;

  if (!roots || Object.keys(roots).length === 0) {
    return EMPTY_ROOT_SET;
  }

  const ownersByRoot = new Map<
    RootKey,
    Array<Readonly<{ ownerLocked: boolean; ownerRoot: RootKey }>>
  >();

  const walk = (
    nodes: readonly Descendant[],
    ownerRoot: RootKey,
    ancestorLocked: boolean
  ) => {
    for (const node of nodes) {
      if (!ElementApi.isElement(node)) continue;

      const locked = ancestorLocked || node.locked === true;
      const { childRoots } = node as Element & {
        childRoots?: Record<string, unknown>;
      };

      if (childRoots && typeof childRoots === 'object') {
        for (const childRoot of Object.values(childRoots)) {
          if (typeof childRoot !== 'string') continue;

          let list = ownersByRoot.get(childRoot);

          if (!list) {
            list = [];
            ownersByRoot.set(childRoot, list);
          }

          list.push({ ownerLocked: locked, ownerRoot });
        }
      }

      walk(node.children, ownerRoot, locked);
    }
  };

  walk(value.children, MAIN_ROOT_KEY, false);
  for (const [rootName, rootChildren] of Object.entries(roots)) {
    walk(rootChildren, rootName, false);
  }

  const memo = new Map<RootKey, boolean>();

  const checkRoot = (root: RootKey, visiting: Set<RootKey>): boolean => {
    const known = memo.get(root);

    if (known !== undefined) return known;
    if (visiting.has(root)) return false;
    visiting.add(root);

    const owners = ownersByRoot.get(root);
    let locked = false;

    if (owners) {
      for (const owner of owners) {
        if (
          owner.ownerLocked ||
          (owner.ownerRoot !== MAIN_ROOT_KEY &&
            checkRoot(owner.ownerRoot, visiting))
        ) {
          locked = true;
          break;
        }
      }
    }

    visiting.delete(root);
    memo.set(root, locked);

    return locked;
  };

  const lockedRoots = new Set<RootKey>();

  for (const root of Object.keys(roots)) {
    if (checkRoot(root, new Set())) {
      lockedRoots.add(root);
    }
  }

  return lockedRoots;
};

const getLockedRoots = (
  editor: AnyEditor,
  committedValue?: EditorDocumentValue
): ReadonlySet<RootKey> => {
  const value = committedValue ?? editor.read.value();

  if (!value.roots || Object.keys(value.roots).length === 0) {
    return EMPTY_ROOT_SET;
  }

  const owner = getEditorRuntimeOwner(editor);
  const cached = LOCK_ROOT_CACHE.get(owner);

  if (cached) return cached;

  const lockedRoots = computeLockedRootsFromValue(value);

  LOCK_ROOT_CACHE.set(owner, lockedRoots);

  return lockedRoots;
};

const isRootLocked = (
  editor: AnyEditor,
  root: RootKey,
  committedValue?: EditorDocumentValue
): boolean =>
  root !== MAIN_ROOT_KEY && getLockedRoots(editor, committedValue).has(root);

const resolveBlockEntries = (
  editor: AnyEditor,
  at?: Location | NodeKey
): ReadonlyArray<readonly [Element, Path]> => {
  if (typeof at === 'string') {
    const entry = editor.read.nodes.get(at);

    if (!entry) return [];

    const [node, path] = entry;

    if (ElementApi.isElement(node) && editor.read.schema.isBlock(node)) {
      return [[node, path]];
    }

    const above = editor.read.nodes.above({
      at: path,
      match: (candidate): candidate is Element =>
        ElementApi.isElement(candidate) &&
        editor.read.schema.isBlock(candidate),
      mode: 'lowest',
    });

    return above ? [above] : [];
  }

  const targetLocation = at ?? editor.read.selection();

  if (!targetLocation) return [];

  if (SelectionApi.isNode(targetLocation)) {
    const results: Array<readonly [Element, Path]> = [];

    for (const path of targetLocation.paths) {
      const node = editor.read.nodes.get(path)?.[0];

      if (ElementApi.isElement(node) && editor.read.schema.isBlock(node)) {
        results.push([node, path]);
      }
    }

    return results;
  }

  if (PathApi.isPath(targetLocation)) {
    const node = editor.read.nodes.get(targetLocation)?.[0];

    if (ElementApi.isElement(node) && editor.read.schema.isBlock(node)) {
      return [[node, targetLocation]];
    }

    const above = editor.read.nodes.above({
      at: targetLocation,
      match: (candidate): candidate is Element =>
        ElementApi.isElement(candidate) &&
        editor.read.schema.isBlock(candidate),
      mode: 'lowest',
    });

    return above ? [above] : [];
  }

  if (RangeApi.isRange(targetLocation) && RangeApi.isExpanded(targetLocation)) {
    return [
      ...editor.read.nodes.blocks({
        at: targetLocation,
        mode: 'lowest',
      }),
    ];
  }

  const above = editor.read.nodes.above({
    at: targetLocation,
    match: (candidate): candidate is Element =>
      ElementApi.isElement(candidate) && editor.read.schema.isBlock(candidate),
    mode: 'lowest',
  });

  return above ? [above] : [];
};

const isTransferRefusalFromLock = (
  editor: AnyEditor,
  refusal: Readonly<{ path: Path; root: RootKey }>
): boolean => {
  const value = editor.read.value();

  if (isRootLocked(editor, refusal.root, value)) return true;
  if (hasLockedElementAtOrAbovePath(value, refusal.root, refusal.path)) {
    return true;
  }

  let siblings = rootChildrenOf(value, refusal.root);
  let node: Descendant | undefined;

  for (const index of refusal.path) {
    node = siblings[index];
    if (!ElementApi.isElement(node)) return false;
    siblings = node.children;
  }

  return ElementApi.isElement(node) && hasLockedDescendant(node);
};

/**
 * Headless plugin for client-side per-block locking. Stores an optional
 * `locked: true` property on any block element, protects locked blocks against
 * local edits, deletion, structural wraps/unwraps/merges, moves, and local undo
 * replays, keeps locked text selectable/copyable/searchable, and lets
 * `lockWriteExemption` contributors approve validated property writes (such as
 * inline field fills) inside locked blocks.
 */
export const BaseLockPlugin = definePlugin('lock', {
  activate: ({ editor, onCleanup }) => {
    let lastAnnouncedAt = 0;
    let announcing = false;

    const announceLockRefusal = () => {
      const now = Date.now();

      if (announcing || now - lastAnnouncedAt < LOCK_ANNOUNCEMENT_COOLDOWN_MS) {
        return;
      }

      lastAnnouncedAt = now;
      announcing = true;
      try {
        editor.update((tx) => {
          tx.tags.add('history-skip');
          tx.effects.emit(
            screenReaderAnnouncementEffect,
            LOCK_ANNOUNCEMENT_TEXT
          );
        });
      } catch {
        queueMicrotask(() => {
          if (announcing) return;
          announcing = true;
          try {
            editor.update((tx) => {
              tx.tags.add('history-skip');
              tx.effects.emit(
                screenReaderAnnouncementEffect,
                LOCK_ANNOUNCEMENT_TEXT
              );
            });
          } finally {
            announcing = false;
          }
        });
      } finally {
        announcing = false;
      }
    };

    onCleanup(
      subscribeEditorRefusals(editor, (refusal) => {
        if (typeof refusal !== 'object' || refusal === null) return;

        const record = refusal as Record<string, unknown>;

        if (record.reason === 'block-locked') {
          announceLockRefusal();
          return;
        }

        if (
          (record.reason === 'node-write-veto' ||
            record.reason === 'transfer-veto') &&
          Array.isArray(record.path) &&
          typeof record.root === 'string' &&
          isTransferRefusalFromLock(editor, {
            path: record.path as Path,
            root: record.root,
          })
        ) {
          announceLockRefusal();
        }
      })
    );

    onCleanup(
      registerEditorTransactionGuard(
        editor,
        ({ after, before, change, commit }) => {
          if (commit.tags.includes('collaboration')) return;
          if (commit.annotations[documentReplacement.key] === true) return;

          const isHistoryReplay =
            commit.tags.includes('historic') || claimsHistoryReplay(commit);

          if (change.empty && !isHistoryReplay) return;

          const blockingKeys = new Set<NodeKey>();
          const refuse = (message: string, key?: NodeKey | null): never => {
            if (key) blockingKeys.add(key);

            throw new EditorRefusalError(
              {
                blockingKeys: [...blockingKeys],
                reason: 'block-locked',
              },
              message
            );
          };

          if (
            commit.annotations[documentReplacement.key] === false &&
            (valueContainsLocked(before) || valueContainsLocked(after))
          ) {
            refuse(
              'Cannot mix document replacement with edits when locked blocks are present.'
            );
          }

          const beforeLockedRoots = getLockedRoots(editor, before);

          for (const deletedRoot of change.deleteRoots) {
            if (
              beforeLockedRoots.has(deletedRoot) ||
              treeContainsLocked(rootChildrenOf(before, deletedRoot))
            ) {
              refuse(`Cannot delete locked content root "${deletedRoot}".`);
            }
          }

          const authorized = new Set<string>();
          const authorityEntries = commit.annotations[lockAuthority.key] as
            | readonly LockAuthorityEntry[]
            | undefined;

          if (authorityEntries) {
            for (const entry of authorityEntries) {
              if (ACTIVE_LOCK_NONCES.has(entry.nonce)) {
                ACTIVE_LOCK_NONCES.delete(entry.nonce);
                authorized.add(`${entry.root}:${entry.key}`);
              }
            }
          }

          const exemptions = getPluginContributions(editor, lockWriteExemption);

          visitDocumentChangeSections(change, (section) => {
            const { root } = section;
            const beforeIndex = readCommitRootIndex(before, root);

            if (!beforeIndex) return;

            const rootLocked = beforeLockedRoots.has(root);

            if (section.kind === 'properties') {
              const resolved = beforeIndex.nodeStartingAt(section.fromA);

              if (!resolved) {
                if (rootLocked) {
                  refuse('Cannot edit properties inside a locked root.');
                }
                return;
              }

              const targetPath = resolved.path;
              const node = beforeIndex.node(targetPath);

              if (!ElementApi.isElement(node)) {
                if (
                  rootLocked ||
                  hasLockedProperAncestor(before, root, targetPath)
                ) {
                  refuse('Cannot modify text marks inside a locked block.');
                }
                return;
              }

              const beforeSnap = getEditorCommitSnapshot(
                commit,
                root,
                'before'
              );
              const nodeKey = beforeSnap.index.keyAt(targetPath);
              const hasLockMod = section.modifications.some(
                (modification) => modification.key === LOCK_KEY
              );

              if (hasLockMod) {
                const isAuthorized =
                  (nodeKey !== null && authorized.has(`${root}:${nodeKey}`)) ||
                  commit.tags.includes('historic');

                if (!isAuthorized) {
                  refuse(
                    'Use BaseLockPlugin commands to change a block lock.',
                    nodeKey
                  );
                }
              }

              const nonLockMods = hasLockMod
                ? section.modifications.filter(
                    (modification) => modification.key !== LOCK_KEY
                  )
                : section.modifications;

              if (nonLockMods.length === 0) return;

              const effectivelyLocked =
                rootLocked ||
                node.locked === true ||
                hasLockedProperAncestor(before, root, targetPath);

              if (!effectivelyLocked) return;

              const exempted = exemptions.some((exemption) =>
                exemption({
                  before,
                  element: node,
                  modifications: nonLockMods,
                  path: targetPath,
                  root,
                })
              );

              if (!exempted) {
                refuse('Cannot edit properties of a locked block.', nodeKey);
              }

              return;
            }

            if (rootLocked) {
              refuse('Cannot edit content inside a locked root.');
            }

            const checkOpenAncestors = (position: number) => {
              for (const ancestor of beforeIndex.openContextAt(position)) {
                const ancestorPath = ancestor.path;

                if (
                  ancestorPath.length === 0 ||
                  ancestor.from >= position ||
                  position >= ancestor.to
                ) {
                  continue;
                }

                const ancestorNode = beforeIndex.node(ancestorPath);

                if (isOwnLockedElement(ancestorNode)) {
                  const beforeSnap = getEditorCommitSnapshot(
                    commit,
                    root,
                    'before'
                  );

                  refuse(
                    'Cannot edit content inside a locked block.',
                    beforeSnap.index.keyAt(ancestorPath)
                  );
                }
              }
            };

            checkOpenAncestors(section.fromA);
            if (section.toA > section.fromA) {
              checkOpenAncestors(section.toA - 1);
              beforeIndex.elementsOpeningIn(
                section.fromA,
                section.toA,
                (openingNode, from) => {
                  if (isOwnLockedElement(openingNode)) {
                    const opening = beforeIndex.nodeStartingAt(from);
                    const beforeSnap = getEditorCommitSnapshot(
                      commit,
                      root,
                      'before'
                    );

                    refuse(
                      'Cannot remove or replace a locked block.',
                      opening ? beforeSnap.index.keyAt(opening.path) : null
                    );
                  }
                }
              );
            }
          });
        }
      )
    );
  },
  contributions: [
    nonWritableContent.of((node) => node.locked === true),
    nonWritableRoot.of((root, editor) => isRootLocked(editor, root)),
    authoredDirectProperties.of([LOCK_KEY]),
    nodeWriteVeto.of((input) => {
      if (input.node.locked === true) return true;
      if (input.kind === 'unwrap' && hasLockedDescendant(input.node)) {
        return true;
      }

      return false;
    }),
    transferVeto.of((input, editor) => {
      const value = editor.read.value();
      const targetRoot = editor.read.view.root() ?? MAIN_ROOT_KEY;

      if (isRootLocked(editor, targetRoot, value)) return true;

      if (input.intent === 'move' && input.payload.kind === 'nodes') {
        const sourceValue = input.from.read.value();
        const sourceRoot = input.from.read.view.root() ?? MAIN_ROOT_KEY;

        if (isRootLocked(input.from, sourceRoot, sourceValue)) return true;

        if (
          input.payload.nodes.some(
            (node) =>
              ElementApi.isElement(node) &&
              (node.locked === true || hasLockedDescendant(node))
          )
        ) {
          return true;
        }

        for (const parentKey of input.payload.parentKeys) {
          if (!parentKey) continue;

          const parentEntry = input.from.read.nodes.get(parentKey);
          const parentRoot = resolveLocationRoot(input.from, parentKey);

          if (
            isRootLocked(input.from, parentRoot, sourceValue) ||
            (parentEntry &&
              hasLockedElementAtOrAbovePath(
                sourceValue,
                parentRoot,
                parentEntry[1]
              ))
          ) {
            return true;
          }
        }
      }

      const [targetNode, targetPath] = input.target;

      if (hasLockedProperAncestor(value, targetRoot, targetPath)) {
        return true;
      }

      if (
        input.wrap &&
        (targetNode.locked === true || hasLockedDescendant(targetNode))
      ) {
        return true;
      }

      return false;
    }),
  ],
  formats: ({ defineFormats }) =>
    defineFormats({
      docx: {
        dropped: 'Block lock settings are not exported to Word documents.',
      },
      html: {
        decode: ({ element, preserve }) => {
          if (element.dataset.locked === 'true') {
            preserve('data-locked');
            return true;
          }

          return undefined;
        },
        encode: ({ value }) =>
          value ? { attributes: { 'data-locked': 'true' } } : null,
        match: [{ attributes: { 'data-locked': 'true' } }],
      },
    }),
  on: {
    commit: ({ commit, editor }) => {
      const owner = getEditorRuntimeOwner(editor);

      if (!LOCK_ROOT_CACHE.has(owner)) return;

      if (
        commit.changed.hasAny('replace') ||
        commit.changed.hasAny('root-order') ||
        commit.changes.createRoots.size > 0 ||
        commit.changes.deleteRoots.size > 0 ||
        commit.changed.hasAny('properties') ||
        commit.changed.hasAny('structure')
      ) {
        LOCK_ROOT_CACHE.delete(owner);
      }
    },
  },
  read: ({ editor }) => ({
    /**
     * Return `true` when the block at `at` (or the current selection) is
     * effectively locked, either via its own `locked` flag, a locked ancestor,
     * or a locked `childRoots` owner.
     */
    isLocked: (at?: Location | NodeKey): boolean => {
      const value = editor.read.value();
      const root = resolveLocationRoot(editor, at);

      if (isRootLocked(editor, root, value)) return true;

      const entries = resolveBlockEntries(editor, at);

      if (entries.length === 0) return false;

      return entries.some(
        ([node, path]) =>
          node.locked === true ||
          hasLockedElementAtOrAbovePath(value, root, path)
      );
    },
    /**
     * Return `true` only when the target block itself owns `locked: true`
     * (ignoring ancestor or parent-root locks). Use this for lock toggle
     * controls and own-lock badges.
     */
    isOwnLocked: (at?: Location | NodeKey): boolean => {
      const entries = resolveBlockEntries(editor, at);

      return (
        entries.length > 0 && entries.every(([node]) => node.locked === true)
      );
    },
  }),
  schema: () => ({
    properties: {
      locked: schema.elementProperty(property.boolean(), {
        copy: 'drop',
        split: 'drop',
        target: target.not(target.group('inline')),
        typeChange: 'preserve-if-allowed',
      }),
    },
  }),
  update: ({ editor, tx }) => {
    const resolveDraftBlockEntries = (
      at?: Location | NodeKey
    ): ReadonlyArray<readonly [Element, Path]> => {
      if (typeof at === 'string') {
        const entry = tx.nodes.get(at);

        if (!entry) return [];

        const [node, path] = entry;

        if (ElementApi.isElement(node) && tx.schema.isBlock(node)) {
          return [[node, path]];
        }

        const above = tx.nodes.above({
          at: path,
          match: (candidate): candidate is Element =>
            ElementApi.isElement(candidate) && tx.schema.isBlock(candidate),
          mode: 'lowest',
        });

        return above ? [above] : [];
      }

      if (at === undefined) {
        const selectedNodes = tx.selection.nodes();

        if (selectedNodes.length > 0) {
          const results: Array<readonly [Element, Path]> = [];

          for (const [node, path] of selectedNodes) {
            if (ElementApi.isElement(node) && tx.schema.isBlock(node)) {
              results.push([node, path]);
            }
          }

          return results;
        }
      }

      const targetLocation = at ?? tx.selection();

      if (!targetLocation) return [];

      if (SelectionApi.isNode(targetLocation)) {
        const results: Array<readonly [Element, Path]> = [];

        for (const path of targetLocation.paths) {
          const node = tx.nodes.get(path)?.[0];

          if (ElementApi.isElement(node) && tx.schema.isBlock(node)) {
            results.push([node, path]);
          }
        }

        return results;
      }

      if (PathApi.isPath(targetLocation)) {
        const node = tx.nodes.get(targetLocation)?.[0];

        if (ElementApi.isElement(node) && tx.schema.isBlock(node)) {
          return [[node, targetLocation]];
        }

        const above = tx.nodes.above({
          at: targetLocation,
          match: (candidate): candidate is Element =>
            ElementApi.isElement(candidate) && tx.schema.isBlock(candidate),
          mode: 'lowest',
        });

        return above ? [above] : [];
      }

      if (
        RangeApi.isRange(targetLocation) &&
        RangeApi.isExpanded(targetLocation)
      ) {
        return [
          ...tx.nodes.blocks({
            at: targetLocation,
            mode: 'lowest',
          }),
        ];
      }

      const above = tx.nodes.above({
        at: targetLocation,
        match: (candidate): candidate is Element =>
          ElementApi.isElement(candidate) && tx.schema.isBlock(candidate),
        mode: 'lowest',
      });

      return above ? [above] : [];
    };

    const applyLockState = (
      mode: 'lock' | 'toggle' | 'unlock',
      options?: LockTargetOptions
    ): boolean => {
      const entries = resolveDraftBlockEntries(options?.at);

      if (entries.length === 0) return false;

      const shouldLock =
        mode === 'lock'
          ? true
          : mode === 'unlock'
            ? false
            : !entries.every(([node]) => node.locked === true);
      const authorityEntries: LockAuthorityEntry[] = [];
      const keysToChange: NodeKey[] = [];

      for (const [node] of entries) {
        const currentlyLocked = node.locked === true;

        if (currentlyLocked === shouldLock) continue;

        const key = tx.key(node);

        if (!key) continue;

        authorityEntries.push({
          key,
          nonce: createLockNonce(),
          root: tx.view.root() ?? resolveLocationRoot(editor, key),
        });
        keysToChange.push(key);
      }

      if (keysToChange.length === 0) return false;

      tx.annotations.set(lockAuthority, authorityEntries);
      tx.annotations.set(skipHistoryIfOnlyProperties, [LOCK_KEY]);

      for (const key of keysToChange) {
        if (shouldLock) {
          tx.nodes.set({ locked: true }, { at: key });
        } else {
          tx.nodes.unset(LOCK_KEY, { at: key });
        }
      }

      return true;
    };

    return {
      /** Lock the target block (or current selection). */
      lock: txLocate(locateAt(0), (options?: LockTargetOptions) =>
        applyLockState('lock', options)
      ),
      /** Toggle the lock state on the target block (or current selection). */
      toggle: txLocate(locateAt(0), (options?: LockTargetOptions) =>
        applyLockState('toggle', options)
      ),
      /** Unlock the target block (or current selection). */
      unlock: txLocate(locateAt(0), (options?: LockTargetOptions) =>
        applyLockState('unlock', options)
      ),
    };
  },
}).extend(({ editor }) => ({
  commands: ({ handle }) => [
    handle(editorCommands.insertBreak, ({ state }) => {
      const selection = state.selection();

      if (
        !selection ||
        !RangeApi.isRange(selection) ||
        !RangeApi.isCollapsed(selection)
      ) {
        return false;
      }

      const root = state.view.root() ?? MAIN_ROOT_KEY;

      if (isRootLocked(editor, root)) {
        publishEditorRefusal(editor, {
          blockingKeys: [],
          reason: 'block-locked',
        });
        return state.transaction(() => {});
      }

      const caretPath = selection.anchor.path;
      let highestLockedPath: Path | null = null;
      let cursor: Path = caretPath;

      while (cursor.length > 0) {
        const node = state.nodes.get(cursor)?.[0];

        if (isOwnLockedElement(node)) {
          highestLockedPath = cursor;
        }
        cursor = PathApi.parent(cursor);
      }

      if (!highestLockedPath) {
        return false;
      }

      const isAtStart = state.points.isStart(
        selection.anchor,
        highestLockedPath
      );
      const isAtEnd = state.points.isEnd(selection.anchor, highestLockedPath);

      if (!isAtStart && !isAtEnd) {
        const key = editor.key(highestLockedPath);
        publishEditorRefusal(editor, {
          blockingKeys: key ? [key] : [],
          reason: 'block-locked',
        });
        return state.transaction(() => {});
      }

      const paragraphType =
        editor.plugin(BaseParagraphPlugin).schema.type ?? 'paragraph';
      const paragraph = { children: [{ text: '' }], type: paragraphType };
      const insertPath = isAtStart
        ? highestLockedPath
        : PathApi.next(highestLockedPath);

      if (
        !canPlaceBlocksAtPath(state.schema, insertPath, [paragraph], { root })
      ) {
        const key = editor.key(highestLockedPath);
        publishEditorRefusal(editor, {
          blockingKeys: key ? [key] : [],
          reason: 'block-locked',
        });
        return state.transaction(() => {});
      }

      return state.transaction((tx) => {
        tx.nodes.insert(paragraph, { at: insertPath, select: true });
      });
    }),
  ],
}));
