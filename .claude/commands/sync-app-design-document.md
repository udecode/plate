# Rule: Syncing an Application Design Document

> $ARGUMENTS

## Goal

To guide an AI assistant in updating an existing Application Design Document based on codebase changes, new features, project evolution, or user feedback. This command maintains consistency with the original document while incorporating new information and reflecting the current state of the application.

## Process

1. **Receive Update Request:** The user requests to sync/update the existing app design document due to changes, new features, or project evolution.
2. **Analyze Current Document:** Read and understand the existing `app-design-document.md` to establish baseline understanding.
3. **Deep Codebase Analysis:** Analyze current codebase to identify changes since the last document update:
   - New features and functionalities added
   - Modified user flows and business logic
   - Updated data models and relationships
   - Changes in authentication/authorization patterns
   - New integrations or external services
   - Removed or deprecated features
4. **Ask Targeted Update Questions:** **ALWAYS start with project stage and development priorities questions first**, then focus on what has changed, what's new, and what needs clarification. Provide lettered/numbered options for easy response.
5. **Update Project Status (if changed):** Based on user answers about project stage and priorities, update both:
   - `CLAUDE.md` "Project Status" section with new priorities
   - `.cursor/rules/project-status.mdc` with updated DO/DON'T lists
6. **Sync Document:** Update the existing document with new information while preserving the established structure and tone.
7. **Save Updated Document:** Overwrite the existing `app-design-document.md` with the updated version.

## Update-Focused Questions (Examples)

**PROJECT EVOLUTION ASSESSMENT (ALWAYS ASK FIRST):**

- **Stage Evolution:** "Has your project stage changed since the last update?"

  - a) Same stage, just new features/improvements
  - b) Evolved to next stage (Pre-MVP → MVP, MVP → Production, etc.)
  - c) Major pivot or significant change in direction
  - d) Unsure, help me assess current stage

- **Development Priorities:** "Have your development priorities changed? What should AI care about vs NOT care about now?"
  - a) Same priorities as before
  - b) New priorities due to stage evolution
  - c) Different focus areas based on user feedback/business needs
  - d) Need help defining current priorities

**CHANGE IDENTIFICATION:**

- **New Features:** "What major features or capabilities have been added since the last update?"
- **Modified Flows:** "Have any core user journeys or workflows changed significantly?"
- **Removed Features:** "Have any features been removed, deprecated, or significantly changed?"
- **Integration Changes:** "Are there new external services, APIs, or systems you're now integrating with?"
- **User Feedback Impact:** "Has user feedback led to any significant changes in direction or priorities?"
- **Business Model Evolution:** "Have there been any changes to your business model or target audience?"
- **Scale Changes:** "Has your user base, data volume, or technical requirements grown significantly?"

**FUTURE DIRECTION:**

- **Priority Shifts:** "Have your development priorities or success metrics changed?"
- **New Goals:** "Are there new business goals or user needs you're now addressing?"
- **Technical Evolution:** "Have you adopted new architectural patterns or technical approaches?"

## Sync Strategy

### **Incremental Updates**

- Preserve existing document structure and established content
- Add new sections only when necessary for significant new feature categories
- Update existing sections with new information
- Mark deprecated or removed features appropriately

### **Change Documentation**

- Clearly indicate what's new, changed, or removed
- Maintain historical context for major decisions
- Update examples and use cases to reflect current state

### **Consistency Maintenance**

- Keep the same tone and level of detail as the original
- Ensure new content aligns with existing writing style
- Maintain technology-agnostic approach
- Preserve focus on "what" rather than "how"

## Document Update Areas

### **Always Review These Sections:**

- **Core Features:** Add new features, update existing ones, note removals
- **User Experience:** Update user journeys, personas, design principles
- **System Architecture:** Reflect new integrations and high-level changes
- **Business Logic:** Update rules, workflows, and validation requirements
- **Future Considerations:** Revise roadmap and planned enhancements

### **Conditionally Update:**

- **Introduction:** Only if there are fundamental changes to purpose or audience
- **Project Status:** Only if stage has evolved or priorities have shifted significantly

## Key Principles for Syncing

1. **Preserve Established Context:** Don't rewrite what's still accurate
2. **Highlight Changes:** Make it clear what's new or different
3. **Maintain Coherence:** Ensure all sections still work together logically
4. **Future-Proof:** Consider how current changes affect future plans
5. **User-Focused:** Keep emphasis on user value and business impact

## Output

- **Format:** Markdown (`.md`)
- **Location:** `.taskmaster/docs/`
- **Filename:** `app-design-document.md` (overwrites existing)
- **Backup:** Optionally suggest creating a backup of the previous version

## Final Instructions

1. Do NOT start implementing the sync immediately
2. First read and understand the existing `app-design-document.md` thoroughly
3. Analyze the current codebase to identify what has changed
4. **CRITICAL:** Ask project stage and development priorities questions FIRST - do NOT analyze or predict
5. Based on user answers, update both CLAUDE.md and project-status.mdc accordingly
6. Ask targeted questions about specific changes and new directions
7. Sync the document incrementally, preserving good existing content
8. Focus on accurately reflecting the current state while maintaining document quality
9. After saving, suggest creating a backup of the previous version if significant changes were made
10. Consider if the tech-stack document also needs updating based on changes identified
