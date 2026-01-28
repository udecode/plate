import { Extensions } from '@harbour-enterprises/superdoc/super-editor';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { PluginKey } from 'prosemirror-state';
import { DOMSerializer } from 'prosemirror-model';

const activeNodeDecorationKey = new PluginKey('activeNodeDecoration');
const ContentMapPluginKey = new PluginKey('contentMapPlugin');

const documentHighlight = (item, state) => {
  if (!item || !item.node || typeof item.pos !== 'number') {
    return false;
  }
  const { pos, node } = item;        
  const nodeDeco = Decoration.inline(pos, pos + node.nodeSize, {
    class: 'document-section-active'
  });
  
  const tr = state.tr.setMeta(activeNodeDecorationKey, { deco: nodeDeco });
  return tr;
}

/**
 * A basic document map extension for SuperDoc.
 * It allows for selecting nodes, reordering them, and syncing content with a content editor.
 * It is for demo and education purposes only. It is purposely simple.
 * It does not handle all edge cases and is not production-ready.
 * 
 * To extend SuperDoc, simply create a new extension:
 */
export const DocumentMapExtension = Extensions.Extension.create({

  /**
   * You can add custom commands here that will be available via editor.commands
   */
  addCommands() {
    return {
      documentMapSelectNode: (item) => ({ state, dispatch }) => {
        if (dispatch) {
          const tr = documentHighlight(item, state);
          dispatch(tr);
        }
        return true;
      },
      documentMapReorder: ({ draggedIndex, targetIndex }) => ({ state, dispatch }) => {
        const pluginState = ContentMapPluginKey.getState(state);
        const docMap = pluginState.docMap;
      
        const draggedItem = docMap[draggedIndex];
        const targetItem = docMap[targetIndex];
        const { doc } = state;
        let tr = state.tr;

        const paragraphNode = state.schema.nodes.paragraph.create();
        const isBefore = draggedItem.pos < targetItem.pos;
        if (!isBefore) {
          tr.delete(draggedItem.pos, Math.min(doc.content.size, draggedItem.pos + draggedItem.node.nodeSize));
          const insertPos = tr.mapping.map(targetItem.pos);
          tr.insert(Math.max(insertPos - 1, 0), draggedItem.node);
          tr.insert(Math.max(insertPos + draggedItem.node.nodeSize, 0), paragraphNode);
        } else {
          const insertPos = tr.mapping.map(targetItem.pos + targetItem.node.nodeSize - 1);
          tr.insert(Math.max(insertPos, 0), paragraphNode);
          tr.insert(Math.max(insertPos + paragraphNode.nodeSize, 0), draggedItem.node);
          tr.delete(draggedItem.pos, Math.min(doc.content.size, draggedItem.pos + draggedItem.node.nodeSize));
        }
        dispatch(tr);
        return true;
      },
      syncContent: ({ item, contentEditor }) => ({ tr, editor, state, dispatch }) => {  
        const contentJson = contentEditor.getJSON();
        const newNode = state.schema.nodeFromJSON(contentJson);

        const activeNode = state.doc.nodeAt(item.pos - 1);
        tr.replaceWith(item.pos - 1, item.pos + activeNode.nodeSize - 1, newNode);
        tr.setMeta(ContentMapPluginKey, { syncContent: true, item });
        dispatch(tr);

        const newItem = { ...item, node: newNode, json: newNode.toJSON() };
        const newTr = documentHighlight(newItem, state);
        dispatch(newTr);
        return true;        
      },
      updateDocumentMap: () => ({ tr, state, dispatch }) => {
        return true;
      }
    };
  },


  /**
   * Create a prosemirror plugin that will be added to the editor.
   * See https://prosemirror.net/docs/ref/#state.Plugin_System
   */
  addPmPlugins() {
    let hasInitialized = false;
    const editor = this.editor;
    const ContentMapPLugin = new Extensions.Plugin({
      key: ContentMapPluginKey,
      state: {
        init(_, state) {
          // Initialize the document map with the current state.
          // Collect all paragraph nodes with content.
          const initialPositions = [];
          state.doc.descendants((node, pos) => {
            if (node.type.name === 'paragraph' && node.content.size > 0) {
              initialPositions.push({ pos, node });
            }
          });

          // Add custom IDs to each node so we can track them.
          const { dispatch } = editor.view;
          const { tr: newTr } = state;
          initialPositions.forEach(({ node, pos }) => {
            const newAttrs = {
              ...node.attrs,
              extraAttrs: {
                customTrackingId: `custom-id-${pos}`,
              }
            }
            newTr.setNodeMarkup(pos, undefined, newAttrs);
          });

          dispatch(newTr);
          const initialDocMap = createMap(state, null);
          editor.emit('document-map-update', initialDocMap);

          return {
            hasInitialized: false,
            docMap: initialDocMap,
          };
        },
        apply(tr, pluginState, oldState, newState) {
          let activeItem;

          const docChanged = tr.docChanged || tr.selectionSet || tr.storedMarksSet;
          if (!docChanged) {
            return pluginState;
          }

          const pluginMeta = tr.getMeta(ContentMapPluginKey);
          if (pluginMeta?.syncContent) {
            activeItem = pluginMeta?.item;
            return pluginState;
          }

          const decoMeta = tr.getMeta(activeNodeDecorationKey);
          if (decoMeta?.deco) {
            return pluginState;
          }

          pluginState.docMap = createMap(newState, activeItem);
          editor.emit('document-map-update', pluginState.docMap);
          return pluginState;
        },
      },
    });
    return [ContentMapPLugin];
  },
});

/**
 * Helper function to create the document map.
 * It builds a tree of block nodes from the document.
 * @param {Object} newState - The new state of the editor.
 * @param {Object} activeItem - The currently active item in the document map.
 * @returns {Array} - An array of block nodes with their properties.
 */
const createMap = (newState, activeItem) => {
  const { doc } = newState;
  const initialElements = buildBlockNodesTree(doc, activeItem);
  return initialElements;
};

/**
 * Recursively builds a tree of paragraph nodes from the ProseMirror document.
 * It serializes each block node to HTML and includes its position, text content, and children.
 * @param {Object} node - The ProseMirror node to process.
 * @param {Object} activeItem - The currently active item in the document map.
 * @param {number} pos - The current position in the document.
 * @returns {Array} - An array of objects representing the block nodes.
 */
function buildBlockNodesTree(node, activeItem, pos = 0) {
  const treeNodes = [];
  node.forEach((child, offset) => {
    const childPos = pos + offset + 1;
    const isActive = childPos === activeItem?.pos;
    
    if (child.isBlock) {
      if (child.type.name === 'paragraph') {
        if (!child.textContent.trim()) {
          return;
        }

        const serializer = DOMSerializer.fromSchema(child.type.schema);
        const fragment = serializer.serializeFragment(child.content);
        const container = document.createElement('div');
        container.appendChild(fragment);
        const html = container.innerHTML;

        treeNodes.push({
          id: childPos,
          node: child,
          json: child.toJSON(),
          pos: childPos,
          html,
          isActive,
          text: child.textContent.slice(0, 50),
          children: buildBlockNodesTree(child, activeItem, childPos),
        });
      }
    }
  });
  return treeNodes;
}
