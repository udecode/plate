/**
 * Utility functions for extracting paragraphs from document HTML
 */

/**
 * Extract paragraphs from paragraphs array based on paragraph indices
 * @param paragraphs - Array of paragraph HTML strings in document order
 * @param paragraphIndices - Array of paragraph indices to extract
 * @returns HTML string containing the extracted paragraphs
 */
export function extractParagraphsByIndex(paragraphs: string[], paragraphIndices: number[]): string {
  if (!paragraphs || !paragraphIndices || paragraphIndices.length === 0) {
    return '';
  }

  // Extract paragraphs by indices in the order specified
  const extractedParagraphs: string[] = [];
  
  paragraphIndices.forEach(index => {
    if (index >= 0 && index < paragraphs.length) {
      extractedParagraphs.push(paragraphs[index]);
    }
  });

  // Return the HTML of extracted paragraphs
  return extractedParagraphs.join('\n');
}

/**
 * @deprecated Use extractParagraphsByIndex instead. This function is kept for backward compatibility.
 * Extract paragraphs from HTML based on paragraph IDs
 * @param html - The full document HTML content
 * @param paragraphIds - Array of paragraph IDs to extract
 * @returns HTML string containing the extracted paragraphs
 */
export function extractParagraphsById(html: string, paragraphIds: string[]): string {
  if (!html || !paragraphIds || paragraphIds.length === 0) {
    return '';
  }

  // Create a temporary DOM element to parse the HTML
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  // Find all paragraphs with matching data-para-id attributes
  const extractedParagraphs: HTMLElement[] = [];
  
  paragraphIds.forEach(paraId => {
    const paragraph = tempDiv.querySelector(`[data-para-id="${paraId}"]`);
    if (paragraph) {
      extractedParagraphs.push(paragraph as HTMLElement);
    }
  });

  // Return the HTML of extracted paragraphs
  return extractedParagraphs.map(p => p.outerHTML).join('\n');
}

/**
 * Get paragraph indices from a comment
 * @param comment - The document comment
 * @returns Array of paragraph indices referenced by the comment
 */
export function getParagraphIndicesFromComment(comment: { paragraphIds?: number[] }): number[] {
  return comment.paragraphIds || [];
}

/**
 * @deprecated Use getParagraphIndicesFromComment instead. This function is kept for backward compatibility.
 * Get paragraph IDs from a comment
 * @param comment - The document comment
 * @returns Array of paragraph IDs referenced by the comment
 */
export function getParagraphIdsFromComment(comment: { paragraphIds?: string[] | number[] }): (string | number)[] {
  return comment.paragraphIds || [];
}
