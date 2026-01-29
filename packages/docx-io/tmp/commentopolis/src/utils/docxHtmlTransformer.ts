/**
 * DOCX to HTML Transformer
 * Converts Word document runs and paragraphs from XML to HTML format
 */
import type { DocumentFootnote } from '../types';
import { 
  getNumberingText, 
  createNumberingCounters, 
  getOrCreateCounter, 
  incrementCounter,
  type NumberingCounters,
  type NumberingCounter,
  type NumberingScheme
} from './numbering';

export interface TransformedContent {
  html: string;
  plainText: string;
  paragraphs: string[]; // Array of paragraph HTML strings in document order
  commentToParagraphMap?: Map<string, number[]>; // Maps comment ID to array of paragraph indices
  commentRanges?: Map<string, CommentRangeInfo[]>; // Maps comment ID to array of range info
}

export interface RunProperties {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean | string; // boolean for simple underline, string for underline types like 'single', 'double', 'none'
  fontSize?: string;
  color?: string;
  fontFamily?: string;
  highlight?: string;
  strikethrough?: boolean;
  doubleStrikethrough?: boolean;
  allCaps?: boolean;
  smallCaps?: boolean;
  verticalAlign?: 'superscript' | 'subscript';
  rStyle?: string; // Character style reference
  // Tracked changes properties
  revision?: {
    type: 'insertion' | 'deletion' | 'moveFrom' | 'moveTo';
    author?: string;
    date?: string;
    id?: string;
  };
}

export interface ParagraphProperties {
  alignment?: 'left' | 'center' | 'right' | 'justify';
  indentation?: {
    left?: number;
    right?: number;
    firstLine?: number;
  };
  spacing?: {
    before?: number;
    after?: number;
    lineSpacing?: number;
  };
  numbering?: {
    numId?: string;
    ilvl?: number;
  };
  pStyle?: string; // Paragraph style reference
  runProperties?: RunProperties; // Run properties at paragraph level
}

export interface TableProperties {
  alignment?: 'left' | 'center' | 'right';
  width?: string;
  border?: {
    style?: string;
    width?: string;
    color?: string;
  };
}

export interface TableCellProperties {
  width?: string;
  alignment?: 'left' | 'center' | 'right' | 'justify';
  verticalAlignment?: 'top' | 'middle' | 'bottom';
  background?: string;
  border?: {
    top?: { style?: string; width?: string; color?: string; };
    bottom?: { style?: string; width?: string; color?: string; };
    left?: { style?: string; width?: string; color?: string; };
    right?: { style?: string; width?: string; color?: string; };
  };
}

/**
 * Extract run properties from Word XML run properties element
 */
function extractRunProperties(rPrElement: Element | null): RunProperties {
  const props: RunProperties = {};
  
  if (!rPrElement) return props;

  // Character style reference
  const rStyleElement = rPrElement.querySelector('w\\:rStyle, rStyle');
  if (rStyleElement) {
    const styleId = rStyleElement.getAttribute('w:val') || rStyleElement.getAttribute('val');
    if (styleId) {
      props.rStyle = styleId;
    }
  }

  // Bold
  if (rPrElement.querySelector('w\\:b, b')) {
    props.bold = true;
  }

  // Italic
  if (rPrElement.querySelector('w\\:i, i')) {
    props.italic = true;
  }

  // Underline - handle different types
  const underlineElement = rPrElement.querySelector('w\\:u, u');
  if (underlineElement) {
    const val = underlineElement.getAttribute('w:val') || underlineElement.getAttribute('val');
    if (val) {
      // Store the underline type for more sophisticated handling
      props.underline = val;
    } else {
      // Default to true for simple underline elements
      props.underline = true;
    }
  }

  // Font size
  const szElement = rPrElement.querySelector('w\\:sz, sz');
  if (szElement) {
    const val = szElement.getAttribute('w:val') || szElement.getAttribute('val');
    if (val) {
      // Word font size is in half-points, convert to points
      props.fontSize = `${Math.round(parseInt(val) / 2)}pt`;
    }
  }

  // Font color
  const colorElement = rPrElement.querySelector('w\\:color, color');
  if (colorElement) {
    const val = colorElement.getAttribute('w:val') || colorElement.getAttribute('val');
    if (val && val !== 'auto') {
      props.color = `#${val}`;
    }
  }

  // Font family
  const rFontsElement = rPrElement.querySelector('w\\:rFonts, rFonts');
  if (rFontsElement) {
    const ascii = rFontsElement.getAttribute('w:ascii') || 
                  rFontsElement.getAttribute('ascii');
    if (ascii) {
      props.fontFamily = ascii;
    }
  }

  // Highlight
  const highlightElement = rPrElement.querySelector('w\\:highlight, highlight');
  if (highlightElement) {
    const val = highlightElement.getAttribute('w:val') || highlightElement.getAttribute('val');
    if (val && val !== 'none') {
      props.highlight = val;
    }
  }

  // Strikethrough
  if (rPrElement.querySelector('w\\:strike, strike')) {
    props.strikethrough = true;
  }

  // Double strikethrough
  if (rPrElement.querySelector('w\\:dstrike, dstrike')) {
    props.doubleStrikethrough = true;
  }

  // All capitals
  if (rPrElement.querySelector('w\\:caps, caps')) {
    props.allCaps = true;
  }

  // Small caps
  if (rPrElement.querySelector('w\\:smallCaps, smallCaps')) {
    props.smallCaps = true;
  }

  // Vertical alignment (superscript/subscript)
  const vertAlignElement = rPrElement.querySelector('w\\:vertAlign, vertAlign');
  if (vertAlignElement) {
    const val = vertAlignElement.getAttribute('w:val') || vertAlignElement.getAttribute('val');
    if (val === 'superscript' || val === 'subscript') {
      props.verticalAlign = val;
    }
  }

  return props;
}

/**
 * Extract paragraph properties from Word XML paragraph properties element
 */
function extractParagraphProperties(pPrElement: Element | null): ParagraphProperties {
  const props: ParagraphProperties = {};
  
  if (!pPrElement) return props;

  // Paragraph style reference
  const pStyleElement = pPrElement.querySelector('w\\:pStyle, pStyle');
  if (pStyleElement) {
    const styleId = pStyleElement.getAttribute('w:val') || pStyleElement.getAttribute('val');
    if (styleId) {
      props.pStyle = styleId;
    }
  }

  // Alignment
  const jcElement = pPrElement.querySelector('w\\:jc, jc');
  if (jcElement) {
    const val = jcElement.getAttribute('w:val') || jcElement.getAttribute('val');
    if (val) {
      switch (val) {
        case 'center':
          props.alignment = 'center';
          break;
        case 'right':
          props.alignment = 'right';
          break;
        case 'both':
          props.alignment = 'justify';
          break;
        default:
          props.alignment = 'left';
      }
    }
  }

  // Indentation
  const indElement = pPrElement.querySelector('w\\:ind, ind');
  if (indElement) {
    props.indentation = {};
    
    const left = indElement.getAttribute('w:left') || indElement.getAttribute('left');
    if (left) {
      props.indentation.left = parseInt(left);
    }
    
    const right = indElement.getAttribute('w:right') || indElement.getAttribute('right');
    if (right) {
      props.indentation.right = parseInt(right);
    }
    
    const firstLine = indElement.getAttribute('w:firstLine') || 
                      indElement.getAttribute('firstLine');
    if (firstLine) {
      props.indentation.firstLine = parseInt(firstLine);
    }
  }

  // Numbering properties  
  const numPrElement = pPrElement.querySelector('w\\:numPr, numPr');
  if (numPrElement) {
    props.numbering = {};
    
    const numIdElement = numPrElement.querySelector('w\\:numId, numId');
    if (numIdElement) {
      const numId = numIdElement.getAttribute('w:val') || numIdElement.getAttribute('val');
      if (numId) {
        props.numbering.numId = numId;
      }
    }
    
    const ilvlElement = numPrElement.querySelector('w\\:ilvl, ilvl');
    if (ilvlElement) {
      const ilvl = ilvlElement.getAttribute('w:val') || ilvlElement.getAttribute('val');
      if (ilvl) {
        props.numbering.ilvl = parseInt(ilvl);
      }
    }
  }

  // Run properties at paragraph level (for character formatting inheritance)
  const rPrElement = pPrElement.querySelector('w\\:rPr, rPr');
  if (rPrElement) {
    props.runProperties = extractRunProperties(rPrElement);
  }

  return props;
}

