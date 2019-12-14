import React, { useEffect, useRef } from 'react';
import { Editor, Range } from 'slate';
import { Menu } from 'slate-plugins/common/components/Menu';
import { Portal } from "slate-plugins/common/components/Portal";
import { MarkButton } from 'slate-plugins/format/MarkButton';
import { ReactEditor, useSlate } from 'slate-react';
import styled from 'styled-components';

const StyledMenu = styled(Menu)`
  padding: 8px 7px 6px;
  position: absolute;
  z-index: 1;
  top: -10000px;
  left: -10000px;
  margin-top: -6px;
  opacity: 0;
  background-color: #222;
  border-radius: 4px;
  /* transition: opacity 0.75s; */
`;

export const HoveringToolbar = () => {
  const ref: any = useRef();
  const editor = useSlate();

  useEffect(() => {
    const el: any = ref.current;
    const { selection } = editor;
    if (!el) {
      return;
    }
    if (
      !selection ||
      !ReactEditor.isFocused(editor) ||
      Range.isCollapsed(selection) ||
      Editor.text(editor, selection) === ''
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
      <StyledMenu ref={ref}>
        <MarkButton reversed format="bold" icon="format_bold" />
        <MarkButton reversed format="italic" icon="format_italic" />
        <MarkButton reversed format="underline" icon="format_underlined" />
      </StyledMenu>
    </Portal>
  );
};
