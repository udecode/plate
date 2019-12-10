import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Editor, Range } from 'slate';
import { ReactEditor, Slate, useSlate } from 'slate-react';
import { CustomEditable } from 'plugins/common/components/CustomEditable';
import { createCustomEditor } from 'plugins/common/helpers/createCustomEditor';
import { Portal } from '../../components';
import { CHARACTERS, initialValue } from './config';
import { editorPlugins, plugins } from './mentions.plugins';

const MentionSelect = ({
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

export const Mentions = () => {
  const [value, setValue] = useState(initialValue);
  const ref: any = useRef();
  const [selection, setSelection] = useState<Range | null>(null);
  const [target, setTarget] = useState<Range | null>();
  const [index, setIndex] = useState(0);
  const [search, setSearch] = useState('');

  const editor = useMemo(() => createCustomEditor(editorPlugins), []);

  const chars = CHARACTERS.filter(c =>
    c.toLowerCase().startsWith(search.toLowerCase())
  ).slice(0, 10);

  const pluginProps = useMemo(
    () => ({ chars, index, target, setIndex, setTarget }),
    [chars, index, target]
  );

  useEffect(() => {
    if (target && chars.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, target);
      const rect = domRange.getBoundingClientRect();
      el.style.top = `${rect.top + window.pageYOffset + 24}px`;
      el.style.left = `${rect.left + window.pageXOffset}px`;
    }
  }, [chars.length, editor, index, search, target]);

  return (
    <Slate
      editor={editor}
      value={value}
      selection={selection}
      onChange={(newValue, newSelection) => {
        setValue(newValue);
        setSelection(newSelection);
        if (newSelection && Range.isCollapsed(newSelection)) {
          const [start] = Range.edges(newSelection);
          const wordBefore = Editor.before(editor, start, { unit: 'word' });
          const before = wordBefore && Editor.before(editor, wordBefore);
          const beforeRange = before && Editor.range(editor, before, start);
          const beforeText = beforeRange && Editor.text(editor, beforeRange);
          const beforeMatch = beforeText && beforeText.match(/^@(\w+)$/);
          const after = Editor.after(editor, start);
          const afterRange = Editor.range(editor, start, after);
          const afterText = Editor.text(editor, afterRange);
          const afterMatch = afterText.match(/^(\s|$)/);

          if (beforeMatch && afterMatch) {
            setTarget(beforeRange);
            setSearch(beforeMatch[1]);
            setIndex(0);
            return;
          }
        }

        setTarget(null);
      }}
    >
      <CustomEditable
        plugins={plugins}
        pluginProps={pluginProps}
        placeholder="Enter some text..."
      />
      {target && chars.length > 0 && (
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
            {chars.map((char, i) => {
              return (
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
              );
            })}
          </div>
        </Portal>
      )}
    </Slate>
  );
};

// {/* {target && chars.length > 0 && (
//   <MentionSelect target={target} index={index} chars={chars} />
// )} */}
