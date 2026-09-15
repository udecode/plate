'use client';

import {
  type EditorElementProps,
  definePlugin,
  EditorRoot,
  EditorElement,
  useCreateEditor,
  useEditorFocused,
  useElementSelected,
} from 'platejs/react';

import { cn } from '@/lib/utils';
import { Editor, EditorContainer } from '@/registry/components/editor/editor';
import { EditorKit } from '@/registry/components/editor/plugins';
import { tabbableValue } from '@/registry/examples/values/tabbable-value';

const TabbableElementPlugin = definePlugin('tabbableElement', {
  schema: { element: { void: 'block' } },
});

export default function TabbableDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...EditorKit,
      TabbableElementPlugin.configure({ component: TabbableElement }),
    ],
    initialValue: tabbableValue,
  });

  return (
    <EditorRoot editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </EditorRoot>
  );
}

export function TabbableElement({
  children,
  ...props
}: EditorElementProps<typeof TabbableElementPlugin>) {
  const selected = useElementSelected();
  const focused = useEditorFocused();

  return (
    <EditorElement {...props}>
      <div
        className={cn(
          'mb-2 p-2',
          selected && focused
            ? 'border-2 border-blue-500'
            : 'border border-gray-200'
        )}
        contentEditable={false}
      >
        <p>This is a void element.</p>
        <button type="button">Button 1</button>{' '}
        <button type="button">Button 2</button>
      </div>
      {children}
    </EditorElement>
  );
}
