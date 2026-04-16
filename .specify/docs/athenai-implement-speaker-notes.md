# Speaker notes — “How we shipped the Countdown block”

*Tone: you’re telling a story to peers who build things, not reading a checklist.*

---

## Why this talk exists

- You’ve felt the gap between “we have a spec” and “it’s on the page.”
- This flow is one way to **close that gap without losing your mind** — design, plan, code, proof, in one lane.

---

## The ask (in one breath)

- A real block: countdown, Figma on three breakpoints, a written spec, and **flags that change how hard the machine runs** — no parallel agents, no test-case CSV this round.
- *Emotion:* “We weren’t proving the block only — we were proving the **pipeline**.”

---

## Flags = respect for the room

- `--no-parallel` — *I want one brain, one timeline; no subagent fan-out.*
- `--no-test-cases` — *We’re not generating CSV tests this pass; speed and focus.*
- Say it plainly: **trade-offs, not weaknesses.**

---

## Before the magic: the gate

- Dev server on 3000. No server, no story.
- Spec must exist and breathe: stories, acceptance criteria, content model.
- *Feeling:* “This isn’t bureaucracy — it’s **what saves you from building the wrong thing beautifully.**”

---

## The clock starts

- A run ID, a timer — not for vanity, for **honesty** about where time goes.
- *Line you can use:* “We’re not hiding that design and implementation eat minutes — we **name** them.”

---

## Phase 0 — Design isn’t a PDF, it’s a contract

- Three Figma frames → one `design.md`: typography, layout matrix, **mobile-first** CSS order.
- Figma gives React-ish noise; the job is **translate into our world** — vanilla CSS, block scope, tokens.
- Assets: we **don’t** blindly overwrite `drafts/media` — respect what’s already there.
- *Emotion:* “The design file stops being a screenshot hunt and becomes **something the implementer can actually follow.**”

---

## While design breathes: draft content in the background

- A generator chewing on the spec **while** Phase 0 runs — parallel human time, not parallel *confusion*.
- *Punch line:* “By the time we planned, **the playground HTML already existed.**”

---

## Phase 1 — Plan is where ambiguity dies

- `plan.md`: architecture, **authored HTML** as the DOM really looks, **parsing pseudocode**, tasks for a Standard block.
- Complexity: not everything is “Complex” — **Standard** keeps tasks inline; no fake Phase 2 ceremony.
- *Speaker beat:* “If you can’t describe the rows and keys, you don’t get to write `decorate()` yet.”

---

## The draft page: structure is everything

- `.plain.html` — no fake `<html>` shell; the platform wraps it.
- **One outer wrapper** so blocks aren’t direct children of `main` in a way that breaks `decorateBlocks`.
- Edge cases in the draft: past date, garbage date, bad timezone — **the spec’s fear list, on the page.**
- *Emotion:* “These aren’t ‘extra sections’ — they’re **trust** that we won’t white-screen when authors typo.”

---

## Phase 3 — Hands on the keyboard

- Read the build skill, then **building-blocks** — conventions before cleverness.
- JS: parse config, build DOM, **wall-clock** countdown (tabs throttle; we don’t drift), `Number.isFinite` on the target instant — **NaN is real.**
- ARIA: `role="timer"` plus a **quiet** live region on a slower cadence — urgency for sighted users, **dignity** for screen reader users.
- CSS: `main .countdown …`, modern color syntax, no `!important`, **lint-clean first shot** where possible.
- *Line:* “We’re not fighting the boilerplate — we’re **earning** the right to ship.”

---

## Phase 4 — Skipped on purpose

- No `testcases.csv` this run — say why: **scope, time, or already covered elsewhere.**
- *Don’t apologize* — name it as a **conscious cut.**

---

## Phase 5 — Verify without fooling yourself

- File exists, **no forbidden root tags**, nesting matches how AEM walks the tree.
- Timer finalize + report — **wall time** for the story you tell leadership.
- *Closing beat:* “We didn’t ‘finish’ — we **closed the loop** with artifacts and numbers.”

---

## What I’d leave them with

- **Spec** = behavior and author contract. **Design** = pixels and tokens. **Plan** = bridge. **Code** = proof.
- Flags tune **parallelism and rigor** — the pipeline serves the team, not the other way around.
- *Optional kicker:* “Seven minutes of tracked flow isn’t the whole project — but it’s **every** project in miniature: decide, document, build, verify.”

---

## If they ask one thing

- *“Was it worth the ceremony?”*  
  → **Yes, when the next person opens the repo and doesn’t need you in the room.**

---

*End — use the headlines as anchors; the room fills in from your experience.*
