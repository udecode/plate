import React from 'react';
import { Transforms } from 'slate';
import {
  RenderElementProps,
  useEditor,
  useFocused,
  useSelected,
} from 'slate-react';
import styled from 'styled-components';
import { VIDEO } from '../types';

interface Props {
  selected?: boolean;
  focused?: boolean;
}

const Wrapper = styled.div<Props>`
  position: relative;
  box-shadow: ${props =>
    props.selected && props.focused ? '0 0 0 3px #B4D5FF' : 'none'};

  padding: 10px 0;
`;

const VideoCell = styled.div<Props>`
  display: ${props => (props.selected && props.focused ? 'none' : 'block')};
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  cursor: cell;
  z-index: 1;
`;

const VideoWrapper = styled.div`
  padding: 75% 0 0 0;
  position: relative;
`;

const Iframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
`;

const Input = styled.input`
  margin-top: 5px;
`;

export const VideoElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useEditor();
  const selected = useSelected();
  const focused = useFocused();
  const { url } = element;

  return (
    <div {...attributes} data-slate-type={VIDEO}>
      <Wrapper selected={selected} focused={focused} contentEditable={false}>
        <VideoCell selected={selected} focused={focused} />
        <VideoWrapper>
          <Iframe
            title="embed"
            src={`${url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
          />
        </VideoWrapper>
        {selected && focused ? (
          <Input
            value={url}
            onClick={e => e.stopPropagation()}
            onChange={value => {
              const path = editor.findPath(element);
              Transforms.setNodes(editor, { url: value }, { at: path });
            }}
          />
        ) : null}
      </Wrapper>
      {children}
    </div>
  );
};
