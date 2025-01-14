Goal:
Complete the Slatejs API doc part of Platejs. Document missing APIs in a straightforward but complete way. Use terminology consistent with Slate docs since users will be migrating from Slate to Plate. Avoid wording repetition. ill give you the current platejs doc, and i want the final version of it.

Return Format:
Follow the existing pattern with:

- title: add backticks if missing and if it's a constant/function/plugin name. Add `<>` if it's a component name (e.g. `<Button>`).
- description: remove the description if the api only includes `<APIReturns>` to avoid redundancy.
- add examples ONLY if there is any in the jsdoc, OR if it's trivial. Avoid adding examples if you are not 100% sure it will work / reliable.
- Wrap the following components in `<API name="sectionName">` if missing.

API Components:

- `<APIState>` - For state-related sections (e.g. store state)
- `<APIProps>` - For component props
- `<APIAttributes>` - For general attributes/properties
- `<APIMethods>` - For methods documentation
- `<APIListAPI>` - For plugin API documentation
- `<APITransforms>` - For transform functions
- `<APIParameters>` - For function parameters
- `<APIOptions>` - For options objects (replaces APISubList for options)
- `<APIReturns type="ReturnType">` - For return values (must include type prop)

Rules:

1. Always wrap API sections in `<API name="SectionName">`
2. Use appropriate API component based on content type
3. For parameters and options:

   - If there's only one parameter, use `<APIOptions>` directly under `<API>` (no `<APIParameters>` wrapper)
   - If there are multiple parameters, use `<APIParameters>`
   - If one of the parameters is `options`, add/move `<APIOptions>` and its children as a sibling to `<APIParameters>`, never nest `<APIOptions>` inside `<APIParameters>`, and convert all its `<APISubListItem>` to `<APIItem>`, removing `parent` prop (when converting to `<APIOptions> > <APIItem>`)

4. For return values:
   - Always include `type` prop in `<APIReturns>`
   - Omit `<APIReturns>` if return type is void/undefined
   - Don't repeat the type in the description text since it's in the type prop

Example of correct parameter/options structure:

```tsx
// Single parameter with options
<API name="method">
<APIOptions type="object">
  <APIItem name="setting1" type="boolean" optional>
    First setting description
  </APIItem>
  <APIItem name="setting2" type="string" optional>
    Second setting description
  </APIItem>
</APIOptions>
</API>

// Multiple parameters, one with options
<API name="method">
<APIParameters>
  <APIItem name="path" type="Path">
    The path to transform.
  </APIItem>
  <APIItem name="options" type="MethodOptions" optional>
    Options for the method.
  </APIItem>
</APIParameters>

<APIOptions type="MethodOptions">
  <APIItem name="setting1" type="boolean" optional>
    First setting description
  </APIItem>
</APIOptions>
</API>
```

5. For default values:

```
<APIItem>
<description>

- **Default:** `true`
</APIItem>
```

6. For parameters:

   - Use single `<APIItem>` if only one parameter
   - Use `<APIParameters>` + `<APIOptions>` e.g. for `(path, options) => void` pattern
   - Use `<APISubList>` for other nested object parameters

7. Keep code examples minimal and only include if:
   - They exist in JSDoc comments
   - The usage is trivial/obvious
   - You are 100% confident in their correctness

Complete Example:

### `transform`

Transform a path by an operation.

```tsx
// Transform a path by an insert operation
path.transform([0, 1], {
  type: 'insert_node',
  path: [0],
  node: { type: 'paragraph' },
});

// Transform with affinity
path.transform([0, 2], op, { affinity: 'forward' });
```

<API name="transform">
<APIParameters>
  <APIItem name="path" type="Path">
    The path to transform.
  </APIItem>
  <APIItem name="operation" type="Operation">
    The operation to apply.
  </APIItem>
  <APIItem name="options" type="PathTransformOptions" optional>
    Options for transforming a path.
  </APIItem>
</APIParameters>

<APIOptions type="PathTransformOptions">
  <APIItem name="affinity" type="TextDirection | null" optional>
    The affinity of the transform.
  </APIItem>
</APIOptions>

<APIReturns type="Path | null">
  The transformed path, or null if the path was deleted.
</APIReturns>
</API>

Warnings:

- Since your output is markdown that has codeblocks, any internal codeblock should be prepended by a + (+\`\`\`) instead of \`\`\`. so it does not break your output.
- When you see repetitive long types, smartly decide if we should document the type in ## Types and link it instead of duplicating. If it's like one sentence doc, just repeat it instead of adding a doc section for the type.
- Don't over-clutter the types in the text to keep it readable. Avoid generics in the text when linking a type, except in the doc section of the type itself.

Now finalize the following doc. DO NOT DELETE SECTIONS!!!
