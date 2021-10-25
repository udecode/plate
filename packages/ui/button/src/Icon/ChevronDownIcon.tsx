import React, { SVGProps } from 'react';

export const ChevronDownIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    focusable="false"
    aria-hidden="true"
    tw="inline text-center select-none overflow-hidden pointer-events-none max-w-full max-h-full h-full align-middle"
    {...props}
  >
    <path
      fill="currentColor"
      d="M16.59 8.59L12 13.17 7.41 8.59 6 10l6 6 6-6z"
    />
  </svg>
);
