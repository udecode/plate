import React from 'react';
import { Transforms } from 'slate';
import { ReactEditor, RenderElementProps, useEditor } from 'slate-react';
import styled from 'styled-components';
import { VIDEO } from '../types';

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
  font-size: 0.85em;
  width: 100%;
  padding: 0.5em;
  border: 2px solid #ddd;
  background: #fafafa;
  margin-top: 5px;
`;

const UrlInput = ({ url, onChange }: { url: string; onChange: Function }) => {
  const [value, setValue] = React.useState(url);

  return (
    <Input
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => {
        const newUrl = e.target.value;
        setValue(newUrl);
        onChange(newUrl);
      }}
    />
  );
};

export const VideoElement = ({
  attributes,
  children,
  element,
}: RenderElementProps) => {
  const editor = useEditor();
  const { url } = element;

  return (
    <div {...attributes} data-slate-type={VIDEO}>
      <div contentEditable={false}>
        <VideoWrapper>
          <Iframe
            title="embed"
            src={`${url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
          />
        </VideoWrapper>

        <UrlInput
          url={url}
          onChange={(val: string) => {
            const path = ReactEditor.findPath(editor, element);
            Transforms.setNodes(editor, { url: val }, { at: path });
          }}
        />
      </div>
      {children}
    </div>
  );
};
