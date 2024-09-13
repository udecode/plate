import React from 'react';

type RefComponent<P, R> = React.FC<P> & {
  ref?: React.Ref<R>;
};

/* eslint-disable react/display-name */
export const withHOC = <ComponentProps, HOCProps, ComponentRef, HOCRef>(
  HOC: RefComponent<HOCProps, HOCRef>,
  Component: RefComponent<ComponentProps, ComponentRef>,
  hocProps?: Omit<HOCProps, 'children'>,
  hocRef?: React.Ref<HOCRef>
) =>
  React.forwardRef<ComponentRef, ComponentProps>((props, componentRef) => (
    <HOC {...(hocProps as any)} ref={hocRef}>
      <Component {...(props as any)} ref={componentRef} />
    </HOC>
  ));
