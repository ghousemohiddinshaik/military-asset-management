// Simple in-memory data storage to simulate backend
const data = {
  purchases: [],
  transfers: [],
  assignments: [],
  expenditures: []
};

// Utility to format date to yyyy-mm-dd
function formatDate(date) {
  return new Date(date).toISOString().split('T')[0];
}

// Load saved data from localStorage
function loadData() {
  const saved = localStorage.getItem('militaryAssetData');
  if (saved) {
    try {
      Object.assign(data, JSON.parse(saved));
    } catch {
      console.warn('Failed to parse saved data.');
    }
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem('militaryAssetData', JSON.stringify(data));
}

// Add event listeners and render data depending on the page
document.addEventListener('DOMContentLoaded', () => {
  loadData();

  const path = window.location.pathname.split('/').pop();

  if (path === 'purchases.html') {
    setupPurchaseForm();
    renderPurchaseHistory();
  } else if (path === 'transfers.html') {
    setupTransferForm();
    renderTransferHistory();
  } else if (path === 'assignments.html') {
    setupAssignmentForm();
    renderAssignmentHistory();
  } else if (path === 'expenditures.html') {
    setupExpenditureForm();
    renderExpenditureHistory();
  } else if (path === 'index.html' || path === '') {
    setupDashboard();
  }
});

/* PURCHASES */
function setupPurchaseForm() {
  const form = document.getElementById('purchaseForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const purchase = {
      assetType: form.assetType.value,
      modelName: form.modelName.value,
      quantity: Number(form.quantity.value),
      unitCost: Number(form.unitCost.value) || 0,
      purchaseDate: form.purchaseDate.value,
      supplierInfo: form.supplierInfo.value,
      receivingBase: form.receivingBase.value
    };

    data.purchases.push(purchase);
    saveData();
    renderPurchaseHistory();
    form.reset();
  });
}

function renderPurchaseHistory() {
  const tbody = document.querySelector('#purchaseHistory tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.purchases.forEach((p) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${p.assetType}</td>
      <td>${p.modelName}</td>
      <td>${p.quantity}</td>
      <td>${p.unitCost.toFixed(2)}</td>
      <td>${(p.unitCost * p.quantity).toFixed(2)}</td>
      <td>${p.purchaseDate}</td>
      <td>${p.supplierInfo}</td>
      <td>${p.receivingBase}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* TRANSFERS */
function setupTransferForm() {
  const form = document.getElementById('transferForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const transfer = {
      assetType: form.transferAssetType.value,
      quantity: Number(form.transferQuantity.value),
      sourceBase: form.sourceBase.value,
      destinationBase: form.destinationBase.value,
      transferDate: form.transferDate.value,
      reason: form.transferReason.value
    };

    if (transfer.sourceBase === transfer.destinationBase) {
      alert('Source and destination bases cannot be the same.');
      return;
    }

    data.transfers.push(transfer);
    saveData();
    renderTransferHistory();
    form.reset();
  });
}

function renderTransferHistory() {
  const tbody = document.querySelector('#transferHistory tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.transfers.forEach((t) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${t.assetType}</td>
      <td>${t.quantity}</td>
      <td>${t.sourceBase}</td>
      <td>${t.destinationBase}</td>
      <td>${t.transferDate}</td>
      <td>${t.reason}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* ASSIGNMENTS */
function setupAssignmentForm() {
  const form = document.getElementById('assignmentForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const assignment = {
      assetType: form.assignmentAssetType.value,
      quantity: Number(form.assignmentQuantity.value),
      personnelName: form.personnelName.value,
      personnelID: form.personnelID.value,
      assignmentDate: form.assignmentDate.value
    };

    data.assignments.push(assignment);
    saveData();
    renderAssignmentHistory();
    form.reset();
  });
}

function renderAssignmentHistory() {
  const tbody = document.querySelector('#assignmentHistory tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.assignments.forEach((a) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${a.assetType}</td>
      <td>${a.quantity}</td>
      <td>${a.personnelName}</td>
      <td>${a.personnelID}</td>
      <td>${a.assignmentDate}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* EXPENDITURES */
function setupExpenditureForm() {
  const form = document.getElementById('expenditureForm');
  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const expenditure = {
      assetType: form.expenditureAssetType.value,
      quantity: Number(form.expenditureQuantity.value),
      reason: form.expenditureReason.value,
      expenditureDate: form.expenditureDate.value
    };

    data.expenditures.push(expenditure);
    saveData();
    renderExpenditureHistory();
    form.reset();
  });
}

