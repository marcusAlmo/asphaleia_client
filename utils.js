function formatDate(date) {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function filterData(data, filters) {
  return data.filter(item => {
    const yearMatch = !filters.year || item.year === filters.year;
    const sectionMatch = !filters.section || item.section === filters.section;
    const dateMatch = !filters.date || item.date === filters.date;
    const startTimeMatch = !filters.startTime || item.time >= filters.startTime;
    const endTimeMatch = !filters.endTime || item.time <= filters.endTime;
    return yearMatch && sectionMatch && dateMatch && startTimeMatch && endTimeMatch;
  });
}

function paginateData(data, page, perPage) {
  const start = (page - 1) * perPage;
  const end = start + perPage;
  return data.slice(start, end);
}

function updatePagination(pageInfo, currentPage, totalPages) {
  pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
}

urlprefix = "https://asphaleia.onrender.com/api/v1";