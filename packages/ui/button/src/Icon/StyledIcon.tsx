import * as React from 'react';
import styled from 'styled-components';

export type StyledIconType = React.ForwardRefExoticComponent<
  React.PropsWithoutRef<StyledIconProps> & React.RefAttributes<SVGSVGElement>
>;

export interface StyledIconProps
  extends React.PropsWithRef<React.SVGProps<SVGSVGElement>> {
  size?: number | string;
  title?: string | null;
}

interface StyledIconBaseProps {
  iconAttrs?: React.SVGProps<SVGSVGElement>;
  iconViewBox?: string;
  iconVerticalAlign?: string;
}

const StyledIconBaseBase = React.forwardRef<
  SVGSVGElement,
  StyledIconProps & StyledIconBaseProps
>((props, ref) => {
  const {
    children,
    iconAttrs,
    iconVerticalAlign,
    iconViewBox,
    size,
    title,
    ...otherProps
  } = props;

  const iconProps: React.SVGProps<SVGSVGElement> = {
    viewBox: iconViewBox,
    height: props.height !== undefined ? props.height : size,
    width: props.width !== undefined ? props.width : size,
    'aria-hidden': title == null ? 'true' : undefined,
    focusable: 'false',
    role: title != null ? 'img' : undefined,
    ...iconAttrs,
    ...otherProps,
  };

  return (
    <svg {...iconProps} ref={ref}>
      {title && <title key="icon-title">{title}</title>}
      {children}
    </svg>
  );
});

export const StyledIcon = styled(StyledIconBaseBase)`
  display: inline-block;
  vertical-align: ${(props) => props.iconVerticalAlign};
  overflow: hidden;
  height: 100%;
`;