/**
 * Extract table properties from Word XML table properties element
 */
function extractTableProperties(tblPrElement: Element | null): TableProperties {
  const props: TableProperties = {};
  
  if (!tblPrElement) return props;

  // Table alignment
  const jcElement = tblPrElement.querySelector('w\\:jc, jc');
  if (jcElement) {
    const val = jcElement.getAttribute('w:val') || jcElement.getAttribute('val');
    if (val) {
      switch (val) {
        case 'center':
          props.alignment = 'center';
          break;
        case 'right':
          props.alignment = 'right';
          break;
        default:
          props.alignment = 'left';
      }
    }
  }

  // Table width
  const tblWElement = tblPrElement.querySelector('w\\:tblW, tblW');
  if (tblWElement) {
    const wVal = tblWElement.getAttribute('w:w') || tblWElement.getAttribute('w');
    const type = tblWElement.getAttribute('w:type') || tblWElement.getAttribute('type');
    if (wVal && type) {
      if (type === 'pct') {
        // Percentage width
        props.width = `${parseInt(wVal) / 50}%`; // Word uses 50ths of a percent
      } else if (type === 'dxa') {
        // Twips width
        props.width = `${twipsToPixels(parseInt(wVal))}px`;
      }
    }
  }

  return props;
}

/**
 * Extract table cell properties from Word XML table cell properties element
 */
function extractTableCellProperties(tcPrElement: Element | null): TableCellProperties {
  const props: TableCellProperties = {};
  
  if (!tcPrElement) return props;

  // Cell width
  const tcWElement = tcPrElement.querySelector('w\\:tcW, tcW');
  if (tcWElement) {
    const wVal = tcWElement.getAttribute('w:w') || tcWElement.getAttribute('w');
    const type = tcWElement.getAttribute('w:type') || tcWElement.getAttribute('type');
    if (wVal && type) {
      if (type === 'pct') {
        props.width = `${parseInt(wVal) / 50}%`;
      } else if (type === 'dxa') {
        props.width = `${twipsToPixels(parseInt(wVal))}px`;
      }
    }
  }

  // Vertical alignment
  const vAlignElement = tcPrElement.querySelector('w\\:vAlign, vAlign');
  if (vAlignElement) {
    const val = vAlignElement.getAttribute('w:val') || vAlignElement.getAttribute('val');
    if (val) {
      switch (val) {
        case 'center':
          props.verticalAlignment = 'middle';
          break;
        case 'bottom':
          props.verticalAlignment = 'bottom';
          break;
        default:
          props.verticalAlignment = 'top';
      }
    }
  }

  // Background color
  const shdElement = tcPrElement.querySelector('w\\:shd, shd');
  if (shdElement) {
    const fill = shdElement.getAttribute('w:fill') || shdElement.getAttribute('fill');
    if (fill && fill !== 'auto' && fill !== 'ffffff') {
      props.background = `#${fill}`;
    }
  }

  return props;
}

/**
 * Apply run properties to create inline CSS styles
 */
function createRunStyles(props: RunProperties): string {
  const styles: string[] = [];
  const decorations: string[] = [];

  if (props.bold) styles.push('font-weight: bold');
  if (props.italic) styles.push('font-style: italic');
  
  // Enhanced underline handling
  if (props.underline) {
    if (typeof props.underline === 'string') {
      switch (props.underline) {
        case 'single':
          decorations.push('underline');
          break;
        case 'double':
          decorations.push('underline');
          break;
        case 'none':
          // Explicitly no underline - this overrides any other decorations
          styles.push('text-decoration: none');
          break;
        default:
          // Fallback for other underline types
          decorations.push('underline');
      }
    } else {
      // Boolean true - simple underline
      decorations.push('underline');
    }
  }

  // Strikethrough handling
  if (props.strikethrough || props.doubleStrikethrough) {
    decorations.push('line-through');
  }

  // Combine text decorations if we have any
  if (decorations.length > 0) {
    styles.push(`text-decoration: ${decorations.join(' ')}`);
  }

  // Add text-decoration-style after text-decoration for double underlines
  if (props.underline === 'double') {
    styles.push('text-decoration-style: double');
  }

  if (props.fontSize) styles.push(`font-size: ${props.fontSize}`);
  if (props.color) styles.push(`color: ${props.color}`);
  if (props.fontFamily) styles.push(`font-family: "${props.fontFamily}"`);
  
  // Highlight (background color)
  if (props.highlight) {
    // Map common Word highlight colors to CSS colors
    const highlightColorMap: { [key: string]: string } = {
      'yellow': '#ffff00',
      'brightGreen': '#00ff00',
      'turquoise': '#40e0d0',
      'pink': '#ffc0cb',
      'blue': '#0000ff',
      'red': '#ff0000',
      'darkBlue': '#000080',
      'teal': '#008080',
      'green': '#008000',
      'violet': '#ee82ee',
      'darkRed': '#8b0000',
      'darkYellow': '#8b8000',
      'gray25': '#c0c0c0',
      'gray50': '#808080',
      'black': '#000000'
    };
    
    const highlightColor = highlightColorMap[props.highlight] || props.highlight;
    styles.push(`background-color: ${highlightColor}`);
  }

  // Text transform for caps
  if (props.allCaps) {
    styles.push('text-transform: uppercase');
  } else if (props.smallCaps) {
    styles.push('font-variant: small-caps');
  }

  // Vertical alignment for super/subscript
  if (props.verticalAlign) {
    if (props.verticalAlign === 'superscript') {
      styles.push('vertical-align: super; font-size: smaller');
    } else if (props.verticalAlign === 'subscript') {
      styles.push('vertical-align: sub; font-size: smaller');
    }
  }

  // Tracked changes styling
  if (props.revision) {
    switch (props.revision.type) {
      case 'insertion':
        styles.push('color: #008000; text-decoration: underline');
        break;
      case 'deletion':
        styles.push('color: #ff0000; text-decoration: line-through');
        break;
      case 'moveFrom':
        styles.push('color: #0000ff; text-decoration: line-through');
        break;
      case 'moveTo':
        styles.push('color: #0000ff; text-decoration: underline');
        break;
    }
  }

  return styles.join('; ');
}

/**
 * Convert twips to pixels (assuming 96 DPI)
 * Twips are a unit used in Word documents (1/20th of a point)
 * The formula: twips / 20 * 96 / 72 converts to pixels at 96 DPI
 */
export function twipsToPixels(twips: number): number {
  return Math.round(twips / 20 * 96 / 72);
}

/**
 * Apply paragraph properties to create inline CSS styles
 * Merges properties in OOXML inheritance order:
 * 1. Paragraph style properties (from styles.xml)
 * 2. Numbering style properties (from numbering.xml level definitions)
 * 3. Direct paragraph properties
 */
