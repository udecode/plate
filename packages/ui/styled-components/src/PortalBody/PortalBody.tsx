import { ReactPortal } from 'react';
import * as ReactDOM from 'react-dom';

export const PortalBody: ({ children }: any) => ReactPortal = ({
  children,
}: any) => ReactDOM.createPortal(children, document.body);
