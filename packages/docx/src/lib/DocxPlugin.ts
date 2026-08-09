import { defineBasePlugin } from '@platejs/core';
import { type Descendant, ElementApi } from '@platejs/plite';
import {
  removeHtmlNodesBetweenComments,
  traverseHtmlElements,
} from '@platejs/core/internal';
import { PLUGINS } from '@platejs/utils';

import { cleanDocx, isDocxContent } from './cleanDocx';

const DECIMAL_PATTERN = /^\d+[.\\]/;
const LEVEL_PATTERN = /level(\d+)/i;
const LOWER_ALPHA_PATTERN = /^[a-z]+\./;
const LOWER_ROMAN_PATTERN = /^[cdilmvx]+\./;
const MSO_LIST_PATTERN = /mso-list:\s*l/i;
const NON_NUMERIC_PATTERN = /[^\d,.]+/;
const UPPER_ALPHA_PATTERN = /^[A-Z]+\./;
const UPPER_ROMAN_PATTERN = /^[CDILMVX]+\./;

export const DocxPlugin = defineBasePlugin(PLUGINS.docx, {
  editOnly: true,
  codecs: ({ defineCodecs, editor }) => {
    const tableCell = editor.plugin(PLUGINS.tableCell);
    const tableCellType = tableCell.installed
      ? tableCell.schema.type
      : undefined;

    return defineCodecs({
      'text/html': {
        transformData: ({ data, source }) => {
          const document = new DOMParser().parseFromString(data, 'text/html');
          const { body } = document;
          const rtf = source.getData('text/rtf');

          if (!isDocxContent(body)) return cleanDocx(data, rtf);

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

          body
            .querySelectorAll('p, h1, h2, h3, h4, h5, h6')
            .forEach((element) => {
              const htmlElement = element as HTMLElement;
              const style = element.getAttribute('style') ?? '';

              if (
                MSO_LIST_PATTERN.test(style) &&
                (element.querySelector('[style="mso-list:Ignore"]') ||
                  element.outerHTML.includes('<!--[if !supportLists]-->'))
              ) {
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
                  if (child.getAttribute('style') === 'mso-list:Ignore') {
                    child.remove();
                  }

                  return true;
                });

                const level = LEVEL_PATTERN.exec(style)?.[1];
                const visualIndent = getIndent(htmlElement, 'marginLeft');

                listItem.dataset.indent = String(
                  level
                    ? Math.max(Number.parseInt(level, 10), visualIndent)
                    : Math.max(1, visualIndent)
                );

                const text = element.textContent?.trimStart() ?? '';

                listItem.dataset.listStyleType = DECIMAL_PATTERN.test(text)
                  ? text.startsWith('0')
                    ? 'decimal-leading-zero'
                    : 'decimal'
                  : LOWER_ROMAN_PATTERN.test(text)
                    ? 'lower-roman'
                    : LOWER_ALPHA_PATTERN.test(text)
                      ? 'lower-alpha'
                      : UPPER_ROMAN_PATTERN.test(text)
                        ? 'upper-roman'
                        : UPPER_ALPHA_PATTERN.test(text)
                          ? 'upper-alpha'
                          : 'disc';
                listItem.innerHTML = clonedElement.innerHTML;
                element.replaceWith(listItem);

                return;
              }

              const indent = getIndent(htmlElement, 'marginLeft');
              const textIndent = getIndent(htmlElement, 'textIndent');

              if (indent) htmlElement.dataset.indent = String(indent);
              if (textIndent)
                htmlElement.dataset.textIndent = String(textIndent);
            });

          const cleanedDocument = new DOMParser().parseFromString(
            cleanDocx(body.innerHTML, rtf),
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

          if (!isDocxContent(document.body)) return fragment;

          const cleanNode = (node: Descendant): Descendant => {
            if (!ElementApi.isElement(node)) return node;

            const children = node.children.map(cleanNode);

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