function createParagraphStyles(
  props: ParagraphProperties, 
  context?: TransformContext,
  effectiveNumbering?: { numId?: string; ilvl?: number }
): string {
  const styles: string[] = [];
  
  // Get style-based properties if pStyle is present
  let styleProps: StyleDefinition['paragraphProps'] | undefined;
  if (props.pStyle && context?.styles) {
    styleProps = getStyleParagraphProps(props.pStyle, context.styles);
  }
  
  // Get numbering-based properties if numbering is present
  let numberingProps: LevelDefinition['paragraphProps'] | undefined;
  if (effectiveNumbering && context?.numbering.definitions) {
    numberingProps = getNumberingParagraphProps(effectiveNumbering, context.numbering.definitions);
  }

  // Apply alignment with correct inheritance order:
  // style < numbering < direct
  const alignment = props.alignment || numberingProps?.alignment || styleProps?.alignment;
  if (alignment) {
    styles.push(`text-align: ${alignment}`);
  }

  // Apply indentation with correct inheritance order:
  // style < numbering < direct
  // Need to merge indentation properties individually
  const indentation: ParagraphProperties['indentation'] = {};
  
  // Start with style properties
  if (styleProps?.indentation) {
    if (styleProps.indentation.left !== undefined) {
      indentation.left = styleProps.indentation.left;
    }
    if (styleProps.indentation.right !== undefined) {
      indentation.right = styleProps.indentation.right;
    }
    if (styleProps.indentation.firstLine !== undefined) {
      indentation.firstLine = styleProps.indentation.firstLine;
    }
  }
  
  // Override with numbering properties
  if (numberingProps?.indentation) {
    if (numberingProps.indentation.left !== undefined) {
      indentation.left = numberingProps.indentation.left;
    }
    if (numberingProps.indentation.right !== undefined) {
      indentation.right = numberingProps.indentation.right;
    }
    if (numberingProps.indentation.firstLine !== undefined) {
      indentation.firstLine = numberingProps.indentation.firstLine;
    }
  }
  
  // Override with direct properties
  if (props.indentation) {
    if (props.indentation.left !== undefined) {
      indentation.left = props.indentation.left;
    }
    if (props.indentation.right !== undefined) {
      indentation.right = props.indentation.right;
    }
    if (props.indentation.firstLine !== undefined) {
      indentation.firstLine = props.indentation.firstLine;
    }
  }
  
  // Apply the merged indentation
  if (indentation.left !== undefined) {
    const leftPx = twipsToPixels(indentation.left);
    styles.push(`margin-left: ${leftPx}px`);
  }
  
  if (indentation.right !== undefined) {
    const rightPx = twipsToPixels(indentation.right);
    styles.push(`margin-right: ${rightPx}px`);
  }
  
  if (indentation.firstLine !== undefined) {
    const firstLinePx = twipsToPixels(indentation.firstLine);
    styles.push(`text-indent: ${firstLinePx}px`);
  }

  return styles.join('; ');
}

/**
 * Apply table properties to create inline CSS styles
 */
function createTableStyles(props: TableProperties): string {
  const styles: string[] = [];

  // Default table styles
  styles.push('border-collapse: collapse');
  styles.push('width: 100%');

  if (props.alignment) {
    if (props.alignment === 'center') {
      styles.push('margin-left: auto');
      styles.push('margin-right: auto');
    } else if (props.alignment === 'right') {
      styles.push('margin-left: auto');
    }
  }

  if (props.width) {
    styles.push(`width: ${props.width}`);
  }

  return styles.join('; ');
}

/**
 * Apply table cell properties to create inline CSS styles
 */
function createTableCellStyles(props: TableCellProperties): string {
  const styles: string[] = [];

  // Default cell styles
  styles.push('border: 1px solid #ddd');
  styles.push('padding: 8px');

  if (props.width) {
    styles.push(`width: ${props.width}`);
  }

  if (props.alignment) {
    styles.push(`text-align: ${props.alignment}`);
  }

  if (props.verticalAlignment) {
    styles.push(`vertical-align: ${props.verticalAlignment}`);
  }

  if (props.background) {
    styles.push(`background-color: ${props.background}`);
  }

  return styles.join('; ');
}

/**
 * Extract revision/tracked change information from an element or its ancestors
 */
