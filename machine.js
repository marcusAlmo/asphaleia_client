(function() {
  const { urlprefix } = window.utils || { urlprefix: 'https://asphaleia.onrender.com/api/v1' };
  console.log('machine.js: Initializing with urlprefix:', urlprefix);

  // Toast notification function
  function showToast(message, isSuccess = true) {
    const toast = document.createElement('div');
    toast.className = `fixed top-4 right-4 px-4 py-2 rounded-md shadow-md text-white ${
      isSuccess ? 'bg-green-500' : 'bg-red-500'
    } z-50 transition-opacity duration-300 opacity-0`;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('opacity-100'), 10);
    setTimeout(() => {
      toast.classList.remove('opacity-100');
      setTimeout(() => document.body.removeChild(toast), 300);
    }, 3000);
  }

  document.addEventListener('DOMContentLoaded', () => {
    console.log('machine.js: Initializing machine management page');

    // Configuration
    let machines = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredMachines = [...machines];
    let isLoading = false;
    let isEditing = false;

    // Fetch machines with pagination
    async function fetchMachines(page = 1, query = '', retries = 3, delay = 2000) {
      console.log('fetchMachines called with page:', page, 'query:', query);
      const controls = ['page-info', 'prev-page', 'next-page', 'refresh-btn', 'select-all']
        .map(id => document.getElementById(id));
      
      if (controls.some(ctrl => !ctrl)) {
        console.error('Pagination controls not found');
        return;
      }

      if (isLoading) return;
      isLoading = true;
      controls.slice(1, 4).forEach(btn => btn.disabled = true);
      controls[4].checked = false;

      try {
        const queryParams = new URLSearchParams({ page, limit: itemsPerPage, query }).toString();
        const response = await fetch(`${urlprefix}/machine?${queryParams}`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const data = await response.json();
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (data.success) {
          machines = data.machines || [];
          filteredMachines = [...machines];
          renderMachineTable(page);
          const totalPages = Math.ceil(data.total / itemsPerPage);
          controls[0].innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
          controls[1].disabled = page === 1;
          controls[2].disabled = page === totalPages;
        } else {
          throw new Error(data.message || 'Failed to fetch machines');
        }
      } catch (error) {
        console.error('Error fetching machines:', error);
        if (retries > 0 && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchMachines(page, query, retries - 1, delay * 2);
        }
        machines = [];
        filteredMachines = [];
        renderMachineTable(page);
        showToast('Failed to fetch machines.', false);
      } finally {
        isLoading = false;
        controls.slice(1, 4).forEach(btn => btn.disabled = false);
        updateBulkDeleteButton();
      }
    }

    // Render machine table
    const renderMachineTable = (page, data = filteredMachines) => {
      console.log('renderMachineTable called with page:', page, 'data:', data);
      const elements = ['machine-table', 'prev-page', 'next-page', 'page-info', 'bulk-delete', 'select-all']
        .map(id => document.getElementById(id));
      
      if (elements.some(el => !el)) {
        console.error('Table elements not found');
        return;
      }

      const [table, prevBtn, nextBtn, pageInfo] = elements;
      table.innerHTML = '';

      const paginatedItems = data.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );
      console.log('Paginated items:', paginatedItems);

      paginatedItems.forEach(machine => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="p-4 text-gray-700"><input type="checkbox" class="select-machine" data-id="${parseInt(machine.machine_id)}"></td>
          <td class="p-4 text-gray-700">${machine.machine_id}</td>
          <td class="p-4 text-gray-700">${machine.name}</td>
          <td class="p-4 text-gray-700">${machine.location}</td>
          <td class="p-4">
            <span class="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
              machine.status === 'Active' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }">
              ${machine.status}
            </span>
          </td>
          <td class="p-4 text-gray-700">${machine.service_type}</td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
            <button class="text-blue-600 hover:text-blue-800 edit-machine p-1 rounded-full hover:bg-blue-50 transition-colors" data-id="${parseInt(machine.machine_id)}" title="Edit">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="text-red-600 hover:text-red-800 delete-machine p-1 rounded-full hover:bg-red-50 transition-colors" data-id="${parseInt(machine.machine_id)}" title="Delete">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </td>
        `;
        table.appendChild(row);
      });

      const totalPages = Math.ceil(data.length / itemsPerPage);
      pageInfo.innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
      prevBtn.disabled = page === 1 || isLoading;
      nextBtn.disabled = page === totalPages || isLoading;

      elements[5].addEventListener('change', (e) => {
        document.querySelectorAll('.select-machine').forEach(checkbox => {
          checkbox.checked = e.target.checked;
        });
        updateBulkDeleteButton();
      });

      document.querySelectorAll('.select-machine').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          elements[5].checked = false;
          updateBulkDeleteButton();
        });
      });

      document.querySelectorAll('.edit-machine').forEach(button => {
        button.addEventListener('click', () => {
          const machineId = parseInt(button.getAttribute('data-id'));
          handleEditMachine(machineId);
        });
      });

      document.querySelectorAll('.delete-machine').forEach(button => {
        button.addEventListener('click', async (e) => {
          const machineId = parseInt(e.target.closest('button').getAttribute('data-id'));
          const machine = machines.find(m => m.machine_id === machineId);
          const machineName = machine?.name || e.target.closest('tr').querySelector('td:nth-child(3)').textContent;
          
          const message = `Are you sure you want to delete machine "${machineName}"? This action cannot be undone.`;
          showConfirmationModal(message, async () => {
            try {
              const response = await fetch(`${urlprefix}/machine-delete/${machineId}`, { 
                method: 'DELETE' 
              });
              const data = await response.json();
              if (data.success) {
                showToast(`Machine "${machineName}" deleted successfully`);
                triggerRefresh();
              } else {
                throw new Error(data.message || 'Failed to delete machine');
              }
            } catch (error) {
              console.error('Error deleting machine:', error);
              showToast(`Failed to delete machine "${machineName}". ${error.message}`, false);
            }
          })
        });
      });
    };

    // Update bulk delete button
    const updateBulkDeleteButton = () => {
      const bulkDeleteBtn = document.getElementById('bulk-delete');
      if (!bulkDeleteBtn) return;
      
      const selectedCount = document.querySelectorAll('.select-machine:checked').length;
      bulkDeleteBtn.textContent = `Delete Selected (${selectedCount})`;
      bulkDeleteBtn.classList.toggle('hidden', selectedCount === 0);
    };

    // Trigger refresh
    const triggerRefresh = () => {
      const refreshBtn = document.getElementById('refresh-btn');
      refreshBtn?.click();
    };

    // Create confirmation modal HTML
    const createConfirmationModal = () => {
      const modalHTML = `
        <div id="delete-confirm-modal" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 hidden">
          <div class="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div class="p-6">
              <div class="flex items-center mb-4">
                <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-full bg-red-100">
                  <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <h3 class="ml-3 text-lg font-medium text-gray-900" id="modal-title">Confirm Deletion</h3>
              </div>
              <div class="mt-2">
                <p id="modal-message" class="text-sm text-gray-500"></p>
              </div>
              <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button type="button" id="confirm-delete" class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm">
                  Delete
                </button>
                <button type="button" id="cancel-delete" class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
      
      // Add modal to body if it doesn't exist
      if (!document.getElementById('delete-confirm-modal')) {
        document.body.insertAdjacentHTML('beforeend', modalHTML);
      }
    };

    // Show confirmation modal
    const showConfirmationModal = (message, onConfirm) => {
      const modal = document.getElementById('delete-confirm-modal');
      const messageEl = document.getElementById('modal-message');
      const confirmBtn = document.getElementById('confirm-delete');
      const cancelBtn = document.getElementById('cancel-delete');
      
      if (!modal || !messageEl || !confirmBtn || !cancelBtn) return;
      
      // Set message
      messageEl.textContent = message;
      
      // Show modal
      modal.classList.remove('hidden');
      
      // Handle confirm
      const handleConfirm = () => {
        onConfirm();
        modal.classList.add('hidden');
        // Clean up event listeners
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
      };
      
      // Handle cancel
      const handleCancel = () => {
        modal.classList.add('hidden');
        // Clean up event listeners
        confirmBtn.removeEventListener('click', handleConfirm);
        cancelBtn.removeEventListener('click', handleCancel);
      };
      
      // Add event listeners
      confirmBtn.addEventListener('click', handleConfirm);
      cancelBtn.addEventListener('click', handleCancel);
      
      // Focus on cancel button for better keyboard navigation
      cancelBtn.focus();
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
      const bulkDeleteBtn = document.getElementById('bulk-delete');
      if (!bulkDeleteBtn) return;
      
      // Create modal if it doesn't exist
      createConfirmationModal();

      bulkDeleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const selected = Array.from(document.querySelectorAll('.select-machine:checked'));
        const selectedIds = selected.map(cb => cb.getAttribute('data-id'));
        const selectedNames = selected.map(cb => 
          cb.closest('tr').querySelector('td:nth-child(3)').textContent
        );

        if (selectedIds.length === 0) return;
        
        const message = selectedIds.length === 1 
          ? `Are you sure you want to delete machine "${selectedNames[0]}"? This action cannot be undone.`
          : `Are you sure you want to delete ${selectedIds.length} selected machines? This action cannot be undone.`;
        
        showConfirmationModal(message, async () => {
          try {
            const response = await fetch(`${urlprefix}/machines-delete-bulk`, {
              method: 'DELETE',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedIds })
            });
            const data = await response.json();
            if (data.success) {
              showToast(`Deleted ${selectedIds.length} ${selectedIds.length === 1 ? 'machine' : 'machines'} successfully`);
              triggerRefresh();
            } else {
              throw new Error(data.message || 'Failed to delete machines');
            }
          } catch (error) {
            console.error('Error deleting machines:', error);
            showToast(`Failed to delete ${selectedIds.length === 1 ? 'machine' : 'machines'}. ${error.message}`, false);
          }
        });
      });
    };

    // Handle search
    const handleSearch = () => {
      const searchInput = document.getElementById('search');
      if (!searchInput) return;

      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        filteredMachines = machines.filter(machine =>
          Object.values(machine).some(
            val => val.toString().toLowerCase().includes(query)
          )
        );
        currentPage = 1;
        renderMachineTable(currentPage);
      });
    };

    // Update submit button state
    function updateSubmitButtonState() {
      const submitBtn = document.getElementById('submit-btn');
      const machineId = document.getElementById('machine-id').value.trim();
      const name = document.getElementById('name').value.trim();
      const location = document.getElementById('location').value.trim();
      const type = document.getElementById('type').value;

      submitBtn.disabled = !(machineId && name && location && type);
    }

    // Handle form input changes
    function handleFormInputChanges() {
      ['machine-id', 'name', 'location', 'type'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.addEventListener('input', updateSubmitButtonState);
        }
      });
    }

    // Clear form
    function clearForm() {
      const form = document.getElementById('machine-form');
      const formTitle = document.getElementById('form-title');
      const submitBtnText = document.getElementById('submit-btn-text');
      const cancelBtn = document.getElementById('cancel-edit');
      const editMachineId = document.getElementById('edit-machine-id');
      
      if (form) form.reset();
      if (editMachineId) editMachineId.value = '';
      if (formTitle) formTitle.textContent = 'Register New Machine';
      if (submitBtnText) submitBtnText.textContent = 'Register';
      if (cancelBtn) cancelBtn.classList.add('hidden');
      
      isEditing = false;
      updateSubmitButtonState();
    }

    // Handle clear form button
    function handleClearForm() {
      const clearBtn = document.getElementById('clear-form-btn');
      if (!clearBtn) return;

      clearBtn.addEventListener('click', () => {
        clearForm();
        showToast('Form cleared successfully');
      });
    }

    // Handle edit machine
    async function handleEditMachine(machineId) {
      const machine = machines.find(m => m.machine_id === machineId);
      console.log('Found machine:', machine);
      if (!machine) {
        showToast('Machine not found', false);
        return;
      }

      const formTitle = document.getElementById('form-title');
      const submitBtnText = document.getElementById('submit-btn-text');
      const cancelBtn = document.getElementById('cancel-edit');
      
      isEditing = true;
      formTitle.textContent = 'Edit Machine';
      submitBtnText.textContent = 'Save';
      cancelBtn.classList.remove('hidden');

      document.getElementById('edit-machine-id').value = String(machine.machine_id).trim();
      document.getElementById('machine-id').value = String(machine.machine_id).trim();
      document.getElementById('name').value = String(machine.name || '').trim();
      document.getElementById('location').value = String(machine.location || '').trim();
      document.getElementById('status').value = String(machine.status || '').trim();
      document.getElementById('type').value = String(machine.service_type || '').trim();

      updateSubmitButtonState();
    }

    // Handle cancel edit
    function handleCancelEdit() {
      const cancelBtn = document.getElementById('cancel-edit');
      if (!cancelBtn) return;

      cancelBtn.addEventListener('click', () => {
        clearForm();
        showToast('Edit cancelled');
      });
    }

    // Handle form submission
    const handleMachineForm = () => {
      const form = document.getElementById('machine-form');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        try {
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${isEditing ? 'Saving...' : 'Registering...'}
          `;

          const formData = {
            id: parseInt(document.getElementById('edit-machine-id').value),
            machine_id: parseInt(document.getElementById('machine-id').value),
            name: document.getElementById('name').value.trim(),
            location: document.getElementById('location').value.trim(),
            type: document.getElementById('type').value,
            status: document.getElementById('status').value,
          };

          console.log(formData);

          // Validate required fields
          if (!formData.machine_id || !formData.name || !formData.location || !formData.type) {
            showToast('Please fill in all required fields', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }

          if (isNaN(formData.machine_id) || formData.machine_id <= 0) {
            showToast('Machine ID must be a positive number', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }

          if (!['Monitor', 'Enroll'].includes(formData.type)) {
            showToast('Invalid machine type', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }

          const endpoint = isEditing ? `${urlprefix}/machine-update` : `${urlprefix}/machine-register`;
          const method = isEditing ? 'PUT' : 'POST';

          const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          const result = await response.json();
          if (result.success) {
            showToast(`Machine ${formData.name} ${isEditing ? 'updated' : 'added'} successfully`);
            triggerRefresh();
            clearForm();
          } else {
            throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'add'} machine`);
          }
        } catch (error) {
          console.error(`Error ${isEditing ? 'updating' : 'adding'} machine:`, error);
          showToast(`Failed to ${isEditing ? 'update' : 'add'} machine. Please try again.`, false);
        } finally {
          submitBtn.disabled = false;
          submitBtn.innerHTML = originalBtnText;
        }
      });
    };

    // Handle refresh with effects
    const handleRefresh = () => {
      const refreshBtn = document.getElementById('refresh-btn');
      const refreshIcon = document.getElementById('refresh-icon');
      if (!refreshBtn || !refreshIcon) return;

      refreshBtn.addEventListener('click', async () => {
        const originalContent = refreshBtn.innerHTML;
        refreshBtn.disabled = true;
        refreshIcon.classList.add('animate-spin');
        refreshBtn.innerHTML = `
          <svg id="refresh-icon" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refreshing...</span>
        `;

        try {
          await fetchMachines(currentPage);
          showToast('Machine list refreshed successfully');
        } catch (error) {
          console.error('Refresh failed:', error);
          showToast('Failed to refresh machine list', false);
        } finally {
          refreshBtn.disabled = false;
          refreshBtn.innerHTML = originalContent;
        }
      });
    };

    // Initialize pagination
    document.getElementById('prev-page')?.addEventListener('click', () => {
      if (currentPage > 1 && !isLoading) {
        currentPage--;
        fetchMachines(currentPage);
      }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      if (currentPage < Math.ceil(filteredMachines.length / itemsPerPage) && !isLoading) {
        currentPage++;
        fetchMachines(currentPage);
      }
    });

    // Initialize all components
    console.log('Initializing machine management');
    fetchMachines(currentPage);
    handleMachineForm();
    handleSearch();
    createConfirmationModal(); // Create modal on init
    handleBulkDelete();
    handleRefresh();
    handleClearForm();
    handleCancelEdit();
    handleFormInputChanges();
    console.log('Initialization complete');
  });
})();