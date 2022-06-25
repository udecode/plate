import React from 'react';
import { createGlobalStyle } from 'styled-components';
// import { GlobalStyles as BaseStyles } from 'twin.macro';

const CustomStyles = createGlobalStyle`
  *,
  ::before,
  ::after {
    box-sizing: border-box; /* 1 */
    border-width: 0; /* 2 */
    border-style: solid; /* 2 */
    border-color: #e2e8f0; /* 2 */
  }
`;

export const GlobalStyles = () => (
  <>
    {/* <BaseStyles /> */}
    <CustomStyles />
  </>
);
