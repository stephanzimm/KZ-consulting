# Publishing a Perspective

Perspectives are managed through the hosted Pages CMS editor.

## One-time repository setup

1. Sign in at `https://app.pagescms.org` with the GitHub account that owns this repository.
2. Install the Pages CMS GitHub App and grant it access to `KZ-consulting`.
3. Open the repository's `main` branch in Pages CMS.
4. Invite Karel as a collaborator by email if he will not use a GitHub account.

## Publishing

1. Open **Perspectives** in Pages CMS.
2. Add an item and enter its publication date, title, and teaser.
3. Select or upload its PDF.
4. Save the entry.

Pages CMS writes the metadata to `perspectives.json` and stores the uploaded PDF
in this directory. The website sorts entries newest first, and Vercel deploys
the saved commit automatically.
