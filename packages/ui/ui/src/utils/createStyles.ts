import clsx from 'clsx';
import castArray from 'lodash/castArray';
import { CSSProp } from 'styled-components';
import { StyledProps } from '../types/StyledProps';

export interface Style {
  css: CSSProp[];
  className: string;
}

export const createStyles = <
  T extends {
    styles?: NonNullable<T['styles']>;
    classNames?: any;
    prefixClassNames?: string;
  } = StyledProps
>(
  props: T,
  styles: NonNullable<T['styles']> | NonNullable<T['styles']>[]
): { root: Style } & Record<
  keyof NonNullable<T['styles']>,
  Style | undefined
> => {
  const stylesArray = castArray(styles);

  const allStyles = {} as any;

  stylesArray.forEach((_styles) => {
    Object.keys(_styles).forEach((key) => {
      const cssProp = castArray(_styles[key]);

      // Init css and className props
      if (!allStyles[key]) {
        let className = '';
        if (props.prefixClassNames) {
          if (key === 'root') {
            className = `slate-${props.prefixClassNames}`;
          } else {
            className = `slate-${props.prefixClassNames}-${key}`;
          }
        }

        allStyles[key as any] = {
          css: cssProp,
          className: clsx(props.prefixClassNames && className),
        };
      }

      // Extend className with `classNames` prop
      const classNameProp = props?.classNames?.[key];
      if (classNameProp) {
        allStyles[key].className = clsx(
          allStyles[key].className,
          classNameProp
        );
      }

      // Extend css with `styles` prop
      const cssPropOverride = props?.styles?.[key];
      if (!cssPropOverride) return;

      const cssPropOverrideArray = castArray(cssPropOverride);
      allStyles[key].css.push(...cssPropOverrideArray);
    });
  });

  return allStyles;
};
