"use strict";

let potsData = [];
let currentActionPotId = null;
let currentActionType = null; // 'add' or 'withdraw'

function loadPotsData() {
    const storedPots = localStorage.getItem('pots');
    if (storedPots) {
        potsData = JSON.parse(storedPots);
    }
}

function savePotsData() {
    localStorage.setItem('pots', JSON.stringify(potsData));
}

function formatCurrency(amount) {
    return '$' + amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

window.initPots = function () {
    loadPotsData();
    
    const potsCardsContainer = document.getElementById('potsCardsContainer');
    
    // "Add New Pot" Modal elements
    const potModal = document.getElementById('potModal');
    const openPotModalBtn = document.getElementById('openPotModalBtn');
    const closePotModalBtn = document.getElementById('closePotModalBtn');
    const potForm = document.getElementById('potForm');
    const pName = document.getElementById('pName');
    const charCount = document.getElementById('charCount');

    // "Manage Money" Modal elements
    const manageMoneyModal = document.getElementById('manageMoneyModal');
    const closeManageMoneyBtn = document.getElementById('closeManageMoneyBtn');
    const manageMoneyForm = document.getElementById('manageMoneyForm');
    const manageMoneyTitle = document.getElementById('manageMoneyTitle');
    const manageMoneyDesc = document.getElementById('manageMoneyDesc');
    const manageMoneyAmount = document.getElementById('manageMoneyAmount');
    
    if (!potsCardsContainer || !potModal || !openPotModalBtn || !closePotModalBtn || !potForm) {
        console.warn('Some Pots DOM elements not found. Initialization skipped.');
        return;
    }

    function renderPots() {
        potsCardsContainer.innerHTML = '';
        
        if (potsData.length === 0) {
            potsCardsContainer.innerHTML = '<div class="col-span-full text-center text-gray-400 py-10">No pots found. Add one to start saving!</div>';
            return;
        }

        potsData.forEach(pot => {
            const savedPercent = pot.target > 0 ? Math.min(100, (pot.saved / pot.target) * 100) : 0;
            
            const card = document.createElement('div');
            card.className = "bg-white rounded-xl p-6 md:p-8 shadow-sm flex flex-col";
            
            card.innerHTML = `
                <div class="flex items-center justify-between mb-6">
                  <div class="flex items-center gap-3">
                    <div class="w-4 h-4 rounded-full" style="background-color: ${pot.theme}"></div>
                    <h3 class="text-xl font-bold text-[#1f2230]">${pot.name}</h3>
                  </div>
                  <button class="text-gray-400 hover:text-gray-600"><i data-lucide="more-horizontal" class="w-5 h-5"></i></button>
                </div>
                
                <div class="flex items-center justify-between mb-3">
                    <span class="text-sm text-gray-500 font-semibold">Total Saved</span>
                    <span class="text-3xl font-bold text-[#1f2230]">${formatCurrency(pot.saved)}</span>
                </div>
                
                <div class="w-full bg-[#f3f4f6] h-3 rounded-full overflow-hidden mb-3">
                  <div class="h-full transition-all duration-500" style="width: ${savedPercent}%; background-color: ${pot.theme};"></div>
                </div>
                
                <div class="flex items-center justify-between text-xs text-gray-500 font-semibold mb-8">
                    <span>${savedPercent.toFixed(2)}%</span>
                    <span>Target of ${formatCurrency(pot.target)}</span>
                </div>
                
                <div class="flex gap-4 mt-auto">
                    <button class="flex-1 bg-[#fcfaf8] hover:bg-gray-100 border border-transparent text-[#1f2230] font-bold py-3 rounded-xl transition text-sm add-money-btn" data-id="${pot.id}">+ Add Money</button>
                    <button class="flex-1 bg-[#fcfaf8] hover:bg-gray-100 border border-transparent text-[#1f2230] font-bold py-3 rounded-xl transition text-sm withdraw-btn" data-id="${pot.id}">Withdraw</button>
                </div>
            `;
            
            potsCardsContainer.appendChild(card);
        });
        
        // Add event listeners for the dynamic buttons
        document.querySelectorAll('.add-money-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openManageMoneyModal(e.target.dataset.id, 'add');
            });
        });
        
        document.querySelectorAll('.withdraw-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                openManageMoneyModal(e.target.dataset.id, 'withdraw');
            });
        });

        // @ts-ignore
        if (window.lucide && typeof window.lucide.createIcons === 'function') {
            window.lucide.createIcons();
        }
    }

    // "Add New Pot" Modal interactions
    openPotModalBtn.addEventListener('click', () => {
        potModal.classList.remove('hidden');
        potModal.classList.add('flex');
    });

    closePotModalBtn.addEventListener('click', () => {
        potModal.classList.add('hidden');
        potModal.classList.remove('flex');
        potForm.reset();
        charCount.textContent = '30 characters left';
    });
    
    if(pName && charCount) {
        pName.addEventListener('input', () => {
            const remaining = 30 - pName.value.length;
            charCount.textContent = remaining + ' characters left';
        });
    }

    // New Pot Form Submission
    potForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('pName').value;
        const target = parseFloat(document.getElementById('pTarget').value);
        const theme = document.getElementById('pTheme').value;
        
        potsData.push({
            id: Date.now().toString(),
            name,
            target,
            theme,
            saved: 0
        });
        
        potModal.classList.add('hidden');
        potModal.classList.remove('flex');
        potForm.reset();
        if(charCount) charCount.textContent = '30 characters left';
        
        savePotsData();
        renderPots();
    });

    // "Manage Money" Modal interactions
    function openManageMoneyModal(potId, action) {
        currentActionPotId = potId;
        currentActionType = action;
        
        const pot = potsData.find(p => p.id === potId);
        if (!pot) return;
        
        if (action === 'add') {
            manageMoneyTitle.textContent = 'Add Money to Pot';
            manageMoneyDesc.textContent = `Add money to your '${pot.name}' pot. Current balance is ${formatCurrency(pot.saved)}.`;
        } else {
            manageMoneyTitle.textContent = 'Withdraw from Pot';
            manageMoneyDesc.textContent = `Withdraw money from your '${pot.name}' pot. Current balance is ${formatCurrency(pot.saved)}.`;
        }
        
        manageMoneyModal.classList.remove('hidden');
        manageMoneyModal.classList.add('flex');
    }
    
    if (closeManageMoneyBtn) {
        closeManageMoneyBtn.addEventListener('click', () => {
            manageMoneyModal.classList.add('hidden');
            manageMoneyModal.classList.remove('flex');
            manageMoneyForm.reset();
        });
    }

    if (manageMoneyForm) {
        manageMoneyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const amount = parseFloat(manageMoneyAmount.value);
            const potIndex = potsData.findIndex(p => p.id === currentActionPotId);
            
            if (potIndex > -1 && !isNaN(amount) && amount > 0) {
                if (currentActionType === 'add') {
                    potsData[potIndex].saved += amount;
                } else if (currentActionType === 'withdraw') {
                    potsData[potIndex].saved = Math.max(0, potsData[potIndex].saved - amount);
                }
                savePotsData();
                renderPots();
            }
            
            manageMoneyModal.classList.add('hidden');
            manageMoneyModal.classList.remove('flex');
            manageMoneyForm.reset();
        });
    }

    renderPots();
};

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.initPots === 'function' && document.getElementById('potsCardsContainer')) {
        window.initPots();
    }
});
