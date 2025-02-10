Goal:
Migrate the existing API doc to the new format.

Return Format:
Follow the existing pattern with:

- title: add backticks if missing and if it's a constant/function/plugin name. Add `<>` if it's a component name (e.g. `<Button>`).
- description. remove the description if the api only includes `<APIReturns>` to avoid redundancy.
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

- Since your output is markdown, output in ```mdx so I can copy the whole codeblock instead of your rich-text output.
- When you see repetitive long types, smartly decide if we should document the type in ## Types and link it instead of duplicating. If it's like one sentence doc, just repeat it instead of adding a doc section for the type.
- Don't over-clutter the types in the text to keep it readable. Avoid generics in the text when linking a type, except in the doc section of the type itself.
  Context API mdx components:

```tsx
type Item = {
  children: ReactNode;
  name: string;
  type: string;
  default?: boolean | string;
  description?: string;
  optional?: boolean;
  required?: boolean;
  value?: string;
};

const APIContext = createContext<{ listType?: string; name?: string }>({});

const listTypeToId: any = {
  attributes: 'attrs',
  options: 'opt',
  parameters: 'params',
  props: 'props',
  returns: 'returns',
  state: 'state',
};

export function API({ children, name }: { children: ReactNode; name: string }) {
  return <APIContext.Provider value={{ name }}>{children}</APIContext.Provider>;
}

export function APIItem({
  children,
  name,
  optional,
  required,
  type,
  value,
}: Item) {
  const { listType, name: contextName } = React.useContext(APIContext);

  const id = contextName
    ? `${contextName}-${listType ? `${listTypeToId[listType]}-` : ''}${name}`
        .toLowerCase()
        .replace(/[^\da-z]+/g, '-')
        .replace(/^-|-$/g, '')
    : undefined;

  return (
    <AccordionItem className="select-text" value={value ?? name}>
      <AccordionTrigger className="group hover:no-underline">
        <li id={id} className="scroll-mt-20">
          <h4 className="relative py-2 text-start font-semibold leading-none tracking-tight">
            {id && (
              <a
                className={cn(
                  'opacity-0 hover:opacity-100 group-hover:opacity-100'
                )}
                onClick={(e) => e.stopPropagation()}
                href={`#${id}`}
              >
                <div className="absolute -left-5 top-2 pr-1 leading-none">
                  <Icons.pragma className="size-4 text-muted-foreground" />
                </div>
              </a>
            )}
            <span className="font-mono font-semibold leading-none group-hover:underline">
              {name}
            </span>
            {required && (
              <span className="font-mono text-xs leading-none text-orange-500">
                {' '}
                REQUIRED
              </span>
            )}
            <span className="text-left font-mono text-sm font-medium leading-none text-muted-foreground">
              {!required && optional && ' optional'} {type}
            </span>
          </h4>
        </li>
      </AccordionTrigger>
      <AccordionContent>{children}</AccordionContent>
    </AccordionItem>
  );
}

export function APIAttributes({ children, ...props }: APIListProps) {
  return (
    <APIList listType="attributes" {...props}>
      {children}
    </APIList>
  );
}

export function APIOptions({ children, ...props }: APIListProps) {
  return (
    <APIList listType="options" {...props}>
      {children}
    </APIList>
  );
}

export function APIProps({ children, ...props }: APIListProps) {
  return (
    <APIList listType="props" {...props}>
      {children}
    </APIList>
  );
}

export function APIState({ children, ...props }: APIListProps) {
  return (
    <APIList listType="state" {...props}>
      {children}
    </APIList>
  );
}

export function APIReturns({ children, ...props }: APIListProps) {
  return (
    <APIList listType="returns" {...props}>
      {children}
    </APIList>
  );
}

export function APIParameters({ children, ...props }: APIListProps) {
  return (
    <APIList listType="parameters" {...props}>
      {children}
    </APIList>
  );
}

type APIListProps = {
  children: ReactNode;
  collapsed?: boolean;
  listType?: string;
  type?: string;
};

