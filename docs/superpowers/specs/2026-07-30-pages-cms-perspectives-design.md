# Pages CMS Perspectives Design

## Goal

Let Karel publish Perspective PDFs without editing HTML or asking a developer to deploy each update.

## Publishing Workflow

Karel opens the hosted Pages CMS editor, selects Perspectives, adds an item, enters its publication date, title, and teaser, uploads a PDF, and saves. Pages CMS commits the PDF and metadata to the repository's `main` branch. The existing Vercel Git integration deploys that commit.

## Content Model

Perspective metadata lives in a top-level JSON array at `perspectives.json`. Each entry contains:

- `date`: required `yyyy-MM-dd` publication date.
- `title`: required single-line title, up to 120 characters.
- `summary`: required plain-text teaser, 20 to 280 characters.
- `pdf`: required path to a PDF stored in `perspectives/`.

Pages CMS is configured through `.pages.yml`. PDF uploads are restricted to the `pdf` extension and renamed safely.

## Website Rendering

The site fetches `perspectives.json`, discards malformed entries, sorts valid entries newest first, and creates the existing card design with DOM APIs. Card text is assigned with `textContent`; PDF links must be same-site paths inside `perspectives/` and end in `.pdf`.

When the JSON array is empty, unavailable, or contains no valid entries, the existing "Coming soon" placeholder remains visible. Dynamically added cards participate in the existing Intersection Observer reveal animation.

## Scope

- No custom admin route, database, serverless function, or separate file storage.
- No drafts, scheduling, categories, rich text, or image uploads.
- No changes to other website content.
- Uploaded PDFs are public repository assets and public website downloads.
