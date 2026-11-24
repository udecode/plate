import { nanoid } from 'nanoid';

import {
  type EditorCommit,
  ElementApi,
  property,
  type NodeKey,
  type RootKey,
  schema,
  target,
  getEditorCommitNode,
  MAIN_ROOT_KEY,
  readElementById,
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

const onlyRemovesNodes = (
  changed: EditorCommit['changed'],
  root: RootKey | undefined,
  presence: readonly NodeKey[]
) =>
  presence.length > 0 &&
  changed.nodeKeys('text', root).length === 0 &&
  presence.every((key) => !changed.hasNodeKey(key, 'path', root));

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
          const { changed } = commit;

          for (const root of elementIdDocumentRoots(after)) {
            const publicRoot = root === MAIN_ROOT_KEY ? undefined : root;
            const writesIds =
              changed.has('properties', publicRoot) ||
              changed.has('replace', publicRoot);

            if (!writesIds && !changed.has('structure', publicRoot)) continue;
            const presence = changed.nodeKeys('presence', publicRoot);

            if (!writesIds && onlyRemovesNodes(changed, publicRoot, presence)) {
              continue;
            }
            for (const nodeKey of new Set([
              ...changed.nodeKeys('node', publicRoot),
              ...presence,
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
      id(key: NodeKey): string | undefined {
        const node = state.nodes.get(key)?.[0];
        const id =
          ElementApi.isElement(node) &&
          state.schema.getProperty(node, idProperty);

        return typeof id === 'string' &&
          readElementById(state.nodes, id)?.key === key
          ? id
          : undefined;
      },
    }),
  };
});
