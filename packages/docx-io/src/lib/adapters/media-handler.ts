/**
 * Media Handler - HTML video/audio/file elements to DOCX placeholder conversion
 *
 * This module provides handlers for converting HTML media elements to
 * docXMLater hyperlink placeholders, since DOCX doesn't natively support
 * embedded video/audio.
 *
 * Converts:
 * - <video> elements to hyperlink placeholders
 * - <audio> elements to hyperlink placeholders
 * - File attachment references to attachment text
 *
 * @module media-handler
 */

import { Hyperlink, Run, type RunFormatting } from '../docXMLater/src';
import type { ConversionContext, ConversionResult } from './element-handlers';
import { generateRelationshipId } from './link-handler';

// ============================================================================
// Constants
// ============================================================================

/** Video placeholder prefix */
export const VIDEO_PLACEHOLDER_PREFIX = '[Video: ';

/** Video placeholder suffix */
export const VIDEO_PLACEHOLDER_SUFFIX = ']';

/** Audio placeholder prefix */
export const AUDIO_PLACEHOLDER_PREFIX = '[Audio: ';

/** Audio placeholder suffix */
export const AUDIO_PLACEHOLDER_SUFFIX = ']';

/** File placeholder prefix */
export const FILE_PLACEHOLDER_PREFIX = '[Attachment: ';

/** File placeholder suffix */
export const FILE_PLACEHOLDER_SUFFIX = ']';

/** Default media link color (blue) */
export const MEDIA_LINK_COLOR = '0563C1';

/** Default media text color (gray) */
export const MEDIA_TEXT_COLOR = '6B7280';

// ============================================================================
// Type Definitions
// ============================================================================

/**
 * Media type
 */
export type MediaType = 'video' | 'audio' | 'file';

/**
 * Options for media conversion
 */
export interface MediaConversionOptions {
  /** Whether to create hyperlinks (default: true for video/audio) */
  createHyperlink?: boolean;
  /** Custom placeholder prefix */
  prefix?: string;
  /** Custom placeholder suffix */
  suffix?: string;
  /** Link color (hex without #) */
  linkColor?: string;
  /** Text color for non-links (hex without #) */
  textColor?: string;
  /** Whether to include file size if available */
  includeFileSize?: boolean;
  /** Whether to include duration if available */
  includeDuration?: boolean;
}

/**
 * Parsed media data
 */
export interface ParsedMediaData {
  /** Media source URL */
  src: string;
  /** Media type */
  type: MediaType;
  /** Media title or filename */
  title: string;
  /** Duration in seconds (if available) */
  duration?: number;
  /** File size in bytes (if available) */
  fileSize?: number;
  /** MIME type */
  mimeType?: string;
  /** Poster image URL (for video) */
  poster?: string;
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Detects if an element is a video element
 *
 * @param element - Element to check
 * @returns True if element is a video
 */
export function isVideoElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'video') {
    return true;
  }

  // Check for data attributes
  if (
    element.hasAttribute('data-slate-type') &&
    element.getAttribute('data-slate-type') === 'video'
  ) {
    return true;
  }

  // Check for video-related classes
  const className = element.className || '';
  if (
    typeof className === 'string' &&
    (className.includes('video-embed') || className.includes('video-player'))
  ) {
    return true;
  }

  return false;
}

/**
 * Detects if an element is an audio element
 *
 * @param element - Element to check
 * @returns True if element is an audio
 */
export function isAudioElement(element: Element): boolean {
  const tagName = element.tagName.toLowerCase();

  if (tagName === 'audio') {
    return true;
  }

  // Check for data attributes
  if (
    element.hasAttribute('data-slate-type') &&
    element.getAttribute('data-slate-type') === 'audio'
  ) {
    return true;
  }

  // Check for audio-related classes
  const className = element.className || '';
  if (
    typeof className === 'string' &&
    (className.includes('audio-embed') || className.includes('audio-player'))
  ) {
    return true;
  }

  return false;
}

