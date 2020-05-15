import React from 'react';
import { getElementComponent } from 'element/utils';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';
import { HeadingType, RenderElementHeadingOptions } from './types';

export interface HeadingProps {
  fontSize: number;
}

const baseMargin = 4.8;

const Heading = styled.div<HeadingProps>`
  font-weight: 400;
`;

const StyledH1 = styled(Heading)`
  :not(:first-child) {
    margin-top: 30px;
  }
  margin-bottom: ${baseMargin * 2.5}px;
  font-size: ${({ fontSize }) => (fontSize * 20) / 11}px;
  line-height: 36px;
`;

const StyledH2 = styled(Heading)`
  :not(:first-child) {
    margin-top: 18px;
  }
  margin-bottom: ${baseMargin * 1.5}px;
  font-size: ${({ fontSize }) => (fontSize * 16) / 11}px;
  line-height: 28px;
`;

const StyledH3 = styled(Heading)`
  color: #434343;
  :not(:first-child) {
    margin-top: 8px;
  }
  margin-bottom: ${baseMargin * 1.25}px;
  font-size: ${({ fontSize }) => (fontSize * 14) / 11}px;
`;

const StyledH4 = styled(Heading)`
  color: #666666;
  :not(:first-child) {
    margin-top: 8px;
  }
  margin-bottom: ${baseMargin}px;
  font-size: ${({ fontSize }) => (fontSize * 12) / 11}px;
`;

const StyledH5 = styled(Heading)`
  color: #666666;

  :not(:first-child) {
    margin-top: 8px;
  }
  margin-bottom: ${baseMargin}px;
  font-size: ${({ fontSize }) => fontSize}px;
`;

const StyledH6 = styled(Heading)`
  color: #666666;
  font-style: italic;

  :not(:first-child) {
    margin-top: 8px;
  }
  margin-bottom: ${baseMargin}px;
  font-size: ${({ fontSize }) => fontSize}px;
`;

/**
 * Font sizes are relative to the base font size
 * H1 - fs * 20/11
 * H2 - fs * 16/11
 * H3 - fs * 14/11
 * H4 - fs * 12/11
 * H5 - fs * 1
 * H6 - fs * 1
 */
export const renderElementHeading = ({
  typeH1 = HeadingType.H1,
  typeH2 = HeadingType.H2,
  typeH3 = HeadingType.H3,
  typeH4 = HeadingType.H4,
  typeH5 = HeadingType.H5,
  typeH6 = HeadingType.H6,
  H1 = getElementComponent(StyledH1),
  H2 = getElementComponent(StyledH2),
  H3 = getElementComponent(StyledH3),
  H4 = getElementComponent(StyledH4),
  H5 = getElementComponent(StyledH5),
  H6 = getElementComponent(StyledH6),
  levels = 6,
  fontSize = 16,
}: RenderElementHeadingOptions = {}) => (props: RenderElementProps) => {
  const {
    element: { type },
  } = props;

  if (levels >= 1 && type === typeH1)
    return <H1 {...props} fontSize={fontSize} />;
  if (levels >= 2 && type === typeH2)
    return <H2 {...props} fontSize={fontSize} />;
  if (levels >= 3 && type === typeH3)
    return <H3 {...props} fontSize={fontSize} />;
  if (levels >= 4 && type === typeH4)
    return <H4 {...props} fontSize={fontSize} />;
  if (levels >= 5 && type === typeH5)
    return <H5 {...props} fontSize={fontSize} />;
  if (levels >= 6 && type === typeH6)
    return <H6 {...props} fontSize={fontSize} />;
};
