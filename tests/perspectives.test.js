const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

let Perspectives = {};

try {
    Perspectives = require('../perspectives.js');
} catch (error) {
    if (error.code !== 'MODULE_NOT_FOUND') {
        throw error;
    }
}

function createMockDocument() {
    return {
        createElement(tagName) {
            const element = {
                tagName: tagName.toUpperCase(),
                className: '',
                textContent: '',
                children: [],
                append(...children) {
                    this.children.push(...children);
                }
            };

            element.classList = {
                add(className) {
                    const classNames = new Set(element.className.split(' ').filter(Boolean));
                    classNames.add(className);
                    element.className = [...classNames].join(' ');
                }
            };

            return element;
        }
    };
}

test('normalizes valid perspectives and sorts them newest first', () => {
    assert.equal(typeof Perspectives.normalizePerspectives, 'function');

    const result = Perspectives.normalizePerspectives([
        {
            date: '2026-05-10',
            title: 'Older perspective',
            summary: 'A sufficiently detailed summary for the older perspective.',
            pdf: '/perspectives/older.pdf'
        },
        {
            date: 'invalid',
            title: 'Invalid perspective',
            summary: 'A sufficiently detailed summary for the invalid perspective.',
            pdf: '/perspectives/invalid.pdf'
        },
        {
            date: '2026-08-15',
            title: 'Newest perspective',
            summary: 'A sufficiently detailed summary for the newest perspective.',
            pdf: '/perspectives/newest.pdf'
        },
        {
            date: '2026-07-01',
            title: 'Unsafe PDF',
            summary: 'A sufficiently detailed summary with an unsafe PDF link.',
            pdf: 'https://example.com/file.pdf'
        }
    ]);

    assert.deepEqual(result.map(item => item.title), [
        'Newest perspective',
        'Older perspective'
    ]);
});

test('formats publication dates as an English month and year', () => {
    assert.equal(typeof Perspectives.formatPerspectiveDate, 'function');
    assert.equal(Perspectives.formatPerspectiveDate('2026-08-15'), 'August 2026');
});

test('creates a card with literal text and a protected PDF link', () => {
    assert.equal(typeof Perspectives.createPerspectiveCard, 'function');

    const card = Perspectives.createPerspectiveCard(createMockDocument(), {
        date: '2026-08-15',
        title: '<img src=x onerror=alert(1)>',
        summary: '<script>alert("unsafe")</script> remains plain text.',
        pdf: '/perspectives/safe-file.pdf'
    });

    assert.equal(card.className, 'perspective-card');
    assert.equal(card.children[0].textContent, 'August 2026');
    assert.equal(card.children[1].textContent, '<img src=x onerror=alert(1)>');
    assert.equal(card.children[2].textContent, '<script>alert("unsafe")</script> remains plain text.');
    assert.equal(card.children[3].href, '/perspectives/safe-file.pdf');
    assert.equal(card.children[3].target, '_blank');
    assert.equal(card.children[3].rel, 'noopener noreferrer');
    assert.equal(card.children[3].textContent, 'Download PDF →');
});

test('creates distinct featured and recent Perspective treatments', () => {
    assert.equal(typeof Perspectives.createFeaturedPerspective, 'function');
    assert.equal(typeof Perspectives.createRecentPerspective, 'function');

    const perspective = {
        date: '2026-10-05',
        title: 'Latest perspective',
        summary: 'A sufficiently detailed summary for the latest perspective.',
        pdf: '/perspectives/latest.pdf',
        page: '/perspectives/latest.html'
    };
    const featured = Perspectives.createFeaturedPerspective(createMockDocument(), perspective);
    const recent = Perspectives.createRecentPerspective(createMockDocument(), perspective);

    assert.equal(featured.className, 'perspective-feature');
    assert.equal(featured.children[0].textContent, 'Latest Perspective');
    assert.equal(featured.children[1].textContent, 'October 2026');
    assert.equal(featured.children[2].textContent, 'Latest perspective');
    assert.equal(featured.children[3].textContent, perspective.summary);
    assert.equal(featured.children[4].href, perspective.page);
    assert.equal(featured.children[4].textContent, 'Read Perspective →');

    assert.equal(recent.className, 'perspective-recent-item');
    assert.equal(recent.children[0].textContent, 'October 2026');
    assert.equal(recent.children[1].textContent, 'Latest perspective');
    assert.equal(recent.children[2].href, perspective.page);

    const pdfOnlyRecent = Perspectives.createRecentPerspective(createMockDocument(), {
        ...perspective,
        page: ''
    });

    assert.equal(pdfOnlyRecent.children[2].textContent, 'Download PDF →');
});

