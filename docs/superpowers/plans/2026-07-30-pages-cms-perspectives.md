# Pages CMS Perspectives Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a self-service Pages CMS workflow for publishing Perspective PDFs.

**Architecture:** Pages CMS writes a top-level JSON array and PDF files directly to GitHub. A small browser module validates and renders the JSON into the existing Perspectives grid, preserving the static placeholder as the failure and empty state.

**Tech Stack:** Pages CMS, JSON, vanilla JavaScript, Node.js built-in test runner, HTML5, CSS3

## Global Constraints

- Content fields are exactly `date`, `title`, `summary`, and `pdf`.
- PDF paths must stay inside `/perspectives/` and end in `.pdf`.
- Empty, unavailable, and invalid data must retain the existing placeholder.
- Valid entries render newest first using text-only DOM assignments.
- Existing card styling and reveal animations remain in use.

---

### Task 1: Perspective data and rendering module

**Files:**
- Create: `tests/perspectives.test.js`
- Create: `perspectives.js`
- Modify: `index.html`

**Interfaces:**
- Produces: `window.Perspectives.loadPerspectives(options)` for browser startup.
- Produces: CommonJS exports for `normalizePerspectives`, `formatPerspectiveDate`, `createPerspectiveCard`, and `loadPerspectives`.

- [ ] **Step 1: Write tests for validation, sorting, safe rendering, and fallback behavior**

Use Node's built-in `node:test` and `node:assert/strict`. Tests must prove that malformed records are removed, valid records sort newest first, dates render as English month and year, card text is not treated as HTML, only approved PDF paths become links, successful loads replace the placeholder, and empty or failed loads preserve it.

- [ ] **Step 2: Run tests and verify they fail because the module is absent**

Run:

```bash
node --test tests/perspectives.test.js
```

Expected: FAIL because the Perspectives implementation does not exist.

- [ ] **Step 3: Implement the browser module and wire it into the page**

Create `perspectives.js` as a dependency-free browser/CommonJS module. Load it before the existing inline script and call `loadPerspectives` after the Intersection Observer is created.

- [ ] **Step 4: Run tests and verify they pass**

Run:

```bash
node --test tests/perspectives.test.js
```

Expected: all Perspective tests pass with zero failures.

### Task 2: Pages CMS content configuration

**Files:**
- Create: `.pages.yml`
- Create: `perspectives.json`
- Modify: `perspectives/README.md`

**Interfaces:**
- Consumes: The JSON schema expected by `perspectives.js`.
- Produces: A hosted Pages CMS editor for the top-level `perspectives.json` array and PDF uploads under `perspectives/`.

- [ ] **Step 1: Add static configuration assertions**

Extend `tests/perspectives.test.js` to assert that `.pages.yml` targets `perspectives.json`, uses a top-level list, configures all four fields, restricts the file field and media source to PDF, and writes media URLs under `/perspectives`.

- [ ] **Step 2: Run tests and verify the configuration assertions fail**

Run:

```bash
node --test tests/perspectives.test.js
```

Expected: FAIL because `.pages.yml` and `perspectives.json` do not exist.

- [ ] **Step 3: Add the Pages CMS configuration and empty data file**

Configure a single `Perspectives` file editor with the approved field constraints. Initialize `perspectives.json` as `[]` and replace the manual HTML instructions in `perspectives/README.md` with the Pages CMS publishing workflow.

- [ ] **Step 4: Validate YAML and run the full test suite**

Run:

```bash
ruby -e "require 'yaml'; YAML.load_file('.pages.yml'); puts 'YAML valid'"
node --test tests/perspectives.test.js
```

Expected: YAML parses and all tests pass.

### Task 3: Browser verification

**Files:**
- Verify: `index.html`
- Verify: `styles.css`
- Verify: `perspectives.js`

**Interfaces:**
- Consumes: The completed static site and a temporary valid `perspectives.json` fixture.
- Produces: Evidence that empty and populated states render correctly.

- [ ] **Step 1: Verify the empty state**

Serve the repository locally and inspect the Perspectives section at `1440x900`, `1024x768`, and `390x844`. Confirm the existing placeholder remains centered with no console errors.

- [ ] **Step 2: Verify a populated state**

Temporarily serve valid sample data without committing it. Confirm cards sort newest first, PDF links point to `/perspectives/*.pdf`, reveal animations apply, and there is no overflow or overlap at all three viewports.

- [ ] **Step 3: Run final integrity checks and commit**

Run:

```bash
node --test tests/perspectives.test.js
ruby -e "require 'yaml'; YAML.load_file('.pages.yml'); puts 'YAML valid'"
git diff --check
```

Expected: all commands exit successfully.
