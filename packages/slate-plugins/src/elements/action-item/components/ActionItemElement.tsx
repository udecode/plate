import * as React from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useEditor, useReadOnly } from 'slate-react';
import styled from 'styled-components';
import { ActionItemRenderElementProps } from '../types';

const Wrapper = styled.div`
  display: flex;
  flex-direction: row;
  padding: 3px 0;
`;

const CheckboxWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;

  width: 24px;
  height: 24px;
  margin-right: 6px;
`;

const Checkbox = styled.input`
  width: 16px;
  height: 16px;
  margin: 0;
`;

const Text = styled.span<{ checked: boolean }>`
  flex: 1;
  opacity: ${(props) => (props.checked ? 0.666 : 1)};
  text-decoration: ${(props) => (props.checked ? 'line-through' : 'none')};

  &:focus {
    outline: none;
  }
`;

export const ActionItemElement = ({
  attributes,
  children,
  element,
}: ActionItemRenderElementProps) => {
  const editor = useEditor();
  const readOnly = useReadOnly();
  const { checked } = element;

  return (
    <Wrapper {...attributes} data-slate-checked={element.checked}>
      <CheckboxWrapper contentEditable={false}>
        <Checkbox
          data-testid="ActionItemElementCheckbox"
          type="checkbox"
          checked={checked}
          onChange={(e) => {
            const path = ReactEditor.findPath(editor, element);

            Transforms.setNodes(
              editor,
              { checked: e.target.checked },
              { at: path }
            );
          }}
        />
      </CheckboxWrapper>
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
