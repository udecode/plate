import React from 'react';
import ServerStyle from './ServerStyle';

function Root({ children }) {
  return (
    <>
      <ServerStyle from={children} />
      {children}
    </>
  );
}

export default Root;
