// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Time and Date Functions
    function updateTimeAndDate() {
        const now = new Date();
        
        // Format time
        const timeOptions = { 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            hour12: true 
        };
        const formattedTime = now.toLocaleTimeString('en-US', timeOptions);
        
        // Format date
        const dateOptions = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        const formattedDate = now.toLocaleDateString('en-US', dateOptions);
        
        // Update the DOM elements if they exist
        const timeElement = document.getElementById('time');
        const dateElement = document.getElementById('date');
        
        if (timeElement) timeElement.textContent = formattedTime;
        if (dateElement) dateElement.textContent = formattedDate;
    }

    // Initialize time and date immediately
    updateTimeAndDate();
    setInterval(updateTimeAndDate, 1000);

    // Sidebar functionality
    function initSidebar() {
        const sidebar = document.getElementById('sidebar');
        const header = document.getElementById('header');
        const mainContent = document.getElementById('main-content');
        const toggleSidebar = document.getElementById('toggle-sidebar');
        const hamburger = document.getElementById('hamburger');
        const overlay = document.getElementById('overlay');

        // Check if all required elements exist
        if (!sidebar || !header || !mainContent || !toggleSidebar || !hamburger || !overlay) {
            console.error('Required elements for sidebar not found');
            return;
        }

        function updateLayout() {
            const isMobile = window.innerWidth < 640;
            const isCollapsed = sidebar.classList.contains('collapsed');
            const isOpen = sidebar.classList.contains('open');

            if (isCollapsed) {
                sidebar.classList.remove('w-3/4', 'sm:w-64');
                sidebar.classList.add('w-16');
                header.classList.add('collapsed');
                mainContent.classList.add('collapsed');
                sidebar.style.transform = 'translateX(0)';
                overlay.classList.remove('active');
            } else {
                sidebar.classList.remove('w-16');
                sidebar.classList.add(isMobile ? 'w-3/4' : 'sm:w-64');
                header.classList.remove('collapsed');
                mainContent.classList.remove('collapsed');
                
                if (isMobile) {
                    sidebar.style.transform = isOpen ? 'translateX(0)' : 'translateX(-100%)';
                    overlay.classList.toggle('active', isOpen);
                } else {
                    sidebar.style.transform = 'translateX(0)';
                    overlay.classList.remove('active');
                }
            }
        }

        // Toggle sidebar with the toggle button
        toggleSidebar.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('collapsed');
            if (window.innerWidth < 640) {
                sidebar.classList.toggle('open');
            }
            updateLayout();
        });

        // Toggle sidebar with hamburger menu (mobile)
        hamburger.addEventListener('click', function(e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            updateLayout();
        });

        // Close sidebar when clicking outside (mobile)
        overlay.addEventListener('click', function() {
            if (window.innerWidth < 640) {
                sidebar.classList.remove('open');
                updateLayout();
            }
        });

        // Handle window resize
        let resizeTimer;
        window.addEventListener('resize', function() {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function() {
                updateLayout();
            }, 250);
        });

        // Initial layout update
        updateLayout();
    }

    // Initialize sidebar
    initSidebar();
});