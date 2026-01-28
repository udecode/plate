// @ts-check

/**
 * Base section attributes
 * @typedef {Object} SectionAttributes
 * @property {number} [id] - Section identifier
 * @property {string} [title] - Section title
 * @property {string} [description] - Section description
 * @property {string} [sectionType] - Type of section
 * @property {boolean} [isLocked] - Whether section is locked
 */

/**
 * Options for creating a section
 * @typedef {Object} SectionCreate
 * @property {number} [id] - Section identifier (auto-generated if not provided)
 * @property {string} [title] - Section title (defaults to "Document section")
 * @property {string} [description] - Section description
 * @property {string} [sectionType] - Type of section
 * @property {boolean} [isLocked] - Whether section is locked
 * @property {string} [html] - HTML content to parse
 * @property {Object} [json] - ProseMirror JSON content (takes precedence over html)
 */

/**
 * Options for updating a section
 * @typedef {Object} SectionUpdate
 * @property {number} id - Section ID to update (required)
 * @property {string} [html] - HTML content to parse
 * @property {Object} [json] - ProseMirror JSON content (takes precedence over html)
 * @property {Partial<SectionAttributes>} [attrs] - Attributes to update
 */

import { Node, Attribute } from '@core/index.js';
import { DocumentSectionView } from './document-section/DocumentSectionView.js';
import { htmlHandler } from '@core/InputRule.js';
import { Selection } from 'prosemirror-state';
import { DOMParser as PMDOMParser } from 'prosemirror-model';
import { findParentNode, SectionHelpers } from '@helpers/index.js';

/**
 * Document Section - Structured content blocks
 * @module DocumentSection
 */
