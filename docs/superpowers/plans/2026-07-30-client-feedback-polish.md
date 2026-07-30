# Client Feedback Polish Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Karel's three final review comments to the website content pull request.

**Architecture:** This is a static HTML/CSS copy and spacing update. The existing hero and service-card structure remains unchanged; one desktop style rule and two text nodes are updated.

**Tech Stack:** HTML5, CSS3, browser-based visual verification

## Global Constraints

- Keep the existing mobile hero spacing unchanged.
- Preserve all section structure, navigation, icons, and responsive behavior.
- Change only the approved hero paragraph and module 6 description.

---

### Task 1: Apply the approved feedback

**Files:**
- Modify: `index.html`
- Modify: `styles.css`

**Interfaces:**
- Consumes: Existing `.hero`, `.hero-content`, `.hero-subtitle`, and `.service-card` markup and styles.
- Produces: Updated static page copy and desktop hero positioning.

- [ ] **Step 1: Capture the current text and spacing as a failing content check**

Run:

```bash
rg -n "Drawing on more than 30 years|transformation and[[:space:]]+execution|translateY\\(16px\\)" index.html styles.css
```

Expected: the old hero sentence and module 6 ending are present, while the desktop hero offset is absent.

- [ ] **Step 2: Apply the minimal HTML and CSS changes**

Replace the second hero paragraph with:

```html
<p class="hero-subtitle">We combine international executive experience with strategic thinking and
    practical execution to deliver measurable, sustainable results.</p>
```

Replace module 6's description with:

```html
<p>Maximizing acquisition value through effective integration, transformation and value realization.</p>
```

Add the desktop hero content offset:

```css
.hero-content {
    max-width: 900px;
    margin: 0 auto;
    text-align: center;
    transform: translateY(16px);
}
```

Reset the offset inside the existing `@media (max-width: 768px)` block:

```css
.hero-content {
    max-width: 100%;
    transform: none;
}
```

- [ ] **Step 3: Run exact content checks**

Run:

```bash
rg -n "We combine international executive experience|value realization|translateY\\(16px\\)|transform: none" index.html styles.css
```

Expected: all approved replacements and both responsive transform rules are present.

- [ ] **Step 4: Verify rendered layout**

Serve the repository locally and inspect the page at `1440x900`, `1024x768`, and `390x844`. Confirm the desktop heading is clearly separated from the fixed navigation, mobile retains its prior top spacing, and no text overlaps or overflows.

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css docs/superpowers/specs/2026-07-30-client-feedback-polish-design.md docs/superpowers/plans/2026-07-30-client-feedback-polish.md
git commit -m "Apply final client content feedback"
```
