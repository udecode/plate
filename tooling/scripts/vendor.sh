# Read excluded packages from JSON array and format them for pnpm
excluded_packages=$(cat << 'EOF' | jq -r '.[] | "!\(.)"'
[
  "@antfu/ni",
  "@excalidraw/excalidraw",
  "@shikijs/compat",
  "jiti",
  "jotai",
  "juice",
  "react-day-picker",
  "rehype-autolink-headings",
  "rehype-pretty-code",
  "rehype-slug",
  "rehype",
  "remark-parse",
  "remark",
  "shiki",
  "ts-morph"
]
EOF
)

# Run pnpm update with excluded packages
pnpm up -i -L $excluded_packages
