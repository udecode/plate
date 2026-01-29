Page headers and footers can be inserted by creating instances of them first, and then referencing in a `<Section>` component.

```tsx
/** @jsx Docx.jsx */
import Docx, { Paragraph, Section } from '../mod.ts';

const docx = Docx.fromNothing();

const header = docx.document.headers.add('word/header1.xml', <Paragraph>SKEET HEADER</Paragraph>);

const footer = docx.document.footers.add('word/footer1.xml', <Paragraph>SKEET FOOTER</Paragraph>);

docx.document.set(
	<Section headers={header} footers={footer}>
		<Paragraph>This page has a header and a footer</Paragraph>
	</Section>,
);

docx.toFile('headers-footers.docx');
```

You can set either/both the `headers` and `footers` props as string reference to the header relationship, or as an object to specify different headers on the first, even and odd pages.

```tsx
<Section
	headers={{
		first: headerFirst,
		even: headerEven,
		odd: headerOdd,
	}}
>
	…
</Section>
```

When some of these specifications are missing the behavior that your text processor adopts [might get a little confusing;](http://officeopenxml.com/WPSectionFooterReference.php). If your `headers` or `footers` prop is simply the relationship reference (and not an object of them) then all first/even/odd headers are set to that reference, and the world is simple again.
