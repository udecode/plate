import React, { useEffect, useRef } from 'react';
import { Portal } from 'slate-plugins';
import { ReactEditor, useSlate } from 'slate-react';

export const MentionSelect = ({
  target,
  chars,
  index,
}: {
  target: any;
  chars: string[];
  index: number;
}) => {
  const ref: any = useRef();
  const editor = useSlate();

  useEffect(() => {
    if (target && chars.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [chars.length, editor, target]);

  return (
    <Portal>
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
        {chars.map((char, i) => (
          <div
            key={char}
            style={{
              padding: '1px 3px',
              borderRadius: '3px',
              background: i === index ? '#B4D5FF' : 'transparent',
            }}
          >
            {char}
          </div>
        ))}
      </div>
    </Portal>
  );
};
