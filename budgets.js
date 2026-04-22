"use strict";
// Mocks (simulating shared state)
const mockTransactions = [
    { id: '1', name: 'Transport', category: 'transportation', date: '2026-04-20', amount: -5000.00, recurring: false },
    { id: '2', name: 'Uber Auto', category: 'transportation', date: '2026-04-18', amount: -125.00, recurring: false },
    { id: '3', name: 'Groceries', category: 'food', date: '2026-04-15', amount: -350.00, recurring: false },
    { id: '4', name: 'Cinema', category: 'entertainment', date: '2026-04-12', amount: -80.00, recurring: false },
];
let budgets = [
    { id: 'b1', category: 'transportation', maxSpend: 5400, theme: '#656464' }
];
// Utility functions
function getSpent(category) {
    return mockTransactions
        .filter(t => t.category === category && t.amount < 0)
        .reduce((sum, t) => sum + Math.abs(t.amount), 0);
}
function getLatestTransactions(category) {
    return mockTransactions
        .filter(t => t.category === category && t.amount < 0)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 3);
}
function formatCurrency(amount) {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function capitalize(str) {
    if (!str)
        return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}
function getIconForCategory(category) {
    switch (category) {
        case 'education': return '<div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500"><i data-lucide="book-open" class="w-4 h-4"></i></div>';
        case 'transportation': return '<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500"><i data-lucide="bus" class="w-4 h-4"></i></div>';
        case 'food': return '<div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500"><i data-lucide="pizza" class="w-4 h-4"></i></div>';
        case 'utilities': return '<div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500"><i data-lucide="zap" class="w-4 h-4"></i></div>';
        case 'entertainment': return '<div class="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500"><i data-lucide="film" class="w-4 h-4"></i></div>';
        case 'shopping': return '<div class="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500"><i data-lucide="shopping-bag" class="w-4 h-4"></i></div>';
        default: return '<div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><i data-lucide="circle-dollar-sign" class="w-4 h-4"></i></div>';
    }
}
// DOM Setup
// Function to initialize budgets logic
window.initBudgets = function () {
    // Budget Summary Elements
    const pieChart = document.getElementById('pieChart');
    const pieTotalSpent = document.getElementById('pieTotalSpent');
    const pieTotalLimit = document.getElementById('pieTotalLimit');
    const pieLegend = document.getElementById('pieLegend');
    // Budget List Elements
    const budgetCardsContainer = document.getElementById('budgetCardsContainer');
    // Modal Elements
    const budgetModal = document.getElementById('budgetModal');
    const openBudgetModalBtn = document.getElementById('openBudgetModalBtn');
    const closeBudgetModalBtn = document.getElementById('closeBudgetModalBtn');
    const budgetForm = document.getElementById('budgetForm');
    if (!pieChart || !pieTotalSpent || !pieTotalLimit || !pieLegend || !budgetCardsContainer || !budgetModal || !openBudgetModalBtn || !closeBudgetModalBtn || !budgetForm) {
        console.warn('Some budget DOM elements not found. Initialization skipped.');
        return;
    }
    function renderBudgets() {
        let totalLimit = 0;
        let totalSpent = 0;
        // Clear dynamic containers
        pieLegend.innerHTML = '';
        budgetCardsContainer.innerHTML = '';
        // Array to hold conic gradient stops
        let conicGradients = [];
        let currentDegree = 0;
        if (budgets.length === 0) {
            budgetCardsContainer.innerHTML = '<div class="text-center text-gray-400 py-10 w-full">No budgets found. Add one to start tracking!</div>';
            pieChart.style.background = `conic-gradient(#f3f4f6 0deg, #f3f4f6 360deg)`;
            pieTotalSpent.textContent = '$0.00';
            pieTotalLimit.textContent = 'of $0.00 limit';
            return;
        }
        budgets.forEach(budget => {
            totalLimit += budget.maxSpend;
            const spent = getSpent(budget.category);
            totalSpent += spent;
            const remaining = Math.max(0, budget.maxSpend - spent);
            const spentPercent = budget.maxSpend > 0 ? Math.min(100, (spent / budget.maxSpend) * 100) : 0;
            // -- Chart Calculation --
            const degreeOffset = (spent / Math.max(1, totalLimit)) * 360;
            // note: totalLimit isn't final yet here, we'll build chart after the loop.
            // -- Budget Card Generation --
            const card = document.createElement('div');
            card.className = "bg-white rounded-xl p-8 mb-6 shadow-sm";
            const latestTransactions = getLatestTransactions(budget.category);
            let transactionsHtml = '';
            if (latestTransactions.length === 0) {
                transactionsHtml = `<div class="text-gray-400 text-sm mt-4 text-center">No spending in this category yet.</div>`;
            }
            else {
                latestTransactions.forEach(t => {
                    const amountDisplay = (t.amount >= 0 ? '+$' : '-$') + Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
                    const formatAmountClass = t.amount >= 0 ? "text-teal-600" : "text-[#1f2230]";
                    transactionsHtml += `
            <div class="flex items-center justify-between border-t border-gray-100 py-3 mt-1">
              <div class="flex items-center gap-3">
                ${getIconForCategory(t.category)}
                <span class="font-bold text-[#1f2230] text-sm">${t.name}</span>
              </div>
              <div class="text-right">
                <div class="font-bold ${formatAmountClass} text-sm">${amountDisplay}</div>
                <div class="text-xs text-gray-400">${new Date(t.date).toLocaleDateString()}</div>
              </div>
            </div>
          `;
                });
            }
            card.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-3">
            <div class="w-4 h-4 rounded-full" style="background-color: ${budget.theme}"></div>
            <h3 class="text-lg font-bold text-[#1f2230]">${capitalize(budget.category)}</h3>
          </div>
          <button class="text-gray-400 hover:text-gray-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
        </div>
        
        <p class="text-sm text-gray-500 mb-6">Maximum of ${formatCurrency(budget.maxSpend)}</p>
        
        <div class="w-full bg-[#f3f4f6] h-6 rounded-md overflow-hidden mb-6">
          <div class="h-full" style="width: ${spentPercent}%; background-color: ${budget.theme};"></div>
        </div>
        
        <div class="flex mb-8">
          <div class="flex-1 border-l-4 pl-4" style="border-color: ${budget.theme}">
            <div class="text-xs text-gray-400 mb-1">Spent</div>
            <div class="font-bold text-[#1f2230] text-sm">${formatCurrency(spent)}</div>
          </div>
          <div class="flex-1 border-l-4 pl-4 border-[#f3f4f6]">
            <div class="text-xs text-gray-400 mb-1">Free</div>
            <div class="font-bold text-[#1f2230] text-sm">${formatCurrency(remaining)}</div>
          </div>
        </div>
        
        <div class="bg-[#faf9f6] rounded-xl p-5 border border-gray-100">
          <div class="flex items-center justify-between mb-4">
            <h4 class="font-bold text-[#1f2230] text-sm">Latest Spending</h4>
            <a href="#" class="text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1">See All <i data-lucide="chevron-right" class="w-4 h-4"></i></a>
          </div>
          ${transactionsHtml}
        </div>
      `;
            budgetCardsContainer.appendChild(card);
        });
        // Re-calculate strictly for the pie chart out of all budgets
        let globalSpentPercentAccumulator = 0;
        budgets.forEach((budget) => {
            const spent = getSpent(budget.category);
            if (totalSpent > 0 && spent > 0) {
                const percentOfSpent = (spent / totalLimit) * 100;
                const degreeSlice = (percentOfSpent / 100) * 360;
                conicGradients.push(`${budget.theme} ${currentDegree}deg ${currentDegree + degreeSlice}deg`);
                currentDegree += degreeSlice;
            }
            // Add legend dynamically
            pieLegend.innerHTML += `
          <div class="flex items-center justify-between text-sm py-3 border-b border-gray-50 last:border-0">
            <div class="flex items-center gap-4">
               <div class="h-4 w-1 rounded-full" style="background-color: ${budget.theme}"></div>
               <span class="text-gray-500">${capitalize(budget.category)}</span>
            </div>
            <div class="flex items-center gap-1">
               <span class="font-bold text-[#1f2230]">${formatCurrency(spent)}</span>
               <span class="text-gray-400 text-xs ml-1">of ${formatCurrency(budget.maxSpend)}</span>
            </div>
          </div>
        `;
        });
        // Fill the remainder of the chart with gray relative to total limit
        if (totalSpent < totalLimit) {
            conicGradients.push(`#f3f4f6 ${currentDegree}deg 360deg`);
        }
        // Assign generic gray if literally 0 spent everywhere
        if (conicGradients.length === 0) {
            pieChart.style.background = `conic-gradient(#f3f4f6 0deg, #f3f4f6 360deg)`;
        }
        else {
            pieChart.style.background = `conic-gradient(${conicGradients.join(', ')})`;
        }
        pieTotalSpent.textContent = formatCurrency(totalSpent);
        pieTotalLimit.textContent = `of ${formatCurrency(totalLimit)} limit`;
        // Re-initialize lucide icons inside dynamically generated HTML
        // @ts-ignore
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }
    // Event Listeners
    openBudgetModalBtn.addEventListener('click', () => {
        budgetModal.classList.remove('hidden');
        budgetModal.classList.add('flex');
    });
    closeBudgetModalBtn.addEventListener('click', () => {
        budgetModal.classList.add('hidden');
        budgetModal.classList.remove('flex');
        budgetForm.reset();
    });
    // Remove previously added listeners to prevent duplicate submissions
    const newBudgetForm = budgetForm.cloneNode(true);
    budgetForm.parentNode?.replaceChild(newBudgetForm, budgetForm);
    const activeBudgetForm = document.getElementById('budgetForm');
    activeBudgetForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('bCategory').value;
        const maxSpend = parseFloat(document.getElementById('bSpend').value);
        const theme = document.getElementById('bTheme').value;
        // Check if category budget already exists and update, or add new
        const existingIndex = budgets.findIndex(b => b.category === category);
        if (existingIndex > -1) {
            budgets[existingIndex].maxSpend = maxSpend;
            budgets[existingIndex].theme = theme;
        }
        else {
            budgets.push({
                id: Date.now().toString(),
                category,
                maxSpend,
                theme
            });
        }
        budgetModal.classList.add('hidden');
        budgetModal.classList.remove('flex');
        activeBudgetForm.reset();
        renderBudgets();
    });
    // Initial render
    renderBudgets();
};
// Fallback for direct page load
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initBudgets === 'function' && document.getElementById('budgetCardsContainer')) {
        window.initBudgets();
    }
});
