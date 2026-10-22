import { afterEach, expect, it, mock, spyOn } from 'bun:test';

import {
  act,
  fireEvent,
  render,
  waitFor,
  within,
} from '@testing-library/react';
import {
  createEditor,
  NavigationFeedbackPlugin,
  EditorRoot,
  EditorContent,
  useEditor,
} from 'platejs/react';
import * as React from 'react';

import { DOMEditor } from '../../../../../../packages/platejs/src/dom/plite-dom.internal';
import { FootnoteKit } from './footnote';

afterEach(() => mock.restore());

const setupNavigation = ({
  citations = 1,
  readOnly = true,
  unresolved = false,
  twoViews = false,
  duplicate = false,
} = {}) => {
  const editor = createEditor({
    plugins: FootnoteKit,
    initialValue: [
      ...Array.from({ length: citations }, (_, index) => ({
        type: 'paragraph',
        children: [
          { text: `Citation ${index + 1} ` },
          { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
          { text: '.' },
        ],
      })),
      ...Array.from({ length: unresolved ? 0 : duplicate ? 2 : 1 }, () => ({
        type: 'footnoteDefinition',
        ref: '1',
        children: [{ type: 'paragraph', children: [{ text: 'Definition' }] }],
      })),
    ],
  });
  const views: Array<ReturnType<typeof useEditor>> = [];
  function Capture({ index, viewing }: { index: number; viewing: boolean }) {
    const view = useEditor();
    React.useLayoutEffect(() => {
      views[index] = view;
    }, [index, view]);
    return <EditorContent readOnly={viewing} />;
  }
  const rendered = render(
    <>
      {twoViews && (
        <EditorRoot editor={editor}>
          <Capture index={0} viewing={false} />
        </EditorRoot>
      )}
      <EditorRoot editor={editor} readOnly={readOnly}>
        <Capture index={1} viewing={readOnly} />
      </EditorRoot>
    </>
  );
  const roots = rendered.container.querySelectorAll<HTMLElement>(
    '[data-editor="true"]'
  );
  const root = roots.item(twoViews ? 1 : 0);
  const scroll = spyOn(DOMEditor, 'scrollIntoView').mockReturnValue(() => {});
  return { editor, rendered, root, roots, scroll, views };
};

const click = (element: HTMLElement, modifiers = {}) => {
  fireEvent.mouseDown(element, modifiers);
  fireEvent.mouseUp(element, modifiers);
  fireEvent.click(element, modifiers);
};

it.each(['chip', 'back link', 'picker item'])(
  'jumps exactly once for a full read-only %s click',
  async (control) => {
    const { rendered, root, scroll, views } = setupNavigation({
      citations: control === 'picker item' ? 2 : 1,
    });
    const chip = within(root).getAllByRole('button', { name: '[1]' })[0];
    const back = within(root).getByRole('button', {
      name: 'Back to reference 1',
    });
    if (control === 'picker item') {
      click(back);
      expect(scroll).not.toHaveBeenCalled();
      const option = await rendered.findByRole('option', {
        name: '2 Citation 2 .',
      });
      const dialog = rendered.getByRole('dialog');
      await waitFor(() =>
        expect(dialog.contains(document.activeElement)).toBe(true)
      );
      click(option);
      await waitFor(() => expect(rendered.queryByRole('dialog')).toBeNull());
    } else {
      click(control === 'chip' ? chip : back);
    }
    expect(scroll).toHaveBeenCalledTimes(1);
    expect(scroll.mock.calls[0]).toEqual([
      views[1],
      {
        offset: 0,
        path:
          control === 'chip'
            ? [1, 0, 0]
            : [control === 'picker item' ? 1 : 0, 2],
      },
      undefined,
    ]);
    expect(document.activeElement).toBe(
      control === 'chip'
        ? back
        : within(root).getAllByRole('button', { name: '[1]' })[
            control === 'picker item' ? 1 : 0
          ]
    );
    rendered.unmount();
  }
);

it('focuses read-only jump controls in the calling view and keeps the editable caret', () => {
  const { rendered, root, roots, views, scroll } = setupNavigation({
    twoViews: true,
  });
  act(() =>
    views[0].update((tx) => tx.selection.set({ offset: 2, path: [0, 0] }))
  );
  act(() => views[0].api.dom.focus());
  const before = views[0].read.selection();
  const target = within(root).getByRole('button', {
    name: 'Back to reference 1',
  });
  // Another spec's userEvent.setup() can leave focus as a prototype getter,
  // which spyOn rejects.
  const focus = mock(target.focus.bind(target));
  Object.defineProperty(target, 'focus', { configurable: true, value: focus });
  click(within(root).getByRole('button', { name: '[1]' }));
  expect(scroll).toHaveBeenCalledTimes(1);
  expect(document.activeElement).toBe(target);
  expect(focus).toHaveBeenCalledWith({ preventScroll: true });
  expect(views[0].read.selection()).toEqual(before);
  expect(roots[0].querySelector('[data-nav-target]')).toBeNull();
  expect(root.querySelector('[data-nav-target]')?.textContent).toContain(
    'Definition'
  );
  rendered.unmount();
});

it('ignores an unresolved read-only chip and hides creation and renumbering', () => {
  const { editor, rendered, root, scroll } = setupNavigation({
    unresolved: true,
  });
  const before = editor.read.children();
  const chip = within(root).getByRole('button', { name: '[1]' });
  expect(() => {
    click(chip);
    click(chip, { ctrlKey: true });
    click(chip, { metaKey: true });
  }).not.toThrow();
  fireEvent.pointerEnter(chip, { pointerType: 'mouse' });
  fireEvent.mouseEnter(chip);
  expect(
    rendered.queryByRole('button', { name: /Create definition/ })
  ).toBeNull();
  expect(scroll).not.toHaveBeenCalled();
  expect(editor.read.children()).toEqual(before);
  rendered.unmount();

  const duplicate = setupNavigation({ duplicate: true });
  expect(
    duplicate.rendered.queryByRole('button', { name: /Renumber/ })
  ).toBeNull();
  duplicate.rendered.unmount();
});

it('keeps an editable plain chip click inert', () => {
  const { editor, rendered, root, scroll } = setupNavigation({
    readOnly: false,
  });
  const before = editor.read.selection();
  click(within(root).getByRole('button', { name: '[1]' }));
  expect(scroll).not.toHaveBeenCalled();
  expect(editor.read.selection()).toEqual(before);
  rendered.unmount();
});

it('refreshes the hover preview when the definition text changes while open', async () => {
  const { editor, rendered, root } = setupNavigation({ readOnly: false });
  const chip = within(root).getByRole('button', { name: '[1]' });
  const preview = () =>
    document.querySelector('[data-slot="hover-card-content"]')?.textContent;

  fireEvent.pointerEnter(chip, { pointerType: 'mouse' });
  await waitFor(() => expect(preview()).toBe('Definition'), { timeout: 2000 });

  act(() => {
    editor.update.text.insert(' revised', {
      at: { offset: 10, path: [1, 0, 0] },
    });
  });

  await waitFor(() => expect(preview()).toBe('Definition revised'));
  rendered.unmount();
});

it('projects navigation feedback onto copied footnote references and definitions', async () => {
  const editor = createEditor({
    plugins: FootnoteKit,
    initialValue: [
      {
        type: 'paragraph',
        children: [
          { text: 'Reference ' },
          { type: 'footnoteReference', ref: '1', children: [{ text: '' }] },
          { text: '.' },
        ],
      },
      {
        type: 'footnoteDefinition',
        ref: '1',
        children: [
          { type: 'paragraph', children: [{ text: 'Definition body' }] },
        ],
      },
    ],
  });
  let mounted: ReturnType<typeof useEditor> | undefined;
  function Capture() {
    mounted = useEditor();
    return <EditorContent />;
  }
  const view = render(
    <EditorRoot editor={editor}>
      <Capture />
    </EditorRoot>
  );
  for (const path of [[0, 1], [1]]) {
    const key = editor.key(path);
    if (!key || !mounted) throw new Error('Missing mounted fixture');
    act(() => {
      mounted?.plugin(NavigationFeedbackPlugin).api.flashTarget({ key });
    });
    await waitFor(() => {
      const target = view.container.querySelector('[data-nav-target="true"]');
      expect(target?.getAttribute('data-nav-pulse')).not.toBeNull();
      expect(target?.textContent).toContain(
        path.length === 2 ? '[1]' : 'Definition body'
      );
      expect(
        view.container.querySelectorAll('[data-nav-target="true"]').length
      ).toBe(1);
    });
    act(() => {
      mounted?.plugin(NavigationFeedbackPlugin).api.clear();
    });
    await waitFor(() =>
      expect(
        view.container.querySelector('[data-nav-target="true"]')
      ).toBeNull()
    );
  }
  view.unmount();
});
