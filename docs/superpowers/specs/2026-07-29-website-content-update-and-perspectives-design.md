# Website content update & Perspectives section

## Context

Karel emailed a Word doc (`2026-07-27 Website update Stephan.docx`) with copy changes for
most sections of the one-page site, plus a question about adding a place to publish
periodic "Perspectives" PDFs he plans to promote on LinkedIn (~monthly).

## Part 1 — Content updates (from Karel's doc, no design decisions needed)

All text-only edits to existing markup/CSS structure in `index.html`. No new sections,
no structural changes.

- **Hero (`#home`)**: new headline "Helping Businesses Grow, Transform and Perform." and
  new subtitle paragraph about partnering with leadership teams/business owners/investors
  to accelerate growth, improve performance, lead transformation, drawing on 30+ years of
  international executive experience.
- **About (`#about`)**: restructure the prose into three labeled points (mirroring the
  `approach-card` pattern already used elsewhere): *Strategic Perspective*, *Operational
  Execution*, *Executive Experience* — each with the supplied one-paragraph description.
- **Background (`#experience`)**: leave unchanged.
- **Services (`#services`)**: keep card 1 (Strategy Definition & Execution) and card 4
  (Product Portfolio Management) titles; update all 6 subtitles/descriptions per doc.
  Rename card 2 → "Organizational Design & Leadership", card 3 → "Commercial Excellence",
  card 5 → "Operational Excellence & Manufacturing Transformation", card 6 → "M&A
  Integration & Value Creation".
- **Approach (`#approach`)**: keep section title/subtitle. Rename the three cards to
  *Executive Experience*, *Practical by Design*, *Lasting Impact* with the supplied body
  copy (replaces current Pragmatic/Structured/Hands-on).
- **Contact (`#contact`)**: replace intro copy with "Experience is valuable. Experience
  that delivers lasting results is invaluable." + paragraph about KZC being an independent
  executive advisory practice that collaborates with a trusted network of specialists.
  Phone/email/LinkedIn stay the same.

## Part 2 — Perspectives section (new feature)

**Decisions from brainstorming (approved):**
- Lives as a new homepage section (`#perspectives`), not a separate page.
- Added to the navbar between "Approach" and "Get in Touch".
- Entries are static hand-written HTML cards (title, date, short teaser, "Download PDF"
  link) — no JSON/JS data layer, consistent with how the rest of the site is built.
- Simple reverse-chronological grid, all cards equal weight (no "featured latest" layout).
- PDFs live in a new `/perspectives/` folder, named e.g. `YYYY-MM-short-slug.pdf`.
- Ships now with one placeholder card ("First Perspective — coming soon"), visually
  distinct (muted/dashed style) so the section reads as intentional, not broken.

**Structure:**
- New `.perspectives` section, positioned between Approach and Contact.
- Section header follows the existing `.section-tag` + `h2` + `.section-subtitle` pattern.
- Grid of `.perspective-card` elements (new CSS class, modeled on `.service-card`): each
  has a date label, title, teaser paragraph, and a download link/button.
- Placeholder card uses a `.perspective-card--placeholder` modifier class (dashed border,
  muted text, no download link).

**Monthly update workflow (for Stephan):**
1. Save the new PDF into `/perspectives/`.
2. Copy an existing `.perspective-card` block in `index.html`, paste it as the first card
   in the grid (newest first).
3. Edit date, title, teaser text, and the `href` to point at the new PDF filename.
4. Remove the placeholder card once a real first entry exists.

## Out of scope
- No CMS, JSON data file, or build tooling for Perspectives.
- No changes to the Background/experience section.
- No redesign of overall site layout/nav beyond the one new nav item.
