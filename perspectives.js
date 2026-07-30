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
                pdf: typeof entry.pdf === 'string' ? entry.pdf.trim() : ''
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

        const link = documentRef.createElement('a');
        link.className = 'perspective-link';
        link.href = perspective.pdf;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        link.textContent = 'Download PDF →';

        card.append(date, title, summary, link);
        return card;
    }

    async function loadPerspectives(options) {
        try {
            const response = await options.fetch('perspectives.json');

            if (!response.ok) {
                throw new Error(`Unable to load Perspectives (${response.status})`);
            }

            const perspectives = normalizePerspectives(await response.json());

            if (perspectives.length === 0) {
                return 0;
            }

            const cards = perspectives.map(perspective => {
                const card = createPerspectiveCard(options.document, perspective);
                card.classList.add('reveal');
                options.observer.observe(card);
                return card;
            });

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
        loadPerspectives
    };
});
