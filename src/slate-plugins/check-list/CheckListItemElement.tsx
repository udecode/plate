import React from 'react';
import { Editor } from 'slate';
import {
  ReactEditor,
  RenderElementProps,
  useEditor,
  useReadOnly,
} from 'slate-react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;

  & + & {
    margin-top: 0;
  }
`;

const InputWrapper = styled.span`
  margin-right: 0.75em;
`;

const Text = styled.span<{ checked: boolean }>`
  flex: 1;
  opacity: ${props => (props.checked ? 0.666 : 1)};
  text-decoration: ${props => (props.checked ? 'none' : 'line-through')};

  &:focus {
    outline: none;
  }
`;

export const CheckListItemElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useEditor();
  const readOnly = useReadOnly();
  const { checked } = element;

  return (
    <Wrapper {...attributes}>
      <InputWrapper contentEditable={false}>
        <input
          type="checkbox"
          checked={checked}
          onChange={event => {
            const path = ReactEditor.findPath(editor, element);
            Editor.setNodes(
              editor,
              { checked: event.target.checked },
              { at: path }
            );
          }}
        />
      </InputWrapper>
      <Text
        contentEditable={!readOnly}
        suppressContentEditableWarning
        checked={checked}
      >
        {children}
      </Text>
    </Wrapper>
  );
};
