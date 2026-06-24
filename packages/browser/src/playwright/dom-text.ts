import type { Locator } from '@playwright/test';
import { toPlainText } from './clipboard';
import { PLITE_BROWSER_HANDLE_KEY } from './constants';
import type { SurfaceTarget } from './surface';
import type { HtmlNormalizationOptions } from './types';

export const getBlockTexts = async (root: Locator): Promise<string[]> =>
  root.evaluate((element: HTMLElement) =>
    Array.from(
      element.querySelectorAll(':scope > [data-plite-node="element"]')
    ).map((block) => (block.textContent ?? '').replace(/\uFEFF/g, ''))
  );

export const includesPasteText = (candidate: string, text: string) => {
  const normalizeSpaced = (value: string) =>
    value
      .replace(/\uFEFF/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const normalizeCompact = (value: string) =>
    value.replace(/\uFEFF/g, '').replace(/\s+/g, '');

  return (
    normalizeSpaced(candidate).includes(normalizeSpaced(text)) ||
    normalizeCompact(candidate).includes(normalizeCompact(text))
  );
};

export const getSelectedText = async (root: Locator): Promise<string> =>
  root.evaluate((element: HTMLElement) => {
    const rootNode = element.getRootNode() as Document | ShadowRoot;
    const selection =
      'getSelection' in rootNode
        ? rootNode.getSelection()
        : element.ownerDocument.getSelection();

    return (selection?.toString() ?? '').replace(/\uFEFF/g, '');
  });

export const insertTextThroughHandle = async (root: Locator, text: string) =>
  root.evaluate(
    (
      element: HTMLElement,
      { key, nextText }: { key: string; nextText: string }
    ) => {
      const handle = (element as Record<string, any>)[key];

      if (!handle?.insertText) {
        throw new Error('This editor surface does not expose insertText');
      }

      handle.insertText(nextText);
    },
    { key: PLITE_BROWSER_HANDLE_KEY, nextText: text }
  );

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

      for (const element of Array.from(container.querySelectorAll('*'))) {
        if (options.ignoreClasses) {
          element.removeAttribute('class');
        }
        if (options.ignoreInlineStyles) {
          element.removeAttribute('style');
        }
        if (options.ignoreDir) {
          element.removeAttribute('dir');
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
