import { frontmatter } from 'fumadocs-core/content/md/frontmatter';

const SITE_URL = 'https://platejs.org';

type PlateLLMFrontmatter = {
  description?: string;
  title?: string;
};

export type PlateLLMPage = {
  url: string;
  data: {
    description?: string;
    title?: string;
    getText: (kind: 'processed' | 'raw') => Promise<string>;
  };
};

const getAbsoluteUrl = (url: string) => `${SITE_URL}${url}`;

const getPageFrontmatter = async (page: PlateLLMPage) => {
  try {
    const raw = await page.data.getText('raw');
    const { data } = frontmatter(raw);

    return data as PlateLLMFrontmatter;
  } catch {
    return {};
  }
};

const getPageTitle = async (page: PlateLLMPage) => {
  const frontmatterData = await getPageFrontmatter(page);

  return (
    page.data.title?.trim() ||
    frontmatterData.title?.trim() ||
    page.url.split('/').filter(Boolean).at(-1) ||
    'Docs'
  );
};

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

export const getPlateLLMPageMarkdownFromPage = async ({
  docUrl,
  page,
  textKind = 'processed',
}: {
  docUrl?: string;
  page: PlateLLMPage;
  textKind?: 'processed' | 'raw';
}) => {
  let content: string;

  try {
    content = await page.data.getText(textKind);
  } catch (error) {
    if (
      textKind !== 'processed' ||
      !(error instanceof Error) ||
      !error.message.includes('includeProcessedMarkdown')
    ) {
      throw error;
    }

    content = await page.data.getText('raw');
  }

  return getPlateLLMPageMarkdown({
    content: processMdxForLLMs(content),
    docUrl: docUrl ?? getAbsoluteUrl(page.url),
    title: await getPageTitle(page),
  });
};

export const getPlateLLMFullMarkdown = async (pages: PlateLLMPage[]) => {
  const content = await Promise.all(
    pages.map((page) => getPlateLLMPageMarkdownFromPage({ page }))
  );

  return content.join('\n\n');
};

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

export const stripMarkdownSuffixFromSlug = (slug: string[] = []) => {
  if (slug.length === 0) return slug;

  const last = slug.at(-1);

  if (!last?.endsWith('.md')) return slug;

  return [...slug.slice(0, -1), last.slice(0, -3)];
};

export const processMdxForLLMs = (content: string) =>
  content.replace(
    /<Component(?:Preview|Source)[\s\S]*?name="([^"]+)"[\s\S]*?\/>/g,
    (_match, name: string) =>
      `[${name} registry content](https://platejs.org/r/${name})`
  );
