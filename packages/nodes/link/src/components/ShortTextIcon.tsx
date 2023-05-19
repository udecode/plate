import React, { SVGProps } from 'react';

export function ShortTextIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      focusable="false"
      role="img"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect width={24} height={24} fill="none" />
      <path d="M4 9h16v2H4V9zm0 4h10v2H4v-2z" />
    </svg>
  );
}
