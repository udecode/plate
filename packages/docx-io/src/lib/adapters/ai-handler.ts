/**
 * AI Handler - AI suggestion and completion export handling
 *
 * This module provides handlers for exporting AI-generated content suggestions
 * from Plate editor to DOCX format. AI suggestions are typically displayed
 * as pending insertions that users can accept or reject.
 *
 * For DOCX export, AI suggestions should be:
 * 1. Accepted before export (resolved to final text)
 * 2. Exported as track changes (if track changes enabled)
 * 3. Excluded (if suggestion is rejected/pending)
 *
 * This handler provides utilities for detecting, extracting, and converting
 * AI suggestions to appropriate DOCX representations.
 *
 * @module ai-handler
 */

import { Paragraph, Run } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';

// ============================================================================
// Constants
// ============================================================================

/** Data attribute for AI suggestion content */
export const AI_SUGGESTION_DATA_ATTR = 'data-ai-suggestion';

/** Data attribute for AI suggestion state */
export const AI_SUGGESTION_STATE_ATTR = 'data-ai-state';

/** Data attribute for AI suggestion ID */
export const AI_SUGGESTION_ID_ATTR = 'data-ai-id';

/** Class patterns for AI suggestion elements */
export const AI_SUGGESTION_CLASS_PATTERNS = [
  'ai-suggestion',
  'ai-completion',
  'ai-inline',
  'copilot-suggestion',
  'ghost-text',
  'ai-generated',
];

/** Default color for AI suggestion text (gray) */
export const AI_SUGGESTION_COLOR = '999999';

/** Default author name for AI-generated content */
export const AI_AUTHOR = 'AI Assistant';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * State of an AI suggestion
 */
export type AISuggestionState =
  | 'pending' // Suggestion is shown but not yet accepted/rejected
  | 'accepted' // User has accepted the suggestion
  | 'rejected' // User has rejected the suggestion
  | 'partial'; // User has partially accepted the suggestion

/**
 * Options for AI suggestion conversion
 */
export interface AIConversionOptions {
  /** How to handle pending suggestions (default: 'accept') */
  pendingBehavior?: 'accept' | 'reject' | 'track-changes' | 'highlight';
  /** Whether to include rejected suggestions (default: false) */
  includeRejected?: boolean;
  /** Whether to mark AI content as track changes (default: false) */
  useTrackChanges?: boolean;
  /** Author name for track changes (default: 'AI Assistant') */
  aiAuthor?: string;
  /** Color for AI suggestion text when highlighted (default: '999999') */
  suggestionColor?: string;
  /** Whether to add a comment noting AI-generated content (default: false) */
  addAIComment?: boolean;
}

/**
 * Extracted AI suggestion metadata
 */
export interface AISuggestionMetadata {
  /** Whether element contains AI suggestion */
  isAISuggestion: boolean;
  /** Current state of the suggestion */
  state: AISuggestionState;
  /** Unique ID for the suggestion */
  suggestionId?: string;
  /** The suggested text content */
  suggestedText?: string;
  /** Original text being replaced (if any) */
  originalText?: string;
  /** Confidence score (0-1) if available */
  confidence?: number;
  /** Model/source that generated the suggestion */
  source?: string;
  /** Timestamp when suggestion was generated */
  timestamp?: string;
}

// ============================================================================
// Detection Functions
// ============================================================================

/**
 * Checks if an element is an AI suggestion element
 *
 * @param element - The element to check
 * @returns True if the element is an AI suggestion
 */
