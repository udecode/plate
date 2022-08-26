export const stylesCode = `html {
  font-family: 'Roboto', sans-serif;
  line-height: 1.4;
}

body {
  margin: 0;
}

td {
  border: 1px solid;
}

[data-slate-editor] {
  padding: 40px;
}

.slate-HeadingToolbar {
  padding: 17px 60px !important;
  position: fixed !important;
  background: white !important;
  z-index: 1000;
  width: 100%;
}

.tippy-box[data-theme~='tomato'] {
  background-color: tomato;
  color: yellow;
}

.drag-button {
  overflow: hidden;
  padding: 0;
  background-color: transparent;
  background-repeat: no-repeat;
  border-style: none;
  cursor: pointer;
  outline: 0;

  min-width: 18px;
  min-height: 18px;
}

.MuiSvgIcon-root {
  font-size: 18px !important;
}

/* .slate-code_block {
  background-color: #111827 !important;
}

.slate-code_block code {
  color: white;
} */
`;

export const stylesFile = {
  '/styles.css': stylesCode,
};
