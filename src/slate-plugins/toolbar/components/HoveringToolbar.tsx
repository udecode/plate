import React, { useEffect, useRef } from 'react';
import { FormatBold, FormatItalic, FormatUnderlined } from '@material-ui/icons';
import { Editor, Range } from 'slate';
import {
  MARK_BOLD,
  MARK_ITALIC,
  MARK_UNDERLINE,
  MarkButton,
  Portal,
} from 'slate-plugins';
import { ReactEditor, useSlate } from 'slate-react';
import styled from 'styled-components';
import { Toolbar } from './Toolbar';

const StyledToolbar = styled(Toolbar)`
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  height: 18px;
  /* transition: opacity 0.75s; */
`;

export const HoveringToolbar = () => {
  const ref: any = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el: any = ref.current;
    const { selection } = editor;
    if (!el) return;

    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.string(editor, selection) === ''
    ) {
      el.removeAttribute('style');
      return;
    }

    const domSelection = window.getSelection();
    const domRange = domSelection && domSelection.getRangeAt(0);
    const rect = domRange && domRange.getBoundingClientRect();
    el.style.opacity = 1;
    if (rect) {
      el.style.top = `${rect.top + window.pageYOffset - el.offsetHeight}px`;
      el.style.left = `${rect.left +
        window.pageXOffset -
        el.offsetWidth / 2 +
        rect.width / 2}px`;
    }
  });

  return (
    <Portal>
      <StyledToolbar ref={ref}>
        <MarkButton reversed format={MARK_BOLD} icon={<FormatBold />} />
        <MarkButton reversed format={MARK_ITALIC} icon={<FormatItalic />} />
        <MarkButton
          reversed
          format={MARK_UNDERLINE}
          icon={<FormatUnderlined />}
        />
      </StyledToolbar>
    </Portal>
  );
};
