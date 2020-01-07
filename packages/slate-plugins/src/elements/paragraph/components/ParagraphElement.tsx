import React from 'react';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';

const Paragraph = styled.p`
  margin: 0;
  padding: 3px 0;
`;

export const ParagraphElement = ({
  attributes,
  children,
}: RenderElementProps) => <Paragraph {...attributes}>{children}</Paragraph>;
