'use client';

import React from 'react';

import type { PlateElementProps } from '@udecode/plate-common/react';

import { cn } from '@udecode/cn';
import { Plate } from '@udecode/plate-common/react';
import { TabbablePlugin } from '@udecode/plate-tabbable/react';
import { useFocused, useSelected } from 'slate-react';

import { editorPlugins } from '@/registry/default/components/editor/plugins/editor-plugins';
import { useCreateEditor } from '@/registry/default/components/editor/use-create-editor';
import { tabbableValue } from '@/registry/default/example/values/tabbable-value';
import { Editor, EditorContainer } from '@/registry/default/plate-ui/editor';
import { PlateElement } from '@/registry/default/plate-ui/plate-element';

export default function TabbableDemo() {
  const editor = useCreateEditor({
    plugins: [
      ...editorPlugins,
      TabbablePlugin.configure({
        node: { component: TabbableElement, isElement: true, isVoid: true },
      }),
    ],
    value: tabbableValue,
  });

  return (
    <Plate editor={editor}>
      <EditorContainer variant="demo">
        <Editor />
      </EditorContainer>
    </Plate>
  );
}

export function TabbableElement({ children, ...props }: PlateElementProps) {
  const selected = useSelected();
  const focused = useFocused();

  return (
    <PlateElement {...props}>
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
    </PlateElement>
  );
}
