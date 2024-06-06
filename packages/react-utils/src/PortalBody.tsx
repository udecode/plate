import React from 'react';
import ReactDOM from 'react-dom';

export type PortalBodyProps = { children: React.ReactNode; element?: Element };

export const PortalBody: ({
  children,
  element,
}: PortalBodyProps) => React.ReactPortal = ({
  children,
  element,
}: PortalBodyProps) => {
  const container =
    element || typeof window !== 'undefined' ? document.body : undefined;

  if (!container) return (<>{children}</>) as any;

  return ReactDOM.createPortal(children, element || document.body);
};
