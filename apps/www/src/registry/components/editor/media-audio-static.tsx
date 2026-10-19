import type { BaseAudioPlugin } from 'platejs/media';
import { type EditorElementProps, EditorElement } from 'platejs/static';
import * as React from 'react';

import { CaptionStatic, getMediaTextAlign } from './caption-static';

export function AudioElementStatic(
  props: EditorElementProps<typeof BaseAudioPlugin>
) {
  return (
    <EditorElement {...props} className="mb-1">
      <figure className="group relative cursor-default">
        <div>
          {/* oxlint-disable-next-line jsx-a11y/media-has-caption -- [P0 behavior-boundary] User media has no caption-track field; an empty fabricated track would falsely claim accessibility. */}
          <audio className="block w-full" src={props.element.url} controls />
        </div>
        <CaptionStatic
          align={getMediaTextAlign(props.element)}
          element={props.element}
        >
          {props.children}
        </CaptionStatic>
      </figure>
    </EditorElement>
  );
}
