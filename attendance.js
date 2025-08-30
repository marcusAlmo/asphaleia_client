(function() {
  // Note: This script initializes the attendance page with test data for an attendance table and status pie chart.
  // Test data mirrors the expected API response structure. Includes error handling and debug logging to ensure proper rendering.
  // Runs in a self-invoking function to avoid conflicts with utils.js or header.js.

  document.addEventListener('DOMContentLoaded', () => {
    console.log('attendance.js: Initializing attendance page with test data');

    // Function: Render attendance status pie chart
    // Purpose: Displays a pie chart showing the distribution of attendance statuses (Present, Absent, Late).
    const renderAttendanceChart = () => {
      console.log('attendance.js: Rendering attendance status pie chart');
      const canvas = document.getElementById('attendanceChart');
      if (!canvas) {
        console.error('attendance.js: Attendance chart canvas not found');
        return;
      }

      // Test data: Represents the structure expected from the API response
      const attendanceData = {
        labels: ['Present', 'Absent', 'Late'],
        data: [120, 30, 20]
      };

      try {
        const chart = new Chart(canvas, {
          type: 'pie',
          data: {
            labels: attendanceData.labels,
            datasets: [{
              data: attendanceData.data,
              backgroundColor: ['#34D399', '#EF4444', '#FBBF24'],
              borderColor: ['#10B981', '#DC2626', '#F59E0B'],
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
        console.log('attendance.js: Attendance status pie chart rendered', {
          data: attendanceData,
          width: canvas.width,
          height: canvas.height
        });
      } catch (error) {
        console.error('attendance.js: Error rendering attendance chart:', error);
        canvas.parentElement.innerHTML += '<p class="text-red-600 text-center">Failed to load pie chart</p>';
      }

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/attendance/status
       * - Method: GET
       * - Query Parameters:
       *   - year: string (optional, e.g., "2025")
       *   - section: string (optional, e.g., "A")
       *   - date: string (optional, e.g., "2025-08-05")
       *   - startTime: string (optional, e.g., "09:00")
       *   - endTime: string (optional, e.g., "17:00")
       * - Expected Response: JSON object
       *   {
       *     labels: string[], // e.g., ["Present", "Absent", "Late"]
       *     data: number[]    // e.g., [120, 30, 20]
       *   }
       * - Notes:
       *   - Labels represent attendance status categories; data represents counts.
       *   - Colors are fixed: green (#34D399) for Present, red (#EF4444) for Absent, yellow (#FBBF24) for Late.
       *   - Use filter values from #yearFilter, #sectionFilter, #dateFilter, #startTimeFilter, #endTimeFilter.
       *   - Fallback to test data if API fails.
       * - Implementation:
       *   async function fetchAttendanceChartData() {
       *     try {
       *       const year = document.getElementById('yearFilter').value;
       *       const section = document.getElementById('sectionFilter').value;
       *       const date = document.getElementById('dateFilter').value;
       *       const startTime = document.getElementById('startTimeFilter').value;
       *       const endTime = document.getElementById('endTimeFilter').value;
       *       const query = new URLSearchParams({ year, section, date, startTime, endTime }).toString();
       *       const response = await fetch(`https://your-api-endpoint/attendance/status?${query}`);
       *       const data = await response.json();
       *       new Chart(document.getElementById('attendanceChart'), {
       *         type: 'pie',
       *         data: {
       *           labels: data.labels,
       *           datasets: [{
       *             data: data.data,
       *             backgroundColor: ['#34D399', '#EF4444', '#FBBF24'],
       *             borderColor: ['#10B981', '#DC2626', '#F59E0B'],
       *             borderWidth: 1,
       *             hoverOffset: 8
       *           }]
       *         },
       *         options: { ... }
       *       });
       *     } catch (error) {
       *       console.error('Error fetching attendance chart data:', error);
       *       // Use attendanceData as fallback
       *       new Chart(document.getElementById('attendanceChart'), { ... });
       *     }
       *   }
       */
    };

    // Function: Render attendance table with pagination
    // Purpose: Displays a paginated table of student attendance records (ID, name, section, year, entry time, entry date, status).
    const renderAttendanceTable = () => {
      console.log('attendance.js: Rendering attendance table');
      const attendanceTable = document.getElementById('attendance-table');
      const prevPageBtn = document.getElementById('prev-page');
      const nextPageBtn = document.getElementById('next-page');
      const pageInfo = document.getElementById('page-info');

      if (!attendanceTable || !prevPageBtn || !nextPageBtn || !pageInfo) {
        console.error('attendance.js: Attendance table elements not found');
        return;
      }

      // Test data: Represents the structure expected from the API response
      const attendanceRecords = [
        { id: 'S001', name: 'John Doe', section: 'A', year: '2025', entryTime: '09:00 AM', entryDate: '2025-08-05', status: 'Present' },
        { id: 'S002', name: 'Jane Smith', section: 'B', year: '2025', entryTime: '09:15 AM', entryDate: '2025-08-05', status: 'Late' },
        { id: 'S003', name: 'Alex Johnson', section: 'A', year: '2024', entryTime: '09:30 AM', entryDate: '2025-08-05', status: 'Late' },
        { id: 'S004', name: 'Emily Brown', section: 'B', year: '2025', entryTime: '09:45 AM', entryDate: '2025-08-05', status: 'Present' },
        { id: 'S005', name: 'Michael Lee', section: 'A', year: '2024', entryTime: '10:00 AM', entryDate: '2025-08-05', status: 'Absent' },
        { id: 'S006', name: 'Sarah Davis', section: 'B', year: '2025', entryTime: '09:10 AM', entryDate: '2025-08-05', status: 'Present' }
      ];

      let currentPage = 1;
      const itemsPerPage = 3;
      const totalPages = Math.ceil(attendanceRecords.length / itemsPerPage);

      const renderPage = (page) => {
        attendanceTable.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = attendanceRecords.slice(start, end);

        paginatedItems.forEach(record => {
          const row = document.createElement('tr');
          row.innerHTML = `
            <td class="p-4 text-gray-700">${record.id}</td>
            <td class="p-4 text-gray-700">${record.name}</td>
            <td class="p-4 text-gray-700">${record.section}</td>
            <td class="p-4 text-gray-700">${record.year}</td>
            <td class="p-4 text-gray-700">${record.entryTime}</td>
            <td class="p-4 text-gray-700">${record.entryDate}</td>
            <td class="p-4 ${record.status === 'Present' ? 'text-green-600' : record.status === 'Late' ? 'text-yellow-600' : 'text-red-600'}">${record.status}</td>
          `;
          attendanceTable.appendChild(row);
        });

        pageInfo.innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = page === totalPages;
        console.log('attendance.js: Attendance table page rendered', { page, totalPages });
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
       * - Endpoint: GET https://your-api-endpoint/attendance/records
       * - Method: GET
       * - Query Parameters:
       *   - page: number (e.g., 1)
       *   - limit: number (e.g., 3)
       *   - year: string (optional, e.g., "2025")
       *   - section: string (optional, e.g., "A")
       *   - date: string (optional, e.g., "2025-08-05")
       *   - startTime: string (optional, e.g., "09:00")
       *   - endTime: string (optional, e.g., "17:00")
       * - Expected Response: JSON object
       *   {
       *     records: {
       *       id: string,
       *       name: string,
       *       section: string,
       *       year: string,
       *       entryTime: string,
       *       entryDate: string,
       *       status: string
       *     }[], // e.g., [{ id: "S001", name: "John Doe", section: "A", year: "2025", entryTime: "09:00 AM", entryDate: "2025-08-05", status: "Present" }, ...]
       *     total: number // e.g., 6
       *   }
       * - Notes:
       *   - Paginate results using page and limit parameters.
       *   - Use filter values to refine the table (e.g., year, section, date, time range).
       *   - Fallback to test data if API fails.
       *   - Status colors: green (#34D399) for Present, yellow (#FBBF24) for Late, red (#EF4444) for Absent.
       * - Implementation:
       *   async function fetchAttendanceRecords(page = 1) {
       *     try {
       *       const year = document.getElementById('yearFilter').value;
       *       const section = document.getElementById('sectionFilter').value;
       *       const date = document.getElementById('dateFilter').value;
       *       const startTime = document.getElementById('startTimeFilter').value;
       *       const endTime = document.getElementById('endTimeFilter').value;
       *       const query = new URLSearchParams({ page, limit: itemsPerPage, year, section, date, startTime, endTime }).toString();
       *       const response = await fetch(`https://your-api-endpoint/attendance/records?${query}`);
       *       const data = await response.json();
       *       const attendanceTable = document.getElementById('attendance-table');
       *       attendanceTable.innerHTML = '';
       *       data.records.forEach(record => {
       *         const row = document.createElement('tr');
       *         row.innerHTML = `
       *           <td class="p-4 text-gray-700">${record.id}</td>
       *           <td class="p-4 text-gray-700">${record.name}</td>
       *           <td class="p-4 text-gray-700">${record.section}</td>
       *           <td class="p-4 text-gray-700">${record.year}</td>
       *           <td class="p-4 text-gray-700">${record.entryTime}</td>
       *           <td class="p-4 text-gray-700">${record.entryDate}</td>
       *           <td class="p-4 ${record.status === 'Present' ? 'text-green-600' : record.status === 'Late' ? 'text-yellow-600' : 'text-red-600'}">${record.status}</td>
       *         `;
       *         attendanceTable.appendChild(row);
       *       });
       *       const totalPages = Math.ceil(data.total / itemsPerPage);
       *       pageInfo.innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
       *       prevPageBtn.disabled = page === 1;
       *       nextPageBtn.disabled = page === totalPages;
       *     } catch (error) {
       *       console.error('Error fetching attendance records:', error);
       *       // Use attendanceRecords as fallback
       *       renderPage(page);
       *     }
       *   }
       */
    };

    // Initialize all components
    console.log('attendance.js: Starting initialization');
    renderAttendanceChart();
    renderAttendanceTable();
    console.log('attendance.js: Initialization complete');
  });
})();