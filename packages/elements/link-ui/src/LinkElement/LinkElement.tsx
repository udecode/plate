import * as React from 'react';
import { LinkNodeData } from '@udecode/slate-plugins-link';
import {
  ClassName,
  getRootClassNames,
  RootStyleSet,
  StyledElementProps,
} from '@udecode/slate-plugins-ui-fluent';
import { styled } from '@uifabric/utilities';
import { getLinkElementStyles } from './LinkElement.styles';

const getClassNames = getRootClassNames();

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
}: StyledElementProps<LinkNodeData>) => {
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
  StyledElementProps<LinkNodeData>,
  ClassName,
  RootStyleSet
>(LinkElementBase, getLinkElementStyles, undefined, {
  scope: 'LinkElement',
});
