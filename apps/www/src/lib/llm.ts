export const getPlateLLMPageMarkdown = ({
  content,
  docUrl,
  title,
}: {
  content: string;
  docUrl: string;
  title: string;
}) => `# ${title}

Source: ${docUrl}

## Registry URLs

- Components index: https://platejs.org/r/registry.json
- Docs index: https://platejs.org/r/registry-docs.json
- Component content: https://platejs.org/r/{name}

Any \`<ComponentSource name="..." />\` or \`<ComponentPreview name="..." />\` in this page can be resolved at \`https://platejs.org/r/{name}\`.

---

${content}`;

export const getPlateLLMPromptUrl = ({
  baseUrl,
  docUrl,
}: {
  baseUrl: string;
  docUrl: string;
}) =>
  `${baseUrl}?${new URLSearchParams({
    q: `I'm looking at this Plate documentation: ${docUrl}.
Help me understand how to use it. Be ready to explain concepts, give examples, or help debug based on it.`,
  })}`;

export const processMdxForLLMs = (content: string) =>
  content.replace(
    /<Component(?:Preview|Source)[\s\S]*?name="([^"]+)"[\s\S]*?\/>/g,
    (_match, name: string) =>
      `[${name} registry content](https://platejs.org/r/${name})`
  );
