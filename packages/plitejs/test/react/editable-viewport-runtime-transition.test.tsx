import { render } from '@testing-library/react';

import { createEditor, EditorRoot } from '../../src/react';
import {
  EditableDOMRoot,
  type EditableViewportRuntime,
} from '../../src/react/components/editable';
import type { PliteBrowserHandleElement } from '../../src/react/editable/browser-handle';

test.each(['replace', 'add', 'remove'] as const)(
  'uses the committed scroll target after a viewport runtime %s',
  (transition) => {
    const editor = createEditor({
      initialValue: [{ type: 'paragraph', children: [{ text: 'Document' }] }],
    });
    const previousScroll = vi.fn(() => true);
    const nextScroll = vi.fn(() => true);
    const previous: EditableViewportRuntime = {
      mountedTopLevelNodeKeys: null,
      scrollToPath: previousScroll,
      type: 'virtualized',
    };
    const next: EditableViewportRuntime = {
      mountedTopLevelNodeKeys: null,
      scrollToPath: nextScroll,
      type: 'virtualized',
    };
    const tree = (viewportRuntime: EditableViewportRuntime | null) => (
      <EditorRoot editor={editor}>
        <EditableDOMRoot
          aria-label="Document"
          viewportRuntime={viewportRuntime}
        />
      </EditorRoot>
    );
    const mounted = render(tree(transition === 'add' ? null : previous));
    const textbox = mounted.getByRole('textbox', {
      name: 'Document',
    }) as PliteBrowserHandleElement;

    try {
      mounted.rerender(tree(transition === 'remove' ? null : next));
      previousScroll.mockClear();
      nextScroll.mockClear();

      expect(
        textbox.__pliteBrowserHandle?.scrollPathIntoView([0], 'start')
      ).toBe(transition !== 'remove');
      expect(previousScroll).not.toHaveBeenCalled();
      if (transition !== 'remove') {
        expect(nextScroll).toHaveBeenCalledWith([0], 'start');
      }
    } finally {
      mounted.unmount();
    }
  }
);
