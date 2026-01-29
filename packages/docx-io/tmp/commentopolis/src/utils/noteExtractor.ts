import type { DocumentFootnote } from '../types';

/**
 * Extract footnote and endnote IDs referenced in the given HTML
 * @param html - HTML string that may contain footnote/endnote references
 * @returns Object with arrays of footnote and endnote IDs
 */
export function extractNoteReferences(html: string): { footnoteIds: string[]; endnoteIds: string[] } {
  if (!html) {
    return { footnoteIds: [], endnoteIds: [] };
  }

  const footnoteIds: string[] = [];
  const endnoteIds: string[] = [];

  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Find all footnote references
  const footnoteLinks = tempDiv.querySelectorAll('a.footnote-link');
  footnoteLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      // Extract ID from href like "#footnote-1"
      const match = href.match(/#footnote-(.+)/);
      if (match && match[1]) {
        footnoteIds.push(match[1]);
      }
    }
  });

  // Find all endnote references
  const endnoteLinks = tempDiv.querySelectorAll('a.endnote-link');
  endnoteLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href) {
      // Extract ID from href like "#endnote-1"
      const match = href.match(/#endnote-(.+)/);
      if (match && match[1]) {
        endnoteIds.push(match[1]);
      }
    }
  });

  return { footnoteIds, endnoteIds };
}

/**
 * Find footnote or endnote by ID in the document's footnotes/endnotes arrays
 * @param noteId - The note ID (the numeric part after the document ID prefix)
 * @param footnotes - Array of document footnotes
 * @param endnotes - Array of document endnotes
 * @param documentId - The document ID to match
 * @returns The matching footnote or endnote, or undefined if not found
 */
export function findNoteById(
  noteId: string,
  footnotes: DocumentFootnote[],
  endnotes: DocumentFootnote[],
  documentId: string
): DocumentFootnote | undefined {
  // Try to find in footnotes
  const footnoteIdToMatch = `${documentId}-footnote-${noteId}`;
  const footnote = footnotes.find(note => note.id === footnoteIdToMatch);
  if (footnote) {
    return footnote;
  }

  // Try to find in endnotes
  const endnoteIdToMatch = `${documentId}-endnote-${noteId}`;
  const endnote = endnotes.find(note => note.id === endnoteIdToMatch);
  if (endnote) {
    return endnote;
  }

  return undefined;
}

/**
 * Append footnote and endnote content to the extracted paragraph HTML
 * @param paragraphsHtml - HTML string containing the extracted paragraphs
 * @param footnotes - Array of document footnotes
 * @param endnotes - Array of document endnotes
 * @param documentId - The document ID
 * @returns HTML string with footnotes/endnotes appended
 */
export function appendNotesToParagraphs(
  paragraphsHtml: string,
  footnotes: DocumentFootnote[],
  endnotes: DocumentFootnote[],
  documentId: string
): string {
  if (!paragraphsHtml) {
    return '';
  }

  // Extract note references from the paragraphs
  const { footnoteIds, endnoteIds } = extractNoteReferences(paragraphsHtml);

  // If no notes are referenced, return the original HTML
  if (footnoteIds.length === 0 && endnoteIds.length === 0) {
    return paragraphsHtml;
  }

  let result = paragraphsHtml;

  // Append footnotes if any are referenced
  if (footnoteIds.length > 0) {
    const footnoteHtmlParts: string[] = [];
    
    footnoteIds.forEach(noteId => {
      // Search only in footnotes array for footnote references
      const footnoteIdToMatch = `${documentId}-footnote-${noteId}`;
      const footnote = footnotes.find(note => note.id === footnoteIdToMatch);
      
      if (footnote && footnote.type === 'footnote') {
        const content = footnote.content || `<p>${footnote.plainText}</p>`;
        footnoteHtmlParts.push(`
          <div class="footnote" id="footnote-${noteId}" style="margin-top: 8px; padding-left: 16px; border-left: 2px solid #93c5fd; font-size: 0.875rem;">
            <a href="#footnote-ref-${noteId}" class="footnote-backlink" style="color: #2563eb; text-decoration: none; font-weight: 600;">${noteId}.</a>
            <span style="margin-left: 4px;">${content}</span>
          </div>
        `);
      }
    });

    if (footnoteHtmlParts.length > 0) {
      result += '\n<div class="footnotes" style="margin-top: 16px;">\n' +
        '<div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">\n' +
        '<div style="font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Footnotes</div>\n' +
        footnoteHtmlParts.join('\n') +
        '\n</div>\n</div>';
    }
  }

  // Append endnotes if any are referenced
  if (endnoteIds.length > 0) {
    const endnoteHtmlParts: string[] = [];
    
    endnoteIds.forEach(noteId => {
      // Search only in endnotes array for endnote references
      const endnoteIdToMatch = `${documentId}-endnote-${noteId}`;
      const endnote = endnotes.find(note => note.id === endnoteIdToMatch);
      
      if (endnote && endnote.type === 'endnote') {
        const content = endnote.content || `<p>${endnote.plainText}</p>`;
        endnoteHtmlParts.push(`
          <div class="endnote" id="endnote-${noteId}" style="margin-top: 8px; padding-left: 16px; border-left: 2px solid #a78bfa; font-size: 0.875rem;">
            <a href="#endnote-ref-${noteId}" class="endnote-backlink" style="color: #7c3aed; text-decoration: none; font-weight: 600;">${noteId}.</a>
            <span style="margin-left: 4px;">${content}</span>
          </div>
        `);
      }
    });

    if (endnoteHtmlParts.length > 0) {
      result += '\n<div class="endnotes" style="margin-top: 16px;">\n' +
        '<div style="border-top: 1px solid #e5e7eb; padding-top: 12px; margin-top: 12px;">\n' +
        '<div style="font-size: 0.75rem; font-weight: 600; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Endnotes</div>\n' +
        endnoteHtmlParts.join('\n') +
        '\n</div>\n</div>';
    }
  }

  return result;
}
