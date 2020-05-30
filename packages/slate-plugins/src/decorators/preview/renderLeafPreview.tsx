import * as React from 'react';
import { RenderLeafProps } from 'slate-react';
import styled, { css } from 'styled-components';

interface PreviewLeafProps {
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  title?: boolean;
  list?: boolean;
  hr?: boolean;
  blockquote?: boolean;
  code?: boolean;
}

const PreviewLeaf = styled.span<PreviewLeafProps>`
  font-weight: ${({ bold }) => bold && 'bold'};
  font-style: ${({ italic }) => italic && 'italic'};
  text-decoration: ${({ underline }) => underline && 'underline'};
  
  ${({ title }) =>
    title &&
    css`
      display: inline-block;
      font-weight: bold;
      font-size: 20px;
      margin: 20px 0 10px 0;
    `}
  ${({ list }) =>
    list &&
    css`
      padding-left: 10px;
      font-size: 20px;
      line-height: 10px;
    `}
  ${({ hr }) =>
    hr &&
    css`
      display: block;
      text-align: center;
      border-bottom: 2px solid #ddd;
    `}
  ${({ blockquote }) =>
    blockquote &&
    css`
      display: inline-block;
      border-left: 2px solid #ddd;
      padding-left: 10px;
      color: #aaa;
      font-style: italic;
    `}
  ${({ code }) =>
    code &&
    css`
      font-family: monospace;
      background-color: #eee;
      padding: 3px;
    `}
`;

export const renderLeafPreview = () => ({
  attributes,
  children,
  leaf,
}: RenderLeafProps) => (
  <PreviewLeaf {...attributes} {...leaf}>
    {children}
  </PreviewLeaf>
);
