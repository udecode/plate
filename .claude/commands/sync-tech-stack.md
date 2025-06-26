# Rule: Syncing Tech Stack Documentation

> $ARGUMENTS

## Goal

To guide an AI assistant in updating an existing Tech Stack Documentation based on dependency changes, new tools adoption, infrastructure evolution, or technical decisions. This command maintains technical accuracy while incorporating new technologies and reflecting the current state of the development stack.

## Process

1. **Receive Update Request:** The user requests to sync/update the existing tech stack documentation due to technical changes, new dependencies, or infrastructure evolution.
2. **Analyze Current Documentation:** Read and understand the existing `tech-stack.md` to establish technical baseline.
3. **Deep Technical Analysis:** Analyze current codebase to identify technical changes since the last update:
   - Package.json dependency changes (additions, removals, version updates)
   - New frameworks, libraries, or tools adopted
   - Infrastructure and deployment changes
   - Build tool and development workflow modifications
   - Database or storage solution changes
   - New integrations or external services
   - Testing framework or quality tool updates
   - Security or performance tool additions
4. **Ask Targeted Technical Questions:** Focus on what has changed technically, new tools adopted, and infrastructure evolution. Provide lettered/numbered options for easy response.
5. **Sync Documentation:** Update the existing document with new technical information while preserving accurate existing content.
6. **Save Updated Documentation:** Overwrite the existing `tech-stack.md` with the updated version.

## Technical Update Questions (Examples)

**DEPENDENCY EVOLUTION:**

- **Package Changes:** "What major dependencies have been added, updated, or removed since the last update?"

  - a) Major version upgrades of existing packages
  - b) New frameworks or libraries adopted
  - c) Dependencies removed or replaced
  - d) All of the above

- **Framework Updates:** "Have you upgraded any major frameworks (React, Next.js, etc.)?"
  - a) Yes, with breaking changes requiring code updates
  - b) Yes, minor/patch updates only
  - c) No framework updates
  - d) Switched to different framework

**INFRASTRUCTURE CHANGES:**

- **Hosting & Deployment:** "Have there been changes to your hosting, deployment, or infrastructure?"
- **Database Evolution:** "Any changes to your database setup, hosting, or data storage solutions?"
- **Build System:** "Have you modified your build tools, bundlers, or development workflow?"
- **Environment Management:** "Changes to how you handle environments, configuration, or secrets?"

**TOOLING UPDATES:**

- **Development Tools:** "What new development tools, linters, or quality tools have you adopted?"
- **Testing Strategy:** "Have you added new testing frameworks or changed your testing approach?"
- **Monitoring & Performance:** "Any new monitoring, logging, or performance tools added?"
- **Security Tools:** "New security tools, vulnerability scanners, or compliance measures?"

**INTEGRATION CHANGES:**

- **External Services:** "New third-party APIs, services, or integrations added?"
- **Payment & Authentication:** "Changes to payment processors, auth providers, or external services?"

## Sync Strategy

### **Technical Accuracy**

- Update exact version numbers and configuration details
- Remove outdated technology references
- Add new dependencies and their purposes
- Update build and deployment configurations

### **Incremental Technical Updates**

- Preserve accurate existing technical information
- Add new sections for significant new technology categories
- Update configuration examples and setup instructions
- Mark deprecated tools or approaches

### **Version Management**

- Track major version changes and breaking updates
- Document migration paths for significant upgrades
- Note compatibility requirements and constraints
- Update browser/runtime support information

## Document Update Areas

### **Always Review These Sections:**

- **Dependencies:** Package.json changes, version updates, new libraries
- **Development Tools:** New linters, formatters, build tools, workflow changes
- **Deployment & Infrastructure:** Hosting changes, CI/CD updates, environment config
- **Database & Storage:** Schema changes, new storage solutions, backup strategies
- **External Integrations:** New APIs, services, authentication providers

### **Conditionally Update:**

- **Programming Language & Runtime:** Only if versions or major features changed
- **Architecture Overview:** Only if fundamental architectural changes occurred
- **Project Structure:** Only if significant reorganization happened

## Technical Sync Principles

1. **Version Precision:** Always include exact version numbers and ranges
2. **Configuration Accuracy:** Update config examples to reflect current setup
3. **Deprecation Tracking:** Mark outdated approaches and migration paths
4. **Dependency Reasoning:** Explain why new dependencies were chosen
5. **Performance Impact:** Note any performance implications of changes

## Output

- **Format:** Markdown (`.md`)
- **Location:** `.taskmaster/docs/`
- **Filename:** `tech-stack.md` (overwrites existing)
- **Backup:** Optionally suggest creating a backup of the previous version

## Final Instructions

1. Do NOT start implementing the sync immediately
2. First read and understand the existing `tech-stack.md` thoroughly
3. Analyze current package.json, config files, and technical setup for changes
4. Compare dependency versions, build configurations, and tool setups
5. Ask targeted questions about specific technical changes and new adoptions
6. Sync the document incrementally, preserving accurate existing technical content
7. Include specific version numbers, configuration examples, and setup details
8. Focus on accurately reflecting the current technical state and tooling
9. After saving, suggest creating a backup if significant technical changes were made
10. Consider if the app-design-document also needs updating based on technical changes identified
