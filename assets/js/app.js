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
  
    // Set default date range
    const today = new Date();
    const priorDate = new Date(today);
    priorDate.setDate(today.getDate() - 30);
    startDateInput.value = formatDate(priorDate);
    endDateInput.value = formatDate(today);
  
    function calculateAndRender() {
      const startDate = new Date(startDateInput.value);
      const endDate = new Date(endDateInput.value);
      const base = baseFilter.value;
      const equipment = equipmentFilter.value;
  
      let totalPurchased = 0;
      let totalAssigned = 0;
      let totalExpended = 0;
      let transferIn = 0;
      let transferOut = 0;
  
      purchaseList.innerHTML = '';
      transferInList.innerHTML = '';
      transferOutList.innerHTML = '';
  
      data.purchases.forEach(p => {
        const pDate = new Date(p.purchaseDate);
        const matchBase = base === 'all' || p.receivingBase === base;
        const matchEquip = equipment === 'all' || p.assetType.toLowerCase() === equipment.toLowerCase();
        if (pDate >= startDate && pDate <= endDate && matchBase && matchEquip) {
          totalPurchased += p.quantity;
          const li = document.createElement('li');
          li.textContent = `${p.quantity} ${p.assetType} from ${p.supplierInfo} to ${p.receivingBase}`;
          purchaseList.appendChild(li);
        }
      });
  
      data.transfers.forEach(t => {
        const tDate = new Date(t.transferDate);
        const matchEquip = equipment === 'all' || t.assetType.toLowerCase() === equipment.toLowerCase();
        const relevant = tDate >= startDate && tDate <= endDate && matchEquip;
  
        if (relevant) {
          if (base === 'all' || t.destinationBase === base) {
            transferIn += t.quantity;
            const li = document.createElement('li');
            li.textContent = `${t.quantity} ${t.assetType} to ${t.destinationBase}`;
            transferInList.appendChild(li);
          }
          if (base === 'all' || t.sourceBase === base) {
            transferOut += t.quantity;
            const li = document.createElement('li');
            li.textContent = `${t.quantity} ${t.assetType} from ${t.sourceBase}`;
            transferOutList.appendChild(li);
          }
        }
      });
  
      data.assignments.forEach(a => {
        const aDate = new Date(a.assignmentDate);
        const matchEquip = equipment === 'all' || a.assetType.toLowerCase() === equipment.toLowerCase();
        if (aDate >= startDate && aDate <= endDate && matchEquip) {
          totalAssigned += a.quantity;
        }
      });
  
      data.expenditures.forEach(e => {
        const eDate = new Date(e.expenditureDate);
        const matchEquip = equipment === 'all' || e.assetType.toLowerCase() === equipment.toLowerCase();
        if (eDate >= startDate && eDate <= endDate && matchEquip) {
          totalExpended += e.quantity;
        }
      });
  
      const openingBalance = 0; // Optional: calculate from earlier dates
      const netMovement = totalPurchased + transferIn - transferOut;
      const closingBalance = netMovement - totalAssigned - totalExpended;
  
      // Update values on screen
      openingBalanceElem.textContent = openingBalance;
      netMovementElem.textContent = netMovement;
      closingBalanceElem.textContent = closingBalance;
      assignedAssetsElem.textContent = totalAssigned;
      expendedAssetsElem.textContent = totalExpended;
    }
  
    // Event listeners
    [startDateInput, endDateInput, baseFilter, equipmentFilter].forEach(input => {
      input.addEventListener('change', calculateAndRender);
    });
  
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
  