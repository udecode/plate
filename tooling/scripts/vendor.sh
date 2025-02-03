# Read excluded packages from JSON array and format them for pnpm
excluded_packages=$(cat << 'EOF' | jq -r '.[] | "!\(.)"'
[
  "@antfu/ni",
  "@changesets/cli",
  "@changesets/get-github-info",
  "@excalidraw/excalidraw",
  "@types/diff",
  "commander",
  "contentlayer2",
  "cosmiconfig",
  "delay",
  "diff",
  "execa",
  "https-proxy-agent",
  "jiti",
  "jotai",
  "juice",
  "next-contentlayer2",
  "ora",
  "rehype",
  "rehype-autolink-headings",
  "rehype-pretty-code",
  "rehype-slug",
  "remark",
  "remark-parse",
  "tailwind-scrollbar-hide",
  "ts-morph",
  "tsup",
  "type-fest",
  "vaul",
  "vitest",
  "zod"
]
EOF
)

# Run pnpm update with excluded packages
pnpm up -i -L $excluded_packages