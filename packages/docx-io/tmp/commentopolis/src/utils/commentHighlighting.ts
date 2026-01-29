/**
 * Utility functions for applying comment range highlighting to paragraph HTML
 */

import type { CommentRange } from '../types';

/**
 * Apply highlighting to paragraphs based on comment ranges
 * 
 * This function wraps the specified span ranges in each paragraph with a highlight element.
 * It uses the DOM to parse and manipulate the HTML, ensuring proper nesting.
 * 
 * @param paragraphs - Array of paragraph HTML strings
 * @param ranges - Array of comment ranges specifying which spans to highlight
 * @returns Array of paragraph HTML strings with highlighting applied
 */
export function applyCommentHighlighting(
  paragraphs: string[],
  ranges: CommentRange[]
): string[] {
  if (!ranges || ranges.length === 0) {
    return paragraphs;
  }

  // Create a copy of paragraphs to avoid mutating the original
  const highlightedParagraphs = [...paragraphs];

  // Group ranges by paragraph index
  const rangesByParagraph = new Map<number, CommentRange[]>();
  ranges.forEach(range => {
    if (!rangesByParagraph.has(range.paragraphIndex)) {
      rangesByParagraph.set(range.paragraphIndex, []);
    }
    rangesByParagraph.get(range.paragraphIndex)!.push(range);
  });

  // Apply highlighting to each paragraph that has ranges
  rangesByParagraph.forEach((paragraphRanges, paragraphIndex) => {
    if (paragraphIndex >= 0 && paragraphIndex < paragraphs.length) {
      highlightedParagraphs[paragraphIndex] = applyHighlightingToParagraph(
        paragraphs[paragraphIndex],
        paragraphRanges
      );
    }
  });

  return highlightedParagraphs;
}

/**
 * Apply highlighting to a single paragraph HTML string
 * 
 * @param paragraphHtml - HTML string of a single paragraph
 * @param ranges - Array of ranges to highlight in this paragraph
 * @returns Modified paragraph HTML with highlighting applied
 */
function applyHighlightingToParagraph(
  paragraphHtml: string,
  ranges: CommentRange[]
): string {
  // Parse the paragraph HTML using DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(paragraphHtml, 'text/html');
  const paragraph = doc.body.firstElementChild;

  if (!paragraph) {
    return paragraphHtml;
  }

  // Get all direct child spans (excluding numbering spans)
  const allSpans = Array.from(paragraph.children).filter(child => {
    // Skip numbering-text spans
    return child.tagName === 'SPAN' && !child.classList.contains('numbering-text');
  });

  // Apply each range
  ranges.forEach(range => {
    const { startSpanIndex, endSpanIndex } = range;
    
    // Validate and clamp indices
    if (startSpanIndex < 0 || startSpanIndex >= allSpans.length) {
      return;
    }
    
    // Clamp endSpanIndex to the actual number of spans
    const clampedEndSpanIndex = Math.min(endSpanIndex, allSpans.length);
    
    if (startSpanIndex >= clampedEndSpanIndex) {
      return;
    }

    // Get the spans to be highlighted
    const spansToHighlight = allSpans.slice(startSpanIndex, clampedEndSpanIndex);
    
    if (spansToHighlight.length === 0) {
      return;
    }

    // Create a wrapper element for the highlight
    const wrapper = document.createElement('mark');
    wrapper.className = 'comment-highlight';

    // Insert the wrapper before the first span to highlight
    const firstSpan = spansToHighlight[0];
    firstSpan.parentElement?.insertBefore(wrapper, firstSpan);

    // Move all spans into the wrapper
    spansToHighlight.forEach(span => {
      wrapper.appendChild(span);
    });
  });

  return paragraph.outerHTML;
}

/**
 * Extract paragraphs by indices and apply highlighting
 * 
 * This is a convenience function that combines paragraph extraction with highlighting.
 * 
 * @param paragraphs - Array of all paragraph HTML strings
 * @param paragraphIndices - Indices of paragraphs to extract
 * @param ranges - Comment ranges to highlight
 * @returns HTML string of extracted and highlighted paragraphs
 */
export function extractAndHighlightParagraphs(
  paragraphs: string[],
  paragraphIndices: number[],
  ranges: CommentRange[]
): string {
  if (!paragraphs || !paragraphIndices || paragraphIndices.length === 0) {
    return '';
  }

  // Extract the specified paragraphs
  const extractedParagraphs = paragraphIndices
    .filter(index => index >= 0 && index < paragraphs.length)
    .map(index => paragraphs[index]);

  // Apply highlighting to the extracted paragraphs
  // We need to adjust the range indices relative to the extracted paragraphs
  const adjustedRanges = ranges.map(range => {
    // Find the new index of this paragraph in the extracted array
    const newIndex = paragraphIndices.indexOf(range.paragraphIndex);
    if (newIndex === -1) {
      return null; // This range is not in the extracted paragraphs
    }
    return {
      ...range,
      paragraphIndex: newIndex
    };
  }).filter((range): range is CommentRange => range !== null);

  const highlightedParagraphs = applyCommentHighlighting(extractedParagraphs, adjustedRanges);

  return highlightedParagraphs.join('\n');
}
