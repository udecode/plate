import React, { forwardRef, PropsWithRef, SVGProps } from 'react';
import styled from 'styled-components';

export interface StyledIconProps extends PropsWithRef<SVGProps<SVGSVGElement>> {
  size?: number | string;
  title?: string | null;
  iconVerticalAlign?: string;
}

const Icon = forwardRef((props: StyledIconProps, ref: any) => {
  const { children, iconVerticalAlign, size, title, ...otherProps } = props;

  const iconProps: SVGProps<SVGSVGElement> = {
    height: props.height !== undefined ? props.height : size,
    width: props.width !== undefined ? props.width : size,
    'aria-hidden': title == null ? 'true' : undefined,
    focusable: 'false',
    role: title != null ? 'img' : undefined,
    ...otherProps,
  };

  return (
    <svg {...iconProps} ref={ref}>
      {title && <title key="icon-title">{title}</title>}
      {children}
    </svg>
  );
});

export const StyledIcon = styled(Icon)`
  display: inline-block;
  vertical-align: ${(props) => props.iconVerticalAlign};
  overflow: hidden;
  height: 100%;
`;
