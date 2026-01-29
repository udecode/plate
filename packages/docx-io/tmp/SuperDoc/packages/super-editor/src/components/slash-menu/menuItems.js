import TableGrid from '../toolbar/TableGrid.vue';
import AIWriter from '../toolbar/AIWriter.vue';
import TableActions from '../toolbar/TableActions.vue';
import LinkInput from '../toolbar/LinkInput.vue';
import { selectionHasNodeOrMark } from '../cursor-helpers.js';
// import { serializeSelectionToClipboard, writeToClipboard } from '@/core/utilities/clipboardUtils.js';
import { handleClipboardPaste } from '@/core/InputRule.js';
import { TEXTS, ICONS, TRIGGERS } from './constants.js';

/**
 * Check if a module is enabled based on editor options
 * This is used for hiding menu items based on module availability
 *
 * @param {Object} editorOptions - Editor options
 * @param {string} moduleName - Name of the module to check (e.g. 'ai')
 * @returns {boolean} Whether the module is enabled
 */
const isModuleEnabled = (editorOptions, moduleName) => {
  switch (moduleName) {
    case 'ai':
      // isAiEnabled is a boolean set in SuperDoc.vue that passes whether or not the ai key is present on the config object
      // For example:
      // isAiEnabled: proxy.$superdoc.config.modules?.ai,
      return !!editorOptions?.isAiEnabled;
    // Example for future use cases
    // case 'comments':
    // return !!editorOptions?.isCommentsEnabled;
    default:
      return true;
  }
};

/**
 * Get menu sections based on context (trigger, selection, node, etc)
 * @param {Object} context - { editor, selectedText, pos, node, event, trigger }
 * @returns {Array<{
 *   id: string,
 *   items: Array<{
 *     id: string,
 *     label: string,
 *     icon?: string,
 *     component?: Component,
 *     action?: (editor: Editor) => void,
 *     allowedTriggers: Array<'slash'|'click'>,
 *     requiresSelection?: boolean,
 *     requiresClipboard?: boolean
 *     requiresTableParent?: boolean
 *     requiredSectionParent?: boolean,
 *     requiresModule?: string
 *   }>
 * }>} Array of menu sections
 */
export function getItems(context) {
  const { editor, selectedText, trigger, clipboardContent } = context;

  const isInTable = selectionHasNodeOrMark(editor.view.state, 'table', { requireEnds: true });
  const isInSectionNode = selectionHasNodeOrMark(editor.view.state, 'documentSection', { requireEnds: true });

  const sections = [
    {
      id: 'ai-content',
      items: [
        {
          id: 'insert-text',
          label: selectedText ? TEXTS.replaceText : TEXTS.insertText,
          icon: ICONS.ai,
          component: AIWriter,
          action: (editor) => {
            // Add AI highlight when menu item is triggered
            if (editor?.commands && typeof editor.commands?.insertAiMark === 'function') {
              editor.commands.insertAiMark();
            }
          },
          allowedTriggers: [TRIGGERS.slash, TRIGGERS.click],
          requiresModule: 'ai',
        },
      ],
    },
    {
      id: 'document-sections',
      items: [
        {
          id: 'insert-document-section',
          label: TEXTS.createDocumentSection,
          icon: ICONS.addDocumentSection,
          action: (editor) => {
            editor.commands.createDocumentSection();
          },
          allowedTriggers: [TRIGGERS.click],
        },
        {
          id: 'remove-section',
          label: TEXTS.removeDocumentSection,
          icon: ICONS.removeDocumentSection,
          action: (editor) => {
            editor.commands.removeSectionAtSelection();
          },
          allowedTriggers: [TRIGGERS.click],
          requiresSectionParent: true,
        },
      ],
    },
    {
      id: 'general',
      items: [
        {
          id: 'insert-link',
          label: TEXTS.insertLink,
          icon: ICONS.link,
          component: LinkInput,
          allowedTriggers: [TRIGGERS.click],
        },
        {
          id: 'insert-table',
          label: TEXTS.insertTable,
          icon: ICONS.table,
          component: TableGrid,
          allowedTriggers: [TRIGGERS.slash, TRIGGERS.click],
        },
        {
          id: 'edit-table',
          label: TEXTS.editTable,
          icon: ICONS.table,
          component: TableActions,
          allowedTriggers: [TRIGGERS.slash, TRIGGERS.click],
          requiresTableParent: true,
        },
      ],
    },
    {
      id: 'clipboard',
      items: [
        {
          id: 'cut',
          label: TEXTS.cut,
          icon: ICONS.cut,
          action: (editor) => {
            editor.view.focus();
            document.execCommand('cut');
          },
          allowedTriggers: [TRIGGERS.click],
          requiresSelection: true,
        },
        {
          id: 'copy',
          label: TEXTS.copy,
          icon: ICONS.copy,
          action: (editor) => {
            editor.view.focus();
            document.execCommand('copy');
          },
          allowedTriggers: [TRIGGERS.click],
          requiresSelection: true,
        },
        {
          id: 'paste',
          label: TEXTS.paste,
          icon: ICONS.paste,
          action: async (editor) => {
            try {
              const clipboardItems = await navigator.clipboard.read();
              let html = '';
              let text = '';

              // Extract clipboard contents
              for (const item of clipboardItems) {
                if (!html && item.types.includes('text/html')) {
                  html = await (await item.getType('text/html')).text();
                }
                if (!text && item.types.includes('text/plain')) {
                  text = await (await item.getType('text/plain')).text();
                }
              }

              // Call shared paste handler from @core/InputRule.js
              const handled = handleClipboardPaste({ editor, view: editor.view }, html, text);

              // If the paste is not handled, dispatch a native paste event
              // only if helper didn't fully handle the paste
              if (!handled) {
                const dataTransfer = new DataTransfer();
                if (html) dataTransfer.setData('text/html', html);
                if (text) dataTransfer.setData('text/plain', text);

                const event = new ClipboardEvent('paste', {
                  clipboardData: dataTransfer,
                  bubbles: true,
                  cancelable: true,
                });
                editor.view.dom.dispatchEvent(event);
              }
            } catch (error) {
              console.warn('Failed to paste:', error);
            }
          },
          allowedTriggers: [TRIGGERS.click, TRIGGERS.slash],
          requiresClipboard: true,
        },
      ],
    },
  ];

  // Filter sections and their items
  const filteredSections = sections
    .map((section) => {
      const filteredItems = section.items.filter((item) => {
        // If the item requires a specific module and that module is not enabled, return false
        if (item.requiresModule && !isModuleEnabled(editor?.options, item.requiresModule)) return false;
        // If the item requires a selection and there is no selection, return false
        if (item.requiresSelection && !selectedText) return false;
        // If the item is not allowed to be triggered with the current trigger, return false
        if (!item.allowedTriggers.includes(trigger)) return false;
        // If the item requires clipboard content and there is no clipboard content, return false
        if (item.requiresClipboard && !clipboardContent) return false;
        // If the item requires a table parent and there is no table parent, return false
        // Or if we are in a table, do not show 'insert table'
        if ((item.requiresTableParent && !isInTable) || (item.id === 'insert-table' && isInTable)) return false;
        // If the item requires a section parent and there is no section parent, return false
        if (item.requiresSectionParent && !isInSectionNode) return false;
        return true;
      });

      return {
        ...section,
        items: filteredItems,
      };
    })
    .filter((section) => section.items.length > 0);

  return filteredSections;
}
