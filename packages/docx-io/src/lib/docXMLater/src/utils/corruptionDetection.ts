/**
 * Corruption Detection - Utilities to detect and diagnose XML corruption in documents
 *
 * This module helps users identify when they've accidentally passed XML-like strings
 * to text methods instead of using the proper API. This is a common mistake that
 * results in escaped XML tags being displayed as literal text in Word.
 */

import { Paragraph } from '../elements/Paragraph';
import { Run } from '../elements/Run';

/**
 * Types of corruption that can be detected
 */
export type CorruptionType =
  | 'escaped-xml' // &lt;w:t&gt; style escaping
  | 'xml-tags' // <w:t> tags in text
  | 'entities' // &quot; &apos; etc.
  | 'mixed'; // Multiple types

/**
 * Location of corruption within a document
 */
export interface CorruptionLocation {
  /** Index of the paragraph containing corruption */
  paragraphIndex: number;
  /** Index of the run within the paragraph */
  runIndex: number;
  /** The corrupted text content */
  text: string;
  /** Type of corruption detected */
  corruptionType: CorruptionType;
  /** Suggested fix for the corruption */
  suggestedFix: string;
  /** Length of corrupted text */
  length: number;
}

/**
 * Comprehensive corruption report for a document
 */
export interface CorruptionReport {
  /** Whether any corruption was found */
  isCorrupted: boolean;
  /** Total number of corrupted locations */
  totalLocations: number;
  /** Detailed list of corruption locations */
  locations: CorruptionLocation[];
  /** Human-readable summary */
  summary: string;
  /** Statistics about corruption types */
  statistics: {
    escapedXml: number;
    xmlTags: number;
    entities: number;
    mixed: number;
  };
}

/**
 * Detects XML corruption in a document
 *
 * Scans all paragraphs and runs to find text that contains escaped XML
 * or XML-like patterns that suggest the user passed XML strings to text methods.
 *
 * @param doc - The document to scan
 * @returns Corruption report with locations and suggested fixes
 *
 * @example
 * ```typescript
 * const doc = await Document.load('corrupted.docx');
 * const report = detectCorruptionInDocument(doc);
 *
 * if (report.isCorrupted) {
 *   console.log(report.summary);
 *   report.locations.forEach(loc => {
 *     console.log(`Paragraph ${loc.paragraphIndex}, Run ${loc.runIndex}: ${loc.suggestedFix}`);
 *   });
 * }
 * ```
 */
export function detectCorruptionInDocument(doc: any): CorruptionReport {
  const locations: CorruptionLocation[] = [];
  const stats = {
    escapedXml: 0,
    xmlTags: 0,
    entities: 0,
    mixed: 0,
  };

  // Get all paragraphs from the document
  const paragraphs = doc.getAllParagraphs ? doc.getAllParagraphs() : [];

  // Scan each paragraph
  for (let pIdx = 0; pIdx < paragraphs.length; pIdx++) {
    const paragraph = paragraphs[pIdx];
    if (!paragraph || !(paragraph instanceof Paragraph)) {
      continue;
    }

    // Get runs from paragraph
    const runs = paragraph.getRuns();

    // Scan each run
    for (let rIdx = 0; rIdx < runs.length; rIdx++) {
      const run = runs[rIdx];
      if (!run || !(run instanceof Run)) {
        continue;
      }

      const text = run.getText();
      if (!text || text.length === 0) {
        continue;
      }

      // Check for corruption in this text
      const corruption = detectCorruptionInText(text);

      if (corruption.isCorrupted) {
        locations.push({
          paragraphIndex: pIdx,
          runIndex: rIdx,
          text,
          corruptionType: corruption.type,
          suggestedFix: corruption.suggestedFix,
          length: text.length,
        });

        // Update statistics
        if (corruption.type === 'escaped-xml') stats.escapedXml++;
        else if (corruption.type === 'xml-tags') stats.xmlTags++;
        else if (corruption.type === 'entities') stats.entities++;
        else if (corruption.type === 'mixed') stats.mixed++;
      }
    }
  }

  // Generate summary
  const summary = generateSummary(locations, stats);

  return {
    isCorrupted: locations.length > 0,
    totalLocations: locations.length,
    locations,
    summary,
    statistics: stats,
  };
}

/**
 * Internal result from text corruption detection
 */
interface TextCorruptionResult {
  isCorrupted: boolean;
  type: CorruptionType;
  suggestedFix: string;
}

/**
 * Detects XML corruption in a single text string
 *
 * Checks for common patterns that indicate the user passed XML strings
 * instead of plain text.
 *
 * @param text - Text to check
 * @returns True if corruption detected
 *
 * @example
 * ```typescript
 * const corrupted = detectCorruptionInText('Hello &lt;w:t&gt;World');
 * // Returns: true
 *
 * const clean = detectCorruptionInText('Hello World');
 * // Returns: false
 * ```
 */
