(function() {
  const { urlprefix } = window.utils || { urlprefix: 'https://asphaleia.onrender.com/api/v1' };

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

    // Configuration
    let teachers = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredTeachers = [...teachers];
    let isLoading = false;
    let isEditing = false;

    // Hardcoded roles
    const roles = [
      { id: 'Admin', name: 'Admin' },
      { id: 'Co-Admin', name: 'Co-Admin' },
      { id: 'Teacher', name: 'Teacher' }
    ];

    // Populate role dropdown
    function populateRoles() {
      const roleSelect = document.getElementById('role');
      if (!roleSelect) {
        showToast('Role dropdown not found', false);
        return;
      }

      roleSelect.innerHTML = '<option value="" disabled selected>Select Role</option>';
      
      roles.forEach(role => {
        const option = document.createElement('option');
        option.value = role.id;
        option.textContent = role.name;
        roleSelect.appendChild(option);
      });

      roleSelect.addEventListener('change', updateSubmitButtonState);
    }

    // Fetch teachers with pagination
    async function fetchTeachers(page = 1, query = '', retries = 3, delay = 2000) {
      const controls = ['page-info', 'prev-page', 'next-page', 'refresh-btn', 'select-all']
        .map(id => document.getElementById(id));
      
      if (controls.some(ctrl => !ctrl)) {
        return;
      }

      if (isLoading) return;
      isLoading = true;
      controls.slice(1, 4).forEach(btn => btn.disabled = true);
      controls[4].checked = false;

      try {
        const queryParams = new URLSearchParams({ page, limit: itemsPerPage, query }).toString();
        const response = await fetch(`${urlprefix}/teachers?${queryParams}`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const data = await response.json();

        if (data.success) {
          teachers = data.teachers || [];
          filteredTeachers = [...teachers];
          renderTeacherTable(page);
          const totalPages = Math.ceil(data.total / itemsPerPage);
          controls[0].innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
          controls[1].disabled = page === 1;
          controls[2].disabled = page === totalPages;
        } else {
          throw new Error(data.message || 'Failed to fetch teachers');
        }
      } catch (error) {
        if (retries > 0 && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchTeachers(page, query, retries - 1, delay * 2);
        }
        teachers = [];
        filteredTeachers = [];
        renderTeacherTable(page);
        showToast('Failed to fetch teachers.', false);
      } finally {
        isLoading = false;
        controls.slice(1, 4).forEach(btn => btn.disabled = false);
        updateBulkDeleteButton();
      }
    }

    // Render teacher table
    const renderTeacherTable = (page, data = filteredTeachers) => {
      const elements = ['teacher-table', 'prev-page', 'next-page', 'page-info', 'bulk-delete', 'select-all']
        .map(id => document.getElementById(id));
      
      if (elements.some(el => !el)) return;

      const [table, prevBtn, nextBtn, pageInfo] = elements;
      table.innerHTML = '';

      const paginatedItems = data.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );

      paginatedItems.forEach(teacher => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="p-4 text-gray-700"><input type="checkbox" class="select-teacher" data-id="${teacher.id}"></td>
          <td class="p-4 text-gray-700">${teacher.name}</td>
          <td class="p-4 text-gray-700">${teacher.email}</td>
          <td class="p-4 text-gray-700">
            <span class="px-2 py-1 rounded-full text-xs ${
              teacher.role === 'Admin' ? 'bg-purple-100 text-purple-800' : 
              teacher.role === 'Co-Admin' ? 'bg-blue-100 text-blue-800' : 
              'bg-green-100 text-green-800'
            }">
              ${teacher.role}
            </span>
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
            <button class="text-blue-600 hover:text-blue-800 edit-teacher p-1 rounded-full hover:bg-blue-50 transition-colors" data-id="${teacher.id}" title="Edit">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="text-red-600 hover:text-red-800 delete-teacher p-1 rounded-full hover:bg-red-50 transition-colors" data-id="${teacher.id}" title="Delete">
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
        document.querySelectorAll('.select-teacher').forEach(checkbox => {
          checkbox.checked = e.target.checked;
        });
        updateBulkDeleteButton();
      });

      document.querySelectorAll('.select-teacher').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          elements[5].checked = false;
          updateBulkDeleteButton();
        });
      });

      document.querySelectorAll('.edit-teacher').forEach(button => {
        button.addEventListener('click', () => {
          const teacherId = button.getAttribute('data-id');
          handleEditTeacher(parseInt(teacherId));
        });
      });

      document.querySelectorAll('.delete-teacher').forEach(button => {
        button.addEventListener('click', async (e) => {
          const teacherId = e.target.closest('button').getAttribute('data-id');
          const teacherName = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
          
          if (confirm(`Delete teacher ${teacherName} (${teacherId})?`)) {
            try {
              const response = await fetch(`${urlprefix}/teachers/delete/${teacherId}`, { 
                method: 'PUT' 
              });
              const data = await response.json();
              if (data.success) {
                showToast(`Teacher ${teacherName} deleted successfully`);
                triggerRefresh();
              } else {
                throw new Error(data.message || 'Failed to delete teacher');
              }
            } catch (error) {
              console.error('Error deleting teacher:', error);
              showToast(`Failed to delete teacher ${teacherName}`, false);
            }
          }
        });
      });
    };

    // Update bulk delete button
    const updateBulkDeleteButton = () => {
      const bulkDeleteBtn = document.getElementById('bulk-delete');
      if (!bulkDeleteBtn) return;
      
      const selectedCount = document.querySelectorAll('.select-teacher:checked').length;
      bulkDeleteBtn.textContent = `Delete Selected (${selectedCount})`;
      bulkDeleteBtn.classList.toggle('hidden', selectedCount === 0);
    };

    // Trigger refresh
    const triggerRefresh = () => {
      const refreshBtn = document.getElementById('refresh-btn');
      refreshBtn?.click();
    };

    // Handle bulk delete
    const handleBulkDelete = () => {
      const bulkDeleteBtn = document.getElementById('bulk-delete');
      if (!bulkDeleteBtn) return;

      bulkDeleteBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const selected = Array.from(document.querySelectorAll('.select-teacher:checked'));
        const selectedIds = selected.map(cb => cb.getAttribute('data-id'));
        const selectedNames = selected.map(cb => 
          cb.closest('tr').querySelector('td:nth-child(2)').textContent
        );

        if (selectedIds.length > 0 && confirm(`Delete ${selectedIds.length} selected teachers?`)) {
          try {
            const response = await fetch(`${urlprefix}/teachers/bulk-delete`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedIds })
            });
            const data = await response.json();
            if (data.success) {
              showToast(`Deleted ${selectedIds.length} teachers successfully`);
              triggerRefresh();
            } else {
              throw new Error(data.message || 'Failed to bulk delete teachers');
            }
          } catch (error) {
            console.error('Error bulk deleting:', error);
            showToast('Failed to delete selected teachers', false);
          }
        }
      });
    };

    // Handle search
    const handleSearch = () => {
      const searchInput = document.getElementById('search');
      if (!searchInput) return;

      searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase().trim();
        filteredTeachers = teachers.filter(teacher =>
          Object.values(teacher).some(
            val => val.toString().toLowerCase().includes(query)
          )
        );
        currentPage = 1;
        renderTeacherTable(currentPage);
      });
    };

    // Handle biometric fetch
    const handleFetch = () => {
      const elements = ['fetch-btn', 'rfid', 'fingerprint', 'rfid-check', 'fingerprint-check', 'submit-btn']
        .map(id => document.getElementById(id));
      
      if (elements.some(el => !el)) {
        return;
      }

      const [fetchBtn, rfidInput, fingerprintInput, rfidCheck, fingerprintCheck, submitBtn] = elements;

      fetchBtn.addEventListener('click', () => {
        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Fetching...';
        rfidCheck.classList.add('hidden');
        fingerprintCheck.classList.add('hidden');

        let pollingInterval = setInterval(async () => {
          try {
            const response = await fetch(`${urlprefix}/arduino/fetch-biometric`);
            const data = await response.json();

            if (data.rfid && !rfidInput.value) {
              rfidInput.value = data.rfid;
              rfidCheck.classList.remove('hidden');
              showToast('RFID fetched successfully');
            }

            if (data.fingerprint_id && !fingerprintInput.value) {
              fingerprintInput.value = data.fingerprint_id;
              fingerprintCheck.classList.remove('hidden');
              showToast('Fingerprint fetched successfully');
            }

            if (rfidInput.value && fingerprintInput.value) {
              clearInterval(pollingInterval);
              fetchBtn.disabled = false;
              fetchBtn.textContent = 'Fetch RFID & Fingerprint';
            }
            updateSubmitButtonState();
          } catch (error) {
          }
        }, 1000);

        setTimeout(() => {
          clearInterval(pollingInterval);
          if (!rfidInput.value || !fingerprintInput.value) {
            showToast('Timeout: No biometric data received', false);
          }
          fetchBtn.disabled = false;
          fetchBtn.textContent = 'Fetch RFID & Fingerprint';
          updateSubmitButtonState();
        }, 10000);
      });
    };

    // Update submit button state
    function updateSubmitButtonState() {
      const submitBtn = document.getElementById('submit-btn');
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const role = document.getElementById('role').value;
      const rfid = document.getElementById('rfid').value.trim();
      const fingerprint_id = document.getElementById('fingerprint').value.trim();

      const isRegisterMode = !isEditing;
      const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isValidRole = role && roles.some(r => r.id === role);

      if (isRegisterMode) {
        submitBtn.disabled = !(name && isValidEmail && isValidRole && rfid && fingerprint_id);
      } else {
        submitBtn.disabled = !(name && isValidEmail && isValidRole);
      }
    }

    // Handle form input changes
    function handleFormInputChanges() {
      ['name', 'email', 'role', 'rfid', 'fingerprint'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.addEventListener('input', updateSubmitButtonState);
        }
      });
    }

    // Clear form
    function clearForm() {
      const form = document.getElementById('teacher-form');
      const formTitle = document.getElementById('form-title');
      const submitBtnText = document.getElementById('submit-btn-text');
      const cancelBtn = document.getElementById('cancel-teacher-form');
      
      if (form) form.reset();
      const editId = document.getElementById('edit-teacher-id');
      if (editId) editId.value = '';
      
      const rfidCheck = document.getElementById('rfid-check');
      if (rfidCheck) rfidCheck.classList.add('hidden');
      
      const fingerprintCheck = document.getElementById('fingerprint-check');
      if (fingerprintCheck) fingerprintCheck.classList.add('hidden');
      
      const fetchBtn = document.getElementById('fetch-btn');
      if (fetchBtn) fetchBtn.disabled = false;
      
      if (formTitle) formTitle.textContent = 'Register New Teacher';
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

    // Handle edit teacher
    async function handleEditTeacher(teacherId) {
      try {
        const teacher = teachers.find(t => t.id === teacherId);
        if (!teacher) {
          showToast('Teacher not found', false);
          return;
        }

        const formTitle = document.getElementById('form-title');
        const submitBtnText = document.getElementById('submit-btn-text');
        const cancelBtn = document.getElementById('cancel-btn');
        const rfidCheck = document.getElementById('rfid-check');
        const fingerprintCheck = document.getElementById('fingerprint-check');
        
        if (!formTitle || !submitBtnText || !cancelBtn || !rfidCheck || !fingerprintCheck) {
          showToast('Error loading teacher form', false);
          return;
        }
        
        isEditing = true;
        formTitle.textContent = 'Edit Teacher';
        submitBtnText.textContent = 'Save';
        cancelBtn.classList.remove('hidden');

        // Set form values
        const form = document.getElementById('teacher-form');
        if (form) {
          form.elements['edit-teacher-id'].value = teacher.id;
          form.elements['name'].value = teacher.name || '';
          form.elements['email'].value = teacher.email || '';
          form.elements['role'].value = teacher.role || '';
          form.elements['rfid'].value = teacher.rfid || '';
          form.elements['fingerprint'].value = teacher.fingerprint || '';
          
          // Toggle checkmarks
          rfidCheck.classList.toggle('hidden', !teacher.rfid);
          fingerprintCheck.classList.toggle('hidden', !teacher.fingerprint);
          
          updateSubmitButtonState();
        } else {
          showToast('Error loading teacher form', false);
        }
      } catch (error) {
        showToast('Error loading teacher details', false);
      }
    }

    // Handle cancel edit
    function handleCancelEdit() {
      const cancelBtn = document.getElementById('cancel-btn');
      if (!cancelBtn) return;

      cancelBtn.addEventListener('click', () => {
        clearForm();
        showToast('Edit cancelled');
      });
    }

    // Handle form submission
    const handleTeacherForm = () => {
      const form = document.getElementById('teacher-form');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = {
          id: document.getElementById('edit-teacher-id').value,
          name: document.getElementById('name').value.trim(),
          email: document.getElementById('email').value.trim(),
          role: document.getElementById('role').value,
          rfid: document.getElementById('rfid').value.trim() || null,
          fingerprint_id: document.getElementById('fingerprint').value.trim() || null
        };


        if (!formData.name || !formData.email || !formData.role) {
          showToast('Please fill in all required fields', false);
          return;
        }

        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          showToast('Please enter a valid email address', false);
          return;
        }

        const validRole = roles.some(r => r.id === formData.role);
        if (!validRole) {
          showToast('Invalid role selected', false);
          return;
        }

        try {
          const endpoint = isEditing ? `${urlprefix}/teachers-update` : `${urlprefix}/teachers-register`;
          const method = isEditing ? 'PUT' : 'POST';
          
          const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          const result = await response.json();
          if (result.success) {
            showToast(`Teacher ${formData.name} ${isEditing ? 'updated' : 'added'} successfully`);
            triggerRefresh();
            clearForm();
          } else {
            throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'add'} teacher`);
          }
        } catch (error) {
          showToast(`Failed to ${isEditing ? 'update' : 'add'} teacher. Please try again.`, false);
        }
      });
    };

    // Handle refresh with effects
    const handleRefresh = () => {
      const refreshBtn = document.getElementById('refresh-btn');
      if (!refreshBtn) {
        showToast('Refresh button not found', false);
        return;
      }

      refreshBtn.addEventListener('click', async () => {
        const originalContent = refreshBtn.innerHTML;
        refreshBtn.disabled = true;
        refreshBtn.innerHTML = `
          <svg id="refresh-icon" class="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refreshing...</span>
        `;

        try {
          await fetchTeachers(currentPage);
          showToast('Teacher list refreshed successfully');
        } catch (error) {
          showToast('Failed to refresh teacher list', false);
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
        fetchTeachers(currentPage);
      }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      if (currentPage < Math.ceil(filteredTeachers.length / itemsPerPage) && !isLoading) {
        currentPage++;
        fetchTeachers(currentPage);
      }
    });

    // Initialize all components
    populateRoles();
    fetchTeachers(currentPage);
    handleTeacherForm();
    handleSearch();
    handleBulkDelete();
    handleRefresh();
    handleFetch();
    handleClearForm();
    handleCancelEdit();
    handleFormInputChanges();
  });
})();