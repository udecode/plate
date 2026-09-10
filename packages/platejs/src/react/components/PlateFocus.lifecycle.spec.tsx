import { act, render } from '@testing-library/react';
import React from 'react';

import { createEditor } from '../editor';
import { useFocusedLast } from '../stores/plate-controller/useFocusedLast';
import { Plate } from './Plate';
import { PlateContent } from './PlateContent';

function Fixture({
  editor,
  name,
  visible = true,
}: {
  editor: ReturnType<typeof createEditor>;
  name: string;
  visible?: boolean;
}) {
  return (
    <Plate editor={editor} suppressInstanceWarning>
      {visible && <PlateContent aria-label={name} />}
      <LastFocus name={name} />
    </Plate>
  );
}
function LastFocus({ name }: { name: string }) {
  return <output data-testid={name}>{String(useFocusedLast())}</output>;
}
const focus = (element: HTMLElement) =>
  act(() => {
    element.focus();
  });

test('focus handoff survives toolbar input blur without confusing equal IDs', () => {
  const a = createEditor({ id: 'same' });
  const b = createEditor({ id: 'same' });
  const view = render(
    <>
      <Fixture editor={a} name="a" />
      <Fixture editor={b} name="b" />
      <input aria-label="toolbar" />
    </>
  );
  focus(view.getByRole('textbox', { name: 'a' }));
  expect(view.getByTestId('a').textContent).toBe('true');
  expect(view.getByTestId('b').textContent).toBe('false');
  focus(view.getByRole('textbox', { name: 'toolbar' }));
  expect(view.getByTestId('a').textContent).toBe('true');
  focus(view.getByRole('textbox', { name: 'b' }));
  expect(view.getByTestId('a').textContent).toBe('false');
  expect(view.getByTestId('b').textContent).toBe('true');
});

test('each owner document remembers its own last editor', () => {
  const frame = document.createElement('iframe');
  document.body.append(frame);
  Object.defineProperty(frame.contentWindow, 'SyntaxError', {
    value: SyntaxError,
    configurable: true,
  });
  const container = frame.contentDocument!.createElement('div');
  frame.contentDocument!.body.append(container);
  const a = render(
    <Fixture editor={createEditor({ id: 'outer' })} name="outer" />
  );
  const b = render(
    <Fixture editor={createEditor({ id: 'inner' })} name="inner" />,
    { container, baseElement: container }
  );
  focus(a.getByRole('textbox', { name: 'outer' }));
  focus(b.getByRole('textbox', { name: 'inner' }));
  expect(a.getByTestId('outer').textContent).toBe('true');
  expect(b.getByTestId('inner').textContent).toBe('true');
  b.unmount();
  frame.remove();
});

test('a disposed view cannot leave stale focus on its replacement', () => {
  const editor = createEditor();
  const view = render(<Fixture editor={editor} name="editor" />);
  focus(view.getByRole('textbox', { name: 'editor' }));
  expect(view.getByTestId('editor').textContent).toBe('true');
  view.rerender(<Fixture editor={editor} name="editor" visible={false} />);
  view.rerender(<Fixture editor={editor} name="editor" />);
  expect(view.getByTestId('editor').textContent).toBe('false');
  focus(view.getByRole('textbox', { name: 'editor' }));
  expect(view.getByTestId('editor').textContent).toBe('true');
});
