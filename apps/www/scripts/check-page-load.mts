import fs from 'node:fs';
import path from 'node:path';

import {
  PAGE_LOAD_REPORT,
  type PageLoadReport,
  PREVIEW_ONLY_ICON_PACKAGES,
} from './page-load.ts';

const OWNER = 'app/(view)/create-preview/';
const STYLE_CSS = /\.style-[a-z]+ \.cn-/;

const distDir = path.join(
  import.meta.dirname,
  '..',
  process.argv[2] ?? '.next'
);
const reportFile = path.join(distDir, PAGE_LOAD_REPORT);

if (!fs.existsSync(reportFile)) {
  console.error(
    `${reportFile} is missing. Run a production webpack build of www first.`
  );
  process.exit(2);
}

const report: PageLoadReport = JSON.parse(fs.readFileSync(reportFile, 'utf-8'));
const styled = new Map<string, boolean>();
const isStyleCss = (file: string) => {
  if (!styled.has(file)) {
    styled.set(
      file,
      STYLE_CSS.test(fs.readFileSync(path.join(distDir, file), 'utf-8'))
    );
  }

  return styled.get(file);
};
const entries = Object.entries(report).map(([name, entry]) => ({
  ...entry,
  name,
  styleCss: entry.css.filter(isStyleCss),
}));
const owners = entries.filter((entry) => entry.name.startsWith(OWNER));

for (const entry of owners) {
  console.log(
    `${entry.name}: ${entry.styleCss.length} style CSS files, ${entry.trees} tree modules, icon modules ${JSON.stringify(entry.icons)}`
  );
}
if (
  !owners.some(
    (entry) =>
      entry.styleCss.length > 0 &&
      entry.trees > 0 &&
      PREVIEW_ONLY_ICON_PACKAGES.every((name) => entry.icons[name])
  )
) {
  console.error(
    `No ${OWNER} entry loads style CSS, a tree module and a module of each of ${PREVIEW_ONLY_ICON_PACKAGES.join(', ')}, so the report cannot judge the other pages.`
  );
  process.exit(2);
}

const violations = entries.filter(
  (entry) =>
    !entry.name.startsWith(OWNER) &&
    (entry.styleCss.length > 0 ||
      entry.trees > 0 ||
      Object.keys(entry.icons).length > 0)
);

for (const entry of violations) {
  console.error(
    `${entry.name} loads ${entry.styleCss.length} style CSS files (${entry.styleCss.join(', ')}), ${entry.trees} tree modules and icon modules ${JSON.stringify(entry.icons)}`
  );
}
if (violations.length > 0) {
  console.error(
    `${violations.length} pages besides /create-preview load the create preview's trees, style CSS or icon packages. Import them only under ${OWNER}.`
  );
  process.exit(1);
}

console.log(
  `${entries.length} client entries checked: only /create-preview loads the create preview's trees, style CSS and icon packages.`
);
