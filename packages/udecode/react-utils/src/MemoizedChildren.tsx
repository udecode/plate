import React from 'react';

export const MemoizedChildren = React.memo(
  ({ children }: { children: React.ReactNode }) => {
    return <>{children}</>;
  }
);
