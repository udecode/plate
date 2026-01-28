Fields (and their instructions) can be inserted using the `<Field>` component. As with most things in
OOXML there is an easy way to do it, but there is also a hard way...

### Simple fields

Simple fields (`<w:fldSimple>`) are implemented through the `<Field>` component.The instruction is a
required string prop, and will tell your Word processor what to do;

```tsx
<Field instruction="PAGE">42</Field>
```

This will show the number `42` in document, because this is what is stored as the last computed value.
See the section on dirty values on how to force a Word processor to compute the _actual_ field value.

### Complex fields

Complex fields are implemented using a handful of components matching the OOXML elements involved;

- `<FieldRangeInstruction>` matching `<w:instrText>`. This component contains the actual instruction.
- `<FieldRangeStart>`, `<FieldRangeSeparator>` and `<FieldRangeEnd>`, matching `<w:fldChar>` with the
  `"begin"`, `"separator"` and `"end"` types. These components mark the range across which this field
  lives (could be spanning multiple paragraphs), and optionally create a separation between the field
  instruction and storing the last computed value.

In its simplest forms, all of these components may live in the same `Text` parent:

```tsx
<Paragraph>
	<Text>
		Page number:
		<FieldRangeStart />
		<FieldRangeInstruction>PAGE</FieldRangeInstruction>
		<FieldRangeSeparator />
		42
		<FieldRangeEnd />
	</Text>
</Paragraph>
```

### Dirty values

For simple and complex fields alike, the computed value is normally stored in OOXML as well. This lets
processors that are not able to implement the field logic display the last computed values still.

If you want to ask the processor to recompute the values, you can mark the field as "dirty".

```tsx
<Field instruction="PAGE" isDirty />
```

This is helpful if you cannot replicate the field logic yourself. However, as a matter of security/policy,
MS Word will prompt the user with a vague message when a document containing dirty fields is opened;

> This document contains fields that may refer to other files. Do you want to update the fields in this document?

In complex fields you can leave the `isDirty` prop on the `<FieldRangeStart>` component.
