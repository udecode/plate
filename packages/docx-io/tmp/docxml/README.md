# DOCX Markup Language

This is a [Deno](https://deno.land) module for making `.docx` documents from scratch or from
an existing `.docx` or `.dotx` template.

You could use `docxml` to:

-   Create an MS Word file without ever opening MS Word
-   Create a parameterized template file and render it to `.docx` with your data parameters
-   Write JSON, XML or other data structures to `.docx`
-   Parse content from an existing `.docx` file
-   Extract style information from a `.docx` or `.dotx` file

This documentation for this lib is available at various locations:

[👉 Documentation site](https://github.com/fontoxml/docxml/wiki)<br />
[👉 GitHub source](http://github.com/fontoxml/docxml)<br />
[👉 Deno mirror](http://jsr.io/@fontoxml/docxml)<br />
[👉 npm mirror](http://npmjs.org/package/docxml)

#### For Deno

[👉 Main article](https://github.com/fontoxml/docxml/wiki/Deno-or-Node)

`docxml` can be used in [Deno](https://deno.land) using `import * from 'jsr:@fontoxml/docxml'` or using an import map.

```js
// Deno without an import map
import Docxml, { Paragraph } from 'jsr:@fontoxml/docxml';
```

#### For JSX or for vanilla

[👉 Main article](https://github.com/fontoxml/docxml/wiki/JSX-or-Not)

`docxml` is designed to be used in vanilla JavaScript using class component instances, or using JSX if you're on Deno:

```ts
const para = new Paragraph(
	{ alignment: 'center' },
	new Text({}, 'I want a cookie')
);
```

```ts
/** @jsx Docx.jsx */
const para = (
	<Paragraph alignment="center">
		<Text>I want a cookie</Text>
	</Paragraph>
);
```

#### For XML or for anything

`docxml` is also designed to be used from scratch/entirely programmatically, or using a more ergonomic API
to transform from an XML document. Both modes work equally well with vanilla JS or JSX.

```ts
await Docx.fromJsx(
	<Paragraph alignment="center">
		<Text>I want a cookie</Text>
	</Paragraph>
).toFile('example-1.docx');
```

```ts
await Docx.fromNothing()
	.withXmlRule('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>)
	.withXmlRule('self::p', ({ traverse, node }) => (
		<Paragraph alignment={node.getAttribute('align')}>
			{traverse()}
		</Paragraph>
	))
	.withXml(`<p align="center">I want a cookie</p>`, {})
	.toFile('example-2.docx');
```

#### Features

To great or small extent, the following features work in the current version of `docxml`. Some items are not ticked off
yet -- they are not available, but hopefully soon.

[👉 See code examples of some or the more intricate features](https://github.com/fontoxml/docxml/wiki/Examples)

**API features:**

-   [x] 100% typed
-   [x] Asynchronous components
-   [x] Component composition

**Custom styles:**

-   [x] Font size and color
-   [x] Bold, italic, underline styles, strike-through
-   [x] Subscript, superscript, small caps
-   [x] Paragraph spacing and indentation
-   [x] Left/right/center/justified alignment
-   [x] Numbering
-   [ ] Aligning text on tabs
-   [x] Font family
-   [ ] Embed TTF in the DOCX file

**References:**

-   [x] Cross references
-   [ ] Table of contents

**Tables:**

-   [x] Colspans and rowspans
-   [x] Cell borders
-   [x] [Table borders](http://officeopenxml.com/WPtableBorders.php)
-   [x] [Conditional formatting](http://officeopenxml.com/WPtblLook.php)

**Images:**

-   [x] From any `UInt8Array` source
-   [x] Alternative and title text
-   [x] Width and height

**Sections:**

-   [x] Width and height
-   [x] Orientation
-   [x] Page headers & footers

**Comments:**

-   [x] Point comment
-   [x] Range comment
-   [ ] Comment reply

**Change tracking:**

-   [x] Text additions and deletions
-   [x] Style changes
-   [x] Table row additions and deletions

#### Differences with actual MS Word DOCX

Obviously `docxml` is a TypeScript project, which is already very different from how you would normally interact with a `.docx` file. More meaningfully however, `docxml` is meant to make writing Word document files _easier_ than going straight to OOXML. For example:

-   All sizes are of type `Length`, which means it doesn't matter wether you input them as points, centimeters, inches, 1/2, 1/8th or 1/20th points, English Metric Units, and so on.
-   The JSX pragma will try to correct components that would lead to invalid XML structures, by splitting the parents of invalidly placed components recursively until the new position is valid. Moreover, string content in unexpected places is automatically wrapped in `<Text>` when using JSX. This makes the configuration of a new DOCX a little more forgiving.
-   Using the `<Image>` or `<Comment>` components will automatically create all required relationships etc.
-   Some of the words have changed, generally speaking `docxml` is more verbose than the DOCX verbiage.
-   Generally speaking `docxml` prefers formal (JS) references over references-by-identifier. In those cases the identifiers are randomly generated for you when the `.docx` file is written.
-   Especially in tables and images, a lot of formatting details are automatically applied. In a lot of cases there is no API _yet_ to change them.

#### For contributors

This project uses unit tests and linting for quality control. To lint, both Deno's own linting as well as ESLint are used.
Please run both of the following commands to ensure that a GitHub Action does not fail later.

```sh
# Once
npm install

# Run all unit tests
deno task test

# Run all linting
deno task lint
```
