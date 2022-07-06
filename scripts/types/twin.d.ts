import { DOMAttributes } from 'react';
import styledImport, { css as cssImport, CSSProp } from 'styled-components';

declare module 'twin.macro' {
  // The styled and css imports
  const styled: typeof styledImport;
  const css: typeof cssImport;
}

declare module 'react' {
  // The css prop
  interface HTMLAttributes<T> extends DOMAttributes<T> {
    tw?: string;
    css?: CSSProp;
    // as?: string | Element;
  }
  // The inline svg css prop
  interface SVGProps<T> extends SVGProps<SVGSVGElement> {
    tw?: string;
    css?: CSSProp;
  }
}

// The 'as' prop on styled components
// declare global {
//   namespace JSX {
//     interface IntrinsicAttributes<T> extends DOMAttributes<T> {
//       as?: string | Element;
//     }
//   }
// }