export function detectCorruptionInText(text: string): TextCorruptionResult {
  if (!text || typeof text !== 'string') {
    return {
      isCorrupted: false,
      type: 'mixed',
      suggestedFix: String(text || ''),
    };
  }

  let hasEscapedXml = false;
  let hasXmlTags = false;
  let hasEntities = false;

  // Pattern 1: Escaped XML tags (most common corruption)
  // Matches: &lt;w:t&gt;, &lt;/w:t&gt;, &lt;w:r&gt;, etc.
  const escapedXmlPattern = /&lt;\/?w:[a-z]+[^&]*&gt;/i;
  if (escapedXmlPattern.test(text)) {
    hasEscapedXml = true;
  }

  // Pattern 2: Raw XML tags (less common, but possible)
  // Matches: <w:t>, </w:t>, <w:r>, etc.
  const xmlTagPattern = /<\/?w:[a-z]+[^>]*>/i;
  if (xmlTagPattern.test(text)) {
    hasXmlTags = true;
  }

  // Pattern 3: Escaped entities combined with Word XML attributes
  // ONLY flag if we see Word-specific patterns, not just any entities
  // This avoids false positives from legitimate escaped characters
  // Matches all OOXML namespaces: w: (word), a: (drawingML), pic: (picture), r: (relationships), wp: (word drawing)
  const wordXmlAttributePattern =
    /(&lt;(?:w|a|r|pic|wp|m|mc|wpc|wps|wpg|c|dgm|o|v):|xml:space=&quot;preserve&quot;)/i;
  if (wordXmlAttributePattern.test(text)) {
    hasEntities = true;
  }

  // Determine corruption type
  const corruptionCount = [hasEscapedXml, hasXmlTags, hasEntities].filter(
    Boolean
  ).length;

  if (corruptionCount === 0) {
    return { isCorrupted: false, type: 'mixed', suggestedFix: text };
  }

  // More precise type detection - check primary indicator first
  let type: CorruptionType;
  if (hasEscapedXml && (hasEntities || hasXmlTags)) {
    // Escaped XML combined with other patterns - this is the classic corruption case
    type = 'escaped-xml';
  } else if (hasXmlTags && hasEntities) {
    type = 'xml-tags';
  } else if (corruptionCount > 1) {
    type = 'mixed';
  } else if (hasEscapedXml) {
    type = 'escaped-xml';
  } else if (hasXmlTags) {
    type = 'xml-tags';
  } else {
    type = 'entities';
  }

  const suggestedFix = suggestFix(text);

  return { isCorrupted: true, type, suggestedFix };
}

/**
 * Suggests a fix for corrupted text
 *
 * Attempts to clean XML patterns from text to restore the intended content.
 * Uses the same cleaning logic as cleanXmlFromText() from validation.ts.
 *
 * @param corruptedText - Text containing XML corruption
 * @returns Cleaned text with XML patterns removed
 *
 * @example
 * ```typescript
 * const fixed = suggestFix('Hello &lt;w:t&gt;World&lt;/w:t&gt;');
 * // Returns: 'Hello World'
 * ```
 */
export function suggestFix(corruptedText: string): string {
  if (!corruptedText || typeof corruptedText !== 'string') {
    return corruptedText;
  }

  let cleaned = corruptedText;

  // Step 1: Unescape XML entities first
  cleaned = cleaned
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&');

  // Step 2: Remove Word XML tags
  // Matches: <w:t xml:space="preserve">, </w:t>, <w:r>, etc.
  cleaned = cleaned.replace(/<w:[^>]+>/g, '');
  cleaned = cleaned.replace(/<\/w:[^>]+>/g, '');

  // Step 3: Remove any remaining XML-like tags
  cleaned = cleaned.replace(/<[^>]+>/g, '');

  // Step 4: Clean up whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Generates a human-readable summary of corruption
 */
function generateSummary(
  locations: CorruptionLocation[],
  stats: {
    escapedXml: number;
    xmlTags: number;
    entities: number;
    mixed: number;
  }
): string {
  if (locations.length === 0) {
    return 'No corruption detected. Document is clean.';
  }

  const lines: string[] = [];
  lines.push(
    `Found ${locations.length} corrupted text location(s) in the document.`
  );
  lines.push('');
  lines.push('Corruption breakdown:');

  if (stats.escapedXml > 0) {
    lines.push(`  - Escaped XML: ${stats.escapedXml} location(s)`);
  }
  if (stats.xmlTags > 0) {
    lines.push(`  - XML Tags: ${stats.xmlTags} location(s)`);
  }
  if (stats.entities > 0) {
    lines.push(`  - XML Entities: ${stats.entities} location(s)`);
  }
  if (stats.mixed > 0) {
    lines.push(`  - Mixed: ${stats.mixed} location(s)`);
  }

  lines.push('');
  lines.push(
    'This corruption typically occurs when XML strings are passed to text methods.'
  );
  lines.push('Instead of: paragraph.addText("Text<w:t>1</w:t>")');
  lines.push('Use: paragraph.addText("Text"); paragraph.addText("1");');
  lines.push('');
  lines.push(
    'To automatically clean text, use: new Run(text, { cleanXmlFromText: true })'
  );

  return lines.join('\n');
}

/**
 * Checks if text looks like it might be corrupted (less strict check)
 *
 * This is a quick check that can be used for warnings without full analysis.
 *
 * @param text - Text to check
 * @returns True if text might be corrupted
 */
export function looksCorrupted(text: string): boolean {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Quick regex checks for common corruption patterns
  return (
    /&lt;\/?(w|r|p):[a-z]+/i.test(text) ||
    /<\/?(w|r|p):[a-z]+/i.test(text) ||
    /xml:space=&quot;/i.test(text)
  );
}
