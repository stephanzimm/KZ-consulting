# Website Content Update & Perspectives Section Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply Karel's copy updates across the homepage and add a new "Perspectives" section where he can publish monthly PDF write-ups.

**Architecture:** This is a static site — one `index.html`, one `styles.css`, no build step, no test framework. "Tests" in this plan are `grep` assertions against the committed files plus a final manual browser check, not unit tests. Every task edits `index.html` and/or `styles.css` directly and is verified by grepping for the exact new strings and confirming the old strings are gone.

**Tech Stack:** Plain HTML5, CSS3 (custom properties already defined in `:root`), vanilla JS (inline `<script>` in `index.html`). No package manager, no server required — files can be opened directly or viewed via `open index.html`.

## Global Constraints

- Do not touch the `#experience` (Background) section — spec says leave as is.
- Do not change the phone number, email address, or LinkedIn URL in the Contact section.
- Reuse existing CSS custom properties (`--navy-dark`, `--teal`, `--gray-500`, `--section-padding`, `--shadow-sm`, `--shadow-lg`, `--transition-base`, etc.) — do not hardcode new colors.
- Match the existing card visual language (`.service-card` / `.approach-card`) for any new card component.
- Every new interactive element (cards) must be added to the `reveal` scroll-animation observer list in the inline script, same as existing cards.
- Commit after each task.

---

### Task 1: Hero section copy

**Files:**
- Modify: `index.html:39-41`

**Interfaces:** None (leaf content change, no other task depends on hero markup).

- [ ] **Step 1: Replace the hero heading and subtitle**

Find:
```html
            <h1>Improving performance through <span class="gradient-text">strategy, structure and execution</span></h1>
            <p class="hero-subtitle">Karel Zimmermann Consulting helps leadership teams achieve sustainable results
                through pragmatic, well-designed solutions that work in the real world.</p>
```

Replace with:
```html
            <h1>Helping Businesses <span class="gradient-text">Grow, Transform and Perform.</span></h1>
            <p class="hero-subtitle">Karel Zimmermann Consulting partners with leadership teams, business
                owners and investors to accelerate growth, improve performance and lead transformation.
                Drawing on more than 30 years of international executive experience, we combine strategic
                thinking with practical execution to deliver measurable, sustainable results.</p>
```

- [ ] **Step 2: Verify**

Run: `grep -n "Helping Businesses" index.html && grep -n "Improving performance through" index.html`
Expected: first grep prints a match, second grep prints nothing (exit code 1).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Update hero headline and subtitle copy"
```

---

### Task 2: About section — restructure into three labeled points

**Files:**
- Modify: `index.html:64-73` (`.about-content` block)
- Modify: `styles.css:394-409` (`.about-content p` / `.focus-statement` rules)
- Modify: `styles.css:1108-1118` (mobile `.focus-statement` override, inside the `768px` media query)

**Interfaces:**
- Produces: new CSS classes `.about-points` and `.about-point` (container + item), used only within `#about`. No other task depends on these.

- [ ] **Step 1: Replace the About section markup**

Find (`index.html`):
```html
                <div class="about-content">
                    <span class="section-tag">Who We Are</span>
                    <h2>Enabling Sustainable Performance</h2>
                    <p>Karel Zimmermann Consulting supports companies in improving performance by designing <strong>strategies</strong>,
                        <strong>structures</strong> and <strong>execution models</strong> that endure.</p>
                    <p>With broad international management experience across industries and geographies, we work as a
                        trusted partner to leadership teams navigating opportunities and challenges.</p>
                    <p class="focus-statement"><strong>Our focus is simple:</strong> clarity, ownership, and measurable
                        outcomes.</p>
                </div>
```

Replace with:
```html
                <div class="about-content">
                    <span class="section-tag">Who We Are</span>
                    <h2>Enabling Sustainable Performance</h2>
                    <div class="about-points">
                        <div class="about-point">
                            <h3>Strategic Perspective</h3>
                            <p>Helping leadership teams define winning strategies, prioritize opportunities,
                                and build businesses that are positioned for long-term success.</p>
                        </div>
                        <div class="about-point">
                            <h3>Operational Execution</h3>
                            <p>Transforming strategy into results through organizational alignment,
                                manufacturing excellence, commercial performance, and disciplined
                                execution.</p>
                        </div>
                        <div class="about-point">
                            <h3>Executive Experience</h3>
                            <p>More than 30 years of international executive leadership across global food
                                and ingredient businesses, bringing practical insight and a proven track
                                record of delivering sustainable value.</p>
                        </div>
                    </div>
                </div>
```

