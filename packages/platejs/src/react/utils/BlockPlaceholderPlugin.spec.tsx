import { act, render, waitFor } from '@testing-library/react';
import React from 'react';

import { BaseParagraphPlugin } from '../../lib/plugins/paragraph/BaseParagraphPlugin';
import { Plate, PlateContent, PlateElement } from '../components';
import type { PlateElementProps } from '../components/plate-nodes';
import { createEditor } from '../editor';
import { useEditor } from '../stores';
import { BlockPlaceholderPlugin } from './BlockPlaceholderPlugin';

function ParagraphElement(
  props: PlateElementProps<typeof BaseParagraphPlugin>
) {
  return <PlateElement {...props} as="section" />;
}

describe('BlockPlaceholderPlugin', () => {
  test.each([
    ['default', undefined, 'DIV'],
    ['intrinsic', 'p', 'P'],
    ['custom', ParagraphElement, 'SECTION'],
  ] as const)(
    'publishes view-local attributes through the %s element host',
    async (_name, component, expectedTag) => {
      const paragraphPlugin = component
        ? BaseParagraphPlugin.configure({ component })
        : BaseParagraphPlugin;
      const editor = createEditor({
        initialValue: [
          { children: [{ text: 'one' }], type: 'paragraph' },
          { children: [{ text: '' }], type: 'paragraph' },
        ],
        plugins: [
          paragraphPlugin,
          BlockPlaceholderPlugin.configure({
            initialState: {
              className: 'block-placeholder',
              placeholders: { paragraph: 'Type here' },
            },
          }),
        ],
        selection: {
          anchor: { offset: 0, path: [1, 0] },
          focus: { offset: 0, path: [1, 0] },
          kind: 'text',
        },
      });
      let commandEditor: ReturnType<typeof useEditor> | undefined;
      function CommandProbe() {
        commandEditor = useEditor();
        return null;
      }
      const mounted = render(
        <React.StrictMode>
          <Plate editor={editor}>
            <PlateContent />
            <CommandProbe />
          </Plate>
        </React.StrictMode>
      );
      const target = mounted.container.querySelectorAll<HTMLElement>(
        '[data-plite-node="element"]'
      )[1];

      await act(async () => {
        commandEditor!.api.dom.focus();
      });

      await waitFor(() => {
        expect(target.getAttribute('placeholder')).toBe('Type here');
        expect(target).toHaveClass('block-placeholder');
      });
      expect(target.tagName).toBe(expectedTag);

      await act(async () => {
        commandEditor!.api.dom.blur();
      });

      await waitFor(() => {
        expect(target.hasAttribute('placeholder')).toBe(false);
        expect(target).not.toHaveClass('block-placeholder');
      });
    }
  );
});