function renderExpenditureHistory() {
  const tbody = document.querySelector('#expenditureHistory tbody');
  if (!tbody) return;
  tbody.innerHTML = '';

  data.expenditures.forEach((e) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${e.assetType}</td>
      <td>${e.quantity}</td>
      <td>${e.reason}</td>
      <td>${e.expenditureDate}</td>
    `;
    tbody.appendChild(tr);
  });
}

/* DASHBOARD */
function setupDashboard() {
  const openingBalanceElem = document.getElementById('openingBalance');
  const closingBalanceElem = document.getElementById('closingBalance');
  const netMovementElem = document.getElementById('netMovement');
  const assignedAssetsElem = document.getElementById('assignedAssets');
  const expendedAssetsElem = document.getElementById('expendedAssets');

  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');
  const baseFilter = document.getElementById('baseFilter');
  const equipmentFilter = document.getElementById('equipmentFilter');
  const netMovementMetric = document.getElementById('netMovementMetric');

  const netMovementModal = document.getElementById('netMovementModal');
  const closeModalBtn = document.getElementById('closeModal');

  // Set default dates to last 30 days
  const today = new Date();
  const priorDate = new Date();
  priorDate.setDate(today.getDate() - 30);
  startDateInput.value = formatDate(priorDate);
  endDateInput.value = formatDate(today);

  function calculateAndRender() {
    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
    const base = baseFilter.value;
    const equipment = equipmentFilter.value;

    // Filter purchases
    const filteredPurchases = data.purchases.filter(p => {
      const pDate = new Date(p.purchaseDate);
      const matchBase = base === 'all' || p.receivingBase === base;
      const matchEquip = equipment === 'all' || p.assetType.toLowerCase() === equipment.toLowerCase();
      return (!startDate || pDate >= startDate) && (!endDate || pDate <= endDate) && matchBase && matchEquip;
    });

    // Calculate totals
    let openingBalance = 0; // Simplified placeholder
    let totalPurchased = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);

    // Filter transfers for net movement
    const filteredTransfers = data.transfers.filter(t => {
      const tDate = new Date(t.transferDate);
      const matchBase = base === 'all' || t.sourceBase === base || t.destinationBase === base;
      const matchEquip = equipment === 'all' || t.assetType.toLowerCase() === equipment.toLowerCase();
      return (!startDate || tDate >= startDate) && (!endDate || tDate <= endDate) && matchBase && matchEquip;
    });

    // Net movement calculation (purchases + transfers in - transfers out)
    let transferIn = 0, transferOut = 0;
    filteredTransfers.forEach(t => {
      if (base === 'all') {
        transferIn += t.quantity;
        transferOut += t.quantity;
      } else {
        if (t.destinationBase === base) transferIn += t.quantity;
        if (t.sourceBase === base) transferOut += t.quantity;
      }
    });

    const netMovement = totalPurchased + transferIn - transferOut;

    // Assignments
    const filteredAssignments = data.assignments.filter(a => {
      const aDate = new Date(a.assignmentDate);
      const matchEquip = equipment === 'all' || a.assetType.toLowerCase() === equipment.toLowerCase();
      return (!startDate || aDate >= startDate) && (!endDate || aDate <= endDate) && (base === 'all' || true) && matchEquip;
    });
    const totalAssigned = filteredAssignments.reduce((sum, a) => sum + a.quantity, 0);

    // Expenditures
    const filteredExpenditures = data.expenditures.filter(e => {
      const eDate = new Date(e.expenditureDate);
      const matchEquip = equipment === 'all' || e.assetType.toLowerCase() === equipment.toLowerCase();
      return (!startDate || eDate >= startDate) && (!endDate || eDate <= endDate) && (base === 'all' || true) && matchEquip;
    });
    const totalExpended = filteredExpenditures.reduce((sum, e) => sum + e.quantity, 0);

    // Update metrics display
    openingBalanceElem.textContent = openingBalance;
    closingBalanceElem.textContent = netMovement - totalAssigned - totalExpended;
    netMovementElem.textContent = netMovement;
    assignedAssetsElem.textContent = totalAssigned;
    expendedAssetsElem.textContent = totalExpended;

    // Prepare modal lists
    renderNetMovementModal(filteredPurchases, filteredTransfers, base);
  }

  function renderNetMovementModal(purchases, transfers, base) {
    const purchaseList = document.getElementById('purchaseList');
    const transferInList = document.getElementById('transferInList');
    const transferOutList = document.getElementById('transferOutList');

    purchaseList.innerHTML = '';
    transfersIn = [];
    transfersOut = [];

    purchases.forEach(p => {
      const li = document.createElement('li');
      li.textContent = `${p.assetType} - Qty: ${p.quantity} on ${p.purchaseDate} at ${p.receivingBase}`;
      purchaseList.appendChild(li);
    });

    transferInList.innerHTML = '';
    transferOutList.innerHTML = '';

    transfers.forEach(t => {
      if (base === 'all' || t.destinationBase === base) {
        const li = document.createElement('li');
        li.textContent = `${t.assetType} - Qty: ${t.quantity} from ${t.sourceBase} on ${t.transferDate}`;
        transferInList.appendChild(li);
      }
      if (base === 'all' || t.sourceBase === base) {
        const li = document.createElement('li');
        li.textContent = `${t.assetType} - Qty: ${t.quantity} to ${t.destinationBase} on ${t.transferDate}`;
        transferOutList.appendChild(li);
      }
    });
  }

  startDateInput.addEventListener('change', calculateAndRender);
  endDateInput.addEventListener('change', calculateAndRender);
  baseFilter.addEventListener('change', calculateAndRender);
  equipmentFilter.addEventListener('change', calculateAndRender);

  netMovementMetric.addEventListener('click', () => {
    netMovementModal.style.display = 'block';
  });

  closeModalBtn.addEventListener('click', () => {
    netMovementModal.style.display = 'none';
  });

  window.addEventListener('click', (e) => {
    if (e.target === netMovementModal) {
      netMovementModal.style.display = 'none';
    }
  });

  calculateAndRender();
}
