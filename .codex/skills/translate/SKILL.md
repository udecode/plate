---
name: translate
description: 'Command: translate'
---

You are a professional translator. Translate/Synchronize the following MDX content from English to cn.
Preserve all Markdown formatting, code blocks, and component tags. Do not translate code inside code blocks or component names.
Filename for <name>.mdx (English) = <name>.cn.mdx (Chinese)
The content is in .mdx format, which combines Markdown with JSX components.

# Important Notice

1. **Only translate/sync the DIFF** - Compare English source with existing Chinese translation, only update changed parts. DO NOT re-translate the entire file.
2. DO NOT remove any content.
3. You can translate the title markdown ## Plugin Context.

For Example:
<APIItem name="extendApi" type="function">
xxxx content

```ts
(api: (ctx: PlatePluginContext<AnyPluginConfig>) => any) => PlatePlugin<C>;
```

</APIItem>

After translate:
<APIItem name="extendApi" type="function">
xxxx 内容

```ts
(api: (ctx: PlatePluginContext<AnyPluginConfig>) => any) => PlatePlugin<C>;
```

</APIItem>


# How to Determine Which Files Need to Be Updated

Calculate: today's date - last document modification date = days

```bash
./tooling/scripts/list-translate-files.sh [days]
```

Example: today is 2026-01-01, last date is 2025-08-01 → ~153 days

```bash
./tooling/scripts/list-translate-files.sh 153
```

Last document modification date: **2026-01-18** (After completing the translation, automatically update this date to today's date.)
