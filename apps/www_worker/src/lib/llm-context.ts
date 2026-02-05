export const getPlateCopyMarkdown = (ctx: {
  content: string;
  docUrl: string;
  title: string;
}) => `${ctx.title}

Source: ${ctx.docUrl}

## Registry URLs

- All components index: https://platejs.org/r/registry.json
- All docs index: https://platejs.org/r/registry-docs.json
- Component content: https://platejs.org/r/{name}

Note: Any <ComponentSource name="..." /> or <ComponentPreview name="..." /> in the documentation can be accessed at https://platejs.org/r/{name}

I'm going to ask questions from the following Plate documentation:

---

${ctx.content}`;
