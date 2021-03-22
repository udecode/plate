import * as React from 'react';
import {
  getRootClassNames,
  NodeStyleProps,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { getLinkElementStyles } from './LinkElement.styles';

const getClassNames = getRootClassNames();

type Props = StyledElementProps<{
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
  nodeProps,
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
      {...nodeProps}
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
