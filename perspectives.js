(function (root, factory) {
    const api = factory();

    if (typeof module === 'object' && module.exports) {
        module.exports = api;
    }

    root.Perspectives = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
    const PDF_PATH_PATTERN = /^\/perspectives\/[a-z0-9][a-z0-9._-]*\.pdf$/i;

    function isValidDate(value) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
            return false;
        }

        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return date.getUTCFullYear() === year
            && date.getUTCMonth() === month - 1
            && date.getUTCDate() === day;
    }

    function normalizePerspectives(entries) {
        if (!Array.isArray(entries)) {
            return [];
        }

        return entries
            .filter(entry => entry && typeof entry === 'object')
            .map(entry => ({
                date: typeof entry.date === 'string' ? entry.date.trim() : '',
                title: typeof entry.title === 'string' ? entry.title.trim() : '',
                summary: typeof entry.summary === 'string' ? entry.summary.trim() : '',
                pdf: typeof entry.pdf === 'string' ? entry.pdf.trim() : '',
                page: typeof entry.page === 'string' ? entry.page.trim() : ''
            }))
            .filter(entry => (
                isValidDate(entry.date)
                && entry.title.length > 0
                && entry.title.length <= 120
                && entry.summary.length >= 20
                && entry.summary.length <= 280
                && PDF_PATH_PATTERN.test(entry.pdf)
            ))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    function formatPerspectiveDate(value) {
        const [year, month, day] = value.split('-').map(Number);
        const date = new Date(Date.UTC(year, month - 1, day));

        return new Intl.DateTimeFormat('en', {
            month: 'long',
            year: 'numeric',
            timeZone: 'UTC'
        }).format(date);
    }

    function createPerspectiveLink(documentRef, perspective, className, label) {
        const link = documentRef.createElement('a');
        link.className = className;
        link.href = perspective.page || perspective.pdf;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = label || (perspective.page ? 'Read Perspective →' : 'Download PDF →');
        return link;
    }

    function createPerspectiveCard(documentRef, perspective) {
        const card = documentRef.createElement('div');
        card.className = 'perspective-card';

        const date = documentRef.createElement('span');
        date.className = 'perspective-date';
        date.textContent = formatPerspectiveDate(perspective.date);

        const title = documentRef.createElement('h3');
        title.textContent = perspective.title;

        const summary = documentRef.createElement('p');
        summary.textContent = perspective.summary;

        const link = createPerspectiveLink(documentRef, perspective, 'perspective-link');

        card.append(date, title, summary, link);
        return card;
    }

    function createFeaturedPerspective(documentRef, perspective) {
        const feature = documentRef.createElement('article');
        feature.className = 'perspective-feature';

        const label = documentRef.createElement('span');
        label.className = 'perspective-feature-label';
        label.textContent = 'Latest Perspective';

        const date = documentRef.createElement('span');
        date.className = 'perspective-feature-date';
        date.textContent = formatPerspectiveDate(perspective.date);

        const title = documentRef.createElement('h3');
        title.textContent = perspective.title;

        const summary = documentRef.createElement('p');
        summary.textContent = perspective.summary;

        const link = createPerspectiveLink(
            documentRef,
            perspective,
            'perspective-feature-link',
            perspective.page ? 'Read Perspective →' : 'Download PDF →'
        );

        feature.append(label, date, title, summary, link);
        return feature;
    }

    function createRecentPerspective(documentRef, perspective) {
        const item = documentRef.createElement('article');
        item.className = 'perspective-recent-item';

        const date = documentRef.createElement('span');
        date.className = 'perspective-recent-date';
        date.textContent = formatPerspectiveDate(perspective.date);

        const title = documentRef.createElement('h3');
        title.textContent = perspective.title;

        const link = createPerspectiveLink(
            documentRef,
            perspective,
            'perspective-recent-link',
            perspective.page ? 'Read →' : 'Download PDF →'
        );

        item.append(date, title, link);
        return item;
    }

    function createHomepageEmptyStates(documentRef) {
        const featured = documentRef.createElement('article');
        featured.className = 'perspective-feature perspective-feature--empty';

        const label = documentRef.createElement('span');
        label.className = 'perspective-feature-label';
        label.textContent = 'Perspectives';

        const title = documentRef.createElement('h3');
        title.textContent = 'More Perspectives are coming soon.';

        const summary = documentRef.createElement('p');
        summary.textContent = 'Fresh thinking on strategy, performance and transformation will appear here.';

        featured.append(label, title, summary);

        const recent = documentRef.createElement('article');
        recent.className = 'perspective-recent-item perspective-recent--empty';

        const recentLabel = documentRef.createElement('span');
        recentLabel.className = 'perspective-recent-date';
        recentLabel.textContent = 'Archive';

        const recentTitle = documentRef.createElement('h3');
        recentTitle.textContent = 'The collection will grow here.';

        recent.append(recentLabel, recentTitle);
        return { featured, recent };
    }

    function createArchiveEmptyState(documentRef) {
        const card = documentRef.createElement('div');
        card.className = 'perspective-card perspective-card--empty';

        const label = documentRef.createElement('span');
        label.className = 'perspective-date';
        label.textContent = 'Archive';

        const title = documentRef.createElement('h3');
        title.textContent = 'More Perspectives are coming soon.';

        const summary = documentRef.createElement('p');
        summary.textContent = 'The complete collection will appear here as new pieces are published.';

        card.append(label, title, summary);
        return card;
    }

    function observeElements(elements, observer) {
        elements.forEach(element => {
            element.classList.add('reveal');
            if (observer) {
                observer.observe(element);
            }
        });
    }

    async function fetchPerspectives(options) {
        const response = await options.fetch(options.dataUrl || 'perspectives.json');

        if (!response.ok) {
            throw new Error(`Unable to load Perspectives (${response.status})`);
        }

        return normalizePerspectives(await response.json());
    }

    async function loadPerspectives(options) {
        try {
            const perspectives = await fetchPerspectives(options);

            if (perspectives.length === 0) {
                const emptyStates = createHomepageEmptyStates(options.document);
                options.featured.replaceChildren(emptyStates.featured);
                options.recent.replaceChildren(emptyStates.recent);
                return 0;
            }

            const featured = createFeaturedPerspective(options.document, perspectives[0]);
            const recent = perspectives
                .slice(1, 4)
                .map(perspective => createRecentPerspective(options.document, perspective));

            if (recent.length === 0) {
                recent.push(createHomepageEmptyStates(options.document).recent);
            }

            observeElements([featured, ...recent], options.observer);

            options.featured.replaceChildren(featured);
            options.recent.replaceChildren(...recent);
            return perspectives.length;
        } catch (error) {
            if (options.onError) {
                options.onError(error);
            }
            return 0;
        }
    }

    async function loadPerspectiveArchive(options) {
        try {
            const perspectives = await fetchPerspectives(options);

            if (perspectives.length === 0) {
                options.grid.replaceChildren(createArchiveEmptyState(options.document));
                return 0;
            }

            const cards = perspectives.map(perspective => (
                createPerspectiveCard(options.document, perspective)
            ));

            observeElements(cards, options.observer);
            options.grid.replaceChildren(...cards);
            return cards.length;
        } catch (error) {
            if (options.onError) {
                options.onError(error);
            }
            return 0;
        }
    }

    return {
        normalizePerspectives,
        formatPerspectiveDate,
        createPerspectiveCard,
        createFeaturedPerspective,
        createRecentPerspective,
        loadPerspectives,
        loadPerspectiveArchive
    };
});
