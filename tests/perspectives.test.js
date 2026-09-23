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

test('loads valid perspectives into the grid and observes each card', async () => {
    assert.equal(typeof Perspectives.loadPerspectives, 'function');

    const placeholder = { className: 'perspective-card--placeholder' };
    const grid = {
        children: [placeholder],
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
                {
                    date: '2026-06-01',
                    title: 'First perspective',
                    summary: 'A sufficiently detailed summary for the first perspective.',
                    pdf: '/perspectives/first.pdf'
                },
                {
                    date: '2026-09-01',
                    title: 'Latest perspective',
                    summary: 'A sufficiently detailed summary for the latest perspective.',
                    pdf: '/perspectives/latest.pdf'
                }
            ];
        }
    });

    const count = await Perspectives.loadPerspectives({
        document: createMockDocument(),
        grid,
        fetch,
        observer
    });

    assert.equal(count, 2);
    assert.deepEqual(grid.children.map(card => card.children[1].textContent), [
        'Latest perspective',
        'First perspective'
    ]);
    assert.equal(observer.observed.length, 2);
    assert.ok(grid.children.every(card => card.className.includes('reveal')));
});

test('keeps the placeholder when Perspective data cannot be loaded', async () => {
    const placeholder = { className: 'perspective-card--placeholder' };
    const grid = {
        children: [placeholder],
        replaceChildren(...children) {
            this.children = children;
        }
    };
    let reportedError;

    const count = await Perspectives.loadPerspectives({
        document: createMockDocument(),
        grid,
        fetch: async () => {
            throw new Error('offline');
        },
        observer: { observe() {} },
        onError(error) {
            reportedError = error;
        }
    });

    assert.equal(count, 0);
    assert.equal(grid.children[0], placeholder);
    assert.equal(reportedError.message, 'offline');
});

test('loads the Perspective module and starts it with the page observer', () => {
    const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');

    assert.match(html, /<script src="perspectives\.js"><\/script>/);
    assert.match(html, /Perspectives\.loadPerspectives\(\{/);
    assert.match(html, /observer\s*\n\s*\}\);/);
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

    assert.equal(data.length, 3);
    assert.equal(data[0].title, 'Where Strategy meets the Market');
    assert.equal(data[0].pdf, '/perspectives/2026-09-where-strategy-meets-the-market.pdf');
    assert.equal(data[1].title, 'The Lost Art of Simplicity');
    assert.equal(data[1].page, '/perspectives/the-lost-art-of-simplicity.html');
});
