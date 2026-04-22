// Define Transaction interface
interface Transaction {
  id: string;
  name: string;
  category: string;
  date: string;
  amount: number;
  recurring: boolean;
}

// Initial Data - Load from local storage
let transactions: Transaction[] = [];

// Functions to handle local storage
function loadTransactions() {
  const stored = localStorage.getItem('transactions');
  if (stored) {
    transactions = JSON.parse(stored);
  }
}

function saveTransactions() {
  localStorage.setItem('transactions', JSON.stringify(transactions));
}

// State
let currentPage = 1;
const itemsPerPage = 5;
let currentSort = 'latest';
let currentFilter = 'all';
let currentSearch = '';

// DOM Elements
// Function to initialize transactions logic
window.initTransactions = function() {
  const transactionsList = document.getElementById('transactionsList') as HTMLElement;
  const searchInput = document.getElementById('searchInput') as HTMLInputElement;
  const sortSelect = document.getElementById('sortSelect') as HTMLSelectElement;
  const categorySelect = document.getElementById('categorySelect') as HTMLSelectElement;
  const paginationNumbers = document.getElementById('paginationNumbers') as HTMLElement;
  const prevPageBtn = document.getElementById('prevPageBtn') as HTMLButtonElement;
  const nextPageBtn = document.getElementById('nextPageBtn') as HTMLButtonElement;
  
  const modal = document.getElementById('transactionModal') as HTMLElement;
  const openModalBtn = document.getElementById('openModalBtn') as HTMLButtonElement;
  const closeModalBtn = document.getElementById('closeModalBtn') as HTMLButtonElement;
  const transactionForm = document.getElementById('transactionForm') as HTMLFormElement;
  
  const tName = document.getElementById('tName') as HTMLInputElement;
  const charCount = document.getElementById('charCount') as HTMLElement;

  if (!transactionsList || !searchInput || !sortSelect || !categorySelect || !paginationNumbers || !prevPageBtn || !nextPageBtn || !modal || !openModalBtn || !closeModalBtn || !transactionForm || !tName || !charCount) {
      console.warn('Some transaction DOM elements not found. Initialization skipped.');
      return;
  }

  // Remove existing listeners if necessary (we can rely on garbage collection for detached DOM elements)
  
  // Initialize
  loadTransactions();
  renderTransactions();

  // Event Listeners for Filters/Search
  searchInput.addEventListener('input', (e) => {
    currentSearch = (e.target as HTMLInputElement).value.toLowerCase();
    currentPage = 1;
    renderTransactions();
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = (e.target as HTMLSelectElement).value;
    currentPage = 1;
    renderTransactions();
  });

  categorySelect.addEventListener('change', (e) => {
    currentFilter = (e.target as HTMLSelectElement).value;
    currentPage = 1;
    renderTransactions();
  });

  // Event Listeners for Pagination
  prevPageBtn.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      renderTransactions();
    }
  });

  nextPageBtn.addEventListener('click', () => {
    const totalPages = Math.ceil(getFilteredAndSortedTransactions().length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTransactions();
    }
  });

  // Modal Event Listeners
  openModalBtn.addEventListener('click', () => {
    modal.classList.remove('hidden');
    modal.classList.add('flex');
  });

  closeModalBtn.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    transactionForm.reset();
    charCount.textContent = '30';
  });

  // Character Count Logic
  tName.addEventListener('input', () => {
    const remaining = 30 - tName.value.length;
    charCount.textContent = remaining.toString();
  });

  // Form Submission
  // Remove previously added listeners to prevent duplicate submissions if init is called multiple times
  const newForm = transactionForm.cloneNode(true);
  transactionForm.parentNode?.replaceChild(newForm, transactionForm);
  const activeTransactionForm = document.getElementById('transactionForm') as HTMLFormElement;

  activeTransactionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTransaction: Transaction = {
      id: Date.now().toString(),
      name: (document.getElementById('tName') as HTMLInputElement).value,
      date: (document.getElementById('tDate') as HTMLInputElement).value,
      category: (document.getElementById('tCategory') as HTMLSelectElement).value,
      amount: parseFloat((document.getElementById('tAmount') as HTMLInputElement).value),
      recurring: (document.getElementById('tRecurring') as HTMLInputElement).checked,
    };

    transactions.unshift(newTransaction);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    activeTransactionForm.reset();
    (document.getElementById('charCount') as HTMLElement).textContent = '30';
    
    // reset filters
    currentSearch = '';
    currentFilter = 'all';
    currentSort = 'latest';
    (document.getElementById('searchInput') as HTMLInputElement).value = '';
    (document.getElementById('categorySelect') as HTMLSelectElement).value = 'all';
    (document.getElementById('sortSelect') as HTMLSelectElement).value = 'latest';
    currentPage = 1;

    saveTransactions();
    renderTransactions();
  });

  function getFilteredAndSortedTransactions(): Transaction[] {
    let filtered = transactions.filter(t => {
      const matchSearch = t.name.toLowerCase().includes(currentSearch);
      const matchCategory = currentFilter === 'all' || t.category === currentFilter;
      return matchSearch && matchCategory;
    });

    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return currentSort === 'latest' ? dateB - dateA : dateA - dateB;
    });

    return filtered;
  }

  function getCategoryIcon(category: string): string {
    switch (category) {
      case 'education': return '<div class="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500"><i data-lucide="book-open" class="w-4 h-4"></i></div>';
      case 'transportation': return '<div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-500"><i data-lucide="bus" class="w-4 h-4"></i></div>';
      case 'food': return '<div class="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500"><i data-lucide="pizza" class="w-4 h-4"></i></div>';
      case 'utilities': return '<div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-500"><i data-lucide="zap" class="w-4 h-4"></i></div>';
      case 'entertainment': return '<div class="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-500"><i data-lucide="film" class="w-4 h-4"></i></div>';
      default: return '<div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500"><i data-lucide="circle-dollar-sign" class="w-4 h-4"></i></div>';
    }
  }

  function renderTransactions() {
    const list = getFilteredAndSortedTransactions();
    const totalPages = Math.ceil(list.length / itemsPerPage);
    
    // Pagination slicing
    const start = (currentPage - 1) * itemsPerPage;
    const paginated = list.slice(start, start + itemsPerPage);

    // Update table body
    const tList = document.getElementById('transactionsList');
    if (!tList) return;
    
    tList.innerHTML = '';
    if (paginated.length === 0) {
      tList.innerHTML = '<div class="text-center text-gray-400 py-10">No transactions found.</div>';
    } else {
      paginated.forEach(t => {
        const amountDisplay = (t.amount >= 0 ? '+$' : '-$') + Math.abs(t.amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const formatAmountClass = t.amount >= 0 ? "text-teal-600 font-bold" : "text-[#1f2230] font-bold";
        
        const rowHTML = `
          <div class="grid grid-cols-4 items-center border-b pb-3 text-sm">
            <div class="flex items-center gap-3">
              ${getCategoryIcon(t.category)}
              <span class="font-bold text-[#1f2230]">${t.name}</span>
            </div>
            <div class="text-gray-500 capitalize">${t.category}</div>
            <div class="text-gray-500">${new Date(t.date).toLocaleDateString()}</div>
            <div class="text-right ${formatAmountClass}">${amountDisplay}</div>
          </div>
        `;
        tList.innerHTML += rowHTML;
      });
    }

    // Since we appended raw HTML with lucide icons, we need to call lucide again
    // @ts-ignore
    if (window.lucide && typeof window.lucide.createIcons === 'function') { window.lucide.createIcons(); }

    // Update Pagination Buttons
    const prevBtn = document.getElementById('prevPageBtn') as HTMLButtonElement;
    const nextBtn = document.getElementById('nextPageBtn') as HTMLButtonElement;
    if (prevBtn) prevBtn.disabled = currentPage === 1;
    if (nextBtn) nextBtn.disabled = currentPage === totalPages || totalPages === 0;

    // Update Pagination Numbers
    const pNumbers = document.getElementById('paginationNumbers');
    if (pNumbers) {
        pNumbers.innerHTML = '';
        for (let i = 1; i <= totalPages; i++) {
          const btn = document.createElement('button');
          btn.textContent = i.toString();
          btn.className = `w-8 h-8 rounded-lg flex items-center justify-center text-sm ${i === currentPage ? 'bg-[#1f2230] text-white' : 'text-gray-600 hover:bg-gray-100'}`;
          btn.addEventListener('click', () => {
            currentPage = i;
            renderTransactions();
          });
          pNumbers.appendChild(btn);
        }
    }
  }
};

// Fallback for direct page load (if router is not handling it)
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initTransactions === 'function' && document.getElementById('transactionsList')) {
        window.initTransactions();
    }
});
