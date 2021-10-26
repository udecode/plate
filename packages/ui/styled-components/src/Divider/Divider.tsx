import React, { HTMLAttributes } from 'react';

export const Divider = (props: HTMLAttributes<HTMLDivElement>) => (
  <div tw="mx-2 my-0.5 w-px bg-gray-200" {...props} />
);
