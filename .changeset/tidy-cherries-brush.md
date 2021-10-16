---
'@udecode/plate-core': patch
---

- Fixes dependencie issue for React<17 users by using the classic `React.createElement` function rather than the newer `jsx-runtime` transform.
- Per babel docs: https://babeljs.io/docs/en/babel-preset-react#with-a-configuration-file-recommended
