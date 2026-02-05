import { promises as fs } from 'node:fs';
import path from 'node:path';
import { rimraf } from 'rimraf';

const OUTPUT_DIR = path.join(process.cwd(), 'public/docs-data');
const DOCS_SOURCE = path.join(
  process.cwd(),
  '.contentlayer/generated/Doc/_index.json'
);

const pickDocData = (doc: any) => ({
  body: doc.body,
  component: doc.component,
  description: doc.description,
  docs: doc.docs,
  featured: doc.featured,
  links: doc.links,
  published: doc.published,
  slug: doc.slug,
  slugAsParams: doc.slugAsParams,
  title: doc.title,
  toc: doc.toc,
});

try {
  rimraf.sync(OUTPUT_DIR);
  await fs.mkdir(OUTPUT_DIR, { recursive: true });

  const allDocs = JSON.parse(await fs.readFile(DOCS_SOURCE, 'utf8'));

  await Promise.all(
    allDocs.map(async (doc: any) => {
      const target = path.join(OUTPUT_DIR, `${doc.slugAsParams}.json`);
      await fs.mkdir(path.dirname(target), { recursive: true });
      await fs.writeFile(target, JSON.stringify(pickDocData(doc)));
    })
  );
} catch (error) {
  console.error('Failed to build docs-data assets', error);
  process.exit(1);
}
