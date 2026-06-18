import { render } from '@testing-library/react';
import { createRef, useRef } from 'react';

import { RestoreDOM } from '../src/components/restore-dom/restore-dom';
import { EditorContext } from '../src/hooks/use-editor';
import { useMutationObserver } from '../src/hooks/use-mutation-observer';
import { createReactEditor } from '../src/plugin/with-react';

vi.mock('@platejs/slate-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@platejs/slate-dom')>();

  return {
    ...actual,
    IS_ANDROID: true,
  };
});

const observerOptions: MutationObserverInit = { childList: true };

test('useMutationObserver waits for an initially-null ref and observes once mounted', () => {
  const observe = vi.spyOn(MutationObserver.prototype, 'observe');
  const callback = vi.fn();

  const Harness = ({ showNode }: { showNode: boolean }) => {
    const node = useRef<HTMLDivElement | null>(null);

    useMutationObserver(node, callback, observerOptions);

    return showNode ? <div ref={node} /> : null;
  };

  const mounted = render(<Harness showNode={false} />);

  expect(observe).not.toHaveBeenCalled();

  mounted.rerender(<Harness showNode />);

  expect(observe).toHaveBeenCalledTimes(1);

  observe.mockRestore();
});

test('RestoreDOM waits for an initially-null ref and observes after update', () => {
  const editor = createReactEditor();
  const node = createRef<HTMLDivElement | null>();
  const observe = vi.spyOn(MutationObserver.prototype, 'observe');
  const receivedUserInput = { current: false };

  const renderTree = () => (
    <EditorContext.Provider value={editor}>
      <RestoreDOM node={node} receivedUserInput={receivedUserInput}>
        <span />
      </RestoreDOM>
    </EditorContext.Provider>
  );

  const mounted = render(renderTree());

  expect(observe).not.toHaveBeenCalled();

  node.current = document.createElement('div');
  mounted.rerender(renderTree());

  expect(observe).toHaveBeenCalledTimes(1);

  observe.mockRestore();
});
