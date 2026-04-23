"use strict";

let recurringTransactions = [];
let groupedRecurringBills = [];
let rbCurrentPage = 1;
const rbItemsPerPage = 5;
let rbCurrentSort = 'latest';
let rbCurrentSearch = '';

function loadRecurringData() {
    const storedTransactions = localStorage.getItem('transactions');
    if (storedTransactions) {
        const allTransactions = JSON.parse(storedTransactions);
        // Filter only recurring transactions
        recurringTransactions = allTransactions.filter(t => t.recurring === true);
        
        // Group by name to find unique bills, using the latest transaction for details
        const uniqueBillsMap = new Map();
        recurringTransactions.forEach(t => {
            const date = new Date(t.date);
            const existing = uniqueBillsMap.get(t.name);
            
            if (!existing || date > new Date(existing.date)) {
                uniqueBillsMap.set(t.name, {
                    ...t,
                    amount: Math.abs(t.amount), // Ensure amount is absolute for display
                    dueDay: date.getDate()
                });
            }
        });
        
        groupedRecurringBills = Array.from(uniqueBillsMap.values());
    }
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function getDaySuffix(day) {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1:  return "st";
        case 2:  return "nd";
        case 3:  return "rd";
        default: return "th";
    }
}

window.initRecurringBills = function () {
    loadRecurringData();
    
    // DOM Elements
    const totalBillsEl = document.getElementById('rbTotalBills');
    const paidBillsEl = document.getElementById('rbPaidBills');
    const totalUpcomingEl = document.getElementById('rbTotalUpcoming');
    const dueSoonEl = document.getElementById('rbDueSoon');
    
    const billsListEl = document.getElementById('rbBillsList');
    const searchInput = document.getElementById('rbSearchInput');
    const sortSelect = document.getElementById('rbSortSelect');
    
    const prevPageBtn = document.getElementById('rbPrevPageBtn');
    const nextPageBtn = document.getElementById('rbNextPageBtn');
    
    if (!totalBillsEl || !billsListEl || !searchInput) {
        console.warn('Some Recurring Bills DOM elements not found.');
        return;
    }

    // Calculate Summaries
    function calculateSummaries() {
        const today = new Date();
        const currentDay = today.getDate();
        
        let totalAmount = 0;
        let paidAmount = 0;
        let upcomingAmount = 0;
        let dueSoonAmount = 0;
        
        groupedRecurringBills.forEach(bill => {
            totalAmount += bill.amount;
            
            if (bill.dueDay <= currentDay) {
                // Paid if due day is past or today
                paidAmount += bill.amount;
            } else {
                // Upcoming
                upcomingAmount += bill.amount;
                
                // Due Soon (within 5 days)
                if (bill.dueDay <= currentDay + 5) {
                    dueSoonAmount += bill.amount;
                }
            }
        });
        
        totalBillsEl.textContent = formatCurrency(totalAmount);
        if(paidBillsEl) paidBillsEl.textContent = formatCurrency(paidAmount);
        if(totalUpcomingEl) totalUpcomingEl.textContent = formatCurrency(upcomingAmount);
        if(dueSoonEl) dueSoonEl.textContent = formatCurrency(dueSoonAmount);
    }
    
    function getFilteredAndSortedBills() {
        let filtered = groupedRecurringBills.filter(b => 
            b.name.toLowerCase().includes(rbCurrentSearch)
        );
        
        filtered.sort((a, b) => {
            switch (rbCurrentSort) {
                case 'latest':
                    return b.dueDay - a.dueDay; // Descending by day
                case 'oldest':
                    return a.dueDay - b.dueDay; // Ascending by day
                case 'highest':
                    return b.amount - a.amount;
                case 'lowest':
                    return a.amount - b.amount;
                case 'a-z':
                    return a.name.localeCompare(b.name);
                case 'z-a':
                    return b.name.localeCompare(a.name);
                default:
                    return b.dueDay - a.dueDay;
            }
        });
        
        return filtered;
    }

    function renderBills() {
        calculateSummaries();
        
        const list = getFilteredAndSortedBills();
        const totalPages = Math.ceil(list.length / rbItemsPerPage);
        
        const start = (rbCurrentPage - 1) * rbItemsPerPage;
        const paginated = list.slice(start, start + rbItemsPerPage);
        
        billsListEl.innerHTML = '';
        
        if (paginated.length === 0) {
            billsListEl.innerHTML = '<div class="text-center text-gray-500 py-10 w-full col-span-full">No results.</div>';
        } else {
            paginated.forEach(bill => {
                const today = new Date().getDate();
                
                // Determine icon based on category logic from previous files
                let iconHTML = '<div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><i data-lucide="circle-dollar-sign" class="w-4 h-4"></i></div>';
                switch (bill.category) {
                    case 'education': iconHTML = '<div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500"><i data-lucide="book-open" class="w-4 h-4"></i></div>'; break;
                    case 'transportation': iconHTML = '<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500"><i data-lucide="bus" class="w-4 h-4"></i></div>'; break;
                    case 'food': iconHTML = '<div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500"><i data-lucide="pizza" class="w-4 h-4"></i></div>'; break;
                    case 'utilities': iconHTML = '<div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500"><i data-lucide="zap" class="w-4 h-4"></i></div>'; break;
                    case 'entertainment': iconHTML = '<div class="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500"><i data-lucide="film" class="w-4 h-4"></i></div>'; break;
                }

                // Status styling
                let statusClass = "text-gray-500";
                let iconStatus = "";
                if (bill.dueDay <= today) {
                    // Paid
                    statusClass = "text-green-600";
                    iconStatus = '<i data-lucide="check-circle-2" class="w-4 h-4 text-green-600 ml-2"></i>';
                } else if (bill.dueDay <= today + 5) {
                    // Due soon
                    statusClass = "text-red-500";
                    iconStatus = '<i data-lucide="alert-circle" class="w-4 h-4 text-red-500 ml-2"></i>';
                }
                
                const rowHTML = `
                <div class="flex flex-col md:grid md:grid-cols-[2fr_1fr_1fr] items-start md:items-center border-b pb-4 pt-2 text-sm gap-2 md:gap-0">
                  <div class="flex items-center gap-3 w-full">
                    ${iconHTML}
                    <span class="font-bold text-[#1f2230]">${bill.name}</span>
                  </div>
                  <div class="flex items-center text-sm md:block w-full">
                    <span class="md:hidden font-semibold text-gray-500 w-24">Due Date:</span>
                    <span class="flex items-center ${statusClass}">Monthly-${bill.dueDay}${getDaySuffix(bill.dueDay)} ${iconStatus}</span>
                  </div>
                  <div class="flex items-center text-right font-bold text-[#1f2230] w-full md:block">
                    <span class="md:hidden font-semibold text-gray-500 w-24 text-left">Amount:</span>
                    <span class="text-right w-full md:w-auto">${formatCurrency(bill.amount)}</span>
                  </div>
                </div>
                `;
                
                billsListEl.innerHTML += rowHTML;
            });
        }

        // @ts-ignore
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
        
        // Update Pagination Buttons
        if (prevPageBtn) prevPageBtn.disabled = rbCurrentPage === 1;
        if (nextPageBtn) nextPageBtn.disabled = rbCurrentPage === totalPages || totalPages === 0;
    }

    // Event Listeners
    searchInput.addEventListener('input', (e) => {
        rbCurrentSearch = e.target.value.toLowerCase();
        rbCurrentPage = 1;
        renderBills();
    });
    
    sortSelect.addEventListener('change', (e) => {
        rbCurrentSort = e.target.value;
        rbCurrentPage = 1;
        renderBills();
    });
    
    if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
            if (rbCurrentPage > 1) {
                rbCurrentPage--;
                renderBills();
            }
        });
    }
    
    if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
            const totalPages = Math.ceil(getFilteredAndSortedBills().length / rbItemsPerPage);
            if (rbCurrentPage < totalPages) {
                rbCurrentPage++;
                renderBills();
            }
        });
    }
    
    renderBills();
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initRecurringBills === 'function' && document.getElementById('rbBillsList')) {
        window.initRecurringBills();
    }
});
