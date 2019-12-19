import React from 'react';
import { ElementType } from 'slate-plugins/common';
import { RenderElementProps } from 'slate-react';
import { HeadingPluginOptions } from './types';

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

  if (levels >= 1 && type === ElementType.HEADING_1) return <H1 {...props} />;
  if (levels >= 2 && type === ElementType.HEADING_2) return <H2 {...props} />;
  if (levels >= 3 && type === ElementType.HEADING_3) return <H3 {...props} />;
  if (levels >= 4 && type === ElementType.HEADING_4) return <H4 {...props} />;
  if (levels >= 5 && type === ElementType.HEADING_5) return <H5 {...props} />;
  if (levels >= 6 && type === ElementType.HEADING_6) return <H6 {...props} />;
};
