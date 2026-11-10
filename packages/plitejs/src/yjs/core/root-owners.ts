import * as Y from 'yjs';

import { getEditorSchema } from '../../core/editor-runtime';
import { getCompiledEditorSchema } from '../../core/plugin-registry';
import { MAIN_ROOT_KEY } from '../../core/public-root';
import { getDefined } from '../../internal/get-defined';
import { getYjsAttributes, type YjsNode } from './attributes';
import { projectYjsRoot, readYjsChildrenNotingPlainList } from './document';
import type { YjsEditor } from './editor-types';
import { YJS_HIDDEN_KEY, YJS_VIRTUAL_CHILD_ID_KEY } from './keys';

const OWNER_KEYS = ['childRoots', 'type'];

const ownedRootsOf = (editor: YjsEditor, element: Y.XmlElement) => {
  const { childRoots, type } = getYjsAttributes(element);

  if (childRoots === undefined || typeof type !== 'string') return [];

  return getEditorSchema(editor).getElementOwnedRoots({
    childRoots,
    children: [],
    type,
  });
};

const exclusiveRootsOf = (
  editor: YjsEditor,
  element: Y.XmlElement
): readonly string[] =>
  ownedRootsOf(editor, element).flatMap(({ ownership, root }) =>
    ownership === 'exclusive' ? [root] : []
  );

const isYjsMovePlaceholder = (node: Y.XmlElement) =>
  typeof node.getAttribute(YJS_VIRTUAL_CHILD_ID_KEY) === 'string';

const mayHoldYjsRootOwner = (
  editor: YjsEditor,
  element: Y.XmlElement
): boolean => {
  const stack = [element];

  for (let node = stack.pop(); node; node = stack.pop()) {
    if (
      isYjsMovePlaceholder(node) ||
      exclusiveRootsOf(editor, node).length > 0
    ) {
      return true;
    }
    for (const child of readYjsChildrenNotingPlainList(node)) {
      if (child instanceof Y.XmlElement) stack.push(child);
    }
  }

  return false;
};

/** @internal */
export const mayAddYjsRootOwner = (
  editor: YjsEditor,
  events: ReadonlyArray<Y.YEvent<Y.AbstractType<unknown>>>
): boolean => {
  if (!editor.read.schema.hasContentRoots()) return false;

  return events.some((event) => {
    const { target } = event;

    if (target instanceof Y.Map && event instanceof Y.YMapEvent) {
      return [...event.keysChanged].some((key) => {
        const root: unknown = target.get(key);

        return (
          root instanceof Y.XmlElement && mayHoldYjsRootOwner(editor, root)
        );
      });
    }
    if (!(target instanceof Y.XmlElement)) return false;

    const { keys } = event.changes;

    if (
      (keys.has(YJS_HIDDEN_KEY) &&
        target.getAttribute(YJS_HIDDEN_KEY) !== true &&
        mayHoldYjsRootOwner(editor, target)) ||
      (OWNER_KEYS.some((key) => keys.has(key)) &&
        exclusiveRootsOf(editor, target).length > 0) ||
      (keys.has(YJS_VIRTUAL_CHILD_ID_KEY) && isYjsMovePlaceholder(target))
    ) {
      return true;
    }

    return [...event.changes.added].some((item) =>
      item.content
        .getContent()
        .some(
          (node: unknown) =>
            node instanceof Y.XmlElement && mayHoldYjsRootOwner(editor, node)
        )
    );
  });
};

type SecondYjsRootOwner = Readonly<{
  root: string;
  slot: YjsNode;
  tree: Y.XmlElement;
}>;

type OwnerVisit = (
  shown: Y.XmlElement,
  declared: ReturnType<typeof ownedRootsOf>,
  at: SecondYjsRootOwner
) => boolean;

const walkYjsRootOwners = (
  editor: YjsEditor,
  main: Y.XmlElement,
  roots: Y.Map<Y.XmlElement>,
  enter: OwnerVisit
) => {
  const visited = new Set<string>([MAIN_ROOT_KEY]);
  const visitRoot = (root: string, tree: Y.XmlElement) => {
    const projection = projectYjsRoot(tree);
    const visit = (parent: Y.XmlElement) => {
      for (const slot of readYjsChildrenNotingPlainList(parent)) {
        if (!(slot instanceof Y.XmlElement)) continue;

        const shown = projection.slotNodeOf(slot);

        if (!(shown instanceof Y.XmlElement)) continue;

        const declared = ownedRootsOf(editor, shown);

        if (!enter(shown, declared, { root, slot, tree })) continue;
        visit(shown);
        for (const { root: owner } of declared) {
          const child = roots.get(owner);

          if (visited.has(owner) || !(child instanceof Y.XmlElement)) continue;
          visited.add(owner);
          visitRoot(owner, child);
        }
      }
    };

    visit(tree);
  };

  visitRoot(MAIN_ROOT_KEY, main);
  for (const name of getCompiledEditorSchema(editor).roots.keys()) {
    const tree = roots.get(name);

    if (visited.has(name) || !(tree instanceof Y.XmlElement)) continue;
    visited.add(name);
    visitRoot(name, tree);
  }
};

// Every peer reads an element's item id the same, while its place in the walk
// moves with a teammate's move or delete. A moved element keeps its id; only
// the slot that shows it changes.
const winsIdTiebreak = (a: Y.XmlElement, b: Y.XmlElement) => {
  const { client, clock } = getDefined(a._item).id;
  const other = getDefined(b._item).id;

  return client === other.client ? clock < other.clock : client < other.client;
};

/** @internal */
export const findSecondYjsRootOwners = (
  editor: YjsEditor,
  main: Y.XmlElement,
  roots: Y.Map<Y.XmlElement>
): readonly SecondYjsRootOwner[] => {
  if (!editor.read.schema.hasContentRoots()) return [];

  const kept = new Map<string, Y.XmlElement>();
  let contested = false;

  walkYjsRootOwners(editor, main, roots, (shown, declared) => {
    for (const { ownership, root } of declared) {
      if (ownership !== 'exclusive') continue;

      const first = kept.get(root);

      if (first) contested = true;
      if (!first || winsIdTiebreak(shown, first)) kept.set(root, shown);
    }

    return true;
  });
  if (!contested) return [];

  const seconds: SecondYjsRootOwner[] = [];

  walkYjsRootOwners(editor, main, roots, (shown, declared, at) => {
    if (
      declared.some(
        ({ ownership, root }) =>
          ownership === 'exclusive' && kept.get(root) !== shown
      )
    ) {
      seconds.push(at);

      return false;
    }

    return true;
  });

  return seconds;
};