export function isAISuggestionElement(element: Element): boolean {
  // Check for AI-specific data attributes
  if (
    element.hasAttribute(AI_SUGGESTION_DATA_ATTR) ||
    element.hasAttribute(AI_SUGGESTION_STATE_ATTR) ||
    element.hasAttribute(AI_SUGGESTION_ID_ATTR) ||
    element.hasAttribute('data-ai') ||
    element.hasAttribute('data-copilot')
  ) {
    return true;
  }

  // Check class names
  const className = element.className?.toLowerCase() || '';
  for (const pattern of AI_SUGGESTION_CLASS_PATTERNS) {
    if (className.includes(pattern.toLowerCase())) {
      return true;
    }
  }

  // Check for contenteditable=false with specific styling (common for suggestions)
  if (
    element.getAttribute('contenteditable') === 'false' &&
    (element.getAttribute('data-suggestion') ||
      className.includes('suggestion'))
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts the state of an AI suggestion
 *
 * @param element - The AI suggestion element
 * @returns The suggestion state
 */
export function extractAISuggestionState(element: Element): AISuggestionState {
  // Check explicit state attribute
  const stateAttr = element.getAttribute(AI_SUGGESTION_STATE_ATTR);
  if (stateAttr) {
    const normalizedState = stateAttr.toLowerCase();
    if (
      ['pending', 'accepted', 'rejected', 'partial'].includes(normalizedState)
    ) {
      return normalizedState as AISuggestionState;
    }
  }

  // Check data-accepted attribute
  const acceptedAttr = element.getAttribute('data-accepted');
  if (acceptedAttr === 'true') return 'accepted';
  if (acceptedAttr === 'false') return 'rejected';

  // Check class names for state
  const className = element.className?.toLowerCase() || '';
  if (className.includes('accepted')) return 'accepted';
  if (className.includes('rejected')) return 'rejected';
  if (className.includes('partial')) return 'partial';

  // Default to pending
  return 'pending';
}

/**
 * Extracts metadata from an AI suggestion element
 *
 * @param element - The AI suggestion element
 * @returns Extracted metadata
 */
export function extractAISuggestionMetadata(
  element: Element
): AISuggestionMetadata {
  const metadata: AISuggestionMetadata = {
    isAISuggestion: isAISuggestionElement(element),
    state: 'pending',
  };

  if (!metadata.isAISuggestion) {
    return metadata;
  }

  // Extract state
  metadata.state = extractAISuggestionState(element);

  // Extract suggestion ID
  metadata.suggestionId =
    element.getAttribute(AI_SUGGESTION_ID_ATTR) ||
    element.getAttribute('data-suggestion-id') ||
    element.getAttribute('id') ||
    undefined;

  // Extract suggested text
  metadata.suggestedText = element.textContent?.trim() || undefined;

  // Extract original text (if this is a replacement)
  const originalAttr = element.getAttribute('data-original');
  if (originalAttr) {
    metadata.originalText = originalAttr;
  }

  // Extract confidence score
  const confidenceAttr = element.getAttribute('data-confidence');
  if (confidenceAttr) {
    const confidence = Number.parseFloat(confidenceAttr);
    if (!isNaN(confidence)) {
      metadata.confidence = confidence;
    }
  }

  // Extract source/model
  metadata.source =
    element.getAttribute('data-source') ||
    element.getAttribute('data-model') ||
    undefined;

  // Extract timestamp
  metadata.timestamp =
    element.getAttribute('data-timestamp') ||
    element.getAttribute('datetime') ||
    undefined;

  return metadata;
}

// ============================================================================
// Conversion Functions
// ============================================================================

/**
 * Determines if a suggestion should be included in export
 *
 * @param metadata - Suggestion metadata
 * @param options - Conversion options
 * @returns True if the suggestion should be included
 */
export function shouldIncludeSuggestion(
  metadata: AISuggestionMetadata,
  options: AIConversionOptions = {}
): boolean {
  const { pendingBehavior = 'accept', includeRejected = false } = options;

  if (!metadata.isAISuggestion) {
    return true; // Not a suggestion, include as normal content
  }

  switch (metadata.state) {
    case 'accepted':
      return true;
    case 'rejected':
      return includeRejected;
    case 'partial':
      return true; // Partial is treated as accepted
    case 'pending':
      return pendingBehavior !== 'reject';
    default:
      return true;
  }
}

/**
 * Gets the text content for an AI suggestion based on options
 *
 * @param metadata - Suggestion metadata
 * @param options - Conversion options
 * @returns Text content to use, or null if suggestion should be excluded
 */
export function resolveSuggestionText(
  metadata: AISuggestionMetadata,
  options: AIConversionOptions = {}
): string | null {
  const { pendingBehavior = 'accept' } = options;

  if (!metadata.isAISuggestion) {
    return metadata.suggestedText || null;
  }

  if (!shouldIncludeSuggestion(metadata, options)) {
    return null;
  }

  // For rejected suggestions with original text, return original
  if (
    metadata.state === 'rejected' &&
    metadata.originalText &&
    options.includeRejected
  ) {
    return metadata.originalText;
  }

  return metadata.suggestedText || null;
}

// ============================================================================
// Element Handlers
// ============================================================================

/**
 * Handles AI suggestion elements
 *
 * Based on conversion options, this handler will:
 * - Accept pending suggestions as normal text
 * - Reject pending suggestions (exclude from export)
 * - Mark suggestions as track changes
 * - Highlight suggestions with special formatting
 *
 * @param element - The AI suggestion element
 * @param context - Conversion context
 * @param options - AI conversion options
 * @returns Conversion result
 */
export function handleAISuggestionElement(
  element: Element,
  context: ConversionContext,
  options: AIConversionOptions = {}
): ConversionResult {
  const {
    pendingBehavior = 'accept',
    useTrackChanges = false,
    suggestionColor = AI_SUGGESTION_COLOR,
  } = options;

  const metadata = extractAISuggestionMetadata(element);

  // If not an AI suggestion, pass through
  if (!metadata.isAISuggestion) {
    return {
      element: null,
      processChildren: true,
    };
  }

  // Check if suggestion should be included
  if (!shouldIncludeSuggestion(metadata, options)) {
    return {
      element: null,
      processChildren: false, // Skip this content
    };
  }

  // Get resolved text
  const text = resolveSuggestionText(metadata, options);
  if (!text) {
    return {
      element: null,
      processChildren: false,
    };
  }

  // Create run with appropriate formatting
  const run = new Run(text);

  // Apply highlighting for pending suggestions in highlight mode
  if (metadata.state === 'pending' && pendingBehavior === 'highlight') {
    run.setColor(suggestionColor);
    run.setItalic(true);
  }

  // If using track changes for accepted suggestions
  // Note: Track changes implementation would require revision support
  // This is a simplified version that just marks the text visually
  if (
    useTrackChanges &&
    (metadata.state === 'pending' || metadata.state === 'accepted')
  ) {
    run.setColor(suggestionColor);
    run.setUnderline('dotted');
  }

  // Add to current paragraph if available
  if (context.currentParagraph) {
    context.currentParagraph.addRun(run);
    return {
      element: null,
      processChildren: false,
    };
  }

  // Create new paragraph
  const paragraph = new Paragraph();
  paragraph.addRun(run);

  return {
    element: paragraph as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Async handler for AI suggestions with track changes support
 *
 * This handler can create proper track change revisions for AI suggestions.
 *
 * @param element - The AI suggestion element
 * @param context - Conversion context
 * @param options - AI conversion options
 * @returns Promise resolving to conversion result
 */
export async function handleAISuggestionElementAsync(
  element: Element,
  context: ConversionContext,
  options: AIConversionOptions = {}
): Promise<ConversionResult> {
  // For now, delegate to sync handler
  // Future implementation could add proper revision tracking
  return handleAISuggestionElement(element, context, options);
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates an AI suggestion run with appropriate styling
 *
 * @param text - The AI-suggested text
 * @param state - State of the suggestion
 * @param options - Conversion options
 * @returns Configured Run
 *
 * @example
 * ```typescript
 * const run = createAISuggestionRun('Hello World', 'accepted');
 * paragraph.addRun(run);
 * ```
 */
export function createAISuggestionRun(
  text: string,
  state: AISuggestionState = 'accepted',
  options: AIConversionOptions = {}
): Run {
  const { suggestionColor = AI_SUGGESTION_COLOR, pendingBehavior = 'accept' } =
    options;

  const run = new Run(text);

  // Apply styling based on state
  if (state === 'pending' && pendingBehavior === 'highlight') {
    run.setColor(suggestionColor);
    run.setItalic(true);
  }

  return run;
}

/**
 * Creates a paragraph with AI-suggested content
 *
 * @param text - The AI-suggested text
 * @param options - Conversion options
 * @returns Configured Paragraph
 *
 * @example
 * ```typescript
 * const paragraph = createAISuggestionParagraph('This is AI-generated content');
 * document.addParagraph(paragraph);
 * ```
 */
export function createAISuggestionParagraph(
  text: string,
  options: AIConversionOptions = {}
): Paragraph {
  const paragraph = new Paragraph();
  const run = createAISuggestionRun(text, 'accepted', options);
  paragraph.addRun(run);
  return paragraph;
}

/**
 * Processes AI suggestions in a collection of elements
 *
 * This utility function processes multiple elements and resolves
 * AI suggestions based on the provided options.
 *
 * @param elements - Collection of elements to process
 * @param options - Conversion options
 * @returns Array of resolved text strings
 */
export function processAISuggestions(
  elements: Element[],
  options: AIConversionOptions = {}
): string[] {
  const results: string[] = [];

  for (const element of elements) {
    const metadata = extractAISuggestionMetadata(element);
    const text = resolveSuggestionText(metadata, options);

    if (text !== null) {
      results.push(text);
    }
  }

  return results;
}

/**
 * Checks if content has any AI suggestions
 *
 * @param root - Root element to check
 * @returns True if any AI suggestions are present
 */
export function hasAISuggestions(root: Element): boolean {
  // Check root element
  if (isAISuggestionElement(root)) {
    return true;
  }

  // Build selector for all AI-related patterns
  const selectors = [
    `[${AI_SUGGESTION_DATA_ATTR}]`,
    `[${AI_SUGGESTION_STATE_ATTR}]`,
    `[${AI_SUGGESTION_ID_ATTR}]`,
    '[data-ai]',
    '[data-copilot]',
    ...AI_SUGGESTION_CLASS_PATTERNS.map((p) => `.${p}`),
  ];

  return root.querySelector(selectors.join(',')) !== null;
}

/**
 * Gets all AI suggestion elements from a root element
 *
 * @param root - Root element to search
 * @returns Array of AI suggestion elements
 */
export function getAISuggestionElements(root: Element): Element[] {
  const elements: Element[] = [];

  // Build selector for all AI-related patterns
  const selectors = [
    `[${AI_SUGGESTION_DATA_ATTR}]`,
    `[${AI_SUGGESTION_STATE_ATTR}]`,
    `[${AI_SUGGESTION_ID_ATTR}]`,
    '[data-ai]',
    '[data-copilot]',
    ...AI_SUGGESTION_CLASS_PATTERNS.map((p) => `.${p}`),
  ];

  const found = root.querySelectorAll(selectors.join(','));
  found.forEach((el) => elements.push(el));

  return elements;
}

/**
 * Resolves all AI suggestions in a document to accepted state
 *
 * This is useful for preprocessing content before export.
 *
 * @param root - Root element to process
 * @returns Number of suggestions resolved
 */
export function resolveAllAISuggestions(root: Element): number {
  const elements = getAISuggestionElements(root);
  let count = 0;

  for (const element of elements) {
    // Update state attribute to accepted
    element.setAttribute(AI_SUGGESTION_STATE_ATTR, 'accepted');
    count++;
  }

  return count;
}
