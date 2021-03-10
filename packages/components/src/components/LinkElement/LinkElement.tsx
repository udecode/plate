import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { ElementProps, getRootClassNames, NodeStyleProps } from '../../types';
import { getLinkElementStyles } from './LinkElement.styles';

const getClassNames = getRootClassNames();

type Props = ElementProps<{
  url: string;
}>;

/**
 * LinkElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const LinkElementBase = ({
  attributes,
  children,
  element,
  styles,
  className,
  htmlAttributes,
}: Props) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
  });

  return (
    <a
      {...attributes}
      href={element.url}
      className={classNames.root}
      {...htmlAttributes}
    >
      {children}
    </a>
  );
};

/**
 * LinkElement
 */
export const LinkElement = styled<
  Props,
  NodeStyleProps,
  NonNullable<Props['styles']>
>(LinkElementBase, getLinkElementStyles, undefined, {
  scope: 'LinkElement',
});
