import { nanoid } from 'nanoid';

import {
  type Element,
  ElementApi,
  type Path,
  property,
  type RootKey,
  type NodeKey,
  schema,
  target,
  getEditorCommitNode,
  MAIN_ROOT_KEY,
  registerEditorTransactionGuard,
} from '../../../facade';
import { definePlugin } from '../../plugin/definePlugin';
import {
  assertElementId,
  elementIdDocumentRoots,
} from './elementIdAdmission.internal';

export type ElementIdPluginState = {
  /** Generate one persisted ID for a newly materialized element. */
  generateId: () => string;
};

export type ElementIdEntry = Readonly<{
  key: NodeKey;
  node: Element;
  path: Path;
  root: RootKey;
}>;

const elementIdInitialState: ElementIdPluginState = {
  generateId: () => nanoid(),
};

export const ElementIdPlugin = definePlugin('elementId', {
  initialState: elementIdInitialState,
  schema: ({ initialState }) => ({
    properties: {
      id: schema.elementProperty(
        property.string({ generate: initialState.generateId }),
        {
          role: 'metadata',
          target: target.group('element'),
          typeChange: 'preserve-if-allowed',
          unique: true,
        }
      ),
    },
  }),
}).extend((context) => {
  const { editor } = context;
  const idProperty = context.schema.properties.id;

  return {
    activate({ onCleanup }) {
      onCleanup(
        registerEditorTransactionGuard(editor, ({ after, commit }) => {
          for (const root of elementIdDocumentRoots(after)) {
            const publicRoot = root === MAIN_ROOT_KEY ? undefined : root;
            const mayChangeIds =
              commit.changed.has('properties', publicRoot) ||
              commit.changed.has('structure', publicRoot) ||
              commit.changed.has('replace', publicRoot);

            if (!mayChangeIds) continue;
            for (const nodeKey of new Set([
              ...commit.changed.nodeKeys('node', publicRoot),
              ...commit.changed.nodeKeys('presence', publicRoot),
            ])) {
              const [node, path] =
                getEditorCommitNode(commit, nodeKey, root) ?? [];

              if (ElementApi.isElement(node) && node.id !== undefined) {
                assertElementId(node.id, `Element ID at ${root}:[${path}]`);
              }
            }
          }
        })
      );
    },
    read: ({ state }) => ({
      entry(id: string): ElementIdEntry | undefined {
        const holder = state.unique.holder('id', id);
        const node = holder && state.nodes.get(holder.key)?.[0];

        return holder && ElementApi.isElement(node)
          ? Object.freeze({ ...holder, node })
          : undefined;
      },
      id(key: NodeKey): string | undefined {
        const node = state.nodes.get(key)?.[0];
        const id =
          ElementApi.isElement(node) &&
          state.schema.getProperty(node, idProperty);

        return typeof id === 'string' &&
          state.unique.holder('id', id)?.key === key
          ? id
          : undefined;
      },
    }),
  };
});
