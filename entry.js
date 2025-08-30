(function() {
  // Note: This script initializes the entry monitoring page with test data for an entry list and status pie chart.
  // Test data mirrors the expected API response structure. Includes error handling and debug logging to ensure proper rendering.
  // Runs in a self-invoking function to avoid conflicts with utils.js or header.js.

  function initSidebar() {
    console.log('Initializing sidebar...');
    const sidebar = document.getElementById('sidebar');
    const header = document.getElementById('header');
    const mainContent = document.getElementById('main-content');
    const toggleSidebar = document.getElementById('toggle-sidebar');
    const hamburger = document.getElementById('hamburger');
    const overlay = document.getElementById('overlay');
    const toggleIcon = document.getElementById('toggle-icon');

    console.log('Sidebar elements:', { sidebar, toggleSidebar, hamburger, overlay });

    if (!sidebar || !toggleSidebar || !hamburger || !overlay) {
      console.error('Required sidebar elements not found');
      return;
    }

    function updateLayout() {
      console.log('Updating layout...');
      const isMobile = window.innerWidth < 640;
      const isCollapsed = sidebar.classList.contains('collapsed');
      const isOpen = sidebar.classList.contains('open');

      console.log('Layout state:', { isMobile, isCollapsed, isOpen });

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
      console.log('Toggling sidebar state...');
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
      console.log('Toggle sidebar clicked');
      sidebar.classList.toggle('collapsed');
      updateLayout();
    });

    hamburger.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log('Hamburger clicked');
      toggleSidebarState();
    });

    if (overlay) {
      overlay.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        console.log('Overlay clicked');
        toggleSidebarState();
      });
    }

    window.addEventListener('resize', () => {
      console.log('Window resized');
      if (window.innerWidth >= 640) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
        sidebar.style.transform = 'translateX(0)';
      }
      updateLayout();
    });

    // Initial layout update
    console.log('Initial layout update');
    updateLayout();
  }

  // Initialize everything when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM fully loaded, initializing...');
    
    // Initialize sidebar first
    initSidebar();
    
    // Rest of your existing code...
    const { urlprefix } = window.utils || { urlprefix: 'https://asphaleia.onrender.com/api/v1' };
    console.log('entry.js: Initializing with urlprefix:', urlprefix);

    // Initialize sidebar toggle functionality
    // const sidebar = document.getElementById('sidebar');
    // const header = document.getElementById('header');
    // const mainContent = document.getElementById('main-content');
    // const toggleSidebar = document.getElementById('toggle-sidebar');
    // const hamburger = document.getElementById('hamburger');
    // const overlay = document.getElementById('overlay');
    // const toggleIcon = document.getElementById('toggle-icon');

    // if (!sidebar || !toggleSidebar || !hamburger || !overlay) {
    //   console.warn('Sidebar elements not found');
    //   return;
    // }

    // function updateLayout() {
    //   const isMobile = window.innerWidth < 640;
    //   const isCollapsed = sidebar.classList.contains('collapsed');
    //   const isOpen = sidebar.classList.contains('open');

    //   if (isCollapsed) {
    //     sidebar.classList.remove('w-3/4', 'sm:w-64');
    //     sidebar.classList.add('w-16');
    //     header.classList.add('collapsed');
    //     mainContent.classList.add('collapsed');
    //     sidebar.style.transform = 'translateX(0)';
    //     overlay.classList.remove('active');
    //     if (toggleIcon) {
    //       toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />';
    //     }
    //   } else {
    //     sidebar.classList.remove('w-16');
    //     sidebar.classList.add(isMobile ? 'w-3/4' : 'sm:w-64');
    //     header.classList.remove('collapsed');
    //     mainContent.classList.remove('collapsed');
    //     if (toggleIcon) {
    //       toggleIcon.innerHTML = '<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />';
    //     }
        
    //     if (isMobile && !isOpen) {
    //       sidebar.style.transform = 'translateX(-100%)';
    //       overlay.classList.remove('active');
    //     } else {
    //       sidebar.style.transform = 'translateX(0)';
    //       overlay.classList.toggle('active', isMobile && isOpen);
    //     }
    //   }
    // }

    // function toggleSidebarState() {
    //   if (window.innerWidth < 640) {
    //     sidebar.classList.toggle('open');
    //   } else {
    //     sidebar.classList.toggle('collapsed');
    //   }
    //   updateLayout();
    // }

    // if (toggleSidebar) {
    //   toggleSidebar.addEventListener('click', () => {
    //     sidebar.classList.toggle('collapsed');
    //     updateLayout();
    //   });
    // }

    // if (hamburger) {
    //   hamburger.addEventListener('click', toggleSidebarState);
    // }

    // if (overlay) {
    //   overlay.addEventListener('click', toggleSidebarState);
    // }

    // window.addEventListener('resize', () => {
    //   if (window.innerWidth >= 640) {
    //     sidebar.classList.remove('open');
    //     overlay.classList.remove('active');
    //     sidebar.style.transform = 'translateX(0)';
    //   }
    //   updateLayout();
    // });

    // // Initial layout update
    // updateLayout();

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
        console.log('Date filter changed, refreshing data...');
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
      console.log('entry.js: Rendering entry status pie chart');
      const canvas = document.getElementById('entryChart');
      if (!canvas) {
        console.error('entry.js: Entry chart canvas not found');
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

        console.log('entry.js: Entry status pie chart rendered', {
          data: entryData,
          width: canvas.width,
          height: canvas.height
        });
        return window.entryChart;
      } catch (error) {
        console.error('entry.js: Error rendering entry chart:', error);
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
      console.log('entry.js: Rendering entry list');
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
        console.error('entry.js: Entry list elements not found');
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
          console.error('Error fetching entry list:', error);
          // Return empty data structure to prevent fallback to test data
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
          console.error('Error rendering entry list:', error);
          entryList.innerHTML = `<div class="text-center py-4 text-red-600">Error: ${error.message}</div>`;
        }
      };

      // Helper function to get status color class
      const getStatusColorClass = (status) => {
        switch(status.toLowerCase()) {
          case 'on time': return 'text-green-600';
          case 'late': return 'text-yellow-600';
          case 'absent': return 'text-red-600';
          default: return 'text-gray-600';
        }
      };

      // Function to handle filter changes
      const handleFilterChange = async () => {
        currentPage = 1; // Reset to first page when filters change
        const refreshBtn = document.getElementById('refresh-btn');
        
        if (refreshBtn) {
          refreshBtn.disabled = true;
          refreshBtn.innerHTML = `
            <svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          `;
        }
        
        try {
          await Promise.all([
            renderEntryChart(),
            renderPage(currentPage)
          ]);
        } finally {
          if (refreshBtn) {
            refreshBtn.disabled = false;
            refreshBtn.innerHTML = `
              <svg class="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Refresh</span>
            `;
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

      // Event listeners for filter changes and refresh button
      const filterElements = [
        { element: dateFilter, event: 'change' },
        { element: startTimeFilter, event: 'change' },
        { element: endTimeFilter, event: 'change' },
        { element: statusFilter, event: 'change' },
        { element: refreshBtn, event: 'click' }
      ];

      filterElements.forEach(({ element, event }) => {
        if (element) {
          element.addEventListener(event, handleFilterChange);
        }
      });

      // Initial render
      console.log('entry.js: Starting initialization');
      handleFilterChange();
    };

    // Initialize components
    console.log('entry.js: Starting initialization');
    
    // Initialize the list and chart
    const initPage = async () => {
      try {
        await Promise.all([
          renderEntryList(),
          // renderEntryChart()
        ]);
        console.log('entry.js: Initialization complete');
      } catch (error) {
        console.error('Error during initialization:', error);
      }
    };
    
    // Start initialization
    initPage();
  });
})();