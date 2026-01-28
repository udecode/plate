Tables consist of `Table`, `Row` and `Cell` components. Cells can have paragraphs or other tables in
them. Assemble like so:

```tsx
/** @jsx Docx.jsx */
import Docx, { Cell, cm, pt, Paragraph, Row, Table } from 'docxml';

await Docx.fromJsx(
	<Table
		columnWidths={[cm(3), cm(5)]}
		borders={{
			bottom: { color: '666666', width: pt(1), type: 'single' },
			left: { color: '666666', width: pt(1), type: 'single' },
			top: { color: '666666', width: pt(1), type: 'single' },
			right: { color: '666666', width: pt(1), type: 'single' },
			insideH: { color: 'CCCCCC', width: pt(1), type: 'dashed' },
			insideV: { color: 'CCCCCC', width: pt(1), type: 'dashed' },
		}}
	>
		<Row>
			<Cell>
				<Paragraph>Cannibal Ox</Paragraph>
			</Cell>
			<Cell>
				<Paragraph>Pigeon</Paragraph>
			</Cell>
		</Row>
		<Row>
			<Cell rowSpan={2}>
				<Paragraph>King Geedorah</Paragraph>
			</Cell>
			<Cell>
				<Paragraph>Lockjaw</Paragraph>
			</Cell>
		</Row>
		<Row>
			<Cell>
				<Paragraph>Anti-Matter</Paragraph>
			</Cell>
		</Row>
	</Table>,
).toFile('tables.docx');
```

The `Table` and `Cell` component each have props to control borders on them, column widths, or
colspans/rowspans. try to make rectangular tables only, meaning that you shouldn't have too few or
too many cells on any given row.

### Header rows

Header rows automatically repeat on the next page in MS Word, if the table is tall enough. You can
mark any amount of rows as a header row by using the `isHeaderRow` prop. However, a header row
"in the middle of the table" will not work -- they need to live at the top of the table.

```tsx
<Row isHeaderRow>
	<Cell>
		<Paragraph>Artist</Paragraph>
	</Cell>
	<Cell>
		<Paragraph>Track name</Paragraph>
	</Cell>
</Row>
```
