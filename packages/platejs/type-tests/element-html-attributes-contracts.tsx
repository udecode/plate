import type { AnchorHTMLAttributes } from 'react';

import type { BaseParagraphPlugin } from '../src';
import type { ParagraphPlugin, PlateElementProps } from '../src/react';
import { PlateElement } from '../src/react';
import type { PliteElementProps } from '../src/static';
import { PliteElement } from '../src/static';

const anchorAttributes: AnchorHTMLAttributes<HTMLAnchorElement> = {
  dir: 'auto',
  href: 'https://platejs.org',
};

export const renderLiveAnchor = (
  props: PlateElementProps<typeof ParagraphPlugin>
) => (
  <PlateElement
    {...props}
    as="a"
    attributes={{ ...props.attributes, ...anchorAttributes }}
  />
);

export const renderStaticAnchor = (
  props: PliteElementProps<typeof BaseParagraphPlugin>
) => (
  <PliteElement
    {...props}
    as="a"
    attributes={{ ...props.attributes, ...anchorAttributes }}
  />
);
