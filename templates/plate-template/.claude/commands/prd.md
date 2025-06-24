# Rule: Generating a Product Requirements Document (PRD)

> $ARGUMENTS

## Goal

To guide an AI assistant in creating a detailed Product Requirements Document (PRD) in Markdown format, based on an initial user prompt. The PRD should follow the `.taskmaster/templates/example_prd.md` structure and be clear, actionable, and suitable for a junior developer to understand and implement the feature.

## Process

1. **Receive Initial Prompt:** The user provides a brief description or request for a new feature or functionality.
2. **Analyze Existing Codebase:** Deeply reflect upon the changes being asked and analyze existing code to map the full scope of changes needed. Review relevant components, systems, and patterns already in place.
3. **Ask Clarifying Questions:** Before writing the PRD, the AI _must_ ask 4-6 (more only if needed) clarifying questions based on your findings from the codebase analysis. The goal is to understand the "what" and "why" of the feature, not necessarily the "how" (which the developer will figure out). Make sure to provide options in letter/number lists so I can respond easily with my selections.
4. **Generate PRD:** Based on the initial prompt and the user's answers to the clarifying questions, generate a PRD using the structure outlined below.
5. **Save PRD:** Save the generated document as `prd-[feature-name].md` inside the `.taskmaster/docs/` directory.

## Clarifying Questions (Examples)

The AI should adapt its questions based on the prompt, but here are some common areas to explore:

- **Problem/Goal:** "What problem does this feature solve for the user?" or "What is the main goal we want to achieve with this feature?"
- **Target User:** "Who is the primary user of this feature?"
- **Core Functionality:** "Can you describe the key actions a user should be able to perform with this feature?"
- **User Stories:** "Could you provide a few user stories? (e.g., As a [type of user], I want to [perform an action] so that [benefit].)"
- **User Experience:** "Describe the user journey and key user flows for this feature"
- **Scope/Boundaries:** "Are there any specific things this feature _should not_ do (non-goals)?"
- **Technical Integration:** "What existing systems or components should this integrate with?"
- **Data Requirements:** "What kind of data does this feature need to display or manipulate?"
- **Design/UI:** "Are there any existing design patterns or UI guidelines to follow?" or "Can you describe the desired look and feel?"
- **Development Phases:** "Should this be built in phases? What's the MVP vs future enhancements?"
- **Dependencies:** "What needs to be built first? Are there logical dependencies?"
- **Success Criteria:** "How will we know when this feature is successfully implemented?"
- **Edge Cases:** "Are there any potential risks or technical challenges we should consider?"

## PRD Structure

The generated PRD must follow the `.taskmaster/templates/example_prd.md` structure with two main sections:

### `<context>` Section

1. **Overview:** High-level overview of the product/feature, what problem it solves, who it's for, and why it's valuable
2. **Project Context:** Include the standard project status information. CRITICIAL: DO NOT forget this section. Read the mentioned files if needed.
3. **Core Features:** List and describe the main features, including what each does, why it's important, and how it works at a high level
4. **User Experience:** Describe user personas, key user flows, and UI/UX considerations

### `<PRD>` Section

1. **Technical Architecture:** System components, data models, APIs and integrations, infrastructure requirements
2. **Development Roadmap:** Break down into phases (MVP requirements, future enhancements) focusing on scope and detailing exactly what needs to be built
3. **Logical Dependency Chain:** Define the logical order of development, which features need to be built first, getting quickly to something usable/visible, properly pacing and scoping each feature
4. **Risks and Mitigations:** Technical challenges, figuring out the MVP that can be built upon, resource constraints
5. **Appendix:** Research findings, technical specifications, additional information

## Target Audience

Assume the primary reader of the PRD is a **junior developer**. Therefore, requirements should be explicit, unambiguous, and avoid jargon where possible. Provide enough detail for them to understand the feature's purpose and core logic.

## Output

- **Format:** Markdown (`.md`)
- **Location:** `.taskmaster/docs/`
- **Filename:** `prd-[feature-name].md`

## Final Instructions

1. Do NOT start implementing the PRD
2. Make sure to ask the user clarifying questions with lettered/numbered options for easy selection
3. Take the user's answers to the clarifying questions and generate a complete PRD following the example_prd.md structure
4. After saving the PRD, suggest using the `/parse` command to convert it into Task Master tasks
