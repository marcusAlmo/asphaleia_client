// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  
  // Initialize settings functionality
  const { urlprefix } = window.utils || { urlprefix: 'https://asphaleia.onrender.com/api/v1' };
  console.log('settings.js: Initializing with urlprefix:', urlprefix);
  
  // Sidebar initialization is handled in header.js

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

  // Main initialization
  console.log('settings.js: Initializing settings page');

  let isLoading = false;
    let settings = {};

    // Initialize form elements
    const settingsForm = document.getElementById('thresholdForm'); // This is the form element
    const adminForm = document.getElementById('admin-form');
    const saveSettingsBtn = document.getElementById('save-settings');
    const saveAdminBtn = document.getElementById('save-admin');
    const clearSettingsBtn = document.getElementById('clear-settings-form-btn');
    const clearAdminBtn = document.getElementById('clear-admin-form-btn');
    const cancelSettingsBtn = document.getElementById('cancel-settings-edit');
    const cancelAdminBtn = document.getElementById('cancel-admin-edit');

    // Debug log to check if forms are found
    console.log('Settings form found:', !!settingsForm);
    console.log('Admin form found:', !!adminForm);

    async function fetchSettings(showLoading = true, signal = null) {
      if (showLoading) setLoading(true, 'settings');
      try {
        const fetchOptions = {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        };
        
        // Add signal to fetch options if provided
        if (signal) {
          fetchOptions.signal = signal;
        } else {
          // Fallback to AbortSignal.timeout if no signal is provided
          fetchOptions.signal = AbortSignal.timeout(10000);
        }
        
        const response = await fetch(`${urlprefix}/settings`, fetchOptions);
        console.log('Settings API response:', response);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data && data.success) {
          // Update the settings with the server response
          if (data.settings) {
            // Handle both direct late_threshold and late_time_threshold
            const threshold = data.settings.late_threshold || 
                            (Array.isArray(data.settings) && 
                             data.settings.find(s => s.name === 'late_time_threshold')?.value);
            
            if (threshold) {
              // Convert the time to HH:MM format if needed
              const [hours, minutes] = threshold.split(':');
              settings.late_threshold = `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
              updateSettingsForm();
            }
          }
          showToast('Settings loaded successfully');
          return true;
        } else {
          throw new Error('Invalid response format from server');
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        showToast('Failed to load settings.', false);
        return false;
      } finally {
        if (showLoading) setLoading(false, 'settings');
      }
    }

    function updateSettingsForm() {
      // Try both possible element IDs
      const lateThresholdInput = document.getElementById('lateThreshold') || document.getElementById('setting_late_threshold');
      if (lateThresholdInput) {
        // Format time to HH:MM if needed
        const timeValue = settings.late_threshold || '00:00';
        const [hours, minutes] = timeValue.split(':');
        lateThresholdInput.value = `${hours.padStart(2, '0')}:${(minutes || '00').padStart(2, '0')}`;
        updateSettingsSubmitButtonState();
      } else {
        console.warn('Late threshold input element not found. Tried IDs: lateThreshold, setting_late_threshold');
      }
    }

    function setLoading(loading, formType) {
      isLoading = loading;
      const buttons = {
        settings: [saveSettingsBtn],
        admin: [saveAdminBtn],
      }[formType] || [];
      buttons.forEach(btn => {
        if (btn) {
          btn.disabled = loading;
          const btnText = btn.querySelector('.btn-text');
          const btnIcon = btn.querySelector('svg');
          
          if (btnText) {
            btnText.textContent = loading 
              ? 'Saving...' 
              : (btn.id === 'save-settings' ? 'Save Settings' : 'Update Credentials');
          }
          
          if (btnIcon) {
            if (loading) {
              btnIcon.classList.add('animate-spin');
            } else {
              btnIcon.classList.remove('animate-spin');
            }
          }
        }
      });
    }

    function updateSettingsSubmitButtonState() {
      const submitBtn = document.getElementById('save-settings');
      const lateThresholdInput = document.getElementById('setting_late_threshold') || document.getElementById('lateThreshold');
      
      if (submitBtn && lateThresholdInput) {
        submitBtn.disabled = !lateThresholdInput.value;
      } else if (submitBtn) {
        submitBtn.disabled = true; // Disable if inputs are not found
      }
    }

    function updateAdminSubmitButtonState() {
      const submitBtn = document.getElementById('save-admin');
      const username = document.getElementById('username').value.trim();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;
      const isValid = username && currentPassword && newPassword && confirmNewPassword && newPassword === confirmNewPassword;
      submitBtn.disabled = !isValid;
    }

    async function saveSettings() {
      if (isLoading) return;
      setLoading(true, 'settings');
      const formData = new FormData(thresholdForm);
      const lateThreshold = formData.get('lateThreshold');
      console.log('Form data:', { lateThreshold });
      
      if (!lateThreshold) {
        showToast('Please select a valid time', false);
        setLoading(false, 'settings');
        return false;
      }
      
      const updatedSettings = {
        late_threshold: lateThreshold,
      };
      
      console.log('Sending to server:', updatedSettings);

      try {
        const response = await fetch(`${urlprefix}/update-settings`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedSettings),
        });
        console.log('Save settings response:', response);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to save settings');
        }
        const result = await response.json();
        if (result && result.success) {
          settings = { ...updatedSettings };
          showToast('Settings saved successfully');
          clearSettingsForm();
          return true;
        } else {
          throw new Error(result.message || 'Failed to save settings');
        }
      } catch (error) {
        console.error('Error saving settings:', error);
        showToast(`Error: ${error.message}`, false);
        return false;
      } finally {
        setLoading(false, 'settings');
      }
    }

    async function updateAdminPassword() {
      if (isLoading) return;
      setLoading(true, 'admin');
      
      // Get form values
      const currentUsername = document.getElementById('currentUsername').value.trim();
      const newUsername = document.getElementById('username').value.trim();
      const currentPassword = document.getElementById('currentPassword').value;
      const newPassword = document.getElementById('newPassword').value;
      const confirmNewPassword = document.getElementById('confirmNewPassword').value;

      // Validate required fields
      if (!currentUsername || !newUsername || !currentPassword || !newPassword) {
        showToast('Please fill in all required fields', false);
        setLoading(false, 'admin');
        return false;
      }
      
      // Validate password match
      if (newPassword !== confirmNewPassword) {
        showToast('New passwords do not match', false);
        setLoading(false, 'admin');
        return false;
      }

      // Validate password strength (optional)
      if (newPassword.length < 8) {
        showToast('New password must be at least 8 characters long', false);
        setLoading(false, 'admin');
        return false;
      }

      try {
        const response = await fetch(`${urlprefix}/auth/change-password`, {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            current_username: currentUsername,  // Current username for verification
            username: newUsername,             // New username to set
            current_password: currentPassword,  // Current password for verification
            new_password: newPassword           // New password to set
          }),
        });
        
        console.log('Change password response status:', response.status);
        const result = await response.json().catch(() => ({}));
        console.log('Change password response data:', result);
        
        if (!response.ok) {
          throw new Error(result.message || 'Failed to update credentials');
        }
        
        if (result && result.success) {
          showToast('Credentials updated successfully');
          clearAdminForm();
          return true;
        } else {
          throw new Error(result.message || 'Failed to update credentials');
        }
      } catch (error) {
        console.error('Error updating password:', error);
        showToast(`Error: ${error.message}`, false);
        return false;
      } finally {
        setLoading(false, 'admin');
      }
    }

    function clearSettingsForm() {
      if (!settingsForm) return;
      settingsForm.reset();
      updateSettingsForm();
      const settingsTitle = document.getElementById('settings-form-title');
      const saveSettings = document.getElementById('save-settings');
      if (settingsTitle) settingsTitle.textContent = 'Configure Late Time Threshold';
      if (saveSettings) {
        const btnText = saveSettings.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Save Settings';
      }
      if (cancelSettingsBtn) cancelSettingsBtn.classList.add('hidden');
      updateSettingsSubmitButtonState();
    }

    function clearAdminForm() {
      if (!adminForm) return;
      adminForm.reset();
      const adminTitle = document.getElementById('admin-form-title');
      const saveAdmin = document.getElementById('save-admin');
      if (adminTitle) adminTitle.textContent = 'Change Admin Credentials';
      if (saveAdmin) {
        const btnText = saveAdmin.querySelector('.btn-text');
        if (btnText) btnText.textContent = 'Update Credentials';
      }
      if (cancelAdminBtn) cancelAdminBtn.classList.add('hidden');
      
      const toggleIcons = document.querySelectorAll('.toggle-password i');
      if (toggleIcons.length > 0) {
        toggleIcons.forEach(icon => {
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        });
      }
      
      const passwordInputs = document.querySelectorAll('#admin-form input[type="password"]');
      if (passwordInputs.length > 0) {
        passwordInputs.forEach(input => {
          input.type = 'password';
        });
      }
      
      updateAdminSubmitButtonState();
    }

    function handleClearForms() {
      if (clearSettingsBtn) {
        clearSettingsBtn.addEventListener('click', () => {
          clearSettingsForm();
          showToast('Settings form cleared');
        });
      }
      if (clearAdminBtn) {
        clearAdminBtn.addEventListener('click', () => {
          clearAdminForm();
          showToast('Admin form cleared');
        });
      }
    }

      function handleCancelEdits() {
    if (cancelSettingsBtn) {
      cancelSettingsBtn.addEventListener('click', () => {
        clearSettingsForm();
        showToast('Settings edit cancelled');
      });
    }
    if (cancelAdminBtn) {
      cancelAdminBtn.addEventListener('click', () => {
        clearAdminForm();
        showToast('Admin edit cancelled');
      });
    }
  }

  function handleFormInputChanges() {
    const settingsInput = document.getElementById('setting_late_threshold');
    if (settingsInput) {
      settingsInput.addEventListener('input', updateSettingsSubmitButtonState);
    }
    
    // Add input listeners for admin form fields
    ['username', 'currentPassword', 'newPassword', 'confirmNewPassword'].forEach(id => {
      const input = document.getElementById(id);
      if (input) {
        input.addEventListener('input', updateAdminSubmitButtonState);
      }
    });
  }

  function setupPasswordToggles() {
    document.querySelectorAll('.toggle-password').forEach(button => {
      button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.classList.remove('fa-eye');
          icon.classList.add('fa-eye-slash');
        } else {
          input.type = 'password';
          icon.classList.remove('fa-eye-slash');
          icon.classList.add('fa-eye');
        }
      });
    });
  }

  function setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Settings form submission
    if (settingsForm) {
      settingsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          await saveSettings();
        } catch (error) {
          console.error('Error saving settings:', error);
          showToast('Failed to save settings', false);
        }
      });
    }
    
    // Admin form submission
    const adminForm = document.getElementById('admin-form');
    if (adminForm) {
      adminForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        try {
          await updateAdminPassword();
        } catch (error) {
          console.error('Error updating admin password:', error);
          showToast('Failed to update admin password', false);
        }
      });
    }
  }

  // Initialize the application
  function initializeApp() {
    console.log('Initializing application...');
    
    // Set default time if not already set
    const timeInput = document.getElementById('lateThreshold');
    if (timeInput && !timeInput.value) {
      timeInput.value = '00:15'; // Default to 15 minutes
    }
    
    // Initialize form
    updateSettingsForm();
    
    // Set up event listeners
    setupEventListeners();
    setupPasswordToggles();
    handleClearForms();
    handleCancelEdits();
    handleFormInputChanges();
    
    // Fetch settings from server
    fetchSettings();
  }
  
  // Start the application
  initializeApp();

  // Function to set time from quick selection buttons
  function setTime(hours, minutes) {
    const timeInput = document.getElementById('lateThreshold');
    if (!timeInput) return;
    
    // Format hours and minutes to ensure two digits
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    timeInput.value = `${formattedHours}:${formattedMinutes}`;
    
    // Trigger change event to update any listeners
    const event = new Event('change', { bubbles: true });
    timeInput.dispatchEvent(event);
  }

    // Make setTime available globally for the quick time buttons
  window.setTime = setTime;
});