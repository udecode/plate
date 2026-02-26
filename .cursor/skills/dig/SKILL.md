---
name: dig
description: Look up documentation and source code for libraries and packages. Use when the user asks a question about a library, needs to understand a library's API, or when you need information about a library that you don't know about. Triggers on questions like "How do I use X library?", "What's the API for Y?", "Show me how Z library handles this", or when encountering unfamiliar library usage.
---

# Dig

Look up library documentation by finding and exploring the library's source code repository.

## Workflow

### 1. Check for Local Availability

First, check if the library source code already exists locally:

```bash
# Check common locations
ls /tmp/cc-repos/{library-name} 2>/dev/null
```

If the library exists locally, skip to step 3.

### 2. Clone the Repository

If not available locally, find and clone the repository:

1. Search for the library's GitHub repository (most libraries are on GitHub)
2. Clone into the standard location:

```bash
mkdir -p /tmp/cc-repos
git clone https://github.com/{owner}/{repo}.git /tmp/cc-repos/{repo-name}
```

**Common repository patterns:**

- npm packages: Check `package.json` homepage or repository field, or search `https://github.com/{package-name}`
- Python packages: Check PyPI page for "Homepage" or "Source" links
- Go packages: The import path often is the repository URL
- Rust crates: Check crates.io for repository link

### 3. Research the Repository

Launch a Research agent (using the Task tool with `subagent_type="Explore"`) to traverse the repository and answer the question.

Example prompt for the agent:

```
Explore the repository at /tmp/cc-repos/{repo-name} to answer: {user's question}

Focus on:
- README and documentation files
- Source code structure
- API exports and public interfaces
- Examples and tests for usage patterns
```

### 4. Synthesize and Answer

Use the research findings to provide a clear, accurate answer to the user's question about the library.
