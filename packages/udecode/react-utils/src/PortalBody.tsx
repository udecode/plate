import type React from 'react';
import ReactDOM from 'react-dom';

export type PortalBodyProps = { children: React.ReactNode; element?: Element };

export const PortalBody = ({ children, element }: PortalBodyProps) => {
  if (typeof document === 'undefined') return children;

  return ReactDOM.createPortal(children, element ?? document.body);
};
