const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const projectRoot = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(projectRoot, 'index.html'), 'utf8');

test('uses Karel Zimmermann Consulting consistently in public branding', () => {
    assert.doesNotMatch(html, /KZ\s*Advisory/i);
    assert.match(html, /<title>Karel Zimmermann Consulting \| Enabling Sustainable Performance<\/title>/);
    assert.match(html, /<meta property="og:site_name" content="Karel Zimmermann Consulting">/);
    assert.match(html, /<meta name="twitter:title" content="Karel Zimmermann Consulting \| Enabling Sustainable Performance">/);
    assert.match(html, /<script type="application\/ld\+json">[\s\S]*"name": "Karel Zimmermann Consulting"/);
});

test('keeps the 30 years experience proof point in the hero only', () => {
    const experienceMentions = html.match(/(?:30\+\s+years|more than 30 years)/gi) || [];

    assert.deepEqual(experienceMentions, []);
    assert.match(html, /<span class="stat-number">30\+<\/span>\s*<span class="stat-label">Years of international management experience<\/span>/);
    assert.match(html, /International executive leadership experience across global Food & Ingredient industries/);
});

test('uses the Karel Zimmermann Consulting text label in navigation', () => {
    assert.match(html, /<a href="#home" class="nav-logo">Karel Zimmermann Consulting<\/a>/);
});

test('centers the Karel Zimmermann Consulting logo in the footer', () => {
    assert.ok(fs.existsSync(path.join(projectRoot, 'footer-logo-centered.png')));
    assert.match(html, /<div class="footer-logo-wrapper">\s*<img src="footer-logo-centered\.png" alt="Karel Zimmermann Consulting" class="footer-logo">\s*<\/div>/);

    const css = fs.readFileSync(path.join(projectRoot, 'styles.css'), 'utf8');
    assert.match(css, /\.footer-logo-wrapper\s*\{[\s\S]*justify-content:\s*center;/);
    assert.match(css, /\.footer-logo\s*\{[\s\S]*width:\s*min\(320px, 90vw\);/);
});
