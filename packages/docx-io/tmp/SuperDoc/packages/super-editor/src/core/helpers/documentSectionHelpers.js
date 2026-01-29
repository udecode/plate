import { DOMSerializer } from 'prosemirror-model';

/**
 * Get all sections in the editor document.
 * This function traverses the document and collects all nodes of the specified section type.
 * @param {Editor} editor - The editor instance to search within.
 * @returns {Array} An array of objects containing the node and its position in the document
 */
const getAllSections = (editor) => {
  if (!editor) return [];
  const type = editor.schema.nodes.documentSection;
  if (!type) return [];

  const sections = [];
  const { state } = editor;
  state.doc.descendants((node, pos) => {
    if (node.type.name === type.name) {
      sections.push({ node, pos });
    }
  });
  return sections;
};

/**
 * Export all sections to HTML format.
 * This function retrieves all sections in the editor and converts them to HTML.
 * @param {Editor} editor - The editor instance containing the sections.
 * @returns {Array} An array of objects containing section details and their HTML representation.
 */
export const exportSectionsToHTML = (editor) => {
  const sections = getAllSections(editor);

  const processedSections = new Set();
  const result = [];
  sections.forEach(({ node }) => {
    const { attrs } = node;
    const { id, title, description } = attrs;
    if (processedSections.has(id)) return;
    processedSections.add(id);

    const html = getHTMLFromNode(node, editor);
    result.push({
      id,
      title,
      description,
      html,
    });
  });
  return result;
};

/**
 * Get HTML representation of a ProseMirror node.
 * @param {Node} node - The ProseMirror node to convert.
 * @param {Editor} editor - The editor instance used for serialization.
 * @returns {String} The HTML representation of the node's content.
 */
const getHTMLFromNode = (node, editor) => {
  const tempDocument = document.implementation.createHTMLDocument();
  const container = tempDocument.createElement('div');
  const fragment = DOMSerializer.fromSchema(editor.schema).serializeFragment(node.content);
  container.appendChild(fragment);
  let html = container.innerHTML;
  return html;
};

/**
 * Export all sections to JSON format.
 * This function retrieves all sections in the editor and converts them to JSON.
 * @param {Editor} editor - The editor instance containing the sections.
 * @returns {Array} An array of objects containing section details and their JSON representation.
 */
export const exportSectionsToJSON = (editor) => {
  const sections = getAllSections(editor);
  const processedSections = new Set();
  const result = [];
  sections.forEach(({ node }) => {
    const { attrs } = node;
    const { id, title, description } = attrs;
    if (processedSections.has(id)) return;
    processedSections.add(id);

    result.push({
      id,
      title,
      description,
      content: node.toJSON(),
    });
  });
  return result;
};

/**
 * Get a linked section editor by its ID.
 * This function creates a child editor for a specific section, allowing for editing of that section's content.
 * @param {String} id - The ID of the section to link to.
 * @param {Object} options - Options for the child editor.
 * @param {Editor} editor - The parent editor instance.
 * @returns {Editor|null} The child editor instance for the linked section, or null if the section is not found.
 */
export const getLinkedSectionEditor = (id, options, editor) => {
  const sections = getAllSections(editor);
  const section = sections.find((s) => s.node.attrs.id === id);
  if (!section) return null;

  const child = editor.createChildEditor({
    ...options,
    onUpdate: ({ editor: childEditor, transaction }) => {
      const isFromtLinkedParent = transaction.getMeta('fromLinkedParent');
      if (isFromtLinkedParent) return; // Prevent feedback loop

      // 1. Get updated content from child editor
      const updatedContent = childEditor.state.doc.content;

      // 2. Find the section node and its position in the parent
      const sectionNode = getAllSections(editor)?.find((s) => s.node.attrs.id === id);
      if (!sectionNode) return;

      const { pos, node } = sectionNode;

      // 3. Create a new node with the same type and attrs, but updated content
      const newNode = node.type.create(node.attrs, updatedContent, node.marks);

      // 4. Replace the old node with the new node in the parent editor
      const tr = editor.state.tr.replaceWith(pos, pos + node.nodeSize, newNode);
      tr.setMeta('fromLinkedChild', true); // Prevent feedback loop
      editor.view.dispatch(tr);
    },
  });

  editor.on('update', ({ transaction }) => {
    const isFromLinkedChild = transaction.getMeta('fromLinkedChild');
    if (isFromLinkedChild) return; // Prevent feedback loop

    const sectionNode = getAllSections(editor)?.find((s) => s.node.attrs.id === id);
    if (!sectionNode) return;

    // Only update if content is actually different
    const sectionContent = sectionNode.node.content;

    const json = {
      type: 'doc',
      content: sectionContent.content.map((node) => node.toJSON()),
    };

    const childTr = child.state.tr;
    childTr.setMeta('fromLinkedParent', true); // Prevent feedback loop
    childTr.replaceWith(0, child.state.doc.content.size, child.schema.nodeFromJSON(json));
    child.view.dispatch(childTr);
  });

  return child;
};

/**
 * SectionHelpers provides utility functions for working with sections in the editor.
 * It includes methods to retrieve all sections and manage section-related data.
 */
export const SectionHelpers = {
  getAllSections,
  exportSectionsToHTML,
  exportSectionsToJSON,
  getLinkedSectionEditor,
};
