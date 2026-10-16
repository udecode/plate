'use client';

import { AudioPlugin } from 'platejs/media/react';
import {
  type EditorElementProps,
  EditorElement,
  useEditor,
  useEditorFocused,
  useEditorReadOnly,
  useElementSelected,
} from 'platejs/react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Caption } from './caption';
import { MediaToolbar } from './media-toolbar';

export function AudioElement(props: EditorElementProps<typeof AudioPlugin>) {
  const editor = useEditor();
  const focused = useEditorFocused();
  const readOnly = useEditorReadOnly();
  const selected = useElementSelected({ mode: 'object' });
  const textAlign =
    'textAlign' in props.element &&
    (props.element.textAlign === 'left' ||
      props.element.textAlign === 'right' ||
      props.element.textAlign === 'center')
      ? props.element.textAlign
      : 'center';

  return (
    <MediaToolbar
      onPreview={() => {
        window.open(props.element.url, '_blank', 'noopener,noreferrer');
      }}
      plugin={AudioPlugin}
      selected={selected}
      placement="top"
    >
      <EditorElement {...props}>
        <figure className="group relative cursor-default [&>figcaption]:min-h-20">
          <div className="py-1" contentEditable={false}>
            <div
              className={cn(
                'rounded-full',
                focused && selected && 'ring-2 ring-ring ring-offset-2'
              )}
            >
              {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- [P0 behavior-boundary] User media has no caption-track field; an empty fabricated track would falsely claim accessibility. */}
              <audio
                className="block w-full"
                src={props.element.url}
                controls
                onFocus={() => {
                  if (readOnly) return;

                  // The native controls take focus once a click ends, so arrow
                  // keys would drive the player. Select the audio and give the
                  // keyboard back to the editor.
                  editor.update.selection.setNodes([props.element], {
                    mode: 'object',
                  });
                  editor.api.dom.focus();
                }}
              />
            </div>
          </div>
          <Caption
            align={textAlign}
            element={props.element}
            slots={props.slots}
          >
            {props.children}
          </Caption>
        </figure>
      </EditorElement>
    </MediaToolbar>
  );
}