/**
 * Detects if an element is a file attachment element
 *
 * @param element - Element to check
 * @returns True if element is a file attachment
 */
export function isFileElement(element: Element): boolean {
  // Check for data attributes
  if (
    element.hasAttribute('data-slate-type') &&
    element.getAttribute('data-slate-type') === 'file'
  ) {
    return true;
  }

  if (
    element.hasAttribute('data-file') ||
    element.hasAttribute('data-attachment')
  ) {
    return true;
  }

  // Check for file-related classes
  const className = element.className || '';
  if (
    typeof className === 'string' &&
    (className.includes('file-attachment') || className.includes('attachment'))
  ) {
    return true;
  }

  return false;
}

/**
 * Extracts media data from an element
 *
 * @param element - The media element
 * @param type - Media type
 * @returns Parsed media data
 */
export function extractMediaData(
  element: Element,
  type: MediaType
): ParsedMediaData {
  // Get source URL
  let src = '';

  // Check direct src attribute
  src =
    element.getAttribute('src') ||
    element.getAttribute('data-src') ||
    element.getAttribute('href') ||
    element.getAttribute('data-url') ||
    '';

  // Check for source child element
  if (!src) {
    const sourceEl = element.querySelector('source');
    if (sourceEl) {
      src = sourceEl.getAttribute('src') || '';
    }
  }

  // Get title
  const title =
    element.getAttribute('title') ||
    element.getAttribute('data-title') ||
    element.getAttribute('data-filename') ||
    element.getAttribute('alt') ||
    element.textContent?.trim() ||
    extractFilenameFromUrl(src) ||
    `${type} file`;

  // Get duration
  let duration: number | undefined;
  const durationAttr = element.getAttribute('data-duration');
  if (durationAttr) {
    duration = Number.parseFloat(durationAttr);
    if (isNaN(duration)) duration = undefined;
  }

  // Get file size
  let fileSize: number | undefined;
  const sizeAttr =
    element.getAttribute('data-size') || element.getAttribute('data-filesize');
  if (sizeAttr) {
    fileSize = Number.parseInt(sizeAttr, 10);
    if (isNaN(fileSize)) fileSize = undefined;
  }

  // Get MIME type
  const mimeType =
    element.getAttribute('type') ||
    element.getAttribute('data-mime-type') ||
    undefined;

  // Get poster (for video)
  const poster =
    type === 'video' ? element.getAttribute('poster') || undefined : undefined;

  return {
    src,
    type,
    title,
    duration,
    fileSize,
    mimeType,
    poster,
  };
}

/**
 * Extracts filename from a URL
 *
 * @param url - URL to extract from
 * @returns Filename or empty string
 */
function extractFilenameFromUrl(url: string): string {
  if (!url) return '';

  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    const filename = pathname.split('/').pop() || '';
    return decodeURIComponent(filename);
  } catch {
    // Not a valid URL, try simple extraction
    const parts = url.split('/');
    return parts[parts.length - 1] || '';
  }
}

/**
 * Formats file size for display
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Formats duration for display
 *
 * @param seconds - Duration in seconds
 * @returns Formatted string (e.g., "1:23")
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

// ============================================================================
// Media Handlers
// ============================================================================

/**
 * Handles video elements
 *
 * Creates a hyperlink placeholder since DOCX doesn't support embedded video.
 *
 * @param element - The video element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with Hyperlink or Run
 *
 * @example
 * ```typescript
 * // HTML: <video src="https://example.com/video.mp4" title="My Video"></video>
 * const result = handleVideoElement(element, context);
 * // Creates a hyperlink: "[Video: My Video]" linking to the video URL
 * ```
 */
