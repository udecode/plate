import { act, render } from '@testing-library/react';
import React from 'react';

import { defineExtension, defineExtensionSlot } from '../../src';
import {
  createEditor,
  Editable,
  Plite,
  useEditorContext,
} from '../../src/react';

test('binds extension APIs to each mounted editor and its own DOM root', () => {
  const owner = defineExtension('owner', {
    api: ({ editor }) => ({ editor: () => editor }),
  });
  const slot = defineExtensionSlot('owner-slot');
  const editor = createEditor({
    extensions: [slot.of(owner)],
    initialValue: [{ type: 'paragraph', children: [{ text: 'one' }] }],
  });
  const views: Array<ReturnType<typeof useEditorContext>> = [];
  function Capture({
    index,
    children,
  }: {
    index: number;
    children: React.ReactNode;
  }) {
    const view = useEditorContext();
    React.useLayoutEffect(() => {
      views[index] = view;
    }, [index, view]);
    return <>{children}</>;
  }
  function View({ index }: { index: number }) {
    return (
      <Editable
        domStrategy="full"
        aria-label={`view-${index}`}
        renderElement={({ attributes, children }) => (
          <div {...attributes}>
            <Capture index={index}>{children}</Capture>
          </div>
        )}
      />
    );
  }
  const rendered = render(
    <Plite editor={editor}>
      <Plite>
        <View index={0} />
      </Plite>
      <Plite>
        <View index={1} />
      </Plite>
    </Plite>
  );

  expect(views[0]).not.toBe(views[1]);
  expect(editor.extension(owner).api.editor()).toBe(editor);
  for (const [index, view] of views.entries()) {
    const capability = view.extension(owner).api;
    expect(capability.editor()).toBe(view);
    expect(Reflect.get(view.api, owner.name)).toBe(capability);
    expect(view.api.dom.root()).toBe(
      rendered.getByRole('textbox', { name: `view-${index}` })
    );
    expect(capability.editor().api).toBe(view.api);
    expect(view.extension(owner).api).toBe(capability);
  }
  const portals = views.map((view) => view.extension(owner));
  const replacement = defineExtension('owner', {
    api: ({ editor: view }) => ({
      editor: () => view,
      label: () => 'replacement',
    }),
  });
  act(() => editor.update.extensions.reconfigure(slot, replacement));
  for (const [index, view] of views.entries()) {
    expect(() => portals[index].api).toThrow('no longer installed');
    expect(view.extension(replacement).api.label()).toBe('replacement');
    expect(view.extension(replacement).api.editor()).toBe(view);
  }
  rendered.unmount();
  for (const view of views) {
    expect(view.api.dom.root()).toBeNull();
  }
});
