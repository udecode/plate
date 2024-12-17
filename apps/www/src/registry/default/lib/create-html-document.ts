export function createHtmlDocument({
  editorHtml,
  tailwindCss,
  theme,
}: {
  editorHtml: string;
  tailwindCss: string;
  theme?: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en"${theme === 'dark' ? ' class="dark"' : ''}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light dark" />
    <style>${tailwindCss}</style>
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;700&display=swap"
      rel="stylesheet"
    />
    <style>
      :root {
        --font-sans: 'Inter', sans-serif;
        --font-mono: 'JetBrains Mono', monospace;
      }
    </style>
  </head>
  <body>
    ${editorHtml}
  </body>
</html>`;
}