export function APIList({
  children,
  collapsed = false,
  listType = 'parameters',
  type,
}: APIListProps) {
  const { name } = React.useContext(APIContext);
  const childCount = React.Children.count(children);
  const hasItems = React.Children.toArray(children).some(
    (child) => (child as any)?.type?.name === 'APIItem'
  );
  const newValues = Array.from(Array.from({ length: childCount }).keys()).map(
    (i) => i.toString()
  );
  const defaultValues = collapsed ? [] : newValues;

  const [values, setValues] = useState<string[]>(defaultValues);
  const [expanded, setExpanded] = useState(!collapsed);

  if (listType === 'returns' && !childCount) return null;

  const id = name ? `${name}-${listTypeToId[listType]}` : undefined;

  return (
    <APIContext.Provider value={{ listType, name }}>
      <section className="flex w-full flex-col items-center">
        <div className="w-full">
          <div className="mt-10 pb-3 ">
            <div className="mt-5 flex items-center justify-between pb-4">
              <h3
                id={id}
                className="group relative scroll-mt-20 text-lg font-medium leading-none tracking-tight"
              >
                {id && (
                  <a
                    className={cn(
                      'opacity-0 hover:opacity-100 group-hover:opacity-100'
                    )}
                    onClick={(e) => e.stopPropagation()}
                    href={`#${id}`}
                  >
                    <div className="absolute -left-5 top-0 pr-1 leading-none">
                      <Icons.pragma className="size-4 text-muted-foreground" />
                    </div>
                  </a>
                )}

                {listType === 'parameters' && 'Parameters'}
                {listType === 'attributes' && 'Attributes'}
                {listType === 'returns' && 'Returns'}
                {listType === 'props' && 'Props'}
                {listType === 'state' && 'State'}
                {listType === 'options' && 'Options'}

                {type && (
                  <span className="ml-2 font-mono text-sm font-medium text-muted-foreground">
                    {type}
                  </span>
                )}
              </h3>

              {hasItems && (
                <div
                  className="cursor-pointer select-none text-sm text-muted-foreground"
                  onClick={() => {
                    values.length === childCount
                      ? setValues([])
                      : setValues(newValues);
                    setExpanded(!expanded);
                  }}
                >
                  {values.length === childCount ? 'Collapse all' : 'Expand all'}
                </div>
              )}
            </div>

            <ul className="m-0 list-none p-0">
              <Separator />

              {hasItems ? (
                <Accordion
                  className="w-full"
                  value={values}
                  onValueChange={setValues}
                  type="multiple"
                >
                  {React.Children.map(children, (child, i) => {
                    return React.cloneElement(child as any, {
                      className: 'pt-4',
                      value: i.toString(),
                    });
                  })}
                </Accordion>
              ) : childCount > 0 ? (
                children
              ) : (
                <div className="py-4 text-sm text-muted-foreground">
                  No parameters.
                </div>
              )}
            </ul>
          </div>
        </div>
      </section>
    </APIContext.Provider>
  );
}

export function APISubListItem({
  children,
  name,
  optional,
  parent,
  required,
  type,
}: {
  children: ReactNode;
  name: string;
  parent: string;
  type: string;
  optional?: boolean;
  required?: boolean;
}) {
  const { listType, name: contextName } = React.useContext(APIContext);

  const id = contextName
    ? `${contextName}-${listType ? `${listTypeToId[listType]}-` : ''}${parent}-${name}`
        .toLowerCase()
        .replace(/[^\da-z]+/g, '-')
        .replace(/^-|-$/g, '')
    : undefined;

  return (
    <div className="border-t border-t-border p-3">
      <h4 className="relative py-2 font-mono font-semibold tracking-tight">
        {id && (
          <a
            className={cn(
              'opacity-0 hover:opacity-100 group-hover:opacity-100'
            )}
            onClick={(e) => e.stopPropagation()}
            href={`#${id}`}
          >
            <div className="absolute -left-5 top-2 pr-1 leading-none">
              <Icons.pragma className="size-4 text-muted-foreground" />
            </div>
          </a>
        )}
        <span className="font-semibold leading-none text-muted-foreground">
          {parent}.
        </span>
        <span className="font-semibold leading-none">{name}</span>
        {required && (
          <span className="ml-1 font-mono text-xs leading-none text-orange-500">
            {' '}
            REQUIRED
          </span>
        )}
        <span className="text-left font-mono text-sm font-medium leading-none text-muted-foreground group-hover:no-underline">
          {!required && optional && ' optional'} {type}
        </span>
      </h4>
      <div>{children}</div>
    </div>
  );
}

export function APISubList({
  children,
  open,
}: {
  children: ReactNode;
  open?: boolean;
}) {
  const [value, setValue] = useState(open ? '1' : '');

  return (
    <Card className="my-2">
      <Accordion
        className="w-full"
        defaultValue={open ? '1' : ''}
        onValueChange={setValue}
        type="single"
        collapsible
      >
        <AccordionItem className="border-none" value="1">
          <AccordionTrigger className="group px-3" iconVariant="plus">
            {value ? 'Hide' : 'Show'} child attributes
          </AccordionTrigger>
          <AccordionContent>{children}</AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
}
```
