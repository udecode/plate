# Research References

This document compiles the academic research that informed the design of the Learn skill.

## Core Papers

### Voyager: An Open-Ended Embodied Agent with Large Language Models

**Authors**: Wang, Xie, Jiang, Mandlekar, Xiao, Zhu, Fan, Anandkumar  
**Published**: May 2023  
**URL**: https://arxiv.org/abs/2305.16291

**Key Contribution**: First LLM-powered embodied lifelong learning agent with a skill library architecture.

**Relevant Concepts Applied**:

1. **Ever-Growing Skill Library**: Voyager maintains "an ever-growing skill library of executable code for storing and retrieving complex behaviors." This inspired our approach of extracting Claude Code skills as executable knowledge packages.

2. **Compositional Skills**: "The skills developed by Voyager are temporally extended, interpretable, and compositional, which compounds the agent's abilities rapidly and alleviates catastrophic forgetting." Our skill structure aims for similar composability.

3. **Self-Verification**: Voyager uses "self-verification for program improvement" before adding skills to the library. We implement similar quality gates before extraction.

4. **Iterative Prompting**: The "iterative prompting mechanism that incorporates environment feedback, execution errors" influenced our retrospective mode design.

---

### CASCADE: Cumulative Agentic Skill Creation through Autonomous Development and Evolution

**Authors**: [Research Team]  
**Published**: December 2024  
**URL**: https://arxiv.org/abs/2512.23880

**Key Contribution**: Self-evolving agentic framework demonstrating the transition from "LLM + tool use" to "LLM + skill acquisition."

**Relevant Concepts Applied**:

1. **Meta-Skills for Learning**: CASCADE demonstrates "continuous learning via web search and code extraction, and self-reflection via introspection." Our skill is itself a meta-skill for acquiring skills.

2. **Knowledge Codification**: "CASCADE accumulates executable skills that can be shared across agents" - this principle drives our skill extraction and storage approach.

3. **Memory Consolidation**: The framework uses memory consolidation to prevent forgetting and enable reuse. Our skill library serves a similar purpose.

---

### SEAgent: Self-Evolving Computer Use Agent with Autonomous Learning from Experience

**Authors**: Sun et al.  
**Published**: August 2025  
**URL**: https://arxiv.org/abs/2508.04700

**Key Contribution**: Framework enabling agents to autonomously evolve through interactions with unfamiliar software.

**Relevant Concepts Applied**:

1. **Experiential Learning**: "SEAgent empowers computer-use agents to autonomously master novel software environments via experiential learning, where agents explore new software, learn through iterative trial-and-error." Our retrospective mode captures this trial-and-error learning.

2. **Learning from Failures and Successes**: "The agent's policy is optimized through experiential learning from both failures and successes." We extract skills from both successful solutions and debugging processes.

3. **Curriculum Generation**: SEAgent uses a "Curriculum Generator" for increasingly diverse tasks. Our skill descriptions enable semantic matching to surface relevant skills.

---

### Reflexion: Language Agents with Verbal Reinforcement Learning

**Authors**: Shinn et al.  
**Published**: March 2023  
**URL**: https://arxiv.org/abs/2303.11366

**Key Contribution**: Framework for verbal reinforcement through linguistic feedback and self-reflection.

**Relevant Concepts Applied**:

1. **Self-Reflection Prompts**: "Reflexion converts feedback from the environment into linguistic feedback, also referred to as self-reflection." Our self-reflection prompts are directly inspired by this.

2. **Memory for Future Trials**: "These experiences (stored in long-term memory) are leveraged by the agent to rapidly improve decision-making." Skills serve as long-term memory.

3. **Verbal Reinforcement**: Instead of scalar rewards, Reflexion uses "nuanced feedback" in natural language. Our skill descriptions capture this nuanced knowledge.

---

### EvoFSM: Controllable Self-Evolution for Deep Research with Finite State Machines

**Authors**: [Research Team]  
**Published**: 2024

**Key Contribution**: Self-evolving framework with experience pools for continuous learning.

**Relevant Concepts Applied**:

1. **Self-Evolving Memory**: "EvoFSM integrates a Self-Evolving Memory mechanism, which distills successful strategies and failure patterns into an Experience Pool to enable continuous learning and warm-starting for future queries."

2. **Experience Pools**: The concept of storing strategies for later retrieval directly influenced our skill library design.

---

## Supporting Research

### Professional Agents: Evolving LLMs into Autonomous Experts

**URL**: https://arxiv.org/abs/2402.03628

Describes a framework for creating agents with specialized expertise through continuous learning. Influenced our quality criteria for what makes a skill worth extracting.

### Self-Reflection in LLM Agents: Effects on Problem-Solving Performance

**URL**: https://arxiv.org/abs/2405.06682

Empirical study showing self-reflection improves performance. Validated our use of reflection prompts for identifying extractable knowledge.

### Building Scalable and Reliable Agentic AI Systems

Comprehensive survey covering memory architectures, tool use, and continuous learning in agentic AI. Provided the broader architectural context for our design.

---

## Claude Code Skills Documentation

### Anthropic Engineering Blog: Equipping Agents for the Real World with Agent Skills

**URL**: https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills

**Key Insights**:

1. **Progressive Disclosure**: "Skills let Claude load information only as needed" - this enables scaling to many skills without context window bloat.

2. **Future Vision**: "We hope to enable agents to create, edit, and evaluate Skills on their own, letting them codify their own patterns of behavior into reusable capabilities." This skill is an implementation of this vision.

3. **Skill as Onboarding**: "Building a skill for an agent is like putting together an onboarding guide for a new hire." Our template follows this mental model.

### Claude Code Skills Documentation

**URL**: https://code.claude.com/docs/en/skills

**Key Insights**:

1. **SKILL.md Structure**: YAML frontmatter + markdown instructions
2. **Description Importance**: Semantic matching relies on good descriptions
3. **Allowed Tools**: Skills can restrict or enable specific tools
4. **Location Options**: User-level vs. project-level installation

---

## Design Patterns Applied

### From Voyager
- Skill library as executable code
- Self-verification before adding to library
- Compositional skill building

### From CASCADE
- Meta-skills for learning
- Knowledge codification into shareable format
- Memory consolidation

### From SEAgent
- Learning from both successes and failures
- Experiential learning through trial-and-error
- Progressive skill complexity

### From Reflexion
- Self-reflection prompts
- Verbal feedback over scalar rewards
- Long-term memory storage

### From EvoFSM
- Experience pools
- Distilling strategies from sessions
- Warm-starting future work

---

## Citation Format

If referencing this skill in academic work:

```
@misc{learn-skill,
  title={Learn: Autonomous Skill Extraction for LLM Agents},
  author={Claude Code},
  year={2024},
  note={Implements continuous learning patterns from Voyager, CASCADE, SEAgent, and Reflexion research}
}
```
