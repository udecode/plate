---
allowed-tools: Read, Glob, Grep, Write, MultiEdit, TodoWrite, Bash
description: Update tech stack documentation based on dependency changes and technical evolution
name: update-tech-stack
---

# Update Tech Stack Documentation

**User Request:** $ARGUMENTS

## Context

- Project root: !`pwd`
- Package.json: @package.json
- Current tech doc: @.claude/rules/2-tech-stack.mdc
- Last modified: !`stat -f "%Sm" .claude/rules/2-tech-stack.mdc 2>/dev/null || echo "No existing document"`
- Recent package changes: !`git diff HEAD~10 HEAD -- package.json 2>/dev/null | grep -E "^[+-]" | head -20 || echo "No recent changes"`

## Goal

Update the existing Tech Stack Documentation to reflect current technical state, dependency changes, new tools adoption, and infrastructure evolution. Maintain technical accuracy while documenting all changes.

## Process

### 1. Document Analysis

- Read existing 2-tech-stack.mdc thoroughly
- Note documented versions and configurations
- Understand current technical baseline
- Identify sections that may need updates

### 2. Technical Change Detection

**Think deeply about technical evolution in the codebase.**

Analyze for:

- **Dependency Changes:** New packages, version updates, removals
- **Framework Evolution:** Major version upgrades, breaking changes
- **Tool Adoption:** New dev tools, linters, formatters, testing frameworks
- **Infrastructure Shifts:** Deployment, hosting, monitoring changes
- **Database Evolution:** Schema changes, new ORMs, migrations
- **Integration Updates:** New APIs, services, authentication providers

_Extended thinking helps identify cascading dependency updates, understand version compatibility issues, and recognize architectural implications of technical changes._

### 3. Automated Comparison

```bash
# Compare current vs documented dependencies
# Check for version mismatches
# Identify new configuration files
# Detect new tool configurations
```

### 4. Interactive Technical Q&A

Ask targeted questions about:

- Non-discoverable infrastructure changes
- Deployment and hosting updates
- New external service integrations
- Workflow and process changes

### 5. Update Documentation

Update incrementally:

- Preserve accurate technical information
- Update version numbers precisely
- Add new sections for major additions
- Mark deprecated technologies

### 6. Save and Verify

- Suggest backup for major changes
- Verify all versions are accurate

## Technical Questions Template

### 🔄 Version Updates & Dependencies

**1. Which major dependencies have been updated?**

Review your recent dependency changes:

a) **Framework upgrades** (Next.js, React, etc.) with breaking changes  
b) **Tool updates** (TypeScript, ESLint, etc.) requiring config changes  
c) **New dependencies** added for features or development  
d) **Removed packages** that are no longer needed  
e) **All of the above** - Major technical overhaul

**2. Have you changed your package manager or Node version?**

a) **Same setup** - No changes to tooling  
b) **Node upgrade** - Updated Node.js version  
c) **Package manager switch** - Changed from npm/yarn/pnpm  
d) **Monorepo adoption** - Moved to workspace setup

### 🏗️ Infrastructure Evolution

**3. Have your deployment or hosting arrangements changed?**

Current deployment is documented as: [show from existing doc]

a) **Same platform** - Just configuration updates  
b) **Platform migration** - Moved to different provider  
c) **Architecture change** - Serverless, containers, etc.  
d) **Multi-region** - Expanded geographic deployment

**4. Database or storage changes?**

a) **Version upgrade** - Same DB, newer version  
b) **Migration** - Switched database systems  
c) **New caching** - Added Redis, Memcached, etc.  
d) **Storage addition** - New file storage, CDN  
e) **No changes** - Same setup as before

### 🛠️ Development Workflow Updates

**5. New development tools or practices?**

Select all that apply:

- [ ] New testing framework or strategy
- [ ] Added code quality tools (linters, formatters)
- [ ] CI/CD pipeline changes
- [ ] Docker/containerization adoption
- [ ] New build tools or bundlers
- [ ] Performance monitoring tools

**6. External service integrations?**

Have you added or changed:

a) **Payment processing** - New or updated provider  
b) **Authentication** - Different auth service  
c) **Email/SMS** - Communication service changes  
d) **Monitoring** - New error tracking or analytics  
e) **APIs** - Additional third-party integrations  
f) **None** - Same external services

### 🔐 Security & Compliance

**7. Security tool adoption?**

- [ ] Vulnerability scanning (Snyk, etc.)
- [ ] Secret management changes
- [ ] New authentication methods
- [ ] Compliance tools (GDPR, etc.)
- [ ] Security headers/policies
- [ ] None of the above

## Update Strategy

### Version Precision

```typescript
// ❌ Outdated
"next": "^13.0.0"

// ✅ Current and precise
"next": "14.2.5"
```

### Configuration Updates

- Update all config examples to match current files
- Include new configuration options
- Remove deprecated settings
- Add migration notes for breaking changes

### New Technology Sections

When adding major new tools:

```markdown
### [New Tool Category]

**Tool:** [Name] [Version]
**Purpose:** [Why it was adopted]
**Configuration:** [Key settings]
**Integration:** [How it connects with other tools]
```

## Document Update Areas

### Always Check:

1. **package.json changes**

   ```bash
   # Compare all dependencies
   # Note version changes
   # Identify new packages
   ```

2. **Configuration files**

   - tsconfig.json updates
   - New .config files
   - Build tool configurations
   - Linting rule changes

3. **Development scripts**

   - New npm/pnpm scripts
   - Changed command purposes
   - Removed scripts

4. **Infrastructure files**
   - Dockerfile changes
   - CI/CD workflows
   - Deployment configs
   - Environment examples

### Conditional Updates:

- **Architecture:** Only if fundamental changes
- **Conventions:** Only if standards changed

## Execution Steps

### 1. Start with Analysis

```bash
# Check current dependencies vs documented
diff <(jq -r '.dependencies | keys[]' package.json | sort) \
     <(grep -E '^\*\*.*:' .claude/rules/2-tech-stack.mdc | cut -d: -f1 | sed 's/\*//g' | sort)

# Review recent dependency commits
git log --oneline --grep="dep" --since="30 days ago"

# Check for new config files
find . -name "*.config.*" -newer .claude/rules/2-tech-stack.mdc 2>/dev/null
```

**Think deeply about:** "What technical decisions drove these changes? How do version updates affect the overall architecture? What new capabilities do these tools enable?"

### 2. Interactive Q&A

- Present technical questions clearly
- Include current state from documentation
- Wait for detailed responses

### 3. Update Documentation

Follow incremental approach:

```markdown
<!-- Version update example -->

**Before:** React 18.2.0
**After:** React 18.3.1 - Includes new compiler optimizations

<!-- New tool example -->

### Code Quality Tools

**New Addition:**

- **Biome:** 1.8.3 - Replaced ESLint and Prettier
  - Faster performance (10x)
  - Single configuration file
  - Built-in formatting
```

### 4. Save and Backup

```bash
# Optional backup
cp .claude/rules/2-tech-stack.mdc .claude/rules/2-tech-stack.backup.md

# Save updated document
# Overwrite .claude/rules/2-tech-stack.mdc
```

## Key Principles

### DO:

- **Exact Versions:** Use precise version numbers from lock files
- **Config Accuracy:** Match actual configuration files
- **Change Rationale:** Explain why tools were adopted/changed
- **Migration Notes:** Document breaking changes and updates
- **Performance Impact:** Note improvements or concerns

### DON'T:

- **Generic Updates:** Avoid vague version ranges
- **Assumption:** Verify every technical detail
- **Old Information:** Remove outdated configurations
- **Wishful Documentation:** Only document what exists
- **Sensitive Data:** Never include secrets or keys

## Output

- **Format:** Markdown (`.mdc`)
- **Location:** `.claude/rules/`
- **Filename:** `2-tech-stack.mdc` (overwrites)
- **Backup:** Suggest for major changes

## Final Checklist

1. ✅ Read existing 2-tech-stack.mdc completely
2. ✅ Analyze all dependency changes
3. ✅ Check configuration file updates
4. ✅ Review infrastructure changes
5. ✅ Ask targeted technical questions
6. ✅ Update with exact versions
7. ✅ Include configuration examples
8. ✅ Suggest backup if major changes
9. ✅ Verify technical accuracy
