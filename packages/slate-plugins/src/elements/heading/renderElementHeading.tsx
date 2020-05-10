import React from 'react';
import { getElementComponent } from 'element/utils';
import { RenderElementProps } from 'slate-react';
import styled from 'styled-components';
import { HeadingType, RenderElementHeadingOptions } from './types';

const Heading = styled.div`
  font-weight: 600;
  line-height: 1.2;
`;

const StyledH1 = styled(Heading)`
  :not(:first-child) {
    margin-top: 30px;
  }
  margin-bottom: 12px;
  font-size: 30px;
  line-height: 36px;
`;

const StyledH2 = styled(Heading)`
  :not(:first-child) {
    margin-top: 18px;
  }
  margin-bottom: 6px;
  font-size: 21px;
  line-height: 28px;
`;

const StyledH3 = styled(Heading)`
  :not(:first-child) {
    margin-top: 8px;
  }
  margin-bottom: 1px;
  font-size: 20px;
`;

export const renderElementHeading = ({
  levels = 6,
  H1 = getElementComponent(StyledH1),
  H2 = getElementComponent(StyledH2),
  H3 = getElementComponent(StyledH3),
  H4 = getElementComponent('h4'),
  H5 = getElementComponent('h5'),
  H6 = getElementComponent('h6'),
  typeH1 = HeadingType.H1,
  typeH2 = HeadingType.H2,
  typeH3 = HeadingType.H3,
  typeH4 = HeadingType.H4,
  typeH5 = HeadingType.H5,
  typeH6 = HeadingType.H6,
}: RenderElementHeadingOptions = {}) => (props: RenderElementProps) => {
  const {
    element: { type },
  } = props;

  if (levels >= 1 && type === typeH1) return <H1 {...props} />;
  if (levels >= 2 && type === typeH2) return <H2 {...props} />;
  if (levels >= 3 && type === typeH3) return <H3 {...props} />;
  if (levels >= 4 && type === typeH4) return <H4 {...props} />;
  if (levels >= 5 && type === typeH5) return <H5 {...props} />;
  if (levels >= 6 && type === typeH6) return <H6 {...props} />;
};