function extractRevisionInfo(element: Element): RunProperties['revision'] | null {
  // Check if the element itself is a tracked change element
  if (element.tagName.match(/^(w:)?ins$/i)) {
    return {
      type: 'insertion',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }
  
  if (element.tagName.match(/^(w:)?del$/i)) {
    return {
      type: 'deletion',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }
  
  if (element.tagName.match(/^(w:)?moveFrom$/i)) {
    return {
      type: 'moveFrom',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }
  
  if (element.tagName.match(/^(w:)?moveTo$/i)) {
    return {
      type: 'moveTo',
      author: element.getAttribute('w:author') || element.getAttribute('author') || undefined,
      date: element.getAttribute('w:date') || element.getAttribute('date') || undefined,
      id: element.getAttribute('w:id') || element.getAttribute('id') || undefined
    };
  }

  // Check parent elements for tracked changes (runs can be nested inside revision elements)
  let parent = element.parentElement;
  while (parent) {
    const parentRevision = extractRevisionInfo(parent);
    if (parentRevision) {
      return parentRevision;
    }
    parent = parent.parentElement;
  }
  
  return null;
}

/**
 * Numbering definition from numbering.xml
 */
interface NumberingDefinition {
  abstractNumId: string;
  levels: Map<number, LevelDefinition>;
}

/**
 * Level definition for numbering format
 */
interface LevelDefinition {
  numFmt: string;
  lvlText: string;
  start?: number;
  paragraphProps?: {
    alignment?: 'left' | 'center' | 'right' | 'justify';
    indentation?: {
      left?: number;
      right?: number;
      firstLine?: number;
    };
  };
}

/**
 * Style definition from styles.xml
 */
interface StyleDefinition {
  styleId: string;
  basedOn?: string;
  numbering?: {
    numId?: string;
    ilvl?: number;
  };
  paragraphProps?: {
    alignment?: 'left' | 'center' | 'right' | 'justify';
    indentation?: {
      left?: number;
      right?: number;
      firstLine?: number;
    };
  };
  runProperties?: RunProperties; // Run properties in paragraph or character styles
}

/**
 * Create footnote/endnote context for transformation
 */
interface NoteContext {
  footnotes: Map<string, DocumentFootnote>;
  endnotes: Map<string, DocumentFootnote>;
}

/**
 * Numbering context with parsed definitions
 */
interface NumberingContext {
  counters: NumberingCounters;
  definitions: Map<string, NumberingDefinition>; // numId -> definition
}

/**
 * Comment range information during transformation
 */
export interface CommentRangeInfo {
  paragraphIndex: number;
  startSpanIndex: number;
  endSpanIndex: number;
}

/**
 * Global comment range tracking for multi-paragraph ranges
 */
interface CommentRangeTracker {
  commentId: string;
  startParagraphIndex: number;
  startSpanIndex: number;
  endParagraphIndex?: number;
  endSpanIndex?: number;
}

/**
 * Transform context including notes, numbering, and styles
 */
interface TransformContext {
  notes: NoteContext;
  numbering: NumberingContext;
  styles: Map<string, StyleDefinition>;
  commentToParagraphMap?: Map<string, Set<number>>; // Maps comment ID to set of paragraph indices
  wordParaIdToIndex?: Map<string, number>; // Maps Word paragraph ID to array index
  paragraphs?: string[]; // Array of paragraph HTML strings
  commentRanges?: Map<string, CommentRangeInfo[]>; // Maps comment ID to array of range info
  globalCommentRanges?: Map<string, CommentRangeTracker>; // Global tracking for multi-paragraph ranges
}

/**
 * Create note context from footnotes and endnotes arrays
 */
function createNoteContext(footnotes: DocumentFootnote[], endnotes: DocumentFootnote[]): NoteContext {
  const footnoteMap = new Map<string, DocumentFootnote>();
  const endnoteMap = new Map<string, DocumentFootnote>();
  
  footnotes.forEach(note => {
    // Extract the original ID from our prefixed ID
    const originalId = note.id.split('-').pop() || note.id;
    footnoteMap.set(originalId, note);
  });
  
  endnotes.forEach(note => {
    // Extract the original ID from our prefixed ID  
    const originalId = note.id.split('-').pop() || note.id;
    endnoteMap.set(originalId, note);
  });
  
  return { footnotes: footnoteMap, endnotes: endnoteMap };
}

/**
 * Parse numbering.xml to extract numbering definitions
 */
function parseNumberingDefinitions(numberingXml?: Document): Map<string, NumberingDefinition> {
  const definitions = new Map<string, NumberingDefinition>();
  
  if (!numberingXml) {
    return definitions;
  }
  
  try {
    // First, build a map of abstractNum definitions
    const abstractNums = new Map<string, Map<number, LevelDefinition>>();
    const abstractNumElements = numberingXml.querySelectorAll('w\\:abstractNum, abstractNum');
    
    abstractNumElements.forEach(abstractNumEl => {
      const abstractNumId = abstractNumEl.getAttribute('w:abstractNumId') || 
                            abstractNumEl.getAttribute('abstractNumId');
      if (!abstractNumId) return;
      
      const levels = new Map<number, LevelDefinition>();
      const lvlElements = abstractNumEl.querySelectorAll('w\\:lvl, lvl');
      
      lvlElements.forEach(lvlEl => {
        const ilvl = lvlEl.getAttribute('w:ilvl') || lvlEl.getAttribute('ilvl');
        if (ilvl === null) return;
        
        const level = parseInt(ilvl);
        const numFmtEl = lvlEl.querySelector('w\\:numFmt, numFmt');
        const lvlTextEl = lvlEl.querySelector('w\\:lvlText, lvlText');
        const startEl = lvlEl.querySelector('w\\:start, start');
        
        const numFmt = numFmtEl?.getAttribute('w:val') || numFmtEl?.getAttribute('val') || 'decimal';
        const lvlText = lvlTextEl?.getAttribute('w:val') || lvlTextEl?.getAttribute('val') || '%1';
        const start = startEl?.getAttribute('w:val') || startEl?.getAttribute('val');
        
        const levelDef: LevelDefinition = {
          numFmt,
          lvlText,
          start: start ? parseInt(start) : undefined
        };
        
        // Extract paragraph properties from level definition
        const pPrEl = lvlEl.querySelector('w\\:pPr, pPr');
        if (pPrEl) {
          levelDef.paragraphProps = {};
          
          // Alignment
          const jcEl = pPrEl.querySelector('w\\:jc, jc');
          if (jcEl) {
            const val = jcEl.getAttribute('w:val') || jcEl.getAttribute('val');
            if (val) {
              switch (val) {
                case 'center':
                  levelDef.paragraphProps.alignment = 'center';
                  break;
                case 'right':
                  levelDef.paragraphProps.alignment = 'right';
                  break;
                case 'both':
                  levelDef.paragraphProps.alignment = 'justify';
                  break;
                default:
                  levelDef.paragraphProps.alignment = 'left';
              }
            }
          }
          
          // Indentation
          const indEl = pPrEl.querySelector('w\\:ind, ind');
          if (indEl) {
            levelDef.paragraphProps.indentation = {};
            
            const left = indEl.getAttribute('w:left') || indEl.getAttribute('left');
            if (left) {
              levelDef.paragraphProps.indentation.left = parseInt(left);
            }
            
            const right = indEl.getAttribute('w:right') || indEl.getAttribute('right');
            if (right) {
              levelDef.paragraphProps.indentation.right = parseInt(right);
            }
            
            const firstLine = indEl.getAttribute('w:firstLine') || indEl.getAttribute('firstLine');
            if (firstLine) {
              levelDef.paragraphProps.indentation.firstLine = parseInt(firstLine);
            }
          }
          
          // Remove paragraphProps if empty
          if (!levelDef.paragraphProps.alignment && !levelDef.paragraphProps.indentation) {
            delete levelDef.paragraphProps;
          }
        }
        
        levels.set(level, levelDef);
      });
      
      abstractNums.set(abstractNumId, levels);
    });
    
    // Now, map num instances to abstractNum definitions
    const numElements = numberingXml.querySelectorAll('w\\:num, num');
    
    numElements.forEach(numEl => {
      const numId = numEl.getAttribute('w:numId') || numEl.getAttribute('numId');
      if (!numId) return;
      
      const abstractNumIdEl = numEl.querySelector('w\\:abstractNumId, abstractNumId');
      const abstractNumId = abstractNumIdEl?.getAttribute('w:val') || 
                           abstractNumIdEl?.getAttribute('val');
      
      if (abstractNumId && abstractNums.has(abstractNumId)) {
        const levels = abstractNums.get(abstractNumId)!;
        definitions.set(numId, {
          abstractNumId,
          levels
        });
      }
    });
  } catch (error) {
    console.warn('Error parsing numbering definitions:', error);
  }
  
  return definitions;
}

/**
 * Parse styles.xml to extract style definitions with numbering
 */
function parseStyleDefinitions(stylesXml?: Document): Map<string, StyleDefinition> {
  const styles = new Map<string, StyleDefinition>();
  
  if (!stylesXml) {
    return styles;
  }
  
  try {
    const styleElements = stylesXml.querySelectorAll('w\\:style, style');
    
    styleElements.forEach(styleEl => {
      const styleId = styleEl.getAttribute('w:styleId') || styleEl.getAttribute('styleId');
      if (!styleId) return;
      
      const styleDef: StyleDefinition = { styleId };
      
      // Check for basedOn relationship
      const basedOnEl = styleEl.querySelector('w\\:basedOn, basedOn');
      const basedOn = basedOnEl?.getAttribute('w:val') || basedOnEl?.getAttribute('val');
      if (basedOn) {
        styleDef.basedOn = basedOn;
      }
      
      // Check for numbering in paragraph properties
      const pPrEl = styleEl.querySelector('w\\:pPr, pPr');
      if (pPrEl) {
        const numPrEl = pPrEl.querySelector('w\\:numPr, numPr');
        if (numPrEl) {
          styleDef.numbering = {};
          
          const numIdEl = numPrEl.querySelector('w\\:numId, numId');
          const numId = numIdEl?.getAttribute('w:val') || numIdEl?.getAttribute('val');
          if (numId) {
            styleDef.numbering.numId = numId;
          }
          
          const ilvlEl = numPrEl.querySelector('w\\:ilvl, ilvl');
          const ilvl = ilvlEl?.getAttribute('w:val') || ilvlEl?.getAttribute('val');
          if (ilvl) {
            styleDef.numbering.ilvl = parseInt(ilvl);
          }
        }
        
        // Extract paragraph formatting properties
        styleDef.paragraphProps = {};
        
        // Alignment
        const jcEl = pPrEl.querySelector('w\\:jc, jc');
        if (jcEl) {
          const val = jcEl.getAttribute('w:val') || jcEl.getAttribute('val');
          if (val) {
            switch (val) {
              case 'center':
                styleDef.paragraphProps.alignment = 'center';
                break;
              case 'right':
                styleDef.paragraphProps.alignment = 'right';
                break;
              case 'both':
                styleDef.paragraphProps.alignment = 'justify';
                break;
              default:
                styleDef.paragraphProps.alignment = 'left';
            }
          }
        }
        
        // Indentation
        const indEl = pPrEl.querySelector('w\\:ind, ind');
        if (indEl) {
          styleDef.paragraphProps.indentation = {};
          
          const left = indEl.getAttribute('w:left') || indEl.getAttribute('left');
          if (left) {
            styleDef.paragraphProps.indentation.left = parseInt(left);
          }
          
          const right = indEl.getAttribute('w:right') || indEl.getAttribute('right');
          if (right) {
            styleDef.paragraphProps.indentation.right = parseInt(right);
          }
          
          const firstLine = indEl.getAttribute('w:firstLine') || indEl.getAttribute('firstLine');
          if (firstLine) {
            styleDef.paragraphProps.indentation.firstLine = parseInt(firstLine);
          }
        }
        
        // Remove paragraphProps if empty
        if (!styleDef.paragraphProps.alignment && !styleDef.paragraphProps.indentation) {
          delete styleDef.paragraphProps;
        }

        // Extract run properties from paragraph properties (for character formatting)
        const rPrInPPrEl = pPrEl.querySelector('w\\:rPr, rPr');
        if (rPrInPPrEl) {
          styleDef.runProperties = extractRunProperties(rPrInPPrEl);
        }
      }

      // Extract run properties from character styles (rPr directly under style)
      const rPrEl = styleEl.querySelector('w\\:rPr, rPr');
      if (rPrEl && !styleDef.runProperties) {
        styleDef.runProperties = extractRunProperties(rPrEl);
      }
      
      styles.set(styleId, styleDef);
    });
  } catch (error) {
    console.warn('Error parsing style definitions:', error);
  }
  
  return styles;
}

/**
 * Walk up the style basedOn hierarchy to find numbering properties
 * Detects circular references to avoid infinite loops
 */
function getStyleNumbering(
  styleId: string,
  styles: Map<string, StyleDefinition>,
  visited = new Set<string>()
): { numId?: string; ilvl?: number } | undefined {
  // Detect circular reference
  if (visited.has(styleId)) {
    console.warn(`Circular reference detected in style hierarchy: ${styleId}`);
    return undefined;
  }
  
  visited.add(styleId);
  
  const style = styles.get(styleId);
  if (!style) {
    return undefined;
  }
  
  // If this style has numbering, return it
  if (style.numbering) {
    return style.numbering;
  }
  
  // Otherwise, check the basedOn style
  if (style.basedOn) {
    return getStyleNumbering(style.basedOn, styles, visited);
  }
  
  return undefined;
}

/**
 * Walk up the style basedOn hierarchy to find paragraph properties
 * Detects circular references to avoid infinite loops
 */
function getStyleParagraphProps(
  styleId: string,
  styles: Map<string, StyleDefinition>,
  visited = new Set<string>()
): StyleDefinition['paragraphProps'] | undefined {
  // Detect circular reference
  if (visited.has(styleId)) {
    return undefined;
  }
  
  visited.add(styleId);
  
  const style = styles.get(styleId);
  if (!style) {
    return undefined;
  }
  
  // Build properties by walking up the hierarchy
  let props: StyleDefinition['paragraphProps'];
  
  // First get parent properties if basedOn exists
  if (style.basedOn) {
    props = getStyleParagraphProps(style.basedOn, styles, visited);
  }
  
  // Then override with current style properties
  if (style.paragraphProps) {
    if (!props) {
      props = {};
    }
    
    // Override alignment if present
    if (style.paragraphProps.alignment) {
      props.alignment = style.paragraphProps.alignment;
    }
    
    // Override indentation if present
    if (style.paragraphProps.indentation) {
      if (!props.indentation) {
        props.indentation = {};
      }
      
      if (style.paragraphProps.indentation.left !== undefined) {
        props.indentation.left = style.paragraphProps.indentation.left;
      }
      
      if (style.paragraphProps.indentation.right !== undefined) {
        props.indentation.right = style.paragraphProps.indentation.right;
      }
      
      if (style.paragraphProps.indentation.firstLine !== undefined) {
        props.indentation.firstLine = style.paragraphProps.indentation.firstLine;
      }
    }
  }
  
  return props;
}

/**
 * Walk up the style basedOn hierarchy to find run properties
 * Detects circular references to avoid infinite loops
 */
function getStyleRunProperties(
  styleId: string,
  styles: Map<string, StyleDefinition>,
  visited = new Set<string>()
): RunProperties | undefined {
  // Detect circular reference
  if (visited.has(styleId)) {
    return undefined;
  }
  
  visited.add(styleId);
  
  const style = styles.get(styleId);
  if (!style) {
    return undefined;
  }
  
  // Build properties by walking up the hierarchy
  let props: RunProperties = {};
  
  // First get parent properties if basedOn exists
  if (style.basedOn) {
    const parentProps = getStyleRunProperties(style.basedOn, styles, visited);
    if (parentProps) {
      props = { ...parentProps };
    }
  }
  
  // Then override with current style run properties
  if (style.runProperties) {
    // Merge run properties, with current style taking precedence
    props = mergeRunProperties(props, style.runProperties);
  }
  
  return Object.keys(props).length > 0 ? props : undefined;
}

/**
 * Merge run properties with precedence to the second argument
 * Handles special case where boolean false values should override true values
 */
function mergeRunProperties(base: RunProperties, override: RunProperties): RunProperties {
  const merged: RunProperties = { ...base };
  
  // For each property in override, copy it to merged
  if (override.bold !== undefined) merged.bold = override.bold;
  if (override.italic !== undefined) merged.italic = override.italic;
  if (override.underline !== undefined) merged.underline = override.underline;
  if (override.fontSize !== undefined) merged.fontSize = override.fontSize;
  if (override.color !== undefined) merged.color = override.color;
  if (override.fontFamily !== undefined) merged.fontFamily = override.fontFamily;
  if (override.highlight !== undefined) merged.highlight = override.highlight;
  if (override.strikethrough !== undefined) merged.strikethrough = override.strikethrough;
  if (override.doubleStrikethrough !== undefined) merged.doubleStrikethrough = override.doubleStrikethrough;
  if (override.allCaps !== undefined) merged.allCaps = override.allCaps;
  if (override.smallCaps !== undefined) merged.smallCaps = override.smallCaps;
  if (override.verticalAlign !== undefined) merged.verticalAlign = override.verticalAlign;
  if (override.rStyle !== undefined) merged.rStyle = override.rStyle;
  if (override.revision !== undefined) merged.revision = override.revision;
  
  return merged;
}

/**
 * Get numbering-based paragraph properties for a paragraph
 * Returns properties from the numbering level definition if applicable
 */
function getNumberingParagraphProps(
  effectiveNumbering: { numId?: string; ilvl?: number } | undefined,
  numberingDefinitions: Map<string, NumberingDefinition>
): LevelDefinition['paragraphProps'] | undefined {
  if (!effectiveNumbering?.numId) {
    return undefined;
  }
  
  const definition = numberingDefinitions.get(effectiveNumbering.numId);
  if (!definition) {
    return undefined;
  }
  
  const level = effectiveNumbering.ilvl || 0;
  const levelDef = definition.levels.get(level);
  
  return levelDef?.paragraphProps;
}

/**
 * Get effective numbering properties for a paragraph
 * Direct numbering takes priority over style-based numbering
 */
function getEffectiveNumbering(
  paragraphProps: ParagraphProperties,
  styles: Map<string, StyleDefinition>
): { numId?: string; ilvl?: number } | undefined {
  // Direct numbering has priority
  if (paragraphProps.numbering?.numId) {
    return paragraphProps.numbering;
  }
  
  // Check for style-based numbering
  if (paragraphProps.pStyle) {
    return getStyleNumbering(paragraphProps.pStyle, styles);
  }
  
  return undefined;
}

/**
 * Apply level text template to counter values
 * Example: "%1.%2" with counters [3, 2] becomes "3.2"
 */
function applyLevelText(
  lvlText: string,
  counter: NumberingCounter,
  currentLevel: number,
  definitions: Map<string, NumberingDefinition>,
  numId: string
): string {
  let result = lvlText;
  
  const definition = definitions.get(numId);
  if (!definition) {
    return result;
  }
  
  // Replace placeholders like %1, %2, %3 etc.
  for (let level = 0; level <= currentLevel; level++) {
    const placeholder = `%${level + 1}`;
    if (result.includes(placeholder)) {
      const counterValue = counter.counters[level] || 0;
      const levelDef = definition.levels.get(level);
      
      if (levelDef) {
        // Map Word numFmt to our NumberingScheme
        let scheme: string = levelDef.numFmt;
        // Word uses different names - map them
        if (scheme === 'lowerLetter') scheme = 'lowerLetter';
        else if (scheme === 'upperLetter') scheme = 'upperLetter';
        else if (scheme === 'lowerRoman') scheme = 'lowerRoman';
        else if (scheme === 'upperRoman') scheme = 'upperRoman';
        else if (scheme === 'ordinal') scheme = 'ordinal';
        else if (scheme === 'cardinalText') scheme = 'cardinalText';
        else if (scheme === 'ordinalText') scheme = 'ordinalText';
        else if (scheme === 'bullet') scheme = 'bullet';
        else scheme = 'decimal'; // Default to decimal
        
        const numberingText = getNumberingText(counterValue, scheme as NumberingScheme);
        result = result.replace(placeholder, numberingText);
      } else {
        // Fallback if no level definition
        result = result.replace(placeholder, counterValue.toString());
      }
    }
  }
  
  return result;
}

/**
 * Transform a Word run element to HTML
 */
function transformRun(
  runElement: Element, 
  context: TransformContext,
  paragraphProps?: ParagraphProperties
): string {
  // Check if this run is inside a tracked change element
  const revisionInfo = extractRevisionInfo(runElement);
  
  // Get run properties directly from the run
  const rPrElement = runElement.querySelector('w\\:rPr, rPr');
  const directRunProps = extractRunProperties(rPrElement);
  
  // Build the complete run properties through inheritance chain:
  // 1. Paragraph style run properties (from styles.xml)
  // 2. Paragraph direct run properties (from pPr/rPr)
  // 3. Character style run properties (from rStyle reference)
  // 4. Direct run properties (from r/rPr)
  
  let mergedRunProps: RunProperties = {};
  
  // Step 1: Get run properties from paragraph style
  if (paragraphProps?.pStyle && context?.styles) {
    const styleRunProps = getStyleRunProperties(paragraphProps.pStyle, context.styles);
    if (styleRunProps) {
      mergedRunProps = mergeRunProperties(mergedRunProps, styleRunProps);
    }
  }
  
  // Step 2: Get run properties from paragraph direct properties
  if (paragraphProps?.runProperties) {
    mergedRunProps = mergeRunProperties(mergedRunProps, paragraphProps.runProperties);
  }
  
  // Step 3: Get run properties from character style (rStyle)
  if (directRunProps.rStyle && context?.styles) {
    const charStyleRunProps = getStyleRunProperties(directRunProps.rStyle, context.styles);
    if (charStyleRunProps) {
      mergedRunProps = mergeRunProperties(mergedRunProps, charStyleRunProps);
    }
  }
  
  // Step 4: Apply direct run properties (highest precedence)
  mergedRunProps = mergeRunProperties(mergedRunProps, directRunProps);
  
  // Apply revision info to run properties
  if (revisionInfo) {
    mergedRunProps.revision = revisionInfo;
  }

  // Check for footnote/endnote references
  const footnoteRef = runElement.querySelector('w\\:footnoteReference, footnoteReference');
  if (footnoteRef) {
    const id = footnoteRef.getAttribute('w:id') || footnoteRef.getAttribute('id');
    if (id && context.notes.footnotes.has(id)) {
      return `<sup><a href="#footnote-${id}" id="footnote-ref-${id}" class="footnote-link">${id}</a></sup>`;
    }
  }

  const endnoteRef = runElement.querySelector('w\\:endnoteReference, endnoteReference');
  if (endnoteRef) {
    const id = endnoteRef.getAttribute('w:id') || endnoteRef.getAttribute('id');
    if (id && context.notes.endnotes.has(id)) {
      return `<sup><a href="#endnote-${id}" id="endnote-ref-${id}" class="endnote-link">${id}</a></sup>`;
    }
  }

  // Process run content (text and line breaks)
  // We need to iterate through child nodes in order to preserve the sequence of text and breaks
  const contentParts: string[] = [];
  const children = Array.from(runElement.childNodes);
  
  for (const child of children) {
    if (child.nodeType === Node.ELEMENT_NODE) {
      const element = child as Element;
      const tagName = element.tagName.toLowerCase();
      
      // Handle text elements
      if (tagName.match(/^(w:)?t$/)) {
        const text = element.textContent || '';
        if (text) {
          // Check for xml:space attribute to determine if whitespace should be preserved
          const xmlSpace = element.getAttribute('xml:space');
          const preserveSpace = xmlSpace === 'preserve';
          contentParts.push(escapeHtmlWithSpace(text, preserveSpace));
        }
      }
      // Handle line break elements
      else if (tagName.match(/^(w:)?br$/)) {
        contentParts.push('<br>');
      }
    }
  }

  const content = contentParts.join('');
  
  // Check if there's any content (text or breaks)
  if (!content || (content.replace(/<br>/g, '').trim() === '' && !content.includes('<br>'))) {
    return '';
  }

  // Apply formatting
  const styles = createRunStyles(mergedRunProps);
  
  if (styles) {
    return `<span style="${styles}">${content}</span>`;
  }
  
  return `<span>${content}</span>`; // Wrap in span for highlighting DEBUG
}

/**
 * Get paragraph-level run properties for numbering
 * These are the run properties that should apply to the numbering text
 * Includes: 1. Paragraph style run properties, 2. Paragraph direct run properties
 * Does NOT include: run-level properties or character styles
 */
function getNumberingRunProperties(
  paragraphProps: ParagraphProperties,
  context: TransformContext
): RunProperties {
  let mergedRunProps: RunProperties = {};
  
  // Step 1: Get run properties from paragraph style
  if (paragraphProps.pStyle && context.styles) {
    const styleRunProps = getStyleRunProperties(paragraphProps.pStyle, context.styles);
    if (styleRunProps) {
      mergedRunProps = mergeRunProperties(mergedRunProps, styleRunProps);
    }
  }
  
  // Step 2: Get run properties from paragraph direct properties
  if (paragraphProps.runProperties) {
    mergedRunProps = mergeRunProperties(mergedRunProps, paragraphProps.runProperties);
  }
  
  return mergedRunProps;
}

/**
 * Transform a Word paragraph element to HTML
 */
function transformParagraph(paragraphElement: Element, context: TransformContext): string {
  // Get paragraph properties
  const pPrElement = paragraphElement.querySelector('w\\:pPr, pPr');
  const paragraphProps = extractParagraphProperties(pPrElement);

  // Extract paragraph ID (w14:paraId) if available
  // Note: w14:paraId is an element inside w:pPr, not an attribute
  let wordParagraphId: string | undefined;
  if (pPrElement) {
    const paraIdElement = pPrElement.querySelector('w14\\:paraId, w\\:paraId, paraId');
    if (paraIdElement) {
      wordParagraphId = paraIdElement.getAttribute('w14:val') || 
                    paraIdElement.getAttribute('w:val') ||
                    paraIdElement.getAttribute('val') || undefined;
    }
  }

  // Get the current paragraph index (if paragraphs array is available)
  const currentParagraphIndex = context.paragraphs?.length ?? -1;
  
  // Store mapping from Word paragraph ID to array index
  if (wordParagraphId && currentParagraphIndex >= 0 && context.wordParaIdToIndex) {
    context.wordParaIdToIndex.set(wordParagraphId, currentParagraphIndex);
  }

  // Note: Comment range processing is now handled globally in transformDocumentToHtml
  // before paragraph transformation begins. This ensures multi-paragraph ranges
  // are correctly identified and all spanned paragraphs are mapped to comments.

  // Get effective numbering (direct or style-based)
  const effectiveNumbering = getEffectiveNumbering(paragraphProps, context.styles);
  
  // Handle numbering if present
  let numberingPrefix = '';
  if (effectiveNumbering?.numId) {
    const counter = getOrCreateCounter(context.numbering.counters, effectiveNumbering.numId);
    const level = effectiveNumbering.ilvl || 0;
    const currentNumber = incrementCounter(counter, level);
    
    // Get run properties for numbering (paragraph-level only)
    const numberingRunProps = getNumberingRunProperties(paragraphProps, context);
    const numberingStyles = createRunStyles(numberingRunProps);
    
    // Try to get numbering definition and apply lvlText template
    const definition = context.numbering.definitions.get(effectiveNumbering.numId);
    if (definition) {
      const levelDef = definition.levels.get(level);
      if (levelDef) {
        // Apply the level text template
        const numberingText = applyLevelText(
          levelDef.lvlText,
          counter,
          level,
          context.numbering.definitions,
          effectiveNumbering.numId
        );
        if (numberingStyles) {
          numberingPrefix = `<span class="numbering-text" style="${numberingStyles}">${numberingText} </span>`;
        } else {
          numberingPrefix = `<span class="numbering-text">${numberingText} </span>`;
        }
      } else {
        // Fallback if no level definition
        const numberingText = getNumberingText(currentNumber, 'decimal');
        if (numberingStyles) {
          numberingPrefix = `<span class="numbering-text" style="${numberingStyles}">${numberingText}. </span>`;
        } else {
          numberingPrefix = `<span class="numbering-text">${numberingText}. </span>`;
        }
      }
    } else {
      // Fallback to decimal if no definition found
      const numberingText = getNumberingText(currentNumber, 'decimal');
      if (numberingStyles) {
        numberingPrefix = `<span class="numbering-text" style="${numberingStyles}">${numberingText}. </span>`;
      } else {
        numberingPrefix = `<span class="numbering-text">${numberingText}. </span>`;
      }
    }
  }

  // Transform all runs in the paragraph, including those within tracked change elements
  const allRunElements = paragraphElement.querySelectorAll('w\\:r, r');
  
  // Note: Tracked change elements are handled through the extractRevisionInfo function
  // which checks parent elements for revision information

  const runContent = Array.from(allRunElements)
    .map(run => transformRun(run, context, paragraphProps))
    .filter(content => content.trim())
    .join('');

  if (!runContent.trim() && !numberingPrefix) {
    return '<p></p>'; // Empty paragraph
  }

  // Apply paragraph styling
  const styles = createParagraphStyles(paragraphProps, context, effectiveNumbering);
  
  const content = numberingPrefix + runContent;
  
  // No longer add data-para-id attribute since we use array indices
  if (styles) {
    return `<p style="${styles}">${content}</p>`;
  }
  
  return `<p>${content}</p>`;
}

/**
 * Transform a Word table cell element to HTML
 */
function transformTableCell(cellElement: Element, context: TransformContext): string {
  // Get cell properties
  const tcPrElement = cellElement.querySelector('w\\:tcPr, tcPr');
  const cellProps = extractTableCellProperties(tcPrElement);

  // Transform all paragraphs in the cell
  const paragraphElements = cellElement.querySelectorAll('w\\:p, p');
  
  let cellContent = '';
  if (paragraphElements.length > 0) {
    cellContent = Array.from(paragraphElements)
      .map(p => transformParagraph(p, context))
      .filter(html => html.trim())
      .join('\n');
  }

  if (!cellContent.trim()) {
    cellContent = '<p></p>'; // Empty cell
  }

  // Apply cell styling
  const styles = createTableCellStyles(cellProps);
  
  return `<td style="${styles}">${cellContent}</td>`;
}

/**
 * Transform a Word table row element to HTML
 */
function transformTableRow(rowElement: Element, context: TransformContext): string {
  // Transform all cells in the row
  const cellElements = rowElement.querySelectorAll('w\\:tc, tc');
  
  const cellContent = Array.from(cellElements)
    .map(cell => transformTableCell(cell, context))
    .filter(html => html.trim())
    .join('');

  if (!cellContent.trim()) {
    return '<tr><td></td></tr>'; // Empty row with at least one cell
  }

  return `<tr>${cellContent}</tr>`;
}

/**
 * Transform a Word table element to HTML
 */
function transformTable(tableElement: Element, context: TransformContext): string {
  // Get table properties
  const tblPrElement = tableElement.querySelector('w\\:tblPr, tblPr');
  const tableProps = extractTableProperties(tblPrElement);

  // Transform all rows in the table
  const rowElements = tableElement.querySelectorAll('w\\:tr, tr');
  
  const rowContent = Array.from(rowElements)
    .map(row => transformTableRow(row, context))
    .filter(html => html.trim())
    .join('\n');

  if (!rowContent.trim()) {
    return '<table><tr><td></td></tr></table>'; // Empty table with minimal structure
  }

  // Apply table styling
  const styles = createTableStyles(tableProps);
  
  return `<table style="${styles}">\n${rowContent}\n</table>`;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Escape HTML special characters and preserve whitespace for xml:space="preserve"
 * When preserveSpace is true, converts leading/trailing spaces to &nbsp; for proper HTML rendering
 */
function escapeHtmlWithSpace(text: string, preserveSpace: boolean): string {
  // First escape HTML entities
  const escaped = escapeHtml(text);
  
  if (!preserveSpace) {
    return escaped;
  }
  
  // Convert leading and trailing spaces to &nbsp; for proper rendering
  // This ensures that when xml:space="preserve" is set, spaces are actually visible in the browser
  let result = escaped;
  
  // Replace leading spaces with &nbsp;
  result = result.replace(/^( +)/, (match) => '&nbsp;'.repeat(match.length));
  
  // Replace trailing spaces with &nbsp;
  result = result.replace(/( +)$/, (match) => '&nbsp;'.repeat(match.length));
  
  return result;
}

/**
 * Transform footnote/endnote/comment content with separate numbering context
 * Each note/comment gets its own numbering counters that don't carry over
 * This is exported so it can be used from docxParser.ts
 */
export function transformNoteContent(
  noteElement: Element,
  numberingXml: Document | undefined,
  stylesXml: Document | undefined
): string {
  // Parse numbering and style definitions (same as document)
  const numberingDefinitions = parseNumberingDefinitions(numberingXml);
  const styleDefinitions = parseStyleDefinitions(stylesXml);
  
  // Create a fresh context with separate numbering counters
  const context: TransformContext = {
    notes: { footnotes: new Map(), endnotes: new Map() }, // Empty note context (no nested notes)
    numbering: {
      counters: createNumberingCounters(), // Fresh counters for this note
      definitions: numberingDefinitions
    },
    styles: styleDefinitions
  };
  
  // Transform all paragraph elements in the note
  const paragraphElements = noteElement.querySelectorAll('w\\:p, p');
  
  const htmlParts = Array.from(paragraphElements)
    .map(p => transformParagraph(p, context))
    .filter(html => html.trim());
  
  return htmlParts.join('\n');
}

/**
 * Pre-scan document to identify all comment ranges globally
 * This handles multi-paragraph comment ranges correctly
 */
function scanCommentRanges(
  body: Element,
  globalCommentRanges: Map<string, CommentRangeTracker>
): void {
  let paragraphIndex = 0;
  
  // Get all paragraph elements in document order
  const contentElements = Array.from(body.children).filter(element => {
    const tagName = element.tagName.toLowerCase();
    return tagName.match(/^(w:)?p$/);
  });
  
  contentElements.forEach((paragraphElement) => {
    let spanIndex = 0;
    
    // Scan all children to find comment range markers
    Array.from(paragraphElement.children).forEach((child) => {
      const tagName = child.tagName.toLowerCase();
      
      if (tagName.match(/^(w:)?commentrangestart$/)) {
        const commentId = child.getAttribute('w:id') || child.getAttribute('id');
        if (commentId) {
          // Record the start of this comment range
          globalCommentRanges.set(commentId, {
            commentId,
            startParagraphIndex: paragraphIndex,
            startSpanIndex: spanIndex
          });
        }
      } else if (tagName.match(/^(w:)?commentrangeend$/)) {
        const commentId = child.getAttribute('w:id') || child.getAttribute('id');
        if (commentId) {
          // Complete the range for this comment
          const tracker = globalCommentRanges.get(commentId);
          if (tracker) {
            tracker.endParagraphIndex = paragraphIndex;
            tracker.endSpanIndex = spanIndex;
          }
        }
      } else if (tagName.match(/^(w:)?r$/)) {
        // This is a run element, increment span counter
        spanIndex++;
      }
    });
    
    paragraphIndex++;
  });
}

/**
 * Process global comment ranges to populate paragraph mappings and per-paragraph ranges
 */
function processGlobalCommentRanges(
  globalCommentRanges: Map<string, CommentRangeTracker>,
  commentToParagraphMap: Map<string, Set<number>>,
  commentRanges: Map<string, CommentRangeInfo[]>
): void {
  globalCommentRanges.forEach((tracker, commentId) => {
    if (tracker.endParagraphIndex === undefined || tracker.endSpanIndex === undefined) {
      // Incomplete range, skip
      return;
    }
    
    // Map comment to all paragraphs it spans (inclusive)
    const paragraphSet = new Set<number>();
    for (let i = tracker.startParagraphIndex; i <= tracker.endParagraphIndex; i++) {
      paragraphSet.add(i);
    }
    commentToParagraphMap.set(commentId, paragraphSet);
    
    // Create per-paragraph ranges for highlighting
    const ranges: CommentRangeInfo[] = [];
    
    if (tracker.startParagraphIndex === tracker.endParagraphIndex) {
      // Single paragraph range
      ranges.push({
        paragraphIndex: tracker.startParagraphIndex,
        startSpanIndex: tracker.startSpanIndex,
        endSpanIndex: tracker.endSpanIndex
      });
    } else {
      // Multi-paragraph range
      
      // First paragraph: from startSpanIndex to end of paragraph (we'll use a large number)
      ranges.push({
        paragraphIndex: tracker.startParagraphIndex,
        startSpanIndex: tracker.startSpanIndex,
        endSpanIndex: 9999 // Will be clamped to actual span count during highlighting
      });
      
      // Middle paragraphs: entire paragraph (all spans)
      for (let i = tracker.startParagraphIndex + 1; i < tracker.endParagraphIndex; i++) {
        ranges.push({
          paragraphIndex: i,
          startSpanIndex: 0,
          endSpanIndex: 9999 // Will be clamped to actual span count during highlighting
        });
      }
      
      // Last paragraph: from beginning to endSpanIndex
      ranges.push({
        paragraphIndex: tracker.endParagraphIndex,
        startSpanIndex: 0,
        endSpanIndex: tracker.endSpanIndex
      });
    }
    
    commentRanges.set(commentId, ranges);
  });
}

/**
 * Transform Word document XML to HTML
 */
export function transformDocumentToHtml(
  documentXml: Document,
  footnotes: DocumentFootnote[] = [],
  endnotes: DocumentFootnote[] = [],
  numberingXml?: Document,
  stylesXml?: Document,
  footnotesXml?: Document,
  endnotesXml?: Document
): TransformedContent {
  // Create note context for footnotes and endnotes
  const noteContext = createNoteContext(footnotes, endnotes);
  
  // Parse numbering and style definitions
  const numberingDefinitions = parseNumberingDefinitions(numberingXml);
  const styleDefinitions = parseStyleDefinitions(stylesXml);
  
  // Create transform context with notes, numbering, and styles
  const commentToParagraphMap = new Map<string, Set<number>>();
  const wordParaIdToIndex = new Map<string, number>();
  const commentRanges = new Map<string, CommentRangeInfo[]>();
  const globalCommentRanges = new Map<string, CommentRangeTracker>();
  const paragraphs: string[] = [];
  const context: TransformContext = {
    notes: noteContext,
    numbering: {
      counters: createNumberingCounters(),
      definitions: numberingDefinitions
    },
    styles: styleDefinitions,
    commentToParagraphMap,
    wordParaIdToIndex,
    paragraphs,
    commentRanges,
    globalCommentRanges
  };
  
  // Find all paragraph and table elements in the document body
  const body = documentXml.querySelector('w\\:body, body');
  if (!body) {
    return {
      html: '<p>No document content found.</p>',
      plainText: 'No document content found.',
      paragraphs: []
    };
  }

  // First pass: Scan for comment ranges globally
  scanCommentRanges(body, globalCommentRanges);
  
  // Process global comment ranges to populate paragraph mappings
  processGlobalCommentRanges(globalCommentRanges, commentToParagraphMap, commentRanges);

  // Get all direct children that are paragraphs or tables
  const contentElements = Array.from(body.children).filter(element => {
    const tagName = element.tagName.toLowerCase();
    return tagName.match(/^(w:)?p$/) || tagName.match(/^(w:)?tbl$/);
  });
  
  if (contentElements.length === 0) {
    return {
      html: '<p>No content found in document.</p>',
      plainText: 'No content found in document.',
      paragraphs: []
    };
  }

  // Transform each content element (paragraph or table)
  const htmlParts = contentElements
    .map(element => {
      const tagName = element.tagName.toLowerCase();
      if (tagName.match(/^(w:)?p$/)) {
        const html = transformParagraph(element, context);
        // Add paragraph to the array (tables are not added to paragraphs array)
        if (html.trim()) {
          paragraphs.push(html);
        }
        return html;
      } else if (tagName.match(/^(w:)?tbl$/)) {
        return transformTable(element, context);
      }
      return '';
    })
    .filter(html => html.trim());

  let html = htmlParts.join('\n');
  
  // Add footnotes at the end of the document
  if (footnotes.length > 0) {
    const footnoteHtml = footnotes
      .filter(note => note.noteType === 'normal') // Only show normal footnotes, not separators
      .map(note => {
        const id = note.id.split('-').pop() || note.id;
        // Use pre-transformed content if available, otherwise fall back to plain text or transform now
        let content = note.content;
        if (!content && footnotesXml) {
          const footnoteElement = footnotesXml.querySelector(`[w\\:id="${id}"], [id="${id}"]`);
          if (footnoteElement) {
            content = transformNoteContent(footnoteElement, numberingXml, stylesXml);
          }
        }
        if (!content) {
          content = `<p>${note.plainText}</p>`;
        }
        
        return `<div class="footnote" id="footnote-${id}">
          <a href="#footnote-ref-${id}" class="footnote-backlink">${id}.</a> ${content}
        </div>`;
      })
      .join('\n');
    
    if (footnoteHtml) {
      html += '\n<div class="footnotes">\n<hr class="footnotes-separator">\n' + footnoteHtml + '\n</div>';
    }
  }
  
  // Add endnotes at the end of the document (after footnotes)
  if (endnotes.length > 0) {
    const endnoteHtml = endnotes
      .filter(note => note.noteType === 'normal') // Only show normal endnotes, not separators
      .map(note => {
        const id = note.id.split('-').pop() || note.id;
        // Use pre-transformed content if available, otherwise fall back to plain text or transform now
        let content = note.content;
        if (!content && endnotesXml) {
          const endnoteElement = endnotesXml.querySelector(`[w\\:id="${id}"], [id="${id}"]`);
          if (endnoteElement) {
            content = transformNoteContent(endnoteElement, numberingXml, stylesXml);
          }
        }
        if (!content) {
          content = `<p>${note.plainText}</p>`;
        }
        
        return `<div class="endnote" id="endnote-${id}">
          <a href="#endnote-ref-${id}" class="endnote-backlink">${id}.</a> ${content}
        </div>`;
      })
      .join('\n');
    
    if (endnoteHtml) {
      html += '\n<div class="endnotes">\n<hr class="endnotes-separator">\n' + endnoteHtml + '\n</div>';
    }
  }
  
  // Extract plain text for search/indexing (including footnotes/endnotes)
  const paragraphElements = body.querySelectorAll('w\\:p, p');
  const mainText = Array.from(paragraphElements)
    .map(p => {
      // Extract text and line breaks from runs in order
      const runs = p.querySelectorAll('w\\:r, r');
      const runTexts = Array.from(runs).map(run => {
        const parts: string[] = [];
        const children = Array.from(run.childNodes);
        
        for (const child of children) {
          if (child.nodeType === Node.ELEMENT_NODE) {
            const element = child as Element;
            const tagName = element.tagName.toLowerCase();
            
            if (tagName.match(/^(w:)?t$/)) {
              parts.push(element.textContent || '');
            } else if (tagName.match(/^(w:)?br$/)) {
              parts.push('\n');
            }
          }
        }
        
        return parts.join('');
      });
      
      return runTexts.join('');
    })
    .filter(text => text.trim())
    .join('\n');
  
  const footnoteText = footnotes.map(note => note.plainText).join(' ');
  const endnoteText = endnotes.map(note => note.plainText).join(' ');
  
  const plainText = [mainText, footnoteText, endnoteText]
    .filter(text => text.trim())
    .join('\n');

  // Convert the comment to paragraph map from Set to Array for serialization
  const commentToParagraphMapArray = new Map<string, number[]>();
  commentToParagraphMap.forEach((paragraphIndexSet, commentId) => {
    commentToParagraphMapArray.set(commentId, Array.from(paragraphIndexSet));
  });

  return {
    html: html || '<p>No content to display.</p>',
    plainText: plainText || 'No content to display.',
    paragraphs,
    commentToParagraphMap: commentToParagraphMapArray,
    commentRanges
  };
}