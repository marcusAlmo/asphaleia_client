(function() {
  'use strict';
  
  // Global variables
  const { urlprefix } = window.utils || { urlprefix: 'https://asphaleia.onrender.com/api/v1' };
  
  // DOM elements
  let currentPage = 1;
  const itemsPerPage = 10;

  function initSidebar() {
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    const mainContent = document.getElementById('main-content');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('overlay');
    const toggleIcon = document.getElementById('toggle-icon');

    if (!sidebar || !toggleSidebar || !hamburger || !overlay) {
      return;
    }

    function updateLayout() {
      const isMobile = window.innerWidth < 640;
      const isCollapsed = sidebar.classList.contains('collapsed');
      const isOpen = sidebar.classList.contains('open');

      if (isCollapsed) {
        sidebar.classList.remove('w-3/4', 'sm:w-64');
        sidebar.classList.add('w-16');
        if (header) header.classList.add('collapsed');
        if (mainContent) mainContent.classList.add('collapsed');
        sidebar.style.transform = 'translateX(0)';
        if (overlay) overlay.classList.remove('active');
        if (toggleIcon) {
          toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />';
        }
      } else {
        sidebar.classList.remove('w-16');
        sidebar.classList.add(isMobile ? 'w-3/4' : 'sm:w-64');
        if (header) header.classList.remove('collapsed');
        if (mainContent) mainContent.classList.remove('collapsed');
        
        if (toggleIcon) {
          toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />';
        }
        
        if (isMobile && !isOpen) {
          sidebar.style.transform = 'translateX(-100%)';
          if (overlay) overlay.classList.remove('active');
        } else {
          sidebar.style.transform = 'translateX(0)';
          if (overlay) overlay.classList.toggle('active', isMobile && isOpen);
        }
      }
    }

    function toggleSidebarState() {
      if (window.innerWidth < 640) {
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      } else {
        sidebar.classList.toggle('collapsed');
      }
      updateLayout();
    }

    // Add event listeners
    toggleSidebar.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      sidebar.classList.toggle('collapsed');
      updateLayout();
    });

    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      toggleSidebarState();
    });

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleSidebarState();
      });
    }

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 640) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        sidebar.style.transform = 'translateX(0)';
      }
      updateLayout();
    });

    updateLayout();
  }

  // Main initialization function
  function initializeApp() {
    
    // Initialize sidebar first
    initSidebar();
    
    // Initialize refresh button
    const refreshBtn = document.getElementById('refresh-btn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        // Get elements
        const refreshIcon = document.getElementById('refresh-icon');
        const refreshSpinner = document.getElementById('refresh-spinner');
        const refreshText = document.getElementById('refresh-text');
        
        try {
          // Show loading state
          refreshBtn.disabled = true;
          if (refreshIcon) refreshIcon.classList.add('hidden');
          if (refreshSpinner) refreshSpinner.classList.remove('hidden');
          if (refreshText) refreshText.textContent = 'Refreshing...';
          
          // Refresh data
          await renderEntryList();
          
        } catch (error) {
          console.error('Error during refresh:', error);
        } finally {
          // Reset button state
          refreshBtn.disabled = false;
          if (refreshIcon) refreshIcon.classList.remove('hidden');
          if (refreshSpinner) refreshSpinner.classList.add('hidden');
          if (refreshText) refreshText.textContent = 'Refresh';
        }
      });
    }
    
    // Initialize entry list and other components
    const initPage = async () => {
      try {
        await renderEntryList();
      } catch (error) {
        console.error('Error initializing page:', error);
      }
    };
    
    // Start initialization
    initPage();
  }
  
  // Global variables
  // Initialize everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    // DOM already loaded, initialize immediately
    initializeApp();
  }

    // Set default date to today and add change event listener
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
      // Set initial date (will be overridden by the inline script if present)
      const today = new Date();
      const phTime = new Date(today.getTime() + (8 * 60 * 60 * 1000)); // Add 8 hours for PH time
      const todayStr = phTime.toISOString().split('T')[0];
      
      // Only set if not already set by the inline script
      if (!dateFilter.value) {
        dateFilter.value = todayStr;
      }
      
      // Add change event listener to refresh data when date changes
      dateFilter.addEventListener('change', () => {
        initPage();
      });
    }

    // Function: Fetch entry status data from API
    const fetchEntryChartData = async () => {
      const date = document.getElementById('dateFilter')?.value || '';
      const startTime = document.getElementById('startTimeFilter')?.value || '';
      const endTime = document.getElementById('endTimeFilter')?.value || '';

      try {
        const params = new URLSearchParams({
          ...(date && { date }),
          ...(startTime && { start_time: startTime }),
          ...(endTime && { end_time: endTime })
        });

        const response = await fetch(`${urlprefix}/entry/status?${params}`);
        if (!response.ok) throw new Error('Failed to fetch chart data');
        return await response.json();
      } catch (error) {
        console.error('Error fetching chart data:', error);
        // Fallback to empty data structure
        return { labels: ['On Time', 'Late', 'Absent'], data: [0, 0, 0] };
      }
    };

    // Function: Render entry status pie chart
    // Purpose: Displays a pie chart showing the distribution of entry statuses (On Time, Late, Absent).
    const renderEntryChart = async () => {
      const canvas = document.getElementById('entryChart');
      if (!canvas) {
        return null;
      }

      // Destroy existing chart if it exists
      if (window.entryChart) {
        window.entryChart.destroy();
      }

      try {
        // Fetch data from API
        const entryData = await fetchEntryChartData();
        
        // Create or update chart
        window.entryChart = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: entryData.labels || ['On Time', 'Late', 'Absent'],
            datasets: [{
              data: entryData.data || [0, 0, 0],
              backgroundColor: ['#34D399', '#FBBF24', '#EF4444'],
              borderColor: ['#10B981', '#F59E0B', '#DC2626'],
              borderWidth: 1,
              hoverOffset: 8
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom'
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const label = context.label || '';
                    const value = context.raw || 0;
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
                    const percentage = Math.round((value / total) * 100) || 0;
                    return `${label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }
        });

        return window.entryChart;
      } catch (error) {
        const errorElement = document.createElement('div');
        errorElement.className = 'text-red-600 text-center text-sm mt-2';
        errorElement.textContent = 'Failed to load chart data';
        canvas.parentElement.appendChild(errorElement);
        return null;
      }

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/entry/status
       * - Method: GET
       * - Query Parameters:
       *   - date: string (optional, e.g., "2025-08-05")
       *   - startTime: string (optional, e.g., "09:00")
       *   - endTime: string (optional, e.g., "17:00")
       *   - status: string (optional, e.g., "On Time", "Late", "Absent")
       * - Expected Response: JSON object
       *   {
       *     labels: string[], // e.g., ["On Time", "Late", "Absent"]
       *     data: number[]    // e.g., [100, 30, 20]
       *   }
       * - Notes:
       *   - Labels represent entry status categories; data represents counts.
       *   - Colors are fixed: green (#34D399) for On Time, yellow (#FBBF24) for Late, red (#EF4444) for Absent.
       *   - Use filter values from #dateFilter, #startTimeFilter, #endTimeFilter, #statusFilter.
       *   - Fallback to test data if API fails.
       * - Implementation:
       *   async function fetchEntryChartData() {
       *     try {
       *       const date = document.getElementById('dateFilter').value;
       *       const startTime = document.getElementById('startTimeFilter').value;
       *       const endTime = document.getElementById('endTimeFilter').value;
       *       const status = document.getElementById('statusFilter').value;
       *       const query = new URLSearchParams({ date, startTime, endTime, status }).toString();
       *       const response = await fetch(`https://your-api-endpoint/entry/status?${query}`);
       *       const data = await response.json();
       *       new Chart(document.getElementById('entryChart'), {
       *         type: 'pie',
       *         data: {
       *           labels: data.labels,
       *           datasets: [{
       *             data: data.data,
       *             backgroundColor: ['#34D399', '#FBBF24', '#EF4444'],
       *             borderColor: ['#10B981', '#F59E0B', '#DC2626'],
       *             borderWidth: 1,
       *             hoverOffset: 8
       *           }]
       *         },
       *         options: { ... }
       *       });
       *     } catch (error) {
       *       console.error('Error fetching entry chart data:', error);
       *       // Use entryData as fallback
       *       new Chart(document.getElementById('entryChart'), { ... });
       *     }
       *   }
       */
    };

    // Function: Render entry list with pagination
    // Purpose: Displays a paginated list of student entries (name, time, status).
    const renderEntryList = async () => {
      const entryList = document.getElementById('entry-list');
      const prevPageBtn = document.getElementById('prev-page');
      const nextPageBtn = document.getElementById('next-page');
      const pageInfo = document.getElementById('page-info');
      const dateFilter = document.getElementById('dateFilter');
      const startTimeFilter = document.getElementById('startTimeFilter');
      const endTimeFilter = document.getElementById('endTimeFilter');
      const statusFilter = document.getElementById('statusFilter');
      const refreshBtn = document.getElementById('refresh-btn');

      if (!entryList || !prevPageBtn || !nextPageBtn || !pageInfo) {
        return;
      }

      let currentPage = 1;
      const itemsPerPage = 10; // Match this with the default limit in the backend

      const fetchEntryList = async (page = 1) => {
        const date = dateFilter?.value || '';
        const startTime = startTimeFilter?.value || '';
        const endTime = endTimeFilter?.value || '';
        const status = statusFilter?.value || '';

        try {
          const params = new URLSearchParams({
            page: page,
            limit: itemsPerPage,
            ...(date && { date }),
            ...(startTime && { start_time: startTime }),
            ...(endTime && { end_time: endTime }),
            ...(status && { status })
          });

          const response = await fetch(`${urlprefix}/entry/list?${params}`);
          const result = await response.json();

          if (!response.ok || !result.success) {
            throw new Error(result.error || 'Failed to fetch entry list');
          }

          return result.data;
        } catch (error) {
          return {
            entries: [],
            total: 0,
            page: page,
            limit: itemsPerPage,
            total_pages: 0
          };
        }
      };

      const renderPage = async (page) => {
        try {
          entryList.innerHTML = '<div class="text-center py-4">Loading...</div>';
          const data = await fetchEntryList(page);
          
          if (data.entries.length === 0) {
            entryList.innerHTML = '<div class="text-center py-4">No entries found. Please check your connection and try again.</div>';
            pageInfo.textContent = 'No entries';
            prevPageBtn.disabled = true;
            nextPageBtn.disabled = true;
            return;
          }

          entryList.innerHTML = `
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50">
                  <tr>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/3">Name</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Time</th>
                    <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-1/4">Status</th>
                  </tr>
                </thead>
                <tbody class="bg-white divide-y divide-gray-200">
                  ${data.entries.map(entry => `
                    <tr class="h-16">
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">${entry.name || 'N/A'}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${entry.time || 'N/A'}</td>
                      <td class="px-6 py-4 whitespace-nowrap">
                        <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColorClass(entry.status)}">
                          ${entry.status || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
          `;

          pageInfo.innerHTML = `Page <span class="font-semibold">${data.page}</span> of <span class="font-semibold">${data.total_pages}</span>`;
          prevPageBtn.disabled = data.page === 1;
          nextPageBtn.disabled = data.page === data.total_pages;
          currentPage = data.page;
          
        } catch (error) {
          entryList.innerHTML = `<div class="text-center py-4 text-red-600">Error: ${error.message}</div>`;
        }
      };

      // Helper function to get status color class
      const getStatusColorClass = (status) => {
        if (!status) return 'text-gray-600';
        switch(status.toLowerCase()) {
          case 'on time': return 'text-green-600';
          case 'late': return 'text-yellow-600';
          case 'absent': return 'text-red-600';
          default: return 'text-gray-600';
        }
      };

      // Function to handle filter changes
      const handleFilterChange = async () => {
        const refreshBtn = document.getElementById('refresh-btn');
        const refreshIcon = document.getElementById('refresh-icon');
        const refreshSpinner = document.getElementById('refresh-spinner');
        const refreshText = document.getElementById('refresh-text');
        
        // Show loading state
        if (refreshBtn && refreshIcon && refreshSpinner && refreshText) {
          refreshBtn.disabled = true;
          refreshIcon.classList.add('hidden');
          refreshSpinner.classList.remove('hidden');
          refreshText.textContent = 'Refreshing...';
        }
        
        try {
          currentPage = 1; // Reset to first page when filters change
          await renderPage(currentPage);
        } catch (error) {
          console.error('Error in handleFilterChange:', error);
        } finally {
          // Reset button state
          if (refreshBtn && refreshIcon && refreshSpinner && refreshText) {
            refreshBtn.disabled = false;
            refreshIcon.classList.remove('hidden');
            refreshSpinner.classList.add('hidden');
            refreshText.textContent = 'Refresh';
          }
        }
      };

      // Event listeners for pagination
      if (prevPageBtn) {
        prevPageBtn.addEventListener('click', () => {
          if (currentPage > 1) {
            currentPage--;
            renderPage(currentPage);
          }
        });
      }

      if (nextPageBtn) {
        nextPageBtn.addEventListener('click', () => {
          currentPage++;
          renderPage(currentPage);
        });
      }

      // Event listeners for filter changes
      [dateFilter, startTimeFilter, endTimeFilter, statusFilter].forEach(element => {
        if (element) {
          element.addEventListener('change', handleFilterChange);
        }
      });

      // Add click event listener to refresh button
      if (refreshBtn) {
        refreshBtn.addEventListener('click', (e) => {
          e.preventDefault();
          try {
            handleFilterChange();
          } catch (error) {
            console.error('Error in refresh button handler:', error);
          }
        });
      }

      // Initial render
      handleFilterChange();
    };

  // Helper function to get status color class
  function getStatusColorClass(status) {
    if (!status) return 'text-gray-600';
    switch(status.toLowerCase()) {
      case 'on time': return 'text-green-600';
      case 'late': return 'text-yellow-600';
      case 'absent': return 'text-red-600';
      default: return 'text-gray-600';
    }
  }
  
  // Initialize everything when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
  } else {
    // DOM already loaded, initialize immediately
    initializeApp();
  }
})();