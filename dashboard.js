(function() {
  // Note: This script initializes the dashboard with test data for summary cards, charts, and late students list.
  // Test data mirrors the expected API response structure. Enhanced with error handling and debug logging for chart sizes.

  document.addEventListener('DOMContentLoaded', () => {
    console.log('dashboard.js: Initializing dashboard with test data');

    // Function: Update summary cards
    const updateSummaryData = () => {
      console.log('dashboard.js: Updating summary data');
      const elements = {
        totalStudents: document.getElementById('total-students'),
        presentAbsent: document.getElementById('present-absent'),
        avgEntryTime: document.getElementById('avg-entry-time'),
        scheduledClasses: document.getElementById('scheduled-classes')
      };

      for (const [key, element] of Object.entries(elements)) {
        if (!element) {
          console.error(`dashboard.js: Element #${key} not found`);
          return;
        }
      }

      const summaryData = {
        totalStudents: 150,
        present: 120,
        absent: 30,
        avgEntryTime: '09:15 AM',
        scheduledClasses: 12
      };

      elements.totalStudents.textContent = summaryData.totalStudents;
      elements.presentAbsent.textContent = `${summaryData.present}/${summaryData.absent}`;
      elements.avgEntryTime.textContent = summaryData.avgEntryTime;
      elements.scheduledClasses.textContent = summaryData.scheduledClasses;
      console.log('dashboard.js: Summary data updated', summaryData);

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/dashboard/summary
       * - Method: GET
       * - Query Parameters: year, section, date, startTime, endTime (optional)
       * - Expected Response: { totalStudents: number, present: number, absent: number, avgEntryTime: string, scheduledClasses: number }
       */
    };

    // Function: Render attendance bar chart
    const renderAttendanceChart = () => {
      console.log('dashboard.js: Rendering attendance chart');
      const canvas = document.getElementById('attendanceChart');
      if (!canvas) {
        console.error('dashboard.js: Attendance chart canvas not found');
        return;
      }

      const attendanceData = {
        labels: ['Section A', 'Section B', 'Section C'],
        data: [50, 60, 45]
      };

      try {
        const chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: attendanceData.labels,
            datasets: [{
              label: 'Attendance',
              data: attendanceData.data,
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 1
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: true }
            },
            responsive: true,
            maintainAspectRatio: false
          }
        });
        console.log('dashboard.js: Attendance chart rendered', {
          data: attendanceData,
          width: canvas.width,
          height: canvas.height
        });
      } catch (error) {
        console.error('dashboard.js: Error rendering attendance chart:', error);
        canvas.parentElement.innerHTML += '<p class="text-red-600 text-center">Failed to load chart</p>';
      }

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/dashboard/attendance-metrics
       * - Method: GET
       * - Query Parameters: year, section, date (optional)
       * - Expected Response: { labels: string[], data: number[] }
       */
    };

    // Function: Render entry status pie chart
    const renderEntryChart = () => {
      console.log('dashboard.js: Rendering entry status pie chart');
      const canvas = document.getElementById('entryChart');
      if (!canvas) {
        console.error('dashboard.js: Entry chart canvas not found');
        return;
      }

      const entryData = {
        labels: ['On Time', 'Late', 'Absent'],
        data: [100, 30, 20]
      };

      try {
        const chart = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: entryData.labels,
            datasets: [{
              data: entryData.data,
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
              }
            }
          }
        });
        console.log('dashboard.js: Entry status pie chart rendered', {
          data: entryData,
          width: canvas.width,
          height: canvas.height
        });
      } catch (error) {
        console.error('dashboard.js: Error rendering entry chart:', error);
        canvas.parentElement.innerHTML += '<p class="text-red-600 text-center">Failed to load pie chart</p>';
      }

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/dashboard/entry-status
       * - Method: GET
       * - Query Parameters: year, section, date, startTime, endTime (optional)
       * - Expected Response: { labels: string[], data: number[] }
       */
    };

    // Function: Render attendance trend chart
    const renderTrendChart = () => {
      console.log('dashboard.js: Rendering attendance trend chart');
      const canvas = document.getElementById('trendChart');
      if (!canvas) {
        console.error('dashboard.js: Trend chart canvas not found');
        return;
      }

      const trendData = {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
        data: [65, 70, 68, 72, 60]
      };

      try {
        const chart = new Chart(canvas, {
          type: 'line',
          data: {
            labels: trendData.labels,
            datasets: [{
              label: 'Attendance Trend',
              data: trendData.data,
              borderColor: '#8B5CF6',
              fill: false,
              tension: 0.4
            }]
          },
          options: {
            scales: {
              y: { beginAtZero: true }
            },
            responsive: true,
            maintainAspectRatio: false
          }
        });
        console.log('dashboard.js: Attendance trend chart rendered', {
          data: trendData,
          width: canvas.width,
          height: canvas.height
        });
      } catch (error) {
        console.error('dashboard.js: Error rendering trend chart:', error);
        canvas.parentElement.innerHTML += '<p class="text-red-600 text-center">Failed to load chart</p>';
      }

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/dashboard/attendance-trend
       * - Method: GET
       * - Query Parameters: year, section, startDate, endDate (optional)
       * - Expected Response: { labels: string[], data: number[] }
       */
    };

    // Function: Render late students list
    const renderLateStudents = () => {
      console.log('dashboard.js: Rendering late students list');
      const lateStudentsList = document.getElementById('late-students-list');
      const prevPageBtn = document.getElementById('prev-page');
      const nextPageBtn = document.getElementById('next-page');
      const pageInfo = document.getElementById('page-info');

      if (!lateStudentsList || !prevPageBtn || !nextPageBtn || !pageInfo) {
        console.error('dashboard.js: Late students list elements not found');
        return;
      }

      const lateStudents = [
        { id: 1, name: 'John Doe', time: '09:30 AM' },
        { id: 2, name: 'Jane Smith', time: '09:45 AM' },
        { id: 3, name: 'Alex Johnson', time: '10:00 AM' },
        { id: 4, name: 'Emily Brown', time: '09:35 AM' },
        { id: 5, name: 'Michael Lee', time: '09:50 AM' }
      ];

      let currentPage = 1;
      const itemsPerPage = 3;
      const totalPages = Math.ceil(lateStudents.length / itemsPerPage);

      const renderPage = (page) => {
        lateStudentsList.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = lateStudents.slice(start, end);

        paginatedItems.forEach(student => {
          const item = document.createElement('div');
          item.className = 'flex justify-between py-2 border-b border-gray-200';
          item.innerHTML = `<span>${student.name}</span><span>${student.time}</span>`;
          lateStudentsList.appendChild(item);
        });

        pageInfo.innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = page === totalPages;
        console.log('dashboard.js: Late students page rendered', { page, totalPages });
      };

      prevPageBtn.addEventListener('click', () => {
        if (currentPage > 1) {
          currentPage--;
          renderPage(currentPage);
        }
      });

      nextPageBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
          currentPage++;
          renderPage(currentPage);
        }
      });

      renderPage(currentPage);

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/dashboard/late-students
       * - Method: GET
       * - Query Parameters: page, limit, year, section, date (optional)
       * - Expected Response: { students: { id: number, name: string, time: string }[], total: number }
       */
    };

    console.log('dashboard.js: Starting initialization');
    updateSummaryData();
    renderAttendanceChart();
    renderEntryChart();
    renderTrendChart();
    renderLateStudents();
    console.log('dashboard.js: Initialization complete');
  });
})();