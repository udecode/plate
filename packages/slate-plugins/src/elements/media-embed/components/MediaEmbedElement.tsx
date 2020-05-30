import * as React from 'react';
import { Transforms } from 'slate';
import { ReactEditor, useEditor } from 'slate-react';
import styled from 'styled-components';
import { MediaEmbedRenderElementProps } from '../types';

const MediaEmbedWrapper = styled.div`
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

export const MediaEmbedUrlInput = ({
  url,
  onChange,
  ...props
}: {
  url: string;
  onChange: Function;
}) => {
  const [value, setValue] = React.useState(url);

  return (
    <Input
      {...props}
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

export const MediaEmbedElement = ({
  attributes,
  children,
  element,
}: MediaEmbedRenderElementProps) => {
  const editor = useEditor();
  const { url } = element;

  return (
    <div {...attributes}>
      <div contentEditable={false}>
        <MediaEmbedWrapper>
          <Iframe
            title="embed"
            src={`${url}?title=0&byline=0&portrait=0`}
            frameBorder="0"
          />
        </MediaEmbedWrapper>

        <MediaEmbedUrlInput
          data-testid="MediaEmbedUrlInput"
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
