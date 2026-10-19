import { writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(join(process.cwd(), 'packages/test/package.json'));
const { chromium } = require('playwright');
const probeNodeModules =
  process.env.PLATE_HTML_PROBE_NODE_MODULES ??
  join(process.cwd(), 'node_modules/.pnpm/node_modules');
const workspaceRequire = createRequire(join(probeNodeModules, 'plate-probe.cjs'));
const { parse } = await import(
  pathToFileURL(workspaceRequire.resolve('parse5')).href
);

const output = join(
  process.cwd(),
  'docs/plite/research/2026-09-25-document-codec-architecture/html-browser-inertness.json'
);
const browser = await chromium.launch({ headless: true });
const source = `
  <html>
    <head>
      <title>import</title>
      <link rel="stylesheet" href="https://example.invalid/plate-html-probe.css">
    </head>
    <body>
      <main data-editor="true"><p>safe</p></main>
      <img src="https://example.invalid/plate-html-probe.png">
      <iframe src="https://example.invalid/plate-html-probe-frame"></iframe>
      <script>globalThis.__plateHtmlProbeExecuted = true</script>
    </body>
  </html>
`;

const portableNode = (node) => {
  if (node.nodeName === '#text') {
    return { kind: 'text', value: node.value };
  }
  if (node.nodeName === '#comment') {
    return { data: node.data, kind: 'comment' };
  }
  if (node.nodeName === '#documentType') {
    return { kind: 'doctype', name: node.name };
  }

  return {
    attrs: node.attrs ?? [],
    children: (node.childNodes ?? []).map(portableNode),
    content: node.content ? portableNode(node.content) : undefined,
    kind: node.tagName ? 'element' : 'container',
    namespaceURI: node.namespaceURI,
    tagName: node.tagName,
  };
};

const parsed = portableNode(parse(source));

try {
  const page = await browser.newPage();
  const requests = [];

  page.on('request', (request) => requests.push(request.url()));
  await page.setContent(`
    <meta
      http-equiv="Content-Security-Policy"
      content="require-trusted-types-for 'script'"
    >
    <title>host</title>
  `);

  const result = await page.evaluate((tree) => {
    const template = document.createElement('template');
    const inertDocument = template.content.ownerDocument;
    const materialize = (node) => {
      if (node.kind === 'text') return inertDocument.createTextNode(node.value);
      if (node.kind === 'comment') {
        return inertDocument.createComment(node.data);
      }
      if (node.kind === 'doctype') {
        return inertDocument.implementation.createDocumentType(
          node.name,
          '',
          ''
        );
      }
      if (node.kind === 'container') {
        const fragment = inertDocument.createDocumentFragment();
        node.children.forEach((child) => fragment.append(materialize(child)));
        return fragment;
      }

      const element = inertDocument.createElementNS(
        node.namespaceURI ?? 'http://www.w3.org/1999/xhtml',
        node.tagName
      );

      node.attrs.forEach((attribute) => {
        const name = attribute.prefix
          ? `${attribute.prefix}:${attribute.name}`
          : attribute.name;

        element.setAttributeNS(attribute.namespace ?? null, name, attribute.value);
      });
      node.children.forEach((child) => element.append(materialize(child)));
      if (node.content && 'content' in element) {
        element.content.append(materialize(node.content));
      }

      return element;
    };
    const fragment = materialize(tree);
    const root = fragment.querySelector('html');

    Object.assign(globalThis, { __plateHtmlProbeRoot: root });

    return {
      cspRequiresTrustedTypes:
        document.querySelector('meta')?.content ===
        "require-trusted-types-for 'script'",
      bodyExists: root.querySelector(':scope > body') !== null,
      defaultViewIsNull: inertDocument.defaultView === null,
      headExists: root.querySelector(':scope > head') !== null,
      markerText: root.querySelector('[data-editor="true"]')?.textContent,
      scriptExecuted: globalThis.__plateHtmlProbeExecuted === true,
    };
  }, parsed);

  await page.waitForTimeout(500);

  const probeRequests = requests.filter((url) =>
    url.includes('plate-html-probe')
  );
  const checks = {
    bodyExists: result.bodyExists,
    cspRequiresTrustedTypes: result.cspRequiresTrustedTypes,
    defaultViewIsNull: result.defaultViewIsNull,
    headExists: result.headExists,
    markerPreserved: result.markerText === 'safe',
    noSubresourceRequests: probeRequests.length === 0,
    scriptDidNotExecute: !result.scriptExecuted,
  };
  const artifact = {
    browser: 'chromium',
    checks,
    passed: Object.values(checks).every(Boolean),
    probeRequests,
  };

  writeFileSync(output, `${JSON.stringify(artifact, null, 2)}\n`);
  console.log(JSON.stringify(artifact));

  if (!artifact.passed) process.exitCode = 1;
} finally {
  await browser.close();
}
