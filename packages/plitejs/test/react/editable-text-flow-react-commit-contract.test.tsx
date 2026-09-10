import { act, render } from '@testing-library/react';
import { useSyncExternalStore } from 'react';

import {
  createEditor,
  Editable,
  Plite,
  type RenderElementProps,
} from '../../src/react';
import { findMountedEditableDOMRuntime } from '../../src/react/editable/editable-dom-runtime';

test('a descendant wrapper change preserves its remounted editable text', async () => {
  const listeners = new Set<() => void>();
  let wrapped = false;
  const subscribe = (listener: () => void) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };
  const getSnapshot = () => wrapped;
  const NestedElement = ({ attributes, children }: RenderElementProps) => {
    const hasWrapper = useSyncExternalStore(
      subscribe,
      getSnapshot,
      getSnapshot
    );

    return (
      <div {...attributes}>
        {hasWrapper ? <section>{children}</section> : children}
      </div>
    );
  };
  const editor = createEditor({
    initialValue: [
      { type: 'paragraph', children: [{ text: 'Preserve this text' }] },
    ],
  });
  const mounted = render(
    <Plite editor={editor}>
      <Editable renderElement={(props) => <NestedElement {...props} />} />
    </Plite>
  );
  const root = mounted.container.querySelector<HTMLElement>(
    '[data-plite-editor]'
  )!;
  const runtime = findMountedEditableDOMRuntime(root)!;

  expect(root.textContent).toBe('Preserve this text');

  await act(async () => {
    wrapped = true;
    listeners.forEach((listener) => listener());
  });
  runtime.domPhaseScheduler.flush();

  expect(root.querySelector('section')?.textContent).toBe('Preserve this text');
  expect(editor.read((state) => state.text.string([0]))).toBe(
    'Preserve this text'
  );

  root.querySelector('section')!.setAttribute('data-plite-path', 'external');
  await act(async () => {
    await new Promise((resolve) => {
      setTimeout(resolve, 0);
    });
  });
  runtime.domPhaseScheduler.flush();

  expect(root.querySelector('section')).not.toHaveAttribute('data-plite-path');
  expect(root.textContent).toBe('Preserve this text');
  mounted.unmount();
});
