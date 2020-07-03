import React from 'react';

export const AlignElement = ({ attributes, children }: any) => {
  return (
    <div
      {...attributes}
      style={{ textAlign: `${attributes['data-slate-type']}` }}
    >
      {children}
    </div>
  );
};
