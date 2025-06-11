// app.js

// Load or initialize data structure in localStorage
let data = {
  purchases: [],
  transfers: [],
  assignments: [],
  expenditures: []
};

const storedData = localStorage.getItem('militaryAssetData');
if (storedData) {
  data = JSON.parse(storedData);
} else {
  // Initialize with empty arrays or some sample data if you want
  localStorage.setItem('militaryAssetData', JSON.stringify(data));
}

// Utility: format Date object to yyyy-mm-dd for input[type=date]
function formatDate(date) {
  const yyyy = date.getFullYear();
  let mm = date.getMonth() + 1;
  let dd = date.getDate();

  if (mm < 10) mm = '0' + mm;
  if (dd < 10) dd = '0' + dd;

  return `${yyyy}-${mm}-${dd}`;
}

// Dashboard setup and render function
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

  const purchaseList = document.getElementById('purchaseList');
  const transferInList = document.getElementById('transferInList');
  const transferOutList = document.getElementById('transferOutList');

  // Set default dates: last 30 days
  const today = new Date();
  const priorDate = new Date();
  priorDate.setDate(today.getDate() - 30);
  startDateInput.value = formatDate(priorDate);
  endDateInput.value = formatDate(today);

  function calculateAndRender() {
    const startDate = startDateInput.value ? new Date(startDateInput.value) : null;
    const endDate = endDateInput.value ? new Date(endDateInput.value) : null;
    const base = baseFilter.value;
    const equipment = equipmentFilter.value.toLowerCase();

    // Filter purchases by date, base, equipment
    const filteredPurchases = data.purchases.filter(p => {
      const pDate = new Date(p.purchaseDate);
      const matchBase = base === 'all' || p.receivingBase === base;
      const matchEquip = equipment === 'all' || p.assetType.toLowerCase() === equipment;
      return (!startDate || pDate >= startDate) && (!endDate || pDate <= endDate) && matchBase && matchEquip;
    });

    // Calculate total purchased quantity
    let totalPurchased = filteredPurchases.reduce((sum, p) => sum + p.quantity, 0);

    // Filter transfers
    const filteredTransfers = data.transfers.filter(t => {
      const tDate = new Date(t.transferDate);
      const matchBase = base === 'all' || t.sourceBase === base || t.destinationBase === base;
      const matchEquip = equipment === 'all' || t.assetType.toLowerCase() === equipment;
      return (!startDate || tDate >= startDate) && (!endDate || tDate <= endDate) && matchBase && matchEquip;
    });

    let transferIn = 0, transferOut = 0;
    filteredTransfers.forEach(t => {
      if (base === 'all') {
        // When 'all' bases selected, count both in and out
        transferIn += t.quantity;
        transferOut += t.quantity;
      } else {
        if (t.destinationBase === base) transferIn += t.quantity;
        if (t.sourceBase === base) transferOut += t.quantity;
      }
    });

    // Net Movement = purchases + transfers in - transfers out
    const netMovement = totalPurchased + transferIn - transferOut;

    // Assignments filtered
    const filteredAssignments = data.assignments.filter(a => {
      const aDate = new Date(a.assignmentDate);
      const matchEquip = equipment === 'all' || a.assetType.toLowerCase() === equipment;
      const matchBase = base === 'all' || a.base === base;
      return (!startDate || aDate >= startDate) && (!endDate || aDate <= endDate) && matchBase && matchEquip;
    });
    const totalAssigned = filteredAssignments.reduce((sum, a) => sum + a.quantity, 0);

    // Expenditures filtered
    const filteredExpenditures = data.expenditures.filter(e => {
      const eDate = new Date(e.expenditureDate);
      const matchEquip = equipment === 'all' || e.assetType.toLowerCase() === equipment;
      const matchBase = base === 'all' || e.base === base;
      return (!startDate || eDate >= startDate) && (!endDate || eDate <= endDate) && matchBase && matchEquip;
    });
    const totalExpended = filteredExpenditures.reduce((sum, e) => sum + e.quantity, 0);

    // For opening balance, you can calculate historical data (for now 0)
    const openingBalance = 0;

    // Calculate closing balance
    const closingBalance = openingBalance + netMovement - totalAssigned - totalExpended;

    // Update dashboard display
    openingBalanceElem.textContent = openingBalance;
    closingBalanceElem.textContent = closingBalance;
    netMovementElem.textContent = netMovement;
    assignedAssetsElem.textContent = totalAssigned;
    expendedAssetsElem.textContent = totalExpended;

    // Update modal lists with details
    purchaseList.innerHTML = filteredPurchases.length
      ? filteredPurchases.map(p => `<li>${p.assetType} - ${p.quantity} units on ${p.purchaseDate}</li>`).join('')
      : '<li>No purchases in this range</li>';

    const transfersInFiltered = filteredTransfers.filter(t => base === 'all' || t.destinationBase === base);
    transferInList.innerHTML = transfersInFiltered.length
      ? transfersInFiltered.map(t => `<li>${t.assetType} - ${t.quantity} units to ${t.destinationBase} on ${t.transferDate}</li>`).join('')
      : '<li>No transfers in</li>';

    const transfersOutFiltered = filteredTransfers.filter(t => base === 'all' || t.sourceBase === base);
    transferOutList.innerHTML = transfersOutFiltered.length
      ? transfersOutFiltered.map(t => `<li>${t.assetType} - ${t.quantity} units from ${t.sourceBase} on ${t.transferDate}</li>`).join('')
      : '<li>No transfers out</li>';
  }

  // Event listeners for filters to recalc dashboard on change
  startDateInput.addEventListener('change', calculateAndRender);
  endDateInput.addEventListener('change', calculateAndRender);
  baseFilter.addEventListener('change', calculateAndRender);
  equipmentFilter.addEventListener('change', calculateAndRender);

  // Show modal on clicking Net Movement metric
  netMovementMetric.addEventListener('click', () => {
    netMovementModal.style.display = 'block';
  });

  // Close modal button
  closeModalBtn.addEventListener('click', () => {
    netMovementModal.style.display = 'none';
  });

  // Close modal if clicking outside content
  window.addEventListener('click', (e) => {
    if (e.target === netMovementModal) {
      netMovementModal.style.display = 'none';
    }
  });

  // Initial render
  calculateAndRender();
}

// Initialize dashboard once DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  setupDashboard();
});
