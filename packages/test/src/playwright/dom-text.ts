import type { Locator } from '@playwright/test';

import { toPlainText } from './clipboard';
import type { SurfaceTarget } from './surface';
import type { HtmlNormalizationOptions } from './types';

export const getBlockTexts = async (root: Locator): Promise<string[]> =>
  root.evaluate((element: HTMLElement) =>
    Array.from(
      element.querySelectorAll(':scope > [data-editor-node="element"]')
    ).map((block) => {
      const logicalBlock = block.cloneNode(true) as Element;

      logicalBlock
        .querySelectorAll('[data-editor-string][data-editor-length]')
        .forEach((string) => {
          const length = Number.parseInt(
            string.getAttribute('data-editor-length') ?? '',
            10
          );

          if (Number.isFinite(length)) {
            string.textContent = (string.textContent ?? '').slice(0, length);
          }
        });

      return (logicalBlock.textContent ?? '').replace(/\uFEFF/g, '');
    })
  );

export const getSelectedText = async (root: Locator): Promise<string> =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    return (selection?.toString() ?? '').replace(/\uFEFF/g, '');
  });

export const dropHtml = async (
  surface: SurfaceTarget,
  root: Locator,
  html: string,
  plainText?: string
) => {
  const text = plainText ?? (await toPlainText(surface, html));

  await root.evaluate(
    (element: HTMLElement, payload: { html: string; text: string }) => {
      const rect = element.getBoundingClientRect();
      const data = new DataTransfer();

      data.setData('text/html', payload.html);
      data.setData('text/plain', payload.text);

      const event = new DragEvent('drop', {
        bubbles: true,
        cancelable: true,
        clientX: rect.left + Math.max(1, Math.min(8, rect.width / 2)),
        clientY: rect.top + Math.max(1, Math.min(8, rect.height / 2)),
        dataTransfer: data,
      });

      element.dispatchEvent(event);
    },
    { html, text }
  );
};

export const normalizeHtml = async (
  root: Locator,
  markup: string,
  {
    ignoreClasses = false,
    ignoreInlineStyles = false,
    ignoreDir = false,
  }: HtmlNormalizationOptions = {}
): Promise<string> =>
  root.evaluate(
    (element: HTMLElement, { nextMarkup, options }) => {
      const container = element.ownerDocument.createElement('div');
      container.innerHTML = nextMarkup;

      for (const innerElement of Array.from(container.querySelectorAll('*'))) {
        if (options.ignoreClasses) {
          innerElement.removeAttribute('class');
        }
        if (options.ignoreInlineStyles) {
          innerElement.removeAttribute('style');
        }
        if (options.ignoreDir) {
          innerElement.removeAttribute('dir');
        }
      }

      return container.innerHTML;
    },
    {
      nextMarkup: markup,
      options: {
        ignoreClasses,
        ignoreInlineStyles,
        ignoreDir,
      },
    }
  );
