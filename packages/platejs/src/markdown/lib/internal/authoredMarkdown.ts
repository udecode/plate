import { deserializeAuthoredJson } from '../../../authored';
import type { EditorDocumentValue } from '../../../core';

const AUTHORED_MARKDOWN_ENVELOPE = /\n?<!--plate-authored:v1:([^\s]+)-->\s*$/;

export const appendAuthoredMarkdownEnvelope = (
  markdown: string,
  document: EditorDocumentValue
) =>
  `${markdown.trimEnd()}\n\n<!--plate-authored:v1:${encodeURIComponent(
    JSON.stringify(document)
  )}-->\n`;

export const readAuthoredMarkdownEnvelope = (
  data: string
): EditorDocumentValue | null => {
  const encoded = AUTHORED_MARKDOWN_ENVELOPE.exec(data)?.[1];

  if (!encoded) return null;

  try {
    return deserializeAuthoredJson(decodeURIComponent(encoded));
  } catch (error) {
    throw new Error('Invalid authored Markdown envelope.', { cause: error });
  }
};
