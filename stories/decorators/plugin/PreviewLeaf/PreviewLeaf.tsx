import * as React from 'react';
import { classNamesFunction, styled } from '@uifabric/utilities';
import { getPreviewLeafStyles } from './PreviewLeaf.styles';
import {
  PreviewLeafProps,
  PreviewLeafStyleProps,
  PreviewLeafStyles,
} from './PreviewLeaf.types';

const getClassNames = classNamesFunction<
  PreviewLeafStyleProps,
  PreviewLeafStyles
>();

/**
 * PreviewLeaf with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const PreviewLeafBase = ({
  children,
  attributes,
  styles,
  className,
  leaf,
}: PreviewLeafProps) => {
  const classNames = getClassNames(styles, {
    className,
    // Other style props
    ...leaf,
  });

  return (
    <span {...attributes} className={classNames.root}>
      {children}
    </span>
  );
};

/**
 * PreviewLeaf
 */
export const PreviewLeaf = styled<
  PreviewLeafProps,
  PreviewLeafStyleProps,
  PreviewLeafStyles
>(PreviewLeafBase, getPreviewLeafStyles, undefined, {
  scope: 'PreviewLeaf',
});
