---
description: Install all dotai registry items in one command
allowed-tools: Bash
name: install
---

Install all dotai registry items (dotai, prompt) in one command:

```bash
npx shadcn@latest add https://raw.githubusercontent.com/udecode/dotai/main/registry/all.json
```

After installation, add ruler postinstall to your `package.json` to auto-generate agent instructions:

```json
{
  "scripts": {
    "postinstall": "npx skiller@latest apply"
  }
}
```
