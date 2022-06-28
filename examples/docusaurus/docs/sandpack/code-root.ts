export const rootCode = `import './styles.css'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './App'

const rootElement = document.getElementById('root')
ReactDOM.render(<App />, rootElement)
`;

export const rootFile = {
  '/index.tsx': rootCode,
};
