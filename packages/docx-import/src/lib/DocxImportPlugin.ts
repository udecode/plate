'use client';

import { type DefinitionOf, defineBasePlugin } from '@platejs/core';
import { cleanWordHtml } from '@platejs/docx-paste';
import {
  TextApi,
  type Descendant,
  type Path,
  type Point,
} from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';
import mammoth from 'mammoth';

const COMMENT_WHITESPACE_PATTERN = /\s+/g;

/** Comment extracted from a DOCX file. */
export type DocxComment = {
  id: string;
  /** Positions of this comment in the imported node snapshot. */
  references: Point[];
  text: string;
};

/** Result of importing a DOCX file. */
export type ImportDocxResult = {
  comments: DocxComment[];
  nodes: Descendant[];
  warnings: string[];
};

/** Options for importing a DOCX file. */
export type ImportDocxOptions = {
  rtf?: string;
};

export const DocxImportPlugin = defineBasePlugin(PLUGINS.docxImport, {
  api: ({ editor }) => ({
    import: async (
      arrayBuffer: ArrayBuffer,
      options: ImportDocxOptions = {}
    ): Promise<ImportDocxResult> => {
      // Mammoth selects `buffer` in Node and `arrayBuffer` in its browser build.
      const mammothInput = { arrayBuffer, buffer: arrayBuffer };
      const mammothResult = await mammoth.convertToHtml(mammothInput, {
        styleMap: ['comment-reference => sup'],
      });
      const warnings = mammothResult.messages.map((message) => message.message);
      const mammothDocument = new DOMParser().parseFromString(
        mammothResult.value,
        'text/html'
      );
      const commentById = new Map<string, string>();

      for (const dl of Array.from(mammothDocument.querySelectorAll('dl'))) {
        const definitions = Array.from(
          dl.querySelectorAll('dt[id^="comment-"]')
        );

        if (definitions.length === 0) continue;

        for (const definition of definitions) {
          const id = (definition.getAttribute('id') ?? '').slice(
            'comment-'.length
          );
          const description = definition.nextElementSibling;

          if (!(id && description?.matches('dd'))) continue;

          const descriptionClone = description.cloneNode(true);

          if (!(descriptionClone instanceof HTMLElement)) continue;

          for (const backReference of Array.from(
            descriptionClone.querySelectorAll('a[href^="#comment-ref-"]')
          )) {
            backReference.remove();
          }

          for (const block of Array.from(
            descriptionClone.querySelectorAll('br, div, li, p')
          )) {
            if (block.matches('br')) {
              block.replaceWith(
                descriptionClone.ownerDocument.createTextNode(' ')
              );
            } else {
              block.append(descriptionClone.ownerDocument.createTextNode(' '));
            }
          }

          const text = (descriptionClone.textContent ?? '')
            .replaceAll(COMMENT_WHITESPACE_PATTERN, ' ')
            .trim();

          commentById.set(
            id,
            text.endsWith('↑') ? text.slice(0, -1).trim() : text
          );
        }

        dl.remove();
      }

      const commentIds: string[] = [];
      const seenCommentIds = new Set<string>();

      for (const reference of Array.from(
        mammothDocument.querySelectorAll('a[id^="comment-ref-"]')
      )) {
        const id = (reference.getAttribute('id') ?? '').slice(
          'comment-ref-'.length
        );

        if (!id) continue;

        if (!seenCommentIds.has(id)) {
          seenCommentIds.add(id);
          commentIds.push(id);
        }

        const marker = mammothDocument.createTextNode(
          `[[DOCX_COMMENT_REF:${id}]]`
        );
        const parent = reference.parentElement;

        if (parent?.matches('sup') && parent.childNodes.length === 1) {
          parent.replaceWith(marker);
        } else {
          reference.replaceWith(marker);
        }
      }

      const cleanedHtml = cleanWordHtml(
        mammothDocument.body.innerHTML,
        options.rtf ?? ''
      );
      const element = new DOMParser().parseFromString(
        cleanedHtml,
        'text/html'
      ).body;

      if (!element) {
        return {
          comments: [],
          nodes: [],
          warnings: [...warnings, 'Failed to parse HTML'],
        };
      }

      const nodes = editor.api.html.deserialize({ element });

      if (!nodes) {
        return {
          comments: [],
          nodes: [],
          warnings: [...warnings, 'Failed to decode HTML'],
        };
      }

      const referencesByCommentId = new Map<string, Point[]>();
      const stripCommentMarkers = (
        node: Descendant,
        path: Path
      ): Descendant => {
        if (!TextApi.isText(node)) {
          return {
            ...node,
            children: node.children.map((child, index) =>
              stripCommentMarkers(child, [...path, index])
            ),
          };
        }

        let cursor = 0;
        let strippedText = '';

        for (const match of node.text.matchAll(
          /\[\[DOCX_COMMENT_REF:([^\]]+)]]/g
        )) {
          const matchIndex = match.index;
          const id = match[1];

          strippedText += node.text.slice(cursor, matchIndex);
          cursor = matchIndex + match[0].length;

          if (!id) continue;

          const references = referencesByCommentId.get(id) ?? [];
          references.push({ offset: strippedText.length, path });
          referencesByCommentId.set(id, references);
        }

        return cursor > 0
          ? { ...node, text: strippedText + node.text.slice(cursor) }
          : node;
      };
      const importedNodes = nodes.map((node, index) =>
        stripCommentMarkers(node, [index])
      );

      return {
        comments: commentIds.map((id) => ({
          id,
          references: referencesByCommentId.get(id) ?? [],
          text: commentById.get(id) ?? '',
        })),
        nodes: importedNodes,
        warnings,
      };
    },
  }),
});

export type DocxImportDefinition = DefinitionOf<typeof DocxImportPlugin>;
