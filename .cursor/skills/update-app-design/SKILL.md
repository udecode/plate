---
allowed-tools: Read, Glob, Grep, Write, MultiEdit, TodoWrite, Bash
description: Update existing app design document based on codebase changes and project evolution
name: update-app-design
---

# Sync Application Design Document

**User Request:** $ARGUMENTS

## Context

- Project root: !`pwd`
- Package.json: @package.json
- Current design doc: @.claude/rules/1-app-design-document.mdc
- Last modified: !`stat -f "%Sm" .claude/rules/1-app-design-document.mdc 2>/dev/null || echo "No existing document"`

## Goal

Update the existing Application Design Document to reflect current codebase state, new features, changed priorities, and project evolution. Maintain consistency with the original document while incorporating new information.

## Process

### 1. Document Analysis

- Read and understand the existing 1-app-design-document.mdc
- Establish baseline understanding of documented features
- Note the document's structure and tone
- Identify areas that may need updates

### 2. Codebase Change Detection

**Think deeply about what has changed in the codebase since the document was last updated.**

Analyze for:

- **New Features:** Components, modules, or capabilities added
- **Modified Flows:** Changes to user journeys or business logic
- **Removed Features:** Deprecated or deleted functionality
- **Architecture Evolution:** New patterns, services, or integrations
- **Scale Changes:** Growth in complexity or user base
- **Security Updates:** New authentication/authorization patterns

_Extended thinking helps identify subtle changes, understand how new features integrate with existing ones, and recognize patterns that indicate architectural evolution._

### 3. Interactive Update Session

**CRITICAL:** Ask project stage question FIRST to assess if priorities have changed:

- Use lettered/numbered options for easy response
- Focus on what has changed and why
- Gather context for accurate updates

### 4. Update Project Configuration

If project stage or priorities have changed:

- Update `.claude/rules/3-project-status.mdc`
- Adjust DO/DON'T lists for new priorities
- Document any stage transitions

### 5. Sync Document

Update the document incrementally:

- Preserve accurate existing content
- Add new sections only when necessary
- Update outdated information
- Maintain consistent tone and structure

### 6. Save Updated Document

- Backup suggestion if major changes
- Overwrite existing 1-app-design-document.mdc
- Note what was updated

## Required Questions Template

### 🎯 CRITICAL: Project Evolution Assessment (Ask First!)

**1. Has your project stage evolved since the last update?**

a) **Same Stage** - Still in [current stage], just adding features  
b) **Stage Evolution** - Moved from [current] to next stage  
c) **Major Pivot** - Significant change in direction or purpose  
d) **Help Me Assess** - Let's review current state together

**2. Have your development priorities changed?**

Based on your current stage, are these still your priorities?

[Show current DO/DON'T lists from `.claude/rules/3-project-status.mdc`]

a) **Same Priorities** - These still reflect our focus  
b) **Adjusted Priorities** - Some changes needed (please specify)  
c) **New Focus Areas** - Different priorities based on learnings  
d) **Stage-Based Change** - Priorities changed due to stage evolution

### 📊 Change Identification Questions

**3. What major features have been added?**

Please describe any significant new capabilities, modules, or user-facing features added since the last update.

**4. Have any core user flows changed?**

a) **Authentication/Authorization** - Login, permissions, security  
b) **Main User Journey** - Primary application workflow  
c) **Data Management** - How users create/edit/delete data  
d) **Integration Points** - External service connections  
e) **None/Minor Only** - No significant flow changes

**5. What has been removed or deprecated?**

List any features, integrations, or capabilities that have been removed or are being phased out.

**6. Have you integrated new external services?**

a) **Payment Processing** - Stripe, PayPal, etc.  
b) **Communication** - Email, SMS, notifications  
c) **Analytics/Monitoring** - Tracking, logging services  
d) **AI/ML Services** - LLMs, image processing, etc.  
e) **Other** - Please specify  
f) **None** - No new integrations

### 🚀 Future Direction Questions

**7. How has user feedback influenced changes?**

Describe any significant pivots or adjustments made based on user feedback or usage patterns.

**8. What are your updated success metrics?**

Have your KPIs or success measurements changed? Current focus:

- User growth targets?
- Revenue goals?
- Engagement metrics?
- Performance benchmarks?

**9. What's the next major milestone?**

a) **Feature Release** - Specific new capability  
b) **Scale Milestone** - User/revenue target  
c) **Technical Goal** - Performance, security, architecture  
d) **Business Goal** - Partnerships, funding, market expansion

## Update Strategy

### Incremental Updates

- **Preserve:** Keep accurate existing content
- **Enhance:** Add new information to existing sections
- **Replace:** Update outdated or incorrect information
- **Remove:** Mark deprecated features appropriately

### Change Documentation

- **New Features:** Add to relevant feature categories
- **Modified Flows:** Update user journey descriptions
- **Architecture Changes:** Reflect in system architecture section
- **Business Evolution:** Update goals and success metrics

### Consistency Maintenance

- Keep the same professional, accessible tone
- Maintain technology-agnostic descriptions
- Focus on WHAT not HOW
- Preserve document structure

## Document Update Areas

### Always Review:

1. **Introduction**

   - Update if purpose or audience has shifted
   - Reflect any pivot in value proposition

2. **Core Features**

   - Add new feature categories if needed
   - Update existing features with enhancements
   - Mark removed features as deprecated

3. **User Experience**

   - Update user journeys with new flows
   - Add new user personas if applicable
   - Reflect UI/UX improvements

4. **System Architecture**

   - Add new integrations
   - Update data flow diagrams
   - Reflect new security patterns

5. **Business Logic**

   - Update rules and workflows
   - Reflect new validation requirements
   - Document new business constraints

6. **Future Considerations**
   - Update roadmap based on progress
   - Add new planned features
   - Reflect lessons learned

## Execution Steps

### 1. Start with Analysis

```bash
# Check when document was last updated
stat -f "%Sm" .claude/rules/1-app-design-document.mdc

# Review recent commits for feature changes
git log --oneline --since="30 days ago" | head -20
```

**Think deeply about:** "What has fundamentally changed in this application? How have new features altered the original vision? What patterns indicate architectural evolution?"

### 2. Interactive Q&A

- **MUST ASK PROJECT STAGE FIRST**
- Present all questions clearly
- Wait for complete responses

### 3. Update Project Status (if needed)

If stage or priorities changed, update both:

```markdown
# In `.claude/rules/3-project-status.mdc`

## Project Status

**Current Stage**: [New Stage]

### DO Care About (Production-Ready Foundation)

[Updated priorities]

### DO NOT Care About (Skip for Velocity)

[Updated items to skip]
```

### 4. Sync Document

- Make targeted updates
- Preserve document quality
- Add version note if helpful:

```markdown
<!-- Last updated: [date] - Major changes: [summary] -->
```

### 5. Save and Backup

```bash
# Optional: Create backup
cp .claude/rules/1-app-design-document.mdc .claude/rules/1-app-design-document.backup.mdc

# Save updated document
# Overwrite .claude/rules/1-app-design-document.mdc
```

## Key Principles

### DO:

- **Preserve Quality:** Maintain document's professional tone
- **Incremental Updates:** Don't rewrite unnecessarily
- **Clear Changes:** Make updates obvious and well-integrated
- **User Focus:** Keep emphasis on user value
- **Stage Awareness:** Align with current project maturity

### DON'T:

- **Complete Rewrite:** Unless fundamentally pivoted
- **Technical Details:** Maintain high-level focus
- **Break Structure:** Keep established organization
- **Lose History:** Preserve context of major decisions
- **Skip Analysis:** Always understand current state first

## Output

- **Format:** Markdown (`.mdc`)
- **Location:** `.claude/rules/`
- **Filename:** `1-app-design-document.mdc` (overwrites)
- **Backup:** Suggest if major changes

## Final Checklist

1. ✅ Read existing document completely
2. ✅ Analyze codebase changes thoroughly
3. ✅ Ask project stage question FIRST
4. ✅ Update `.claude/rules/3-project-status.mdc` if stage/priorities changed
5. ✅ Make incremental, targeted updates
6. ✅ Preserve document quality and tone
7. ✅ Suggest backup for major changes
8. ✅ Consider 2-tech-stack.mdc updates if needed
