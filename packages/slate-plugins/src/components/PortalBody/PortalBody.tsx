import * as ReactDOM from 'react-dom';

export const PortalBody: ({ children }: any) => React.ReactPortal = ({
  children,
}: any) => ReactDOM.createPortal(children, document.body);
