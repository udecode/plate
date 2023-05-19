import React, { SVGProps } from 'react';

export function ArrowDropDownCircleIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      focusable="false"
      role="img"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path fill="none" d="M0 0h24v24H0V0z" />
      <path d="m7 10 5 5 5-5H7z" />
    </svg>
  );
}
