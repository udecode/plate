import React, { useState } from 'react';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';
import { Example } from '../../components/editable-plugins.stories';

const Wrapper = styled.div`
  box-shadow: 0 0 0 3px #ddd;
  padding: 8px;
`;

const Input = styled.input`
  margin: 8px 0;
`;

const EditorWrapper = styled.div`
  padding: 20px;
  border: 2px solid #ddd;
`;

export const EditableVoidElement = ({
  attributes,
  children,
}: RenderElementProps) => {
  const [inputValue, setInputValue] = useState('');

  return (
    // Need contentEditable=false or Firefox has issues with certain input types.
    <div {...attributes} contentEditable={false}>
      <Wrapper>
        <h4>Name:</h4>
        <Input
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
          }}
        />
        <h4>Left or right handed:</h4>
        <input
          style={{ width: 'unset' }}
          type="radio"
          name="handedness"
          value="left"
        />{' '}
        Left
        <br />
        <input
          style={{ width: 'unset' }}
          type="radio"
          name="handedness"
          value="right"
        />{' '}
        Right
        <h4>Tell us about yourself:</h4>
        <EditorWrapper>
          <Example />
        </EditorWrapper>
      </Wrapper>
      {children}
    </div>
  );
};
