import { act, render } from '@testing-library/react';
import React from 'react';

import { definePlugin, definePluginSlot } from '../../src';
import {
  createEditor,
  Editable,
  EditorRoot,
  useEditorContext,
} from '../../src/react';

test('binds plugin APIs to each mounted editor and its own DOM root', () => {
  const owner = definePlugin('owner', {
    api: ({ editor }) => ({ editor: () => editor }),
  });
  const slot = definePluginSlot('owner-slot');
  const editor = createEditor({
    plugins: [slot.of(owner)],
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
    <EditorRoot editor={editor}>
      <EditorRoot editor={editor}>
        <View index={0} />
      </EditorRoot>
      <EditorRoot editor={editor}>
        <View index={1} />
      </EditorRoot>
    </EditorRoot>
  );

  expect(views[0]).not.toBe(views[1]);
  expect(editor.plugin(owner).api.editor()).toBe(editor);
  for (const [index, view] of views.entries()) {
    const capability = view.plugin(owner).api;
    expect(capability.editor()).toBe(view);
    expect(Reflect.get(view.api, owner.name)).toBe(capability);
    expect(view.api.dom.root()).toBe(
      rendered.getByRole('textbox', { name: `view-${index}` })
    );
    expect(capability.editor().api).toBe(view.api);
    expect(view.plugin(owner).api).toBe(capability);
  }
  const portals = views.map((view) => view.plugin(owner));
  const replacement = definePlugin('owner', {
    api: ({ editor: view }) => ({
      editor: () => view,
      label: () => 'replacement',
    }),
  });
  act(() => editor.update.plugins.reconfigure(slot, replacement));
  for (const [index, view] of views.entries()) {
    expect(() => portals[index].api).toThrow('no longer installed');
    expect(view.plugin(replacement).api.label()).toBe('replacement');
    expect(view.plugin(replacement).api.editor()).toBe(view);
  }
  rendered.unmount();
  for (const view of views) {
    expect(view.api.dom.root()).toBeNull();
  }
});
