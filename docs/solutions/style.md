# Documentation Writing Style

Reference: `@docs/solutions/style.md`, `@www/content/docs/server/http.mdx`

Write verbose, educational documentation. Guide the reader step by step. Advanced / low-level documentation should be written in a last section `## API Reference` (if any).

## Writing Principles

### 1. Guide, Don't Just Show

**Bad:** Here's the code.

```tsx
const form = useForm({ resolver: zodResolver(schema) });
```

**Good:** Next, we'll use the `useForm` hook from React Hook Form to create our form instance. We'll also add the Zod resolver to validate the form data.

```tsx
const form = useForm({ resolver: zodResolver(schema) });
```

### 2. Explain the Why

**Bad:** Add `accessibilityLayer` to your chart.

**Good:** You can turn on the `accessibilityLayer` prop to add an accessible layer to your chart. This prop adds keyboard access and screen reader support to your charts.

### 3. Build Progressively

Start simple, add complexity. Use transitions:

- "Let's add a grid to the chart."
- "We'll do the same for the legend."
- "So far we've only used components from Recharts."
- "To add a tooltip, we'll use the custom `ChartTooltip` component."

### 4. Celebrate Completion

End sections with accomplishment:

- "Done. You've built your first chart! What's next?"
- "That's it. You now have a fully accessible form with client-side validation."
- "Easy, right? Two components, and we've got a beautiful tooltip."

### 5. Use Conversational Transitions

Connect ideas naturally:

- "Next, we'll..."
- "We'll start by..."
- "You can now..."
- "This is where you..."
- "**Important:** Remember to..."

### 6. Highlight Key Gotchas

Use callouts for critical information:

```md
<Callout icon={<InfoIcon />}>
**Note:** We're returning `values` for error cases. This is because we want to keep the user submitted values in the form state.
</Callout>
```

```md
<Callout icon={<InfoIcon />}>
**Important:** Remember to set a `min-h-[VALUE]` on the `ChartContainer` component. This is required for the chart to be responsive.
</Callout>
```

### 7. Use Tables for Reference

Organize options, modes, props clearly:

```md
| Mode         | Description                              |
| ------------ | ---------------------------------------- |
| `"onChange"` | Validation triggers on every change.     |
| `"onBlur"`   | Validation triggers on blur.             |
| `"onSubmit"` | Validation triggers on submit (default). |
```

### 8. Show Real Code, Not Placeholders

**Bad:**

```tsx
// Your validation logic here
```

**Good:**

```tsx
const result = formSchema.safeParse(values);

if (!result.success) {
  return {
    values,
    success: false,
    errors: result.error.flatten().fieldErrors,
  };
}
```

### 9. Highlight Important Lines

Use `{line-numbers}` to focus attention:

````md
```tsx showLineNumbers {17-23}
// Lines 17-23 are highlighted
```
````

````

### 10. Use Steps for Multi-Part Processes

```md
<Steps>

<Step>Import the `CartesianGrid` component.</Step>

```tsx
import { Bar, BarChart, CartesianGrid } from "recharts"
````

<Step>Add the `CartesianGrid` component to your chart.</Step>

```tsx
<BarChart>
  <CartesianGrid vertical={false} />
</BarChart>
```

</Steps>
```

## Document Structure

Flexible, but typically includes:

1. **Frontmatter** - Title, description, external links
2. **Import** - `import { InfoIcon } from "lucide-react"`
3. **Opening** - What you'll learn/build
4. **Demo** (optional) - Show end result first
5. **Approach** (optional) - Methodology + comparison table
6. **Main Content** - Step-by-step with explanations
7. **Next Steps** - Navigation cards

### Opening Paragraph

Explain what the reader will learn:

```md
In this guide, we will take a look at building forms with React Hook Form. We'll cover building forms with the `<Field />` component, adding schema validation using Zod, error handling, accessibility, and more.
```

Or start with what you'll build:

```md
We are going to build the following form. It has a simple text input and a textarea. On submit, we'll validate the form data and display any errors.
```

### Approach Section (When Useful)

Explain methodology with bullets + comparison table:

```md
## Approach

This form leverages React Hook Form for performant, flexible form handling. We'll build our form using the `<Field />` component, which gives you **complete flexibility over the markup and styling**.

- Uses React Hook Form's `useForm` hook for form state management.
- `<Controller />` component for controlled inputs.
- Client-side validation using Zod with `zodResolver`.

| Use Case  | Approach             |
| --------- | -------------------- |
| REST APIs | cRPC HTTP Router ✅  |
| Real-time | Queries/Mutations ✅ |
| Webhooks  | Traditional HTTP     |
```

### Subsections

Use H3 for steps within a feature. Start with a guiding sentence:

```md
### Create a form schema

We'll start by defining the shape of our form using a Zod schema.
```

```md
### Add Tooltip

So far we've only used components from Recharts. They look great out of the box thanks to some customization in the `chart` component.

To add a tooltip, we'll use the custom `ChartTooltip` and `ChartTooltipContent` components.
```

## Code Blocks

Always include:

- `showLineNumbers` for multi-line code
- `title="filename.tsx"` for file context
- `{10-21}` for highlighting important lines

````md
```tsx showLineNumbers title="form.tsx" {17-23}
// Code with lines 17-23 highlighted
```
````

```

## Tone

- **Educational** - Teach, don't just document
- **Conversational** - "Let's", "We'll", "You can"
- **Encouraging** - "Easy, right?", "That's it."
- **Practical** - Real examples, real gotchas
- **Clear** - One concept at a time

## Anti-Patterns

❌ Walls of code without explanation
❌ Placeholder comments like `// Your logic here`
❌ Jumping to advanced concepts without building up
❌ Missing the "why" behind choices
❌ Dry, reference-style prose when tutorial-style fits better
❌ Forgetting to celebrate completion
```
