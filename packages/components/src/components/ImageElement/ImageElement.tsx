import * as React from 'react';
import { styled } from '@uifabric/utilities';
import { useFocused, useSelected } from 'slate-react';
import { getRootClassNames } from '../../types';
import { StyledElementProps } from '../StyledElement/StyledElement.types';
import { getImageElementStyles } from './ImageElement.styles';
import {
  ImageElementStyleProps,
  ImageElementStyleSet,
} from './ImageElement.types';

const getClassNames = getRootClassNames<
  ImageElementStyleProps,
  ImageElementStyleSet
>();

type Props = StyledElementProps<
  { url: string },
  ImageElementStyleProps,
  ImageElementStyleSet
>;

/**
 * ImageElement with no default styles.
 * [Use the `styles` API to add your own styles.](https://github.com/OfficeDev/office-ui-fabric-react/wiki/Component-Styling)
 */
export const ImageElementBase = ({
  attributes,
  children,
  element,
  className,
  styles,
  nodeProps,
}: Props) => {
  const { url } = element;
  const focused = useFocused();
  const selected = useSelected();

  const classNames = getClassNames(styles, {
    className,
    // Other style props
    focused,
    selected,
  });

  return (
    <div {...attributes} className={classNames.root}>
      <div contentEditable={false}>
        <img
          data-testid="ImageElementImage"
          className={classNames.img}
          src={url}
          alt=""
          {...nodeProps}
        />
      </div>
      {children}
    </div>
  );
};

/**
 * ImageElement
 */
export const ImageElement = styled<
  Props,
  ImageElementStyleProps,
  NonNullable<Props['styles']>
>(ImageElementBase, getImageElementStyles, undefined, {
  scope: 'ImageElement',
});
