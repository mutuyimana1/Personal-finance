"use strict";

let ovTransactions = [];
let ovPots = [];
let ovBudgets = [];

function loadOverviewData() {
    const tData = localStorage.getItem('transactions');
    if (tData) ovTransactions = JSON.parse(tData);
    
    const pData = localStorage.getItem('pots');
    if (pData) ovPots = JSON.parse(pData);
    
    const bData = localStorage.getItem('budgets');
    if (bData) ovBudgets = JSON.parse(bData);
}

function ovFormatCurrency(amount) {
    return '$' + Math.abs(amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function renderOverview() {
    // 1. Top Metrics
    let income = 0;
    let expenses = 0;
    
    ovTransactions.forEach(t => {
        if (t.amount >= 0) {
            income += t.amount;
        } else {
            expenses += Math.abs(t.amount);
        }
    });
    
    const currentBalance = income - expenses;
    
    document.getElementById('ovCurrentBalance').textContent = ovFormatCurrency(currentBalance);
    document.getElementById('ovIncome').textContent = ovFormatCurrency(income);
    document.getElementById('ovExpenses').textContent = ovFormatCurrency(expenses);
    
    // 2. Pots Preview
    const potsTotalEl = document.getElementById('ovPotsTotal');
    const potsListEl = document.getElementById('ovPotsList');
    
    let totalPotsSaved = 0;
    ovPots.forEach(p => totalPotsSaved += p.saved);
    potsTotalEl.textContent = ovFormatCurrency(totalPotsSaved);
    
    potsListEl.innerHTML = '';
    const displayPots = ovPots.slice(0, 4);
    displayPots.forEach(p => {
        potsListEl.innerHTML += `
            <div class="flex flex-col border-l-4 pl-3" style="border-color: ${p.theme}">
                <span class="text-xs text-gray-500">${p.name}</span>
                <span class="font-bold text-sm text-[#1f2230]">${ovFormatCurrency(p.saved)}</span>
            </div>
        `;
    });
    
    // 3. Transactions Preview
    const transListEl = document.getElementById('ovTransactionsList');
    transListEl.innerHTML = '';
    
    const sortedTrans = [...ovTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    if (sortedTrans.length === 0) {
        transListEl.innerHTML = '<p class="text-gray-400 text-sm">No recent transactions.</p>';
    } else {
        sortedTrans.forEach(t => {
            const amountDisplay = (t.amount >= 0 ? '+$' : '-$') + Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
            const amountClass = t.amount >= 0 ? "text-teal-600 font-bold" : "text-[#1f2230] font-bold";
            
            transListEl.innerHTML += `
                <div class="flex items-center justify-between border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                    <div class="flex items-center gap-3">
                        <span class="font-semibold text-sm text-[#1f2230]">${t.name}</span>
                    </div>
                    <div class="flex flex-col items-end">
                        <span class="${amountClass} text-sm">${amountDisplay}</span>
                        <span class="text-xs text-gray-400">${new Date(t.date).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });
    }

    // 4. Budgets Preview
    const pieChart = document.getElementById('ovBudgetsPie');
    const pieSpent = document.getElementById('ovBudgetsPieSpent');
    const pieLimit = document.getElementById('ovBudgetsPieLimit');
    const budgetsLegend = document.getElementById('ovBudgetsLegend');
    
    let totalLimit = 0;
    let totalSpent = 0;
    let conicGradients = [];
    let currentDegree = 0;
    
    function getSpent(category) {
        return ovTransactions
            .filter(t => t.category === category)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);
    }
    
    if (ovBudgets.length === 0) {
        pieChart.style.background = `conic-gradient(#f3f4f6 0deg, #f3f4f6 360deg)`;
        pieSpent.textContent = '$0';
        pieLimit.textContent = 'of $0 limit';
        budgetsLegend.innerHTML = '<p class="text-xs text-gray-400">No budgets set.</p>';
    } else {
        ovBudgets.forEach(b => {
            totalLimit += b.maxSpend;
            totalSpent += getSpent(b.category);
        });
        
        let globalSpentPercentAccumulator = 0;
        ovBudgets.forEach(b => {
            const spent = getSpent(b.category);
            if (totalSpent > 0 && spent > 0) {
                const percentOfSpent = (spent / totalLimit) * 100;
                const degrees = (percentOfSpent / 100) * 360;
                conicGradients.push(`${b.theme} ${currentDegree}deg ${currentDegree + degrees}deg`);
                currentDegree += degrees;
            }
        });
        
        if (conicGradients.length > 0) {
            conicGradients.push(`#f3f4f6 ${currentDegree}deg 360deg`);
            pieChart.style.background = `conic-gradient(${conicGradients.join(', ')})`;
        } else {
            pieChart.style.background = `conic-gradient(#f3f4f6 0deg, #f3f4f6 360deg)`;
        }
        
        pieSpent.textContent = ovFormatCurrency(totalSpent);
        pieLimit.textContent = `of ${ovFormatCurrency(totalLimit)} limit`;
        
        budgetsLegend.innerHTML = '';
        const displayBudgets = ovBudgets.slice(0, 4);
        displayBudgets.forEach(b => {
            budgetsLegend.innerHTML += `
                <div class="flex flex-col border-l-4 pl-2" style="border-color: ${b.theme}">
                    <span class="text-xs text-gray-500 capitalize">${b.category}</span>
                    <span class="font-bold text-sm text-[#1f2230]">${ovFormatCurrency(b.maxSpend)}</span>
                </div>
            `;
        });
    }

    // 5. Recurring Bills Preview
    const today = new Date();
    const currentDay = today.getDate();
    let rPaidAmount = 0;
    let rUpcomingAmount = 0;
    let rDueSoonAmount = 0;
    
    const recurringTrans = ovTransactions.filter(t => t.recurring === true);
    const uniqueBillsMap = new Map();
    recurringTrans.forEach(t => {
        const date = new Date(t.date);
        const existing = uniqueBillsMap.get(t.name);
        if (!existing || date > new Date(existing.date)) {
            uniqueBillsMap.set(t.name, { ...t, amount: Math.abs(t.amount), dueDay: date.getDate() });
        }
    });
    
    Array.from(uniqueBillsMap.values()).forEach(bill => {
        if (bill.dueDay <= currentDay) {
            rPaidAmount += bill.amount;
        } else {
            rUpcomingAmount += bill.amount;
            if (bill.dueDay <= currentDay + 5) {
                rDueSoonAmount += bill.amount;
            }
        }
    });
    
    document.getElementById('ovPaidBills').textContent = ovFormatCurrency(rPaidAmount);
    document.getElementById('ovTotalUpcoming').textContent = ovFormatCurrency(rUpcomingAmount);
    document.getElementById('ovDueSoon').textContent = ovFormatCurrency(rDueSoonAmount);
}

window.initOverview = function() {
    loadOverviewData();
    renderOverview();
};

document.addEventListener('DOMContentLoaded', () => {
    // Only run if on dashboard
    if (document.getElementById('ovCurrentBalance')) {
        window.initOverview();
    }
});
