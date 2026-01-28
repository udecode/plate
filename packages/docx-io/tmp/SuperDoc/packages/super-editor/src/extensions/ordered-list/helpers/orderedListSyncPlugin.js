import { Plugin, PluginKey } from 'prosemirror-state';
import { docxNumberigHelpers } from '@core/super-converter/v2/importer/listImporter.js';
import { ListHelpers } from '@helpers/list-numbering-helpers.js';
import { refreshAllListItemNodeViews } from '@extensions/list-item/ListItemNodeView.js';

export const orderedListSyncPluginKey = new PluginKey('orderedListSync');

export function orderedListSync(editor) {
  let hasInitialized = false;
  const docx = editor.converter.convertedXml;
  return new Plugin({
    key: orderedListSyncPluginKey,

    appendTransaction(transactions, oldState, newState) {
      const updateNodeViews = transactions.some((tr) => tr.getMeta('updatedListItemNodeViews'));
      if (updateNodeViews || !hasInitialized) refreshAllListItemNodeViews();

      const isFromPlugin = transactions.some((tr) => tr.getMeta('orderedListSync'));
      if (isFromPlugin || !transactions.some((tr) => tr.docChanged)) {
        return null;
      }

      hasInitialized = true;

      const tr = newState.tr;
      tr.setMeta('orderedListSync', true);

      const listMap = new Map(); // numId -> [counts per level]
      const listInitialized = new Map(); // Track if we've initialized each numId

      const shouldProcess = transactions.some((tr) => {
        return tr.steps.some((step) => {
          const stepJSON = step.toJSON();
          const hasUpdateMeta = tr.getMeta('updateListSync');
          return hasUpdateMeta || (stepJSON && stepJSON.slice && JSON.stringify(stepJSON).includes('"listItem"'));
        });
      });
      if (!shouldProcess) return null;

      newState.doc.descendants((node, pos) => {
        if (node.type.name !== 'listItem') return;

        const { level: attrLvl, numId: attrNumId, styleId } = node.attrs;
        const level = parseInt(attrLvl);
        const numId = parseInt(attrNumId);

        let {
          lvlText,
          customFormat,
          listNumberingType,
          start: numberingDefStart,
        } = ListHelpers.getListDefinitionDetails({ numId, level, editor });

        const start = parseInt(numberingDefStart) || 1;

        // Initialize tracking for this numId if not exists
        if (!listMap.has(numId)) {
          // Get the initial path to understand the starting state
          const generatedLevels = {};
          const initialPath = docxNumberigHelpers.generateListPath(level, numId, styleId, generatedLevels, docx);

          // Set the initial path, we'll use it as a template
          listMap.set(numId, initialPath || []);
          listInitialized.set(numId, false);
        }

        let currentListLevels = [...listMap.get(numId)];

        // For the first item, use the generateListPath result as-is
        if (!listInitialized.get(numId)) {
          listInitialized.set(numId, true);
          // if there's a start override for this level, use it
          if (typeof start === 'number') {
            while (currentListLevels.length <= level) {
              currentListLevels.push(0);
            }
            currentListLevels[level] = start;
            // reset any deeper levels
            for (let i = level + 1; i < currentListLevels.length; i++) {
              currentListLevels[i] = 0;
            }
          }
        } else {
          // For subsequent items, increment at the current level
          // Ensure array is long enough for current level
          while (currentListLevels.length <= level) {
            currentListLevels.push(0);
          }

          // Increment count at current level
          currentListLevels[level] = (currentListLevels[level] || 0) + 1;

          // Reset deeper levels to 0 when we encounter a shallower level
          for (let i = level + 1; i < currentListLevels.length; i++) {
            currentListLevels[i] = 0;
          }
        }

        if (currentListLevels.length === 0) {
          currentListLevels = [1]; // Ensure we have at least one level
        }

        // Update the map
        listMap.set(numId, currentListLevels);

        // Update list attrs
        const updatedAttrs = {
          ...node.attrs,
          listLevel: [...currentListLevels],
          level,
          lvlText,
          listNumberingType,
          customFormat,
        };

        const keysChanged = Object.keys(updatedAttrs).some((key) => node.attrs[key] !== updatedAttrs[key]);

        if (keysChanged) {
          tr.setNodeMarkup(pos, undefined, updatedAttrs);
        }
      });

      return tr;
    },
  });
}

export function randomId() {
  return Math.floor(Math.random() * 0xffffffff).toString();
}
