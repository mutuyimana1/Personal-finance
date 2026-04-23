"use strict";
// router.ts
class Router {
    constructor() {
        this.init();
    }
    init() {
        // Intercept all clicks on the document
        document.addEventListener('click', (e) => {
            const target = e.target;
            // Find the closest anchor tag
            const anchor = target.closest('a');
            if (anchor) {
                const href = anchor.getAttribute('href');
                // Only handle internal links that go to HTML files
                if (href && href.startsWith('/') && href.endsWith('.html')) {
                    e.preventDefault();
                    this.navigateTo(href);
                }
            }
        });
        // Handle back/forward buttons
        window.addEventListener('popstate', () => {
            this.handleRoute(window.location.pathname);
        });
        // Initialize the current route on load
        this.handleRoute(window.location.pathname, false);
    }
    async navigateTo(url) {
        // Update the URL
        history.pushState(null, '', url);
        await this.handleRoute(url);
    }
    async handleRoute(url, fetchHTML = true) {
        if (fetchHTML) {
            try {
                // Fetch the target HTML file
                const response = await fetch(url);
                const html = await response.text();
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                // Extract the <main> element
                const newMain = doc.querySelector('main');
                const currentMain = document.querySelector('main');
                if (newMain && currentMain) {
                    // Replace current main content and attributes
                    currentMain.innerHTML = newMain.innerHTML;
                    currentMain.className = newMain.className;
                }
                // Update the document title
                if (doc.title) {
                    document.title = doc.title;
                }
                // Update active sidebar link
                this.updateSidebarActiveState(url);
            }
            catch (error) {
                console.error('Error loading page:', error);
            }
        }
        // Call the corresponding initialization function based on the URL
        this.executePageLogic(url);
        // Re-initialize icons
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }
    updateSidebarActiveState(url) {
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            const anchor = btn.querySelector('a');
            if (anchor) {
                const href = anchor.getAttribute('href');
                if (href === url || (url === '/' && href === '/index.html')) {
                    // Set as active
                    btn.classList.remove('text-gray-400', 'hover:text-white');
                    btn.classList.add('text-teal-400');
                }
                else {
                    // Set as inactive
                    btn.classList.remove('text-teal-400');
                    btn.classList.add('text-gray-400', 'hover:text-white');
                }
            }
        });
    }
    executePageLogic(url) {
        if (url.includes('transactions.html') || url === '/transactions.html') {
            if (typeof window.initTransactions === 'function') {
                window.initTransactions();
            }
        }
        else if (url.includes('budgets.html') || url === '/budgets.html') {
            if (typeof window.initBudgets === 'function') {
                window.initBudgets();
            }
        }
        else if (url.includes('pots.html') || url === '/pots.html') {
            if (typeof window.initPots === 'function') {
                window.initPots();
            }
        }
        else if (url.includes('recurring-bills.html') || url === '/recurring-bills.html') {
            if (typeof window.initRecurringBills === 'function') {
                window.initRecurringBills();
            }
        }
        else if (url.includes('index.html') || url === '/' || url === '/index.html') {
            if (typeof window.initOverview === 'function') {
                window.initOverview();
            }
        }
        // Add other page logic as needed
    }
}
// Initialize the router when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    new Router();
});
