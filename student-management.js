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

    // Mobile sidebar toggle
    const hamburger = document.getElementById('hamburger');
    const sidebar = document.getElementById('sidebar');
    const overlay = document.getElementById('overlay');
    const mainContent = document.getElementById('main-content');
    const header = document.getElementById('header');

    function toggleSidebar() {
        const isOpen = sidebar.classList.toggle('-translate-x-full');
        overlay.classList.toggle('hidden');
        if (window.innerWidth < 640) { // Only apply to mobile
            if (isOpen) {
                document.body.classList.remove('overflow-hidden');
            } else {
                document.body.classList.add('overflow-hidden');
            }
        }
    }

    if (hamburger && sidebar && overlay) {
        hamburger.addEventListener('click', toggleSidebar);
        overlay.addEventListener('click', toggleSidebar);
    }

    // Close sidebar when clicking outside on mobile
    if (mainContent && header) {
        mainContent.addEventListener('click', (e) => {
            if (window.innerWidth < 640 && !sidebar.contains(e.target) && !hamburger.contains(e.target)) {
                if (!sidebar.classList.contains('-translate-x-full')) {
                    toggleSidebar();
                }
            }
        });
    }

    // Configuration
    let students = [];
    let currentPage = 1;
    const itemsPerPage = 10;
    let filteredStudents = [...students];
    let isLoading = false;
    let gradeSections = {};
    let isEditing = false;

    // Fetch grade and section data
    async function fetchGradeSections() {
      try {
        const response = await fetch(`${urlprefix}/grade-sections`, { 
          signal: AbortSignal.timeout(10000) 
        });

        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && data.success && data.grades && data.sections) {
          gradeSections = {
            grades: data.grades,
            sections: data.sections
          };
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        showToast('Failed to fetch grade sections', false);
        gradeSections = {};
      } finally {
        populateGradeLevels();
      }
    }

    // Populate grade level dropdown
    function populateGradeLevels() {
      const gradeSelect = document.getElementById('gradeLevel');
      if (!gradeSelect) {
        return;
      }

      gradeSelect.innerHTML = '<option value="" disabled selected>Select Grade Level</option>';
      
      if (!gradeSections.grades || !Array.isArray(gradeSections.grades)) {
        return;
      }

      gradeSections.grades.forEach(grade => {
        const option = document.createElement('option');
        option.value = grade.id;
        option.textContent = grade.name || `Grade ${grade.id}`;
        gradeSelect.appendChild(option);
      });

      gradeSelect.addEventListener('change', (e) => {
        populateSections(e.target.value);
        updateSubmitButtonState();
      });
      
    }

    // Populate sections based on selected grade
    function populateSections(gradeId) {
      const sectionSelect = document.getElementById('section');
      if (!sectionSelect) {
        return;
      }
    
      sectionSelect.innerHTML = '<option value="" disabled selected>Select Section</option>';
      sectionSelect.disabled = true;
    
      if (!gradeId) {
        return;
      }

      if (!gradeSections.sections || !Array.isArray(gradeSections.sections)) {
        return;
      }

      const filteredSections = gradeSections.sections.filter(section => section.gradeId === gradeId);
      
      if (filteredSections.length > 0) {
        sectionSelect.disabled = false;
        filteredSections.forEach(section => {
          const option = document.createElement('option');
          option.value = section.id;
          option.textContent = section.name || section.id;
          sectionSelect.appendChild(option);
        });
      }
      updateSubmitButtonState();
    }

    // Fetch students with pagination
    async function fetchStudents(page = 1, query = '', retries = 3, delay = 2000) {
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
        const response = await fetch(`${urlprefix}/students?${queryParams}`, { 
          signal: AbortSignal.timeout(15000) 
        });
        const data = await response.json();

        if (data.success) {
          students = data.students || [];
          filteredStudents = [...students];
          renderStudentTable(page);
          const totalPages = Math.ceil(data.total / itemsPerPage);
          controls[0].innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
          controls[1].disabled = page === 1;
          controls[2].disabled = page === totalPages;
        } else {
          throw new Error(data.message || 'Failed to fetch students');
        }
      } catch (error) {
        if (retries > 0 && (error.name === 'TimeoutError' || error.name === 'AbortError')) {
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchStudents(page, query, retries - 1, delay * 2);
        }
        students = [...fallbackStudents];
        filteredStudents = [...fallbackStudents];
        renderStudentTable(page);
        showToast('Failed to fetch students. Using default data.', false);
      } finally {
        isLoading = false;
        controls.slice(1, 4).forEach(btn => btn.disabled = false);
        updateBulkDeleteButton();
      }
    }

    // Render student table
    const renderStudentTable = (page, data = filteredStudents) => {
      const elements = ['student-table', 'prev-page', 'next-page', 'page-info', 'bulk-delete', 'select-all']
        .map(id => document.getElementById(id));
      
      if (elements.some(el => !el)) {
        return;
      }

      const [table, prevBtn, nextBtn, pageInfo] = elements;
      table.innerHTML = '';

      const paginatedItems = data.slice(
        (page - 1) * itemsPerPage,
        page * itemsPerPage
      );

      paginatedItems.forEach(student => {
        const row = document.createElement('tr');
        row.innerHTML = `
          <td class="p-4 text-gray-700"><input type="checkbox" class="select-student" data-id="${student.id}"></td>
          <td class="p-4 text-gray-700">${student.name}</td>
          <td class="p-4 text-gray-700">${student.email}</td>
          <td class="p-4 text-gray-700">${student.section}</td>
          <td class="p-4 text-gray-700">${student.gradeLevel}</td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
            <button class="text-blue-600 hover:text-blue-800 edit-student p-1 rounded-full hover:bg-blue-50 transition-colors" data-id="${student.id}" title="Edit">
              <svg class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button class="text-red-600 hover:text-red-800 delete-student p-1 rounded-full hover:bg-red-50 transition-colors" data-id="${student.id}" title="Delete">
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
        document.querySelectorAll('.select-student').forEach(checkbox => {
          checkbox.checked = e.target.checked;
        });
        updateBulkDeleteButton();
      });

      document.querySelectorAll('.select-student').forEach(checkbox => {
        checkbox.addEventListener('change', () => {
          elements[5].checked = false;
          updateBulkDeleteButton();
        });
      });

      document.querySelectorAll('.edit-student').forEach(button => {
        button.addEventListener('click', () => {
          const studentId = button.getAttribute('data-id');
          handleEditStudent(parseInt(studentId));
        });
      });

      document.querySelectorAll('.delete-student').forEach(button => {
        button.addEventListener('click', async (e) => {
          const studentId = e.target.closest('button').getAttribute('data-id');
          const studentName = e.target.closest('tr').querySelector('td:nth-child(2)').textContent;
          
          if (confirm(`Delete student ${studentName} (${studentId})?`)) {
            try {
              const response = await fetch(`${urlprefix}/students/delete/${studentId}`, { 
                method: 'PUT' 
              });
              const data = await response.json();
              if (data.success) {
                showToast(`Student ${studentName} deleted successfully`);
                triggerRefresh();
              } else {
                throw new Error(data.message || 'Failed to delete student');
              }
            } catch (error) {
                showToast(`Failed to delete student ${studentName}`, false);
            }
          }
        });
      });
    };

    // Update bulk delete button
    const updateBulkDeleteButton = () => {
      const bulkDeleteBtn = document.getElementById('bulk-delete');
      if (!bulkDeleteBtn) return;
      
      const selectedCount = document.querySelectorAll('.select-student:checked').length;
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
        const selected = Array.from(document.querySelectorAll('.select-student:checked'));
        const selectedIds = selected.map(cb => cb.getAttribute('data-id'));
        const selectedNames = selected.map(cb => 
          cb.closest('tr').querySelector('td:nth-child(2)').textContent
        );

        if (selectedIds.length > 0 && confirm(`Delete ${selectedIds.length} selected students?`)) {
          try {
            const response = await fetch(`${urlprefix}/students/bulk-delete`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ids: selectedIds })
            });
            const data = await response.json();
            if (data.success) {
              showToast(`Deleted ${selectedIds.length} students successfully`);
              triggerRefresh();
            } else {
              throw new Error(data.message || 'Failed to bulk delete students');
            }
          } catch (error) {
            console.error('Error bulk deleting:', error);
            showToast('Failed to delete selected students', false);
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
        filteredStudents = students.filter(student =>
          Object.values(student).some(
            val => val.toString().toLowerCase().includes(query)
          )
        );
        currentPage = 1;
        renderStudentTable(currentPage);
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
      let pollingInterval = null;
      let timeoutId = null;

      const stopPolling = () => {
        if (pollingInterval) {
          clearInterval(pollingInterval);
          pollingInterval = null;
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
          timeoutId = null;
        }
        fetchBtn.disabled = false;
        fetchBtn.textContent = 'Fetch RFID & Fingerprint';
        updateSubmitButtonState();
      };

      fetchBtn.addEventListener('click', () => {
        // Clear any existing polling
        if (pollingInterval) {
          clearInterval(pollingInterval);
        }
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        fetchBtn.disabled = true;
        fetchBtn.textContent = 'Fetching...';
        rfidCheck.classList.add('hidden');
        fingerprintCheck.classList.add('hidden');

        pollingInterval = setInterval(async () => {
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

            // Stop polling if both values are received
            if (rfidInput.value && fingerprintInput.value) {
              stopPolling();
            }
          } catch (error) {
            }
        }, 1000);

        // Set timeout to stop polling after 10 seconds
        timeoutId = setTimeout(() => {
          if (!rfidInput.value || !fingerprintInput.value) {
            showToast('Timeout: No biometric data received', false);
          }
          stopPolling();
        }, 10000);
      });
    };

    // Update submit button state
    function updateSubmitButtonState() {
      const submitBtn = document.getElementById('submit-btn');
      const name = document.getElementById('name').value.trim();
      const email = document.getElementById('email').value.trim();
      const gradeLevel = document.getElementById('gradeLevel').value;
      const section = document.getElementById('section').value;
      const rfid = document.getElementById('rfid').value.trim();
      const fingerprint_id = document.getElementById('fingerprint').value.trim();

      const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
      const isValidSection = section && gradeLevel && gradeSections.sections.some(
        s => s.id === section && s.gradeId === gradeLevel
      );

      // For new registrations, require all fields
      if (!isEditing) {
        submitBtn.disabled = !(name && isValidEmail && gradeLevel && isValidSection && rfid && fingerprint_id);
      } else {
        // For updates, only require name, email, grade level, and section
        submitBtn.disabled = !(name && isValidEmail && gradeLevel && isValidSection);
      }
    }

    // Handle form input changes
    function handleFormInputChanges() {
      ['name', 'email', 'gradeLevel', 'section', 'rfid', 'fingerprint_id'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.addEventListener('input', updateSubmitButtonState);
        }
      });
    }

    // Clear form
    function clearForm() {
      const form = document.getElementById('student-form');
      const formTitle = document.getElementById('form-title');
      const submitBtnText = document.getElementById('submit-btn-text');
      const cancelBtn = document.getElementById('cancel-edit');
      const rfidCheck = document.getElementById('rfid-check');
      const fingerprintCheck = document.getElementById('fingerprint-check');
      const fetchBtn = document.getElementById('fetch-btn');
      const editStudentId = document.getElementById('edit-student-id');
      
      if (form) form.reset();
      if (editStudentId) editStudentId.value = '';
      if (rfidCheck) rfidCheck.classList.add('hidden');
      if (fingerprintCheck) fingerprintCheck.classList.add('hidden');
      if (fetchBtn) fetchBtn.disabled = false;
      if (formTitle) formTitle.textContent = 'Register New Student';
      if (submitBtnText) submitBtnText.textContent = 'Register';
      if (cancelBtn) cancelBtn.classList.add('hidden');
      
      isEditing = false;
      populateSections('');
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

    // Handle edit student
    async function handleEditStudent(studentId) {
      const student = students.find(s => s.id === studentId);
      if (!student) {
        showToast('Student not found', false);
        return;
      }

      const formTitle = document.getElementById('form-title');
      const submitBtnText = document.getElementById('submit-btn-text');
      const cancelBtn = document.getElementById('cancel-edit');
      
      isEditing = true;
      formTitle.textContent = 'Edit Student';
      submitBtnText.textContent = 'Save';
      cancelBtn.classList.remove('hidden');

      document.getElementById('edit-student-id').value = student.id;
      document.getElementById('name').value = student.name;
      document.getElementById('email').value = student.email;
      document.getElementById('gradeLevel').value = student.gradeLevel;
      document.getElementById('rfid').value = student.rfid || '';
      document.getElementById('fingerprint').value = student.fingerprint_id || '';
      document.getElementById('rfid-check').classList.toggle('hidden', !student.rfid);
      document.getElementById('fingerprint-check').classList.toggle('hidden', !student.fingerprint_id);

      populateSections(student.gradeLevel);
      document.getElementById('section').value = student.section;
      
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
    const handleStudentForm = () => {
      const form = document.getElementById('student-form');
      if (!form) return;

      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        
        try {
          // Show loading state
          submitBtn.disabled = true;
          submitBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            ${isEditing ? 'Saving...' : 'Registering...'}
          `;

          const formData = {
            id: document.getElementById('edit-student-id').value,
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            gradeLevel: document.getElementById('gradeLevel').value,
            section: document.getElementById('section').value,
            rfid: document.getElementById('rfid').value.trim() || null,
            fingerprint_id: document.getElementById('fingerprint').value.trim() || null
          };


          // Validate required fields
          if (!formData.name || formData.gradeLevel === undefined || !formData.section) {
            showToast('Please fill in all required fields (Name, Grade Level, Section)', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }
          
          // For new registrations, ensure biometric data is provided
          // if (!isEditing && (!formData.rfid || !formData.fingerprint_id)) {
          if (!isEditing && (!formData.fingerprint_id)) {
            showToast('RFID and Fingerprint are required for new registrations', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }

          if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            showToast('Please enter a valid email address', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }

          const validSection = gradeSections.sections.some(
            s => s.id === formData.section && s.gradeId === formData.gradeLevel
          );
          if (!validSection) {
            showToast('Invalid section for selected grade level', false);
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
            return;
          }

          const endpoint = isEditing ? `${urlprefix}/students/update` : `${urlprefix}/students/register`;
          const method = isEditing ? 'PUT' : 'POST';

          
          const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
          });
          
          const result = await response.json();
          if (result.success) {
            showToast(`Student ${formData.name} ${isEditing ? 'updated' : 'added'} successfully`);
            triggerRefresh();
            clearForm();
          } else {
            throw new Error(result.message || `Failed to ${isEditing ? 'update' : 'add'} student`);
          }
        } catch (error) {
          showToast(`Failed to ${isEditing ? 'update' : 'add'} student. Please try again.`, false);
        } finally {
          // Restore button state
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
          }
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
          await fetchStudents(currentPage);
          showToast('Student list refreshed successfully');
        } catch (error) {
          showToast('Failed to refresh student list', false);
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
        fetchStudents(currentPage);
      }
    });

    document.getElementById('next-page')?.addEventListener('click', () => {
      if (currentPage < Math.ceil(filteredStudents.length / itemsPerPage) && !isLoading) {
        currentPage++;
        fetchStudents(currentPage);
      }
    });

    // Initialize all components
    fetchGradeSections();
    fetchStudents(currentPage);
    handleStudentForm();
    handleSearch();
    handleBulkDelete();
    handleRefresh();
    handleFetch();
    handleClearForm();
    handleCancelEdit();
    handleFormInputChanges();
  });
})();