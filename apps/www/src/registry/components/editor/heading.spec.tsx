import { expect, it } from 'bun:test';

import { act, render } from '@testing-library/react';
import {
  createEditor,
  HeadingPlugin,
  NavigationFeedbackPlugin,
  Plate,
  PlateContent,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { HeadingElement } from './heading';

it('preserves caller-supplied navigation attributes on the mounted heading', () => {
  const editor = createEditor({
    navigationFeedback: { duration: 100_000 },
    plugins: [HeadingPlugin.configure({ component: HeadingElement })],
    initialValue: [
      { children: [{ text: 'Heading' }], level: 2, type: 'heading' },
    ],
  });
  let mounted!: ReturnType<typeof useEditor>;
  function Capture() {
    const view = useEditor();
    React.useLayoutEffect(() => {
      mounted = view;
    }, [view]);
    return <PlateContent />;
  }
  const view = render(
    <Plate editor={editor}>
      <Capture />
    </Plate>
  );

  try {
    const heading = view.getByRole('heading', { name: 'Heading', level: 2 });
    const before = heading.className;
    act(() => {
      expect(
        mounted.plugin(NavigationFeedbackPlugin).api.flashTarget({
          key: editor.key([0])!,
          attributes: { className: 'rounded-md bg-(--color-highlight)' },
        })
      ).toBe(true);
    });
    expect(heading.getAttribute('data-nav-target')).toBe('true');
    expect(heading.classList.contains('bg-(--color-highlight)')).toBe(true);
    expect(heading.classList.contains('font-heading')).toBe(true);
    act(() => {
      mounted.plugin(NavigationFeedbackPlugin).api.clear();
    });
    expect(heading.getAttribute('data-nav-target')).toBeNull();
    expect(heading.className).toBe(before);
  } finally {
    view.unmount();
  }
});
