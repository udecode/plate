import * as React from 'react';
import { useEffect, useRef } from 'react';
import { getPreventDefaultHandler } from '@udecode/plate-common';
import { useEventEditorId, useStoreEditorRef } from '@udecode/plate-core';
import { MentionNodeData } from '@udecode/plate-mention';
import { PortalBody } from '@udecode/plate-styled-components';
import { ReactEditor } from 'slate-react';
import { getMentionSelectStyles } from './MentionSelect.styles';
import { MentionSelectProps } from './MentionSelect.types';

export const MentionSelect = (props: MentionSelectProps) => {
  const {
    at,
    options,
    valueIndex,
    onClickMention,
    portalElement,
    renderLabel = (mentionable: MentionNodeData) => mentionable.value,
  } = props;

  const ref: any = useRef();
  const editor = useStoreEditorRef(useEventEditorId('focus'));

  useEffect(() => {
    if (editor && at && options.length > 0) {
      const el = ref.current;
      const domRange = ReactEditor.toDOMRange(editor, at);
      const rect = domRange.getBoundingClientRect();
      if (el) {
        el.style.top = `${rect.top + window.pageYOffset + 24}px`;
        el.style.left = `${rect.left + window.pageXOffset}px`;
      }
    }
  }, [options.length, editor, at]);

  if (!editor || !at || !options.length) {
    return null;
  }

  const styles = getMentionSelectStyles(props);

  return (
    <PortalBody element={portalElement}>
      <div
        ref={ref}
        css={styles.root.css}
        className={styles.root.className}
        {...props}
      >
        {options.map((option, i) => (
          <div
            key={`${i}${option.value}`}
            css={
              i === valueIndex
                ? styles.mentionItemSelected?.css
                : styles.mentionItem?.css
            }
            className={
              i === valueIndex
                ? styles.mentionItemSelected?.className
                : styles.mentionItem?.className
            }
            onMouseDown={getPreventDefaultHandler(
              onClickMention,
              editor,
              option
            )}
          >
            {renderLabel(option)}
          </div>
        ))}
      </div>
    </PortalBody>
  );
};
