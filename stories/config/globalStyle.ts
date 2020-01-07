import { createGlobalStyle, css } from 'styled-components';

export const bodyStyles = css`
  html,
  input,
  textarea {
    font-family: 'Roboto', sans-serif;
    line-height: 1.4;
  }

  #root {
    padding: 20px;
  }

  .MuiSvgIcon-root {
    font-size: 18px !important;
  }

  body {
    margin: 0;
  }

  p {
    margin: 0;
  }

  ul {
    margin-block-start: 0;
    margin-block-end: 0;
    margin-inline-start: 0;
    margin-inline-end: 0;
    padding-inline-start: 0;
  }

  pre {
    padding: 10px;
    background-color: #eee;
    white-space: pre-wrap;
  }

  :not(pre) > code {
    font-family: monospace;
    background-color: #eee;
    padding: 3px;
  }

  img {
    max-width: 100%;
    max-height: 20em;
  }

  table {
    border-collapse: collapse;
  }

  td {
    padding: 10px;
    border: 2px solid #ddd;
  }

  input {
    box-sizing: border-box;
    font-size: 0.85em;
    width: 100%;
    padding: 0.5em;
    border: 2px solid #ddd;
    background: #fafafa;
  }

  input:focus {
    outline: 0;
    border-color: blue;
  }

  [data-slate-editor] > * {
    line-height: 1.5em;
    padding: 3px 0;
  }
`;

export const GlobalStyle = createGlobalStyle`
  ${bodyStyles}
`;
