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
