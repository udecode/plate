import { defineBasePlugin } from '@platejs/core';
import {
  isHtmlBlockElement,
  removeHtmlNodesBetweenComments,
  traverseHtmlElements,
} from '@platejs/core/internal';
import { type Descendant, ElementApi } from '@platejs/plite';
import { PLUGINS } from '@platejs/utils';

import { cleanWordHtml, isWordHtml } from './cleanWordHtml';

const DECIMAL_COMPONENT_PATTERN = /^\d+$/;
const LEVEL_PATTERN = /level(\d+)/i;
const LIST_IDENTITY_PATTERN =
  /mso-list:\s*(l\d+)(?:\s+level\d+)?(?:\s+(lfo\d+))?/i;
const LIST_MARKER_PATTERN =
  /^\(?([A-Za-z\d]+(?:\.[A-Za-z\d]+)*)(?:\.(?![A-Za-z\d])|[)\\]|\s|$)/;
const LIST_DECLARATION_PATTERN = /@list\s+(l\d+):level(\d+)\s*\{([^}]*)\}/gi;
const LOWER_ALPHA_PATTERN = /^[a-z]+$/;
const LOWER_ROMAN_PATTERN = /^[cdilmvx]+$/;
const MSO_LIST_PATTERN = /mso-list:\s*l/i;
const MSO_LIST_IGNORE_PATTERN = /mso-list:\s*ignore/i;
const MSO_LEVEL_NUMBER_FORMAT_PATTERN = /mso-level-number-format:\s*([^;}]*)/i;
const NON_NUMERIC_PATTERN = /[^\d,.]+/;
const UPPER_ALPHA_PATTERN = /^[A-Z]+$/;
const UPPER_ROMAN_PATTERN = /^[CDILMVX]+$/;

const parseAlphaOrdinal = (value: string) =>
  [...value.toLowerCase()].reduce(
    (ordinal, character) =>
      ordinal * 26 + character.charCodeAt(0) - 'a'.charCodeAt(0) + 1,
    0
  );

const parseRomanOrdinal = (value: string) => {
  const values: Record<string, number> = {
    c: 100,
    d: 500,
    i: 1,
    l: 50,
    m: 1000,
    v: 5,
    x: 10,
  };
  const characters = [...value.toLowerCase()];

  return characters.reduce((ordinal, character, index) => {
    const current = values[character] ?? 0;
    const next = values[characters[index + 1] ?? ''] ?? 0;

    return ordinal + (current < next ? -current : current);
  }, 0);
};

const parseListOrdinal = (text: string, listStyle: string) => {
  const marker = LIST_MARKER_PATTERN.exec(text)?.[1].split('.').at(-1);

  if (!marker) return;
  if (listStyle.startsWith('decimal')) {
    return DECIMAL_COMPONENT_PATTERN.test(marker) ? Number(marker) : undefined;
  }
  if (listStyle.includes('alpha')) return parseAlphaOrdinal(marker);
  if (listStyle.includes('roman')) return parseRomanOrdinal(marker);
};

const getListStyleFromDeclaredFormat = (format: string | undefined) => {
  switch (format) {
    case 'alpha-lower':
      return 'lower-alpha';
    case 'alpha-upper':
      return 'upper-alpha';
    case 'bullet':
      return 'disc';
    case 'decimal':
      return 'decimal';
    case 'decimal-leading-zero':
      return 'decimal-leading-zero';
    case 'roman-lower':
      return 'lower-roman';
    case 'roman-upper':
      return 'upper-roman';
  }
};

const getDeclaredListStyles = (html: string) => {
  const styles = new Map<string, string>();

  for (const match of html.matchAll(LIST_DECLARATION_PATTERN)) {
    const format = MSO_LEVEL_NUMBER_FORMAT_PATTERN.exec(match[3])?.[1]
      .trim()
      .toLowerCase();
    const style = getListStyleFromDeclaredFormat(format);

    if (style) styles.set(`${match[1]}:${match[2]}`, style);
  }

  return styles;
};

const hasStructuralBoundary = (
  previous: HTMLElement,
  current: globalThis.Element
) => {
  if (previous.parentElement !== current.parentElement) return true;

  let sibling = previous.nextElementSibling;

  while (sibling && sibling !== current) {
    if (isHtmlBlockElement(sibling)) return true;
    sibling = sibling.nextElementSibling;
  }

  return sibling !== current;
};

