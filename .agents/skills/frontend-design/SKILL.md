---
name: frontend-design
description: >-
  Guidance for distinctive, intentional visual design when building new UI or
  reshaping an existing one. Helps with aesthetic direction, typography, layout,
  and making choices that do not read as templated defaults or AI slop.
---

# Frontend Design — Distinctive & Intentional Visual Design

Guidance for distinctive, intentional visual design when building new UI or reshaping an existing one. Helps with aesthetic direction, typography, and making choices that don't read as templated defaults.

## Approach: Design Lead Mindset

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. This client has already rejected proposals that felt templated, and is paying for a distinctive point of view: make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

---

## 1. Ground It in the Subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in your memory about the human's preferences, context about what they're building, or designs you've made before – use that as a hint. 

The subject's own world—its materials, instruments, artifacts, and vernacular—is where distinctive choices come from. Build with the brief's real content and subject matter throughout.

---

## 2. Design Principles

### The Hero is a Thesis
For web designs, the hero is a thesis. Open with the most characteristic thing in the subject's world, in whatever form makes sense for it: a headline, an image, an animation, a live demo, an interactive moment. Be deliberate with your choice: a big number with a small label, supporting stats, and a gradient accent is the template answer—only use if that's truly the best option.

### Typography Carries Personality
Typography carries the personality of the page. Pair the display and body faces deliberately, not the same families you would reach for on any other project, and set a clear type scale with intentional weights, widths, and spacing. Make the type treatment itself a memorable part of the design, not a neutral delivery vehicle for the content.

### Structure is Information
Structural devices—numbering, eyebrows, dividers, labels—should encode something true about the content, not decorate it. Many generic designs use numbered markers (`01` / `02` / `03`), but that's only appropriate if the content actually is a sequence, like a real process or a typed timeline where order carries information the reader needs. Question if choices like numbered markers actually make sense before incorporating them.

### Leverage Motion Deliberately
Think about where and if animation can serve the subject: a page-load sequence, a scroll-triggered reveal, hover micro-interactions, ambient atmosphere. An orchestrated moment usually lands harder than scattered effects; choose what the direction calls for. However, sometimes less is more, and extra animation contributes to the feeling that the design is AI-generated.

### Match Complexity to the Vision
Maximalist directions need elaborate execution; minimal directions need precision in spacing, type, and detail. Elegance is executing the chosen vision well.

### Consider Written Content Carefully
Often a design brief may not contain real content, and it's up to you to come up with copy. Copy can make a design feel as templated as the design itself.

---

## 3. Process: Brainstorm, Explore, Plan, Critique, Build, Critique Again

### Calibration: Avoid the Three AI Design Clusters
AI-generated design right now clusters around three looks:
1. A warm cream background (near `#F4F1EA`) with a high-contrast serif display and a terracotta or warm-clay accent (often near `#D97757`).
2. A near-black background with a single bright acid-green or vermilion accent.
3. A broadsheet-style layout with hairline rules, zero border-radius, and dense newspaper-like columns.

All three are legitimate for some briefs, but they are defaults rather than choices, and they appear regardless of subject. Where the brief pins down a visual direction, follow it exactly. Where it leaves an axis free, don't spend that freedom on one of these defaults.

### Work in Two Passes

#### Pass 1: Design Plan
Brainstorm a short design plan based on the human's design brief: create a compact token system with color, type, layout, and signature:
* **Color**: Describe the palette as 4–6 named hex values.
* **Type**: Typefaces for 2+ roles (a characterful display face used with restraint, a complementary body face, and a utility face for captions/data if needed).
* **Layout**: A layout concept using one-sentence prose descriptions and ASCII wireframes to ideate and compare.
* **Signature**: The single unique element this page will be remembered by that embodies the brief in an appropriate way.

#### Pass 2: Review & Critique Before Building
Review that plan against the brief before building: if any part of it reads like the generic default you would produce for any similar page rather than a choice made for this specific brief — revise that part, say what you changed and why. Only after confirming the relative uniqueness of your design plan, start writing code following the revised plan exactly.

#### Code Construction Rules
* Be careful of structuring CSS selector specificities. Avoid classes canceling each other out (especially type-based selectors vs element-based selectors like `.section` and `.cta`), which happens often with paddings/margins between sections.
* Do planning and iteration internally, showing ideas with high confidence.

---

## 4. Restraint and Self-Critique

* **Spend boldness in one place**: Let the signature element be the one memorable thing, keep everything around it quiet and disciplined, and cut decoration that does not serve the brief. Not taking a risk can be a risk itself!
* **Build to a quality floor without announcing it**: Responsive down to mobile, visible keyboard focus, reduced motion respected.
* **Critique as you build**: Take screenshots if supported. Consider Chanel's advice: *before leaving the house, look in the mirror and remove one accessory*.

---

## 5. Writing in Design (Copy Doctrine)

Words appear in a design for one reason: to make it easier to understand, and therefore easier to use. They are design material, not decoration. Bring the same intentionality to copy that you would bring to spacing and color.

* **Write from the end user's side**: Name things by what people control and recognize, never by how the system is built. A person manages notifications, not webhook config. Describe what something does in plain terms rather than selling it. Being specific is always better than being clever.
* **Use active voice as default**: A control should say exactly what happens when it's used ("Save changes", not "Submit"). An action keeps the same name through the whole flow (e.g., button "Publish" -> toast "Published").
* **Direction over mood for failure/emptiness**: Explain what went wrong and how to fix it in the interface's voice. Errors don't apologize and are never vague. An empty screen is an invitation to act.
* **Conversational, tuned register**: Plain verbs, sentence case, no filler, tone matched to brand and audience. Let each element do exactly one job.
