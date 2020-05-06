import '@testing-library/jest-dom/extend-expect';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [key: string]: any;
      editor: any;
      mention: any;
      actionitem: any;
      inline: any;
      txt: any;
    }
  }
}

declare module 'react';