export const DocxPastePlugin = defineBasePlugin(PLUGINS.docxPaste, {
  editOnly: true,
  codecs: ({ defineCodecs, editor }) => {
    const tableCell = editor.plugin(PLUGINS.tableCell);
    const tableCellType = tableCell.installed
      ? tableCell.schema.type
      : undefined;
    const table = editor.plugin(PLUGINS.table);
    const tableType = table.installed ? table.schema.type : undefined;

    return defineCodecs({
      'text/html': {
        transformData: ({ data, source }) => {
          const document = new DOMParser().parseFromString(data, 'text/html');
          const { body } = document;
          const rtf = source.getData('text/rtf');

          if (!isWordHtml(body)) return cleanWordHtml(data, rtf);

          const getIndent = (
            element: HTMLElement,
            property: 'marginLeft' | 'textIndent'
          ) => {
            const value = element.style[property];

            if (!value || value.startsWith('-')) return 0;

            let number = value.replace(NON_NUMERIC_PATTERN, '');

            if (number.startsWith('.')) number = `0${number}`;

            const parsed = Number.parseFloat(number);

            if (!parsed) return 0;

            return Math.round(
              value.includes('in') ? (parsed * 72) / 36 : parsed / 36
            );
          };
          const orderedStyleBySequence = new Map<string, string>();
          const lastOrdinalBySequence = new Map<string, number>();
          const activeSequenceByIndent = new Map<number, string>();
          const declaredListStyles = getDeclaredListStyles(data);
          let previousListElement: HTMLElement | undefined;

          body
            .querySelectorAll('p, h1, h2, h3, h4, h5, h6')
            .forEach((element) => {
              const htmlElement = element as HTMLElement;
              const style = element.getAttribute('style') ?? '';

              if (
                MSO_LIST_PATTERN.test(style) &&
                ([...element.querySelectorAll('[style]')].some((child) =>
                  MSO_LIST_IGNORE_PATTERN.test(
                    child.getAttribute('style') ?? ''
                  )
                ) ||
                  element.outerHTML.includes('<!--[if !supportLists]-->'))
              ) {
                if (
                  previousListElement &&
                  hasStructuralBoundary(previousListElement, element)
                ) {
                  activeSequenceByIndent.clear();
                }
                const listItem = document.createElement(
                  element.tagName === 'P' ? 'li' : element.tagName.toLowerCase()
                );
                const clonedElement = element.cloneNode(true) as Element;

                Array.from(element.attributes).forEach(({ name, value }) => {
                  listItem.setAttribute(name, value);
                });
                removeHtmlNodesBetweenComments(
                  clonedElement,
                  '[if !supportLists]',
                  '[endif]'
                );
                traverseHtmlElements(clonedElement, (child) => {
                  if (
                    MSO_LIST_IGNORE_PATTERN.test(
                      child.getAttribute('style') ?? ''
                    )
                  ) {
                    child.remove();
                  }

                  return true;
                });

                const level = LEVEL_PATTERN.exec(style)?.[1];
                const visualIndent = getIndent(htmlElement, 'marginLeft');

                const indent = level
                  ? Math.max(Number.parseInt(level, 10), visualIndent)
                  : Math.max(1, visualIndent);

                listItem.dataset.indent = String(indent);

                const markerText =
                  Array.from(element.querySelectorAll<HTMLElement>('[style]'))
                    .find((child) =>
                      MSO_LIST_IGNORE_PATTERN.test(
                        child.getAttribute('style') ?? ''
                      )
                    )
                    ?.textContent?.trim() ??
                  element.textContent?.trimStart() ??
                  '';
                const identity = LIST_IDENTITY_PATTERN.exec(style);
                const declaredListStyle =
                  identity?.[1] && level
                    ? declaredListStyles.get(`${identity[1]}:${level}`)
                    : undefined;
                const marker = LIST_MARKER_PATTERN.exec(markerText)?.[1]
                  .split('.')
                  .at(-1);
                let listStyle =
                  declaredListStyle ??
                  (marker && DECIMAL_COMPONENT_PATTERN.test(marker)
                    ? marker.length > 1 && marker.startsWith('0')
                      ? 'decimal-leading-zero'
                      : 'decimal'
                    : marker && LOWER_ROMAN_PATTERN.test(marker)
                      ? 'lower-roman'
                      : marker && LOWER_ALPHA_PATTERN.test(marker)
                        ? 'lower-alpha'
                        : marker && UPPER_ROMAN_PATTERN.test(marker)
                          ? 'upper-roman'
                          : marker && UPPER_ALPHA_PATTERN.test(marker)
                            ? 'upper-alpha'
                            : 'disc');
                const sequenceKey = `${identity?.[1] ?? 'list'}:${identity?.[2] ?? ''}:${indent}`;
                const previousStyle = orderedStyleBySequence.get(sequenceKey);

                if (
                  previousStyle === 'lower-alpha' &&
                  listStyle === 'lower-roman'
                ) {
                  listStyle = 'lower-alpha';
                } else if (
                  previousStyle === 'upper-alpha' &&
                  listStyle === 'upper-roman'
                ) {
                  listStyle = 'upper-alpha';
                }
                if (listStyle !== 'disc') {
                  orderedStyleBySequence.set(sequenceKey, listStyle);
                }
                listItem.dataset.listType =
                  listStyle === 'disc' ? 'bulleted' : 'numbered';
                if (listStyle !== 'disc' && listStyle !== 'decimal') {
                  listItem.dataset.listStyle = listStyle;
                }
                for (const activeIndent of activeSequenceByIndent.keys()) {
                  if (activeIndent > indent) {
                    activeSequenceByIndent.delete(activeIndent);
                  }
                }
                if (listStyle !== 'disc') {
                  const ordinal = parseListOrdinal(markerText, listStyle);
                  const activeSequence = activeSequenceByIndent.get(indent);
                  const activeStyle = activeSequence
                    ? orderedStyleBySequence.get(activeSequence)
                    : undefined;
                  const activeOrdinal = activeSequence
                    ? lastOrdinalBySequence.get(activeSequence)
                    : undefined;
                  const expectedOrdinal =
                    activeStyle === listStyle && activeOrdinal !== undefined
                      ? activeOrdinal + 1
                      : 1;
                  const needsBoundary =
                    ordinal !== undefined &&
                    (ordinal !== expectedOrdinal ||
                      (activeSequence !== undefined &&
                        activeSequence !== sequenceKey));

                  if (needsBoundary) {
                    listItem.dataset.listRestart = String(ordinal);
                  }
                  if (ordinal !== undefined) {
                    lastOrdinalBySequence.set(sequenceKey, ordinal);
                  }
                  activeSequenceByIndent.set(indent, sequenceKey);
                } else {
                  activeSequenceByIndent.delete(indent);
                }
                listItem.innerHTML = clonedElement.innerHTML;
                element.replaceWith(listItem);
                previousListElement = listItem;

                return;
              }

              activeSequenceByIndent.clear();
              previousListElement = undefined;
              const indent = getIndent(htmlElement, 'marginLeft');
              const textIndent = getIndent(htmlElement, 'textIndent');

              if (indent) htmlElement.dataset.indent = String(indent);
              if (textIndent)
                htmlElement.dataset.textIndent = String(textIndent);
            });

          const cleanedDocument = new DOMParser().parseFromString(
            cleanWordHtml(body.innerHTML, rtf),
            'text/html'
          );

          cleanedDocument.body.querySelectorAll('img').forEach((element) => {
            element.remove();
          });

          return cleanedDocument.body.outerHTML;
        },
        transformFragment: ({ fragment, source }) => {
          const document = new DOMParser().parseFromString(
            source.getData('text/html'),
            'text/html'
          );

          if (!isWordHtml(document.body)) return fragment;

          const cleanNode = (node: Descendant): Descendant => {
            if (!ElementApi.isElement(node)) return node;

            const children = node.children.map(cleanNode);

            if (tableType && node.type === tableType) {
              const { columnWidths: _columnWidths, ...table } = node;

              return { ...table, children };
            }

            if (!tableCellType || node.type !== tableCellType) {
              return { ...node, children };
            }

            const { borders: _borders, size: _size, ...cell } = node;

            return { ...cell, children };
          };

          return fragment.map(cleanNode);
        },
      },
    });
  },
});