test('loads the latest Perspective as a feature and limits the recent rail to three', async () => {
    assert.equal(typeof Perspectives.loadPerspectives, 'function');

    const featured = {
        children: [{ className: 'perspective-feature--placeholder' }],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    const recent = {
        children: [{ className: 'perspective-recent--placeholder' }],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    const observer = {
        observed: [],
        observe(element) {
            this.observed.push(element);
        }
    };
    const fetch = async () => ({
        ok: true,
        async json() {
            return [
                ...Array.from({ length: 5 }, (_, index) => ({
                    date: `2026-0${index + 1}-01`,
                    title: `Perspective ${index + 1}`,
                    summary: `A sufficiently detailed summary for Perspective ${index + 1}.`,
                    pdf: `/perspectives/perspective-${index + 1}.pdf`
                }))
            ];
        }
    });

    const count = await Perspectives.loadPerspectives({
        document: createMockDocument(),
        featured,
        recent,
        fetch,
        observer
    });

    assert.equal(count, 5);
    assert.equal(featured.children.length, 1);
    assert.equal(featured.children[0].children[2].textContent, 'Perspective 5');
    assert.deepEqual(recent.children.map(item => item.children[1].textContent), [
        'Perspective 4',
        'Perspective 3',
        'Perspective 2'
    ]);
    assert.equal(observer.observed.length, 4);
    assert.ok(featured.children[0].className.includes('reveal'));
    assert.ok(recent.children.every(item => item.className.includes('reveal')));
});

test('keeps homepage placeholders when Perspective data cannot be loaded', async () => {
    const featuredPlaceholder = { className: 'perspective-feature--placeholder' };
    const recentPlaceholder = { className: 'perspective-recent--placeholder' };
    const featured = {
        children: [featuredPlaceholder],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    const recent = {
        children: [recentPlaceholder],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    let reportedError;

    const count = await Perspectives.loadPerspectives({
        document: createMockDocument(),
        featured,
        recent,
        fetch: async () => {
            throw new Error('offline');
        },
        observer: { observe() {} },
        onError(error) {
            reportedError = error;
        }
    });

    assert.equal(count, 0);
    assert.equal(featured.children[0], featuredPlaceholder);
    assert.equal(recent.children[0], recentPlaceholder);
    assert.equal(reportedError.message, 'offline');
});

test('shows intentional homepage empty states for an empty collection', async () => {
    const featured = {
        children: [],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    const recent = {
        children: [],
        replaceChildren(...children) {
            this.children = children;
        }
    };

    const count = await Perspectives.loadPerspectives({
        document: createMockDocument(),
        featured,
        recent,
        fetch: async () => ({
            ok: true,
            async json() {
                return [];
            }
        }),
        observer: { observe() {} }
    });

    assert.equal(count, 0);
    assert.equal(featured.children[0].children[1].textContent, 'More Perspectives are coming soon.');
    assert.equal(recent.children[0].children[1].textContent, 'The collection will grow here.');
});

test('loads every valid Perspective into the archive', async () => {
    assert.equal(typeof Perspectives.loadPerspectiveArchive, 'function');

    const grid = {
        children: [],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    const observer = { observe() {} };
    const count = await Perspectives.loadPerspectiveArchive({
        document: createMockDocument(),
        grid,
        fetch: async () => ({
            ok: true,
            async json() {
                return [
                    {
                        date: '2026-08-01',
                        title: 'Newest',
                        summary: 'A sufficiently detailed summary for the newest item.',
                        pdf: '/perspectives/newest.pdf'
                    },
                    {
                        date: '2026-07-01',
                        title: 'Older',
                        summary: 'A sufficiently detailed summary for the older item.',
                        pdf: '/perspectives/older.pdf'
                    }
                ];
            }
        }),
        dataUrl: '../perspectives.json',
        observer
    });

    assert.equal(count, 2);
    assert.deepEqual(grid.children.map(card => card.children[1].textContent), ['Newest', 'Older']);
});

test('loads the Perspective module and starts it with the page observer', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    assert.match(html, /<script src="perspectives\.js"><\/script>/);
    assert.match(html, /class="perspective-feature-slot"/);
    assert.match(html, /class="perspectives-recent-list"/);
    assert.match(html, /href="perspectives\/"/);
    assert.match(html, /Perspectives\.loadPerspectives\(\{/);
    assert.match(html, /featured: document\.querySelector\('\.perspective-feature-slot'\)/);
    assert.match(html, /recent: document\.querySelector\('\.perspectives-recent-list'\)/);
});

test('provides a dedicated Perspective archive page', () => {
    const archivePath = path.join(__dirname, '..', 'perspectives', 'index.html');

    assert.ok(fs.existsSync(archivePath), 'the Perspective archive page should exist');

    const html = fs.readFileSync(archivePath, 'utf8');

    assert.match(html, /<h1>Perspectives<\/h1>/);
    assert.match(html, /<script src="\.\.\/perspectives\.js"><\/script>/);
    assert.match(html, /Perspectives\.loadPerspectiveArchive\(\{/);
    assert.match(html, /dataUrl: '\.\.\/perspectives\.json'/);
});

test('defines the Pages CMS Perspective schema and published Perspective data', () => {
    const projectRoot = path.join(__dirname, '..');
    const configPath = path.join(projectRoot, '.pages.yml');
    const dataPath = path.join(projectRoot, 'perspectives.json');

    assert.ok(fs.existsSync(configPath), '.pages.yml should exist');
    assert.ok(fs.existsSync(dataPath), 'perspectives.json should exist');

    const config = fs.readFileSync(configPath, 'utf8');
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

    assert.match(config, /input: perspectives/);
    assert.match(config, /output: \/perspectives/);
    assert.match(config, /rename: safe/);
    assert.equal((config.match(/extensions: \[pdf\]/g) || []).length, 2);
    assert.match(config, /path: perspectives\.json/);
    assert.match(config, /format: json/);
    assert.match(config, /list: true/);

    for (const field of ['date', 'title', 'summary', 'pdf', 'page']) {
        assert.match(config, new RegExp(`- name: ${field}`));
    }

    assert.equal(data.length, 5);
    assert.equal(data[0].date, '2026-10-05');
    assert.equal(data[0].title, 'When Empowerment Isn’t Enough');
    assert.equal(data[0].pdf, '/perspectives/kz-perspectives-05-when-empowerment-isnt-enough.pdf');
    assert.equal(data[0].page, '/perspectives/when-empowerment-isnt-enough.html');
    assert.equal(data[1].title, 'The Great M&A Synergy Illusion');
    assert.equal(data[1].page, '/perspectives/the-great-ma-synergy-illusion.html');

    const pdfPath = path.join(projectRoot, data[0].pdf.replace(/^\//, ''));
    const pagePath = path.join(projectRoot, data[0].page.replace(/^\//, ''));

    assert.ok(fs.existsSync(pdfPath), 'the latest Perspective PDF should exist');
    assert.ok(fs.existsSync(pagePath), 'the latest Perspective web page should exist');

    const page = fs.readFileSync(pagePath, 'utf8');

    assert.match(page, /<title>When Empowerment Isn&rsquo;t Enough \| Karel Zimmermann Consulting<\/title>/);
    assert.match(page, /<meta property="article:published_time" content="2026-10-05">/);
    assert.match(page, /href="kz-perspectives-05-when-empowerment-isnt-enough\.pdf"/);
});
