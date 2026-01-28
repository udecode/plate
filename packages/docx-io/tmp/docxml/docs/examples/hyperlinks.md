The `<Hyperlink>` component can be used to create clickable references to external sources (like an URL) or internal sources (like pointing to another section). Hyperlink text is styled by nesting the `<Text>` component in it.

```tsx
<Hyperlink url="http://google.com">
	<Text color="blue" isUnderlined>
		Google
	</Text>
</Hyperlink>
```

[👉 Read more about cross-referencing to another part of the document](bookmarks.md)
