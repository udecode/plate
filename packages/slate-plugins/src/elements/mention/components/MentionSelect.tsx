import React, { useEffect, useRef } from 'react';
import { ReactEditor, useSlate } from 'slate-react';
import { PortalBody } from 'components';
import { MentionableItem } from '../types';

export const MentionSelect = ({
  target,
  mentionables,
  index,
}: {
  target: any;
  mentionables: MentionableItem[];
  index: number;
}) => {
  const ref: any = useRef();
  const editor = useSlate();

  useEffect(() => {
    if (target && mentionables.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [mentionables.length, editor, target]);

  return (
    <PortalBody>
      <div
        ref={ref}
        style={{
          top: '-9999px',
          left: '-9999px',
          position: 'absolute',
          zIndex: 1,
          padding: '3px',
          background: 'white',
          borderRadius: '4px',
          boxShadow: '0 1px 5px rgba(0,0,0,.2)',
        }}
      >
        {mentionables.map((mentionable, i) => (
          <div
            key={`${i}${mentionable.value}`}
            style={{
              padding: '1px 3px',
              borderRadius: '3px',
              background: i === index ? '#B4D5FF' : 'transparent',
            }}
          >
            {mentionable.value}
          </div>
        ))}
      </div>
    </PortalBody>
  );
};
