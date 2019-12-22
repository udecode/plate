import React from 'react';
import { RenderElementProps } from 'slate-react';
import { HeadingPluginOptions, HeadingType } from './types';

const getHeading = (Heading: any) => ({
  attributes,
  children,
}: RenderElementProps) => <Heading {...attributes}>{children}</Heading>;

export const renderElementHeading = ({
  levels = 6,
  H1 = getHeading('h1'),
  H2 = getHeading('h2'),
  H3 = getHeading('h3'),
  H4 = getHeading('h4'),
  H5 = getHeading('h5'),
  H6 = getHeading('h6'),
}: HeadingPluginOptions) => (props: RenderElementProps) => {
  const {
    element: { type },
  } = props;

  if (levels >= 1 && type === HeadingType.H1) return <H1 {...props} />;
  if (levels >= 2 && type === HeadingType.H2) return <H2 {...props} />;
  if (levels >= 3 && type === HeadingType.H3) return <H3 {...props} />;
  if (levels >= 4 && type === HeadingType.H4) return <H4 {...props} />;
  if (levels >= 5 && type === HeadingType.H5) return <H5 {...props} />;
  if (levels >= 6 && type === HeadingType.H6) return <H6 {...props} />;
};
