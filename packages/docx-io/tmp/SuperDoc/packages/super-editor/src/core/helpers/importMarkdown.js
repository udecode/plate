// @ts-check
import { marked } from 'marked';
import { createDocFromHTML } from './importHtml.js';

// Configure marked once
marked.use({
  breaks: false, // Use proper paragraphs, not <br> tags
  gfm: true, // GitHub Flavored Markdown support
});

/**
 * Create a ProseMirror document from Markdown content
 * @param {string} markdown - Markdown content
 * @param {Object} schema - ProseMirror schema
 * @returns {Object} Document node
 */
export function createDocFromMarkdown(markdown, schema) {
  const html = convertMarkdownToHTML(markdown);
  return createDocFromHTML(html, schema);
}

/**
 * Convert Markdown to HTML with SuperDoc/DOCX compatibility
 * @param {string} markdown - Markdown content
 * @returns {string} HTML content
 */
export function convertMarkdownToHTML(markdown) {
  let html = marked.parse(markdown, { async: false });

  // Add spacing between paragraphs and lists for proper DOCX rendering
  return html
    .replace(/<\/p>\n<ul>/g, '</p>\n<p>&nbsp;</p>\n<ul>')
    .replace(/<\/p>\n<ol>/g, '</p>\n<p>&nbsp;</p>\n<ol>')
    .replace(/<\/ul>\n<h/g, '</ul>\n<p>&nbsp;</p>\n<h')
    .replace(/<\/ol>\n<h/g, '</ol>\n<p>&nbsp;</p>\n<h');
}