export const DocumentSection = Node.create({
  name: 'documentSection',
  group: 'block',
  content: 'block*',
  atom: true,
  isolating: true,

  addOptions() {
    return {
      htmlAttributes: {
        class: 'sd-document-section-block',
        'aria-label': 'Structured content block',
      },
    };
  },

  parseDOM() {
    return [
      {
        tag: 'div.sd-document-section-block',
        priority: 60,
      },
    ];
  },

  renderDOM({ htmlAttributes }) {
    return ['div', Attribute.mergeAttributes(this.options.htmlAttributes, htmlAttributes), 0];
  },

  addAttributes() {
    return {
      id: {},
      sdBlockId: {
        default: null,
        keepOnSplit: false,
        parseDOM: (elem) => elem.getAttribute('data-sd-block-id'),
        renderDOM: (attrs) => {
          return attrs.sdBlockId ? { 'data-sd-block-id': attrs.sdBlockId } : {};
        },
      },
      title: {},
      description: {},
      sectionType: {},
      isLocked: { default: false },
    };
  },

  addNodeView() {
    return ({ node, editor, getPos, decorations }) => {
      return new DocumentSectionView(node, getPos, decorations, editor);
    };
  },

  addCommands() {
    return {
      /**
       * Create a new document section
       * @category Command
       * @param {SectionCreate} [options={}]
       * @returns {Function} Command function - returns true if section was created successfully
       */
      createDocumentSection:
        (options = {}) =>
        ({ tr, state, dispatch, editor }) => {
          const { selection } = state;
          let { from, to } = selection;

          let content = selection.content().content;
          const { html: optionsHTML, json: optionsJSON } = options;

          // If HTML is provided, parse it and convert to ProseMirror nodes
          if (optionsHTML) {
            const html = htmlHandler(optionsHTML, this.editor);
            const doc = PMDOMParser.fromSchema(this.editor.schema).parse(html);
            content = doc.content;
          }

          // JSON takes priority over HTML
          if (optionsJSON) {
            content = this.editor.schema.nodeFromJSON(optionsJSON);
          }

          if (!content?.content?.length) {
            content = this.editor.schema.nodeFromJSON({ type: 'paragraph', content: [] });
          }

          // We assign IDs as positive integers starting from 0.
          if (!options.id) {
            const allSections = SectionHelpers.getAllSections(editor);
            options.id = allSections.length + 1;
          }

          if (!options.title) {
            options.title = 'Document section';
          }

          const node = this.type.createAndFill(options, content);
          if (!node) return false;

          const isAlreadyInSdtBlock = findParentNode((node) => node.type.name === 'documentSection')(selection);
          if (isAlreadyInSdtBlock && isAlreadyInSdtBlock.node) {
            const insertPos = isAlreadyInSdtBlock.pos + isAlreadyInSdtBlock.node.nodeSize;
            from = insertPos;
            to = insertPos;
          }

          // Replace the selection with the new node
          tr.replaceRangeWith(from, to, node);

          // Calculate where the node ends after insertion
          const nodeEnd = from + node.nodeSize;

          // Only insert paragraph if we're not at the document boundary and there's space
          let shouldInsertParagraph = true;
          let insertPos = nodeEnd;

          // Check if we can safely insert at this position
          if (nodeEnd >= tr.doc.content.size) {
            // We're at or beyond the document end
            insertPos = tr.doc.content.size;

            // Check if there's already content at the end
            if (insertPos > 0) {
              const $endPos = tr.doc.resolve(insertPos);
              if ($endPos.nodeBefore && $endPos.nodeBefore.type.name === 'paragraph') {
                shouldInsertParagraph = false; // There's already a paragraph
              }
            }
          }

          if (shouldInsertParagraph) {
            const emptyParagraph = tr.doc.type.schema.nodes.paragraph.create();
            tr.insert(insertPos, emptyParagraph);
          }

          if (dispatch) {
            tr.setMeta('documentSection', { action: 'create' });
            dispatch(tr);

            // Set selection after the DOM has updated
            setTimeout(() => {
              try {
                const currentState = editor.state;
                const docSize = currentState.doc.content.size;

                // Calculate target position more safely
                let targetPos = from + node.nodeSize;

                // If we inserted a paragraph, position inside it
                if (shouldInsertParagraph) {
                  targetPos += 1; // +1 to get inside the paragraph
                }

                // Ensure we don't go beyond document bounds
                targetPos = Math.min(targetPos, docSize);

                // Ensure we have a valid position (at least 1 if document has content)
                if (targetPos < docSize && targetPos > 0) {
                  const newSelection = Selection.near(currentState.doc.resolve(targetPos));
                  const newTr = currentState.tr.setSelection(newSelection);
                  editor.view.dispatch(newTr);
                }
              } catch (e) {
                console.warn('Could not set delayed selection:', e);
              }
            }, 0);
          }

          return true;
        },

      /**
       * Remove section at current selection, keeping content
       * @category Command
       * @returns {Function} Command function - returns true if section was removed, false if none found
       */
      removeSectionAtSelection:
        () =>
        ({ tr, dispatch }) => {
          const sdtNode = findParentNode((node) => node.type.name === 'documentSection')(tr.selection);
          if (!sdtNode) return false;

          const { node, pos } = sdtNode;

          // Calculate positions before making changes
          const nodeStart = pos;
          const nodeEnd = nodeStart + node.nodeSize;

          // Extract the content we want to preserve
          const contentToPreserve = node.content;

          // Delete the entire structured content block
          tr.delete(nodeStart, nodeEnd);

          // Insert the preserved content at the same position
          if (contentToPreserve.size > 0) {
            tr.insert(nodeStart, contentToPreserve);
          }

          // Set selection to a safe position after the operation
          const newPos = Math.min(nodeStart, tr.doc.content.size);
          tr.setSelection(Selection.near(tr.doc.resolve(newPos)));

          if (dispatch) {
            tr.setMeta('documentSection', { action: 'delete' });
            dispatch(tr);
          }

          return true;
        },

      /**
       * Remove section by ID
       * @category Command
       * @param {number} id - Section ID to remove
       * @returns {Function} Command function - returns true if section was removed, false if not found
       */
      removeSectionById:
        (id) =>
        ({ tr, dispatch }) => {
          const sections = SectionHelpers.getAllSections(this.editor);
          const sectionToRemove = sections.find(({ node }) => node.attrs.id === id);
          if (!sectionToRemove) return false;

          const { pos, node } = sectionToRemove;
          const nodeStart = pos;
          const nodeEnd = nodeStart + node.nodeSize;

          // Delete the entire structured content block
          tr.delete(nodeStart, nodeEnd);

          if (dispatch) {
            tr.setMeta('documentSection', { action: 'delete', id });
            dispatch(tr);
          }

          return true;
        },

      /**
       * Lock section by ID
       * @category Command
       * @param {number} id - Section ID to lock
       * @returns {Function} Command function - returns true if section was locked, false if not found
       * @private
       */
      lockSectionById:
        (id) =>
        ({ tr, dispatch }) => {
          const sections = SectionHelpers.getAllSections(this.editor);
          const sectionToLock = sections.find(({ node }) => node.attrs.id === id);
          if (!sectionToLock) return false;

          tr.setNodeMarkup(sectionToLock.pos, null, { ...sectionToLock.node.attrs, isLocked: true });

          if (dispatch) {
            tr.setMeta('documentSection', { action: 'lock', id });
            dispatch(tr);
          }

          return true;
        },

      /**
       * Update section by ID
       * @category Command
       * @param {SectionUpdate} options
       * @returns {Function} Command function - returns true if section was updated, false if not found
       */
      updateSectionById:
        ({ id, html, json, attrs }) =>
        ({ tr, dispatch, editor }) => {
          const sections = SectionHelpers.getAllSections(editor || this.editor);
          const sectionToUpdate = sections.find(({ node }) => node.attrs.id === id);
          if (!sectionToUpdate) return false;

          const { pos, node } = sectionToUpdate;
          let newContent = null;

          // If HTML is provided, parse it and convert to ProseMirror nodes
          if (html) {
            const htmlDoc = htmlHandler(html, editor || this.editor);
            const doc = PMDOMParser.fromSchema((editor || this.editor).schema).parse(htmlDoc);
            newContent = doc.content;
          }

          // JSON takes priority over HTML
          if (json) {
            newContent = (editor || this.editor).schema.nodeFromJSON(json);
          }

          // If no new content, keep the old content
          if (!newContent) {
            newContent = node.content;
          }

          const updatedNode = node.type.create({ ...node.attrs, ...attrs }, newContent, node.marks);

          tr.replaceWith(pos, pos + node.nodeSize, updatedNode);

          if (dispatch) {
            tr.setMeta('documentSection', { action: 'update', id, attrs });
            dispatch(tr);
          }

          return true;
        },
    };
  },
});
