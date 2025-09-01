(function() {
  // Note: This script initializes the reports page with test data for an attendance report table and section bar chart.
  // Test data mirrors the expected API response structure. Includes error handling to ensure proper rendering.
  // Runs in a self-invoking function to avoid conflicts with utils.js or header.js.

  document.addEventListener('DOMContentLoaded', () => {

    // Function: Render attendance by section bar chart
    // Purpose: Displays a bar chart showing attendance counts by section.
    const renderAttendanceChart = () => {
      const canvas = document.getElementById('attendanceChart');
      if (!canvas) {
        return;
      }

      // Test data: Represents the structure expected from the API response
      const sectionData = {
        labels: ['Section A', 'Section B'],
        data: [80, 60]
      };

      try {
        const chart = new Chart(canvas, {
          type: 'bar',
          data: {
            labels: sectionData.labels,
            datasets: [{
              label: 'Attendance Count',
              data: sectionData.data,
              backgroundColor: ['#34D399', '#FBBF24'],
              borderColor: ['#10B981', '#F59E0B'],
              borderWidth: 1
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
              y: {
                beginAtZero: true,
                title: {
                  display: true,
                  text: 'Attendance Count'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Section'
                }
              }
            },
            plugins: {
              legend: {
                display: false
              }
            }
          }
        });
      } catch (error) {
        canvas.parentElement.innerHTML += '<p class="text-red-600 text-center">Failed to load bar chart</p>';
      }

      /*
       * API Integration Point:
       * - Endpoint: GET https://your-api-endpoint/reports/attendance-by-section
       * - Method: GET
       * - Query Parameters:
       *   - year: string (optional, e.g., "2025")
       *   - section: string (optional, e.g., "A")
       *   - startDate: string (optional, e.g., "2025-08-01")
       *   - endDate: string (optional, e.g., "2025-08-05")
       * - Expected Response: JSON object
       *   {
       *     labels: string[], // e.g., ["Section A", "Section B"]
       *     data: number[]    // e.g., [80, 60]
       *   }
       * - Notes:
       *   - Labels represent section names; data represents attendance counts.
       *   - Colors are fixed: green (#34D399) for Section A, yellow (#FBBF24) for Section B.
       *   - Use filter values from #yearFilter, #sectionFilter, #startDateFilter, #endDateFilter.
       *   - Fallback to test data if API fails.
       * - Implementation:
       *   async function fetchAttendanceChartData() {
       *     try {
       *       const year = document.getElementById('yearFilter').value;
       *       const section = document.getElementById('sectionFilter').value;
       *       const startDate = document.getElementById('startDateFilter').value;
       *       const endDate = document.getElementById('endDateFilter').value;
       *       const query = new URLSearchParams({ year, section, startDate, endDate }).toString();
       *       const response = await fetch(`https://your-api-endpoint/reports/attendance-by-section?${query}`);
       *       const data = await response.json();
       *       new Chart(document.getElementById('attendanceChart'), {
       *         type: 'bar',
       *         data: {
       *           labels: data.labels,
       *           datasets: [{
       *             label: 'Attendance Count',
       *             data: data.data,
       *             backgroundColor: ['#34D399', '#FBBF24'],
       *             borderColor: ['#10B981', '#F59E0B'],
       *             borderWidth: 1
       *           }]
       *         },
       *         options: { ... }
       *       });
       *     } catch (error) {
       *       console.error('Error fetching attendance chart data:', error);
       *       // Use sectionData as fallback
       *       new Chart(document.getElementById('attendanceChart'), { ... });
       *     }
       *   }
       */
    };

    // Function: Render attendance report table with pagination
    // Purpose: Displays a paginated table of student attendance records (ID, name, section, year, entry time, entry date, status).
    const renderReportTable = () => {
      const reportTable = document.getElementById('report-table');
      const prevPageBtn = document.getElementById('prev-page');
      const nextPageBtn = document.getElementById('next-page');
      const pageInfo = document.getElementById('page-info');

      if (!reportTable || !prevPageBtn || !nextPageBtn || !pageInfo) {
        return;
      }

      // Test data: Represents the structure expected from the API response
      const reportRecords = [
        { id: 'S001', name: 'John Doe', section: 'A', year: '2025', entryTime: '09:00 AM', entryDate: '2025-08-01', status: 'Present' },
        { id: 'S002', name: 'Jane Smith', section: 'B', year: '2025', entryTime: '09:15 AM', entryDate: '2025-08-01', status: 'Late' },
        { id: 'S003', name: 'Alex Johnson', section: 'A', year: '2024', entryTime: '09:30 AM', entryDate: '2025-08-02', status: 'Late' },
        { id: 'S004', name: 'Emily Brown', section: 'B', year: '2025', entryTime: '09:45 AM', entryDate: '2025-08-02', status: 'Present' },
        { id: 'S005', name: 'Michael Lee', section: 'A', year: '2024', entryTime: '10:00 AM', entryDate: '2025-08-03', status: 'Absent' },
        { id: 'S006', name: 'Sarah Davis', section: 'B', year: '2025', entryTime: '09:10 AM', entryDate: '2025-08-03', status: 'Present' }
      ];

      let currentPage = 1;
      const itemsPerPage = 3;
      const totalPages = Math.ceil(reportRecords.length / itemsPerPage);

      const renderPage = (page) => {
        reportTable.innerHTML = '';
        const start = (page - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const paginatedItems = reportRecords.slice(start, end);

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
          reportTable.appendChild(row);
        });

        pageInfo.innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
        prevPageBtn.disabled = page === 1;
        nextPageBtn.disabled = page === totalPages;
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
       * - Endpoint: GET https://your-api-endpoint/reports/attendance
       * - Method: GET
       * - Query Parameters:
       *   - page: number (e.g., 1)
       *   - limit: number (e.g., 3)
       *   - year: string (optional, e.g., "2025")
       *   - section: string (optional, e.g., "A")
       *   - startDate: string (optional, e.g., "2025-08-01")
       *   - endDate: string (optional, e.g., "2025-08-05")
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
       *     }[], // e.g., [{ id: "S001", name: "John Doe", section: "A", year: "2025", entryTime: "09:00 AM", entryDate: "2025-08-01", status: "Present" }, ...]
       *     total: number // e.g., 6
       *   }
       * - Notes:
       *   - Paginate results using page and limit parameters.
       *   - Use filter values to refine the table (e.g., year, section, date range).
       *   - Fallback to test data if API fails.
       *   - Status colors: green (#34D399) for Present, yellow (#FBBF24) for Late, red (#EF4444) for Absent.
       * - Implementation:
       *   async function fetchReportRecords(page = 1) {
       *     try {
       *       const year = document.getElementById('yearFilter').value;
       *       const section = document.getElementById('sectionFilter').value;
       *       const startDate = document.getElementById('startDateFilter').value;
       *       const endDate = document.getElementById('endDateFilter').value;
       *       const query = new URLSearchParams({ page, limit: itemsPerPage, year, section, startDate, endDate }).toString();
       *       const response = await fetch(`https://your-api-endpoint/reports/attendance?${query}`);
       *       const data = await response.json();
       *       const reportTable = document.getElementById('report-table');
       *       reportTable.innerHTML = '';
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
       *         reportTable.appendChild(row);
       *       });
       *       const totalPages = Math.ceil(data.total / itemsPerPage);
       *       pageInfo.innerHTML = `Page <span class="font-semibold">${page}</span> of <span class="font-semibold">${totalPages}</span>`;
       *       prevPageBtn.disabled = page === 1;
       *       nextPageBtn.disabled = page === totalPages;
       *     } catch (error) {
       *       console.error('Error fetching report records:', error);
       *       // Use reportRecords as fallback
       *       renderPage(page);
       *     }
       *   }
       */
    };

    // Function: Handle download report button
    // Purpose: Placeholder for generating and downloading a report (e.g., CSV or PDF).
    const handleDownloadReport = () => {
      const downloadBtn = document.getElementById('download-btn');
      if (!downloadBtn) {
        return;
      }

      downloadBtn.addEventListener('click', () => {
        // Placeholder for download functionality
        alert('Report download functionality to be implemented (e.g., CSV or PDF export).');
        /*
         * API Integration Point:
         * - Endpoint: GET https://your-api-endpoint/reports/download
         * - Method: GET
         * - Query Parameters:
         *   - year: string (optional, e.g., "2025")
         *   - section: string (optional, e.g., "A")
         *   - startDate: string (optional, e.g., "2025-08-01")
         *   - endDate: string (optional, e.g., "2025-08-05")
         *   - format: string (e.g., "csv", "pdf")
         * - Expected Response: File (e.g., CSV or PDF)
         * - Notes:
         *   - Use filter values to generate the report.
         *   - Handle file download using Blob and URL.createObjectURL.
         * - Implementation:
         *   async function downloadReport() {
         *     try {
         *       const year = document.getElementById('yearFilter').value;
         *       const section = document.getElementById('sectionFilter').value;
         *       const startDate = document.getElementById('startDateFilter').value;
         *       const endDate = document.getElementById('endDateFilter').value;
         *       const format = 'csv'; // or 'pdf'
         *       const query = new URLSearchParams({ year, section, startDate, endDate, format }).toString();
         *       const response = await fetch(`https://your-api-endpoint/reports/download?${query}`);
         *       const blob = await response.blob();
         *       const url = window.URL.createObjectURL(blob);
         *       const a = document.createElement('a');
         *       a.href = url;
         *       a.download = `attendance_report_${startDate}_${endDate}.${format}`;
         *       document.body.appendChild(a);
         *       a.click();
         *       document.body.removeChild(a);
         *       window.URL.revokeObjectURL(url);
         *     } catch (error) {
         *       console.error('Error downloading report:', error);
         *       alert('Failed to download report. Please try again.');
         *     }
         *   }
         */
      });
    };

    // Initialize all components
    renderAttendanceChart();
    renderReportTable();
    handleDownloadReport();
  });
})();