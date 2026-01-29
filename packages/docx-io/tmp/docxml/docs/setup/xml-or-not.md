`docxml` comes with a few methods that makes transforming XML into DOCX real easy -- based on
[https://github.com/wvbe/xml-renderer](https://github.com/wvbe/xml-renderer).

If you're not using XML, you are essentially building a document object model (DOM) by nesting
`docxml` components "by hand".

If you _are_ using XML, we're building the same DOM but by translating your XML structure to a `docxml` structure.

### Using XML rules

Coming from XML, you already have a DOM -- most of the time you just need element `<x>` to be translated
to component `Y`, sometimes leaving out some content or inventing a bit of it on the fly, or sometimes putting
it into a different order.

`docxml` comes with some methods with which you can use XPath tests to select content to map to another `docxml`
component. This way of associating a "template" to nodes matching a selector is quite similar to XSLT.

When there are multiple rules matching one element (for example, `self::p` and `self::p[@align]` both match the
element `<p align="center">`), the most specific selector/template pair wins.

For example;

```ts
const docx = Docx.fromNothing();

// Match any text node to the Text component
docx.withXmlRule('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>);

// Match any <strong> element to the Text component set to bold text.
docx.withXmlRule('self::strong', ({ node }) => <Text isBold>{node.nodeValue}</Text>);

// Match any <p> element, and map it to the Paragraph component
docx.withXmlRule('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>);

// Match any <p> element that has an align="center" attribute, and map it to the Paragraph component
docx.withXmlRule('self::p[@align = "center"]', ({ traverse }) => (
	<Paragraph>{traverse()}</Paragraph>
));

// Map a <chapter> element and control where the <title> element goes, vs. the rest
docx.withXmlRule('self::chapter', ({ traverse }) => [
	...traverse('./title/node()'),
	...traverse('./*[not(self::title)]'),
]);
```

Finally, make `docxml` run your rules on an XML document by passing it into the `.withXml` method. It accepts an XML string, or any spec-compliant DOM.

### XPath tests

`.withXmlRule` uses XPath 3.1 to select XML elements and to traverse further down the XML tree. For example, use the
following selectors to select content meeting various conditions:

- **`self::p`**<br />Any `<p>` element
- **`self::a[@title]`**<br />Any `<a>` element that has a `title` attribute
- **`self::section[@type="chapter"]`**<br />Any `<section>` element where the `type` attribute is set to `chapter`
- **`self::figure[child::img and not(descendant::fn)]`**<br />Any `<figure>` element that directly contains `<img>` and
  not contains `<fn>` anywhere

Note that these are _tests_ and not _queries_. A query (For example, `.//bold`) might return a truthy value even if the
context that is being evaluated itself does not match your intended selector.

### Template context

Every template used for an element (the callback argument to `.withXmlRule`) is given some helper context to make rendering child content or doing XML lookups easier.

For example, you may sometimes want to _skip_ XML content from a section that is meant for a different audience. Using XPath you can tell the system to "render all child elements, except any element with the `audience="advanced"` attribute:

```ts
docx.withXmlRule('self::section', ({ traverse }) => (
	<Section>{traverse('./*[not(@audience="advanced")]')}</Section>
));
```

The entire list of context that is passed into your template function is as follows:

```ts
({ traverse, node, document }) => (…)
```

- **`traverse(xPathQuery?: string) => RuleResult`**<br />A function with which you can select and render the next part of the document wherever you like.
- **`node: Node`**<br />The XML node that matched the XPath selector for this rule. Often you are dealing with elements, but rendering rules can apply to text nodes, document nodes, XML comments, processing instructions and so on too!
- **`document: OfficeDocument`**<br />The instance of the OOXML document that is being worked on. This instance correlates with `word/document.xml` (in the eventual OOXML archive), and via the relationships of it you can reach helper classes to deal with (custom) styles, comments, change tracking and more.

You can pass in additional context if you like;

```ts
const doc = new Docx<{ publicationTime: Date }>();

docx.withXmlRule('self::meta', ({ publicationTime }) => (
	<Paragraph>{publicationTime.toString()}</Paragraph>
));

docx.withXml('<test><meta /></test>', {
	publicationTime: new Date(),
});
```

### Step-by-step example

```ts
/** @jsx Docx.jsx */
import Docx, { Paragraph, Text } from 'docxml';

await Docx.fromNothing()
	.withXmlRule('self::node()', ({ traverse }) => traverse('./node()'))
	.withXmlRule('self::text()', ({ node }) => <Text>{node.nodeValue}</Text>)
	.withXmlRule('self::p', ({ traverse }) => <Paragraph>{traverse()}</Paragraph>)
	.withXmlRule('self::strong', ({ traverse }) => <Text isBold>{traverse()}</Text>)
	.withXml(
		`<html>
			<body>
				<p>This is a very simply <strong>XML transformation</strong>.</p>
			</body>
		</html>`,
		{},
	)
	.toFile('example-2.docx');
```

In the code example above the following happened:

1. We specified a JSX pragma using the `/** @jsx Docx.jsx */` comment, so that we could use JSX
   in the rest of the code. [👉 More info on using JSX](./jsx-or-not.md)
2. We created an empty DOCX document using `Docx.fromNothing()` and proceeded to configure it
   immediately with a few chaining methods. [👉 Main article on instantiation](./instantiation.md)
3. We specified the "template" for several XML nodes and elements using the `.withXmlRule` method.
   - Any node at all (`self::node()`) defaults to just rendering its child (`traverse('./node()')`).
   - For any _text_ node (`self::text()`) we'll use the `Text` component and render the actual string.
   - The `<p>` and `<strong>` elements (`self::p` and `self::strong`) are translated to appropriate
     components, and their contents (text nodes, child elements etc.) are passed in as the JSX children.
4. We loaded some XML using the `.withXml` method. It's hardcoded here but could obviously come
   from anywhere.
5. We wrote file `example-2.docx` to disk using the `.toFile()` method.