- [ ] **Step 2: Replace the now-unused `.focus-statement` CSS with `.about-points` / `.about-point` rules**

Find (`styles.css`, right after `.about-content p`):
```css
.about-content p {
    color: var(--gray-700);
    font-size: 1.1rem;
}

.focus-statement {
    margin-top: 24px;
    padding: 20px 24px;
    background: var(--gray-50);
    border-left: 4px solid var(--teal);
    border-radius: 0 8px 8px 0;
}
```

Replace with:
```css
.about-content p {
    color: var(--gray-700);
    font-size: 1.1rem;
}

.about-points {
    display: flex;
    flex-direction: column;
    gap: 28px;
    margin-top: 8px;
}

.about-point h3 {
    margin-bottom: 8px;
}

.about-point p {
    margin-bottom: 0;
}
```

- [ ] **Step 3: Remove the now-unused mobile `.focus-statement` override**

Find (`styles.css`, inside the `@media (max-width: 768px)` block, right after `.about-content p`'s mobile rule):
```css
    .about-content p {
        font-size: 1rem;
    }

    .focus-statement {
        padding: 16px 20px;
        font-size: 0.95rem;
    }
```

Replace with:
```css
    .about-content p {
        font-size: 1rem;
    }
```

- [ ] **Step 4: Verify**

Run: `grep -n "Strategic Perspective\|Operational Execution" index.html`
Expected: two matches (the `h3` for each point).

Run: `grep -n "focus-statement" index.html styles.css`
Expected: no matches in either file (exit code 1).

- [ ] **Step 5: Commit**

```bash
git add index.html styles.css
git commit -m "Restructure About section into three labeled points"
```

---

### Task 3: Services section — titles and subtitles

**Files:**
- Modify: `index.html:200-254` (all 6 `.service-card` blocks)

**Interfaces:** None (text-only; icons/structure unchanged).

**Note:** Card 1 and Card 4 keep their concept ("keep" per spec), but Karel's doc names them "Strategy Definition & Execution" and "Product Portfolio Management" exactly — card 1's current title has a trailing "Planning" that the doc doesn't include, so trim it to match his wording exactly.

- [ ] **Step 1: Update card 1 (Strategy)**

Find:
```html
                    <h3>Strategy Definition & Execution Planning</h3>
                    <p>Clear strategic choices with actionable roadmaps for implementation.</p>
```

Replace with:
```html
                    <h3>Strategy Definition & Execution</h3>
                    <p>Developing clear strategies and turning them into sustainable business results.</p>
```

- [ ] **Step 2: Update card 2 (Organizational Design → Organizational Design & Leadership)**

Find:
```html
                    <h3>Organizational Design</h3>
                    <p>Structures aligned with strategic priorities for optimal performance.</p>
```

Replace with:
```html
                    <h3>Organizational Design & Leadership</h3>
                    <p>Building organizations, leadership teams and governance models that enable high
                        performance.</p>
```

- [ ] **Step 3: Update card 3 (Commercial & Go-to-Market Effectiveness → Commercial Excellence)**

Find:
```html
                    <h3>Commercial & Go-to-Market Effectiveness</h3>
                    <p>Optimizing market approach for sustainable revenue growth.</p>
```

Replace with:
```html
                    <h3>Commercial Excellence</h3>
                    <p>Strengthening commercial capabilities to accelerate profitable and sustainable
                        growth.</p>
```

- [ ] **Step 4: Update card 4 (Product Portfolio Management)**

Find:
```html
                    <h3>Product Portfolio Management</h3>
                    <p>Strategic portfolio optimization for maximum impact.</p>
```

Replace with:
```html
                    <h3>Product Portfolio Management</h3>
                    <p>Creating focused product portfolios that support growth, profitability and
                        operational effectiveness.</p>
```

- [ ] **Step 5: Update card 5 (Incentive Alignment → Operational Excellence & Manufacturing Transformation)**

Find:
```html
                    <h3>Incentive Alignment</h3>
                    <p>Performance systems aligned with business priorities.</p>
```

Replace with:
```html
                    <h3>Operational Excellence & Manufacturing Transformation</h3>
                    <p>Improving operational performance through manufacturing excellence, organizational
                        alignment and disciplined execution.</p>
```

- [ ] **Step 6: Update card 6 (M&A Integration & Divestiture → M&A Integration & Value Creation)**

Find:
```html
                    <h3>M&A Integration & Divestiture</h3>
                    <p>Seamless integration and divestiture support.</p>
```

Replace with:
```html
                    <h3>M&A Integration & Value Creation</h3>
                    <p>Maximizing acquisition value through effective integration, transformation and
                        execution.</p>
```

- [ ] **Step 7: Verify**

Run: `grep -n "Organizational Design & Leadership\|Commercial Excellence\|Operational Excellence & Manufacturing Transformation\|M&A Integration & Value Creation" index.html`
Expected: four matches, one per renamed card.

Run: `grep -n "Incentive Alignment\|Divestiture\|Go-to-Market Effectiveness" index.html`
Expected: no matches (exit code 1).

- [ ] **Step 8: Commit**

```bash
git add index.html
git commit -m "Update services section titles and subtitles"
```

---

### Task 4: Approach section — rename the three pillars

**Files:**
- Modify: `index.html:269-286` (three `.approach-card` blocks)

**Interfaces:** None (text-only; section title/subtitle and `.approach-number` markup unchanged).

- [ ] **Step 1: Replace all three approach cards**

Find:
```html
                <div class="approach-card">
                    <div class="approach-number">01</div>
                    <h3>Pragmatic</h3>
                    <p>We focus on what works — clear choices, practical solutions, and actions that teams can implement
                        immediately.</p>
                </div>
                <div class="approach-card">
                    <div class="approach-number">02</div>
                    <h3>Structured</h3>
                    <p>We bring clarity through frameworks, decision paths, and well-designed processes that support
                        alignment and execution.</p>
                </div>
                <div class="approach-card">
                    <div class="approach-number">03</div>
                    <h3>Hands-on</h3>
                    <p>We work closely with leadership teams to ensure ownership, momentum, and measurable performance
                        improvement.</p>
                </div>
```

Replace with:
```html
                <div class="approach-card">
                    <div class="approach-number">01</div>
                    <h3>Executive Experience</h3>
                    <p>Drawing on more than 30 years of international executive leadership, we understand the
                        realities, responsibilities and decisions that leadership teams face every day.</p>
                </div>
                <div class="approach-card">
                    <div class="approach-number">02</div>
                    <h3>Practical by Design</h3>
                    <p>Every recommendation is shaped by real-world experience and focused on practical
                        solutions that can be implemented with confidence.</p>
                </div>
                <div class="approach-card">
                    <div class="approach-number">03</div>
                    <h3>Lasting Impact</h3>
                    <p>Our objective is not simply to solve today's challenges, but to help organizations
                        become stronger, more resilient and better positioned for the future.</p>
                </div>
```

- [ ] **Step 2: Verify**

Run: `grep -n "Executive Experience\|Practical by Design\|Lasting Impact" index.html`
Expected: at least three matches (one per card; "Executive Experience" may also match if Task 2 already ran, which is fine).

Run: `grep -n ">Pragmatic<\|>Structured<\|>Hands-on<" index.html`
Expected: no matches (exit code 1).

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Rename Approach section pillars"
```

---

### Task 5: Contact section intro copy

**Files:**
- Modify: `index.html:296-297`

**Interfaces:** None. Do not touch `contact-details` (phone/email/LinkedIn) below this block.

- [ ] **Step 1: Replace the heading and intro paragraph**

Find:
```html
                <h2>Ready to improve your organization's performance?</h2>
                <p>Let's discuss how we can help your leadership team achieve sustainable results.</p>
```

Replace with:
```html
                <h2>Experience is valuable. Experience that delivers lasting results is invaluable.</h2>
                <p>Karel Zimmermann Consulting is an independent executive advisory practice. Depending on
                    the nature and scope of an assignment, we collaborate with a trusted network of
                    experienced specialists to provide complementary expertise whenever it adds value.</p>
```

- [ ] **Step 2: Verify**

Run: `grep -n "Experience is valuable" index.html`
Expected: one match.

Run: `grep -n "zimmermannkarel1@gmail.com" index.html`
Expected: still 2 matches (unchanged `mailto:` link + contact-details entry) — confirms contact info wasn't touched.

- [ ] **Step 3: Commit**

```bash
git add index.html
git commit -m "Update contact section intro copy"
```

---

### Task 6: Add the Perspectives section, nav link, and CSS

**Files:**
- Modify: `index.html:22-27` (nav menu)
- Modify: `index.html` — insert new `<section id="perspectives">` between the closing `</section>` of Approach and the `<!-- Contact Section -->` comment
- Modify: `index.html:390` (reveal-animation `querySelectorAll` list)
- Modify: `styles.css` — new rules after the Approach section block (after line ~742, before the Contact section comment)
- Modify: `styles.css` — new reveal stagger rules after `.approach-card.reveal:nth-child(3)` (~line 921)
- Modify: `styles.css` — new mobile rules inside `@media (max-width: 768px)`, after the Approach mobile rules (~line 1237, right before `/* Contact */`)
- Create: `perspectives/README.md`

**Interfaces:**
- Produces: `.perspectives`, `.perspectives-grid`, `.perspective-card`, `.perspective-card--placeholder`, `.perspective-date`, `.perspective-link` CSS classes, and the `perspectives/` folder where PDFs are dropped. Future monthly updates only touch the `.perspectives-grid` contents in `index.html` and add a file to `perspectives/` — no other task or file needs to change.

- [ ] **Step 1: Add the nav link**

Find (`index.html`):
```html
                <li><a href="#approach">Approach</a></li>
                <li><a href="#contact" class="nav-cta">Get in Touch</a></li>
```

Replace with:
```html
                <li><a href="#approach">Approach</a></li>
                <li><a href="#perspectives">Perspectives</a></li>
                <li><a href="#contact" class="nav-cta">Get in Touch</a></li>
```

- [ ] **Step 2: Insert the Perspectives section**

Find (`index.html`, the boundary between Approach and Contact):
```html
    </section>

    <!-- Contact Section -->
```

Replace with:
```html
    </section>

    <!-- Perspectives Section -->
    <section id="perspectives" class="perspectives">
        <div class="container">
            <div class="section-header">
                <span class="section-tag">Perspectives</span>
                <h2>Perspectives on strategy, performance and transformation</h2>
                <p class="section-subtitle">Periodic insights, published as a short read with an in-depth
                    PDF.</p>
            </div>
            <div class="perspectives-grid">
                <div class="perspective-card perspective-card--placeholder">
                    <span class="perspective-date">Coming soon</span>
                    <h3>First Perspective — coming soon</h3>
                    <p>New Perspectives will be published here periodically. Check back soon for the first
                        edition.</p>
                </div>
            </div>
        </div>
    </section>

    <!-- Contact Section -->
```

- [ ] **Step 3: Add `.perspective-card` to the scroll-reveal observer list**

Find (`index.html`, inline script near the bottom):
```javascript
        document.querySelectorAll('.service-card, .approach-card, .about-content, .about-image, .career-item').forEach(el => {
```

Replace with:
```javascript
        document.querySelectorAll('.service-card, .approach-card, .perspective-card, .about-content, .about-image, .career-item').forEach(el => {
```

- [ ] **Step 4: Add the Perspectives CSS block**

Find (`styles.css`, the boundary between the Approach section rules and the Contact section comment):
```css
.approach-card p {
    color: var(--gray-500);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 0;
}

/* ========================================
   Contact Section
   ======================================== */
```

Replace with:
```css
.approach-card p {
    color: var(--gray-500);
    font-size: 1rem;
    line-height: 1.7;
    margin-bottom: 0;
}

/* ========================================
   Perspectives Section
   ======================================== */

.perspectives {
    padding: var(--section-padding) 0;
    background: var(--gray-50);
}

.perspectives-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
}

.perspective-card {
    background: var(--white);
    padding: 32px;
    border-radius: 16px;
    box-shadow: var(--shadow-sm);
    transition: all var(--transition-base);
}

.perspective-card:hover {
    transform: translateY(-8px);
    box-shadow: var(--shadow-lg);
}

.perspective-date {
    display: inline-block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--teal);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 12px;
}

.perspective-card h3 {
    margin-bottom: 12px;
}

.perspective-card p {
    color: var(--gray-500);
    font-size: 0.95rem;
    margin-bottom: 20px;
}

.perspective-link {
    font-weight: 600;
}

.perspective-card--placeholder {
    background: transparent;
    border: 2px dashed var(--gray-300);
    box-shadow: none;
}

.perspective-card--placeholder:hover {
    transform: none;
    box-shadow: none;
}

.perspective-card--placeholder .perspective-date {
    color: var(--gray-500);
}

.perspective-card--placeholder p {
    margin-bottom: 0;
}

/* ========================================
   Contact Section
   ======================================== */
```

- [ ] **Step 5: Add reveal stagger rules for `.perspective-card`**

Find (`styles.css`, right after the approach-card stagger rules):
```css
.approach-card.reveal:nth-child(1) {
    transition-delay: 0s;
}

.approach-card.reveal:nth-child(2) {
    transition-delay: 0.15s;
}

.approach-card.reveal:nth-child(3) {
    transition-delay: 0.3s;
}

/* ========================================
   Responsive Design
   ======================================== */
```

Replace with:
```css
.approach-card.reveal:nth-child(1) {
    transition-delay: 0s;
}

.approach-card.reveal:nth-child(2) {
    transition-delay: 0.15s;
}

.approach-card.reveal:nth-child(3) {
    transition-delay: 0.3s;
}

.perspective-card.reveal:nth-child(1) {
    transition-delay: 0s;
}

.perspective-card.reveal:nth-child(2) {
    transition-delay: 0.15s;
}

.perspective-card.reveal:nth-child(3) {
    transition-delay: 0.3s;
}

/* ========================================
   Responsive Design
   ======================================== */
```

- [ ] **Step 6: Add the mobile (768px) collapse rule for the Perspectives grid**

Find (`styles.css`, inside `@media (max-width: 768px)`, the Approach mobile rules right before the Contact comment):
```css
    .approach-card p {
        font-size: 0.95rem;
    }

    /* Contact */
```

Replace with:
```css
    .approach-card p {
        font-size: 0.95rem;
    }

    /* Perspectives */
    .perspectives-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .perspective-card {
        padding: 28px 24px;
    }

    /* Contact */
```

- [ ] **Step 7: Create the `perspectives/` folder with a workflow README**

Create `perspectives/README.md`:
```markdown
# Adding a new Perspective

1. Save the PDF here, named like `2026-08-example-slug.pdf` (year-month-short-title).
2. In `index.html`, find the `.perspectives-grid` div and copy this card as the
   **first** child (newest first):

   ```html
   <div class="perspective-card">
       <span class="perspective-date">August 2026</span>
       <h3>Title of the Perspective</h3>
       <p>One to two sentence teaser describing what this Perspective covers.</p>
       <a href="perspectives/2026-08-example-slug.pdf" class="perspective-link"
           target="_blank" rel="noopener noreferrer">Download PDF →</a>
   </div>
   ```
3. Edit the date, title, teaser, and `href` to match the new PDF.
4. The first time you do this, delete the placeholder card
   (`perspective-card--placeholder`) already in the grid.
```

- [ ] **Step 8: Verify**

Run: `grep -n 'href="#perspectives"' index.html`
Expected: one match.

Run: `grep -n "perspectives-grid\|perspective-card" index.html styles.css`
Expected: matches in both files (markup in `index.html`, rules in `styles.css`).

Run: `test -f perspectives/README.md && echo OK`
Expected: prints `OK`.

- [ ] **Step 9: Commit**

```bash
git add index.html styles.css perspectives/README.md
git commit -m "Add Perspectives section, nav link, and monthly-update workflow"
```

---

### Task 7: Final visual QA

**Files:** None modified — verification only.

**Interfaces:** N/A.

- [ ] **Step 1: Open the page locally**

Run: `open index.html` (macOS default browser) — or use a Chrome automation tool if available in the session — and visually confirm:
- Hero renders the new headline/subtitle without visually overflowing the viewport on a normal laptop width.
- About section shows three stacked labeled points instead of the old paragraphs.
- All 6 service cards show their new titles/subtitles.
- All 3 approach cards show the renamed pillars.
- Contact section shows the new heading/paragraph; phone/email/LinkedIn links still work.
- New Perspectives section appears between Approach and Contact, nav link scrolls to it, placeholder card is visually distinct (dashed border) from a normal card.
- Resize the window to a narrow (mobile) width and confirm the Perspectives grid collapses to one column like Services/Approach do.

- [ ] **Step 2: Fix any visual issues found**

If the hero text overflows on short viewports, or any grid fails to collapse on mobile, fix inline in `index.html`/`styles.css` and re-check. No separate task needed — this is QA, not new scope.

- [ ] **Step 3: Final commit (only if Step 2 required changes)**

```bash
git add index.html styles.css
git commit -m "Fix visual QA issues from content update"
```
