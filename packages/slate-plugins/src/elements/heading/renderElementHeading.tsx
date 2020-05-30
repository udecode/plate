import * as React from 'react';
import { RenderElementProps } from 'slate-react';
import { getElementComponent } from '../../element/utils';
import {
  HeadingElement1,
  HeadingElement2,
  HeadingElement3,
  HeadingElement4,
  HeadingElement5,
  HeadingElement6,
} from './components';
import { HeadingRenderElementOptions, HeadingType } from './types';

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
  H1 = getElementComponent(HeadingElement1),
  H2 = getElementComponent(HeadingElement2),
  H3 = getElementComponent(HeadingElement3),
  H4 = getElementComponent(HeadingElement4),
  H5 = getElementComponent(HeadingElement5),
  H6 = getElementComponent(HeadingElement6),
  levels = 6,
  fontSize = 16,
}: HeadingRenderElementOptions = {}) => (props: RenderElementProps) => {
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