export function handleVideoElement(
  element: Element,
  context: ConversionContext,
  options: MediaConversionOptions = {}
): ConversionResult {
  const {
    createHyperlink = true,
    prefix = VIDEO_PLACEHOLDER_PREFIX,
    suffix = VIDEO_PLACEHOLDER_SUFFIX,
    linkColor = MEDIA_LINK_COLOR,
    includeDuration = true,
  } = options;

  // Extract video data
  const mediaData = extractMediaData(element, 'video');

  // Build placeholder text
  let text = `${prefix}${mediaData.title}`;
  if (includeDuration && mediaData.duration) {
    text += ` (${formatDuration(mediaData.duration)})`;
  }
  text += suffix;

  // Create hyperlink if URL available and createHyperlink is true
  if (createHyperlink && mediaData.src) {
    const formatting: RunFormatting = {
      color: linkColor,
      underline: 'single',
      ...(context.inheritedFormatting || {}),
    };

    const hyperlink = Hyperlink.createExternal(mediaData.src, text, formatting);
    hyperlink.setRelationshipId(generateRelationshipId());

    return {
      element: hyperlink as unknown as ConversionResult['element'],
      processChildren: false,
    };
  }

  // Create plain text run
  const formatting: RunFormatting = {
    color: MEDIA_TEXT_COLOR,
    italic: true,
    ...(context.inheritedFormatting || {}),
  };

  const run = new Run(text, formatting);

  return {
    element: run as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles audio elements
 *
 * Creates a hyperlink placeholder since DOCX doesn't support embedded audio.
 *
 * @param element - The audio element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with Hyperlink or Run
 */
export function handleAudioElement(
  element: Element,
  context: ConversionContext,
  options: MediaConversionOptions = {}
): ConversionResult {
  const {
    createHyperlink = true,
    prefix = AUDIO_PLACEHOLDER_PREFIX,
    suffix = AUDIO_PLACEHOLDER_SUFFIX,
    linkColor = MEDIA_LINK_COLOR,
    includeDuration = true,
  } = options;

  // Extract audio data
  const mediaData = extractMediaData(element, 'audio');

  // Build placeholder text
  let text = `${prefix}${mediaData.title}`;
  if (includeDuration && mediaData.duration) {
    text += ` (${formatDuration(mediaData.duration)})`;
  }
  text += suffix;

  // Create hyperlink if URL available and createHyperlink is true
  if (createHyperlink && mediaData.src) {
    const formatting: RunFormatting = {
      color: linkColor,
      underline: 'single',
      ...(context.inheritedFormatting || {}),
    };

    const hyperlink = Hyperlink.createExternal(mediaData.src, text, formatting);
    hyperlink.setRelationshipId(generateRelationshipId());

    return {
      element: hyperlink as unknown as ConversionResult['element'],
      processChildren: false,
    };
  }

  // Create plain text run
  const formatting: RunFormatting = {
    color: MEDIA_TEXT_COLOR,
    italic: true,
    ...(context.inheritedFormatting || {}),
  };

  const run = new Run(text, formatting);

  return {
    element: run as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

/**
 * Handles file attachment elements
 *
 * Creates a text reference for file attachments.
 *
 * @param element - The file element
 * @param context - Conversion context
 * @param options - Conversion options
 * @returns Conversion result with Hyperlink or Run
 */
export function handleFileElement(
  element: Element,
  context: ConversionContext,
  options: MediaConversionOptions = {}
): ConversionResult {
  const {
    createHyperlink = true,
    prefix = FILE_PLACEHOLDER_PREFIX,
    suffix = FILE_PLACEHOLDER_SUFFIX,
    linkColor = MEDIA_LINK_COLOR,
    includeFileSize = true,
  } = options;

  // Extract file data
  const mediaData = extractMediaData(element, 'file');

  // Build placeholder text
  let text = `${prefix}${mediaData.title}`;
  if (includeFileSize && mediaData.fileSize) {
    text += ` (${formatFileSize(mediaData.fileSize)})`;
  }
  text += suffix;

  // Create hyperlink if URL available and createHyperlink is true
  if (createHyperlink && mediaData.src) {
    const formatting: RunFormatting = {
      color: linkColor,
      underline: 'single',
      ...(context.inheritedFormatting || {}),
    };

    const hyperlink = Hyperlink.createExternal(mediaData.src, text, formatting);
    hyperlink.setRelationshipId(generateRelationshipId());

    return {
      element: hyperlink as unknown as ConversionResult['element'],
      processChildren: false,
    };
  }

  // Create plain text run
  const formatting: RunFormatting = {
    color: MEDIA_TEXT_COLOR,
    italic: true,
    ...(context.inheritedFormatting || {}),
  };

  const run = new Run(text, formatting);

  return {
    element: run as unknown as ConversionResult['element'],
    processChildren: false,
  };
}

// ============================================================================
// Factory Functions
// ============================================================================

/**
 * Creates a video placeholder Run or Hyperlink
 *
 * @param title - Video title
 * @param url - Video URL (optional)
 * @param options - Conversion options
 * @returns Hyperlink if URL provided, otherwise Run
 */
export function createVideoPlaceholder(
  title: string,
  url?: string,
  options: MediaConversionOptions = {}
): Hyperlink | Run {
  const {
    prefix = VIDEO_PLACEHOLDER_PREFIX,
    suffix = VIDEO_PLACEHOLDER_SUFFIX,
    linkColor = MEDIA_LINK_COLOR,
  } = options;

  const text = `${prefix}${title}${suffix}`;

  if (url) {
    const formatting: RunFormatting = {
      color: linkColor,
      underline: 'single',
    };

    const hyperlink = Hyperlink.createExternal(url, text, formatting);
    hyperlink.setRelationshipId(generateRelationshipId());
    return hyperlink;
  }

  return new Run(text, { color: MEDIA_TEXT_COLOR, italic: true });
}

/**
 * Creates an audio placeholder Run or Hyperlink
 *
 * @param title - Audio title
 * @param url - Audio URL (optional)
 * @param options - Conversion options
 * @returns Hyperlink if URL provided, otherwise Run
 */
export function createAudioPlaceholder(
  title: string,
  url?: string,
  options: MediaConversionOptions = {}
): Hyperlink | Run {
  const {
    prefix = AUDIO_PLACEHOLDER_PREFIX,
    suffix = AUDIO_PLACEHOLDER_SUFFIX,
    linkColor = MEDIA_LINK_COLOR,
  } = options;

  const text = `${prefix}${title}${suffix}`;

  if (url) {
    const formatting: RunFormatting = {
      color: linkColor,
      underline: 'single',
    };

    const hyperlink = Hyperlink.createExternal(url, text, formatting);
    hyperlink.setRelationshipId(generateRelationshipId());
    return hyperlink;
  }

  return new Run(text, { color: MEDIA_TEXT_COLOR, italic: true });
}

/**
 * Creates a file attachment placeholder Run or Hyperlink
 *
 * @param filename - File name
 * @param url - File URL (optional)
 * @param fileSize - File size in bytes (optional)
 * @param options - Conversion options
 * @returns Hyperlink if URL provided, otherwise Run
 */
export function createFileAttachment(
  filename: string,
  url?: string,
  fileSize?: number,
  options: MediaConversionOptions = {}
): Hyperlink | Run {
  const {
    prefix = FILE_PLACEHOLDER_PREFIX,
    suffix = FILE_PLACEHOLDER_SUFFIX,
    linkColor = MEDIA_LINK_COLOR,
    includeFileSize = true,
  } = options;

  let text = `${prefix}${filename}`;
  if (includeFileSize && fileSize) {
    text += ` (${formatFileSize(fileSize)})`;
  }
  text += suffix;

  if (url) {
    const formatting: RunFormatting = {
      color: linkColor,
      underline: 'single',
    };

    const hyperlink = Hyperlink.createExternal(url, text, formatting);
    hyperlink.setRelationshipId(generateRelationshipId());
    return hyperlink;
  }

  return new Run(text, { color: MEDIA_TEXT_COLOR, italic: true });
}
