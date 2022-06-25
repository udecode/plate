# @udecode/examples

Shares code and dependencies amongst apps in the monorepo:
- [docs](docusaurus)
- [apps/next](apps/next)
- [apps/cra](apps/cra)

### Usage

Add the workspace dependency to the consuming app or package.

```bash
yarn add @udecode/examples:"workspace:^"
```

Add an alias in tsconfig.js to enable fast-refresh.

```json5
{
  "compilerOptions": {
    "paths": {
      "@udecode/examples/*": ["../examples/common/*"]
    },
  },
}
```
