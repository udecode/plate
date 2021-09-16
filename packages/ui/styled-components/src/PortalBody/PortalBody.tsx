import { ReactPortal } from 'react';
import * as ReactDOM from 'react-dom';
import { PortalBodyProps } from './PortalBody.types';

export const PortalBody: ({
  children,
  element,
}: PortalBodyProps) => ReactPortal = ({ children, element }: PortalBodyProps) =>
  ReactDOM.createPortal(children, element || document.body);
