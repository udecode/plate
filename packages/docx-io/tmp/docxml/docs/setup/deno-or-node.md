`docxml` is originally written in [Deno](http://deno.land), but published to [npmjs.org](https://npmjs.org) for [NodeJS](https://nodejs.org) users as well (see the original repo here ([wvbe/docxml](https://github.com/wvbe/docxml))!

### Deno

`docxml` is published to [JSR](https://jsr.io/@fontoxml/docxml) and can be imported via there. Always ensure to specify the version number, and point to the `mod.ts` entry file.

```ts
// Not using version number, bad
import Docxml, { Paragraph } from 'https://jsr.io/@fontoxml/docxml';

// Using version number, good
import Docxml, { Paragraph } from 'https://jsr.io/@fontoxml/docxml@5.15.5';
```

Deno comes with the advantage that it supports TypeScript and JSX without needing configuration. [Read more about `docxml` and JSX here](./jsx-or-not.md)

Deno supports import maps too, [a fun way of making those imports easier to write](https://deno.land/manual/basics/import_maps).
