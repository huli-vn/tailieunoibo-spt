// script.js

document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('sidebar');
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const navItems = document.querySelectorAll('.nav-item');
    const htmlElement = document.documentElement;
    const darkModeToggle = document.getElementById('darkModeToggle');

    const videoModal = document.getElementById('videoModal');
    const closeButton = document.querySelector('.modal .close-button');
    const youtubeIframeModal = document.getElementById('youtube-iframe-modal');
    const downloadDocumentButton = document.getElementById('download-document-button');
    const lessonItems = document.querySelectorAll('.lesson-item');

    // --- Sidebar Toggle for Mobile ---
    sidebarToggle.addEventListener('click', () => {
        sidebar.classList.toggle('open');
    });

    // Close sidebar if clicked outside (for mobile)
    document.addEventListener('click', (event) => {
        if (window.innerWidth < 768) { // Only for mobile view
            if (!sidebar.contains(event.target) && !sidebarToggle.contains(event.target) && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
            }
        }
    });

    // --- Dark Mode Toggle ---
    if (darkModeToggle) {
        darkModeToggle.addEventListener('change', () => {
            if (darkModeToggle.checked) {
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark'); 
            } else {
                htmlElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            }
        });

        // Apply saved theme on load
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            htmlElement.setAttribute('data-theme', savedTheme);
            if (savedTheme === 'dark') {
                darkModeToggle.checked = true;
            }
        } else {
            // Default to light if no theme saved
            htmlElement.setAttribute('data-theme', 'light');
            darkModeToggle.checked = false;
        }
    }


    // --- Navigation Active State & Submenu Toggle ---
    navItems.forEach(item => {
        const navLink = item.querySelector('.nav-link');
        const submenuToggle = item.querySelector('.nav-link-toggle');
        const submenu = item.querySelector('.submenu');

        // Toggle submenu visibility
        if (submenuToggle) {
            submenuToggle.addEventListener('click', function(e) {
                e.preventDefault(); // Prevent default link behavior
                item.classList.toggle('open'); // Toggle 'open' class on nav-item
                if (submenu) {
                    submenu.classList.toggle('open');
                }
            });
        }
        
        // Handle active state for main nav items
        if (navLink) {
            navLink.addEventListener('click', function(e) {
                // Prevent default link behavior if it's a submenu toggle or '#'
                if (this.getAttribute('href') === '#' || this.getAttribute('href') === 'about:blank' || this.classList.contains('nav-link-toggle')) {
                    e.preventDefault();
                }

                // Remove active from all and add to current
                navItems.forEach(ni => ni.classList.remove('active'));
                item.classList.add('active');

                // If it's a submenu toggle, ensure the submenu itself opens/closes
                if (this.classList.contains('nav-link-toggle')) {
                    item.classList.toggle('open');
                    if (submenu) {
                        submenu.classList.remove('open'); // Close submenu if already open
                    }
                } else if (submenu) {
                    // If it's a regular nav item that also has a submenu, close submenu if open
                    item.classList.remove('open');
                    submenu.classList.remove('open');
                }
            });
        }
    });

    const submenuLinks = document.querySelectorAll('.submenu-link');
    submenuLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            // Prevent default link behavior if it's '#' or 'about:blank'
            if (this.getAttribute('href') === '#' || this.getAttribute('href') === 'about:blank') {
                e.preventDefault();
            }

            navItems.forEach(ni => ni.classList.remove('active'));
            let parent = link.closest('.nav-item');
            if (parent) parent.classList.add('active');
        });
    });

    // Set active based on current URL
    const setActiveNavItem = () => {
        const path = window.location.pathname;
        let foundActive = false;

        // Check submenu links first for exact match
        submenuLinks.forEach(link => {
            if (link.href && new URL(link.href).pathname === path) {
                navItems.forEach(ni => ni.classList.remove('active', 'open')); // Reset all
                let parent = link.closest('.nav-item');
                if (parent) {
                    parent.classList.add('active', 'open'); // Activate parent and open submenu
                    const submenu = parent.querySelector('.submenu');
                    if (submenu) submenu.classList.add('open');
                }
                foundActive = true;
            }
        });

        // If no submenu link matched, check main nav items
        if (!foundActive) {
            navItems.forEach(item => {
                const navLink = item.querySelector('.nav-link:not(.nav-link-toggle)'); // Only consider direct links
                if (navLink && navLink.href) {
                    if (new URL(navLink.href).pathname === path) {
                        navItems.forEach(ni => ni.classList.remove('active', 'open')); // Reset all
                        item.classList.add('active');
                        foundActive = true;
                    }
                }
            });
        }

        // Default to dashboard if no active element is set
        if (!foundActive) {
            const dashboardItem = document.querySelector('.nav-item[data-path="dashboard"]');
            if (dashboardItem) {
                dashboardItem.classList.add('active');
            }
        }
    };

    // Call on load
    setActiveNavItem();

    // Re-evaluate active state on hash change (if applicable) or other navigation
    window.addEventListener('popstate', setActiveNavItem);
    window.addEventListener('hashchange', setActiveNavItem);


    // --- Video Popup Logic ---
    lessonItems.forEach(item => {
        item.addEventListener('click', function() {
            const videoId = this.dataset.videoId; // Get video ID from data-video-id attribute
            const documentUrl = this.dataset.documentUrl; // Get document URL from data-document-url attribute
            const lessonTitle = this.querySelector('.lesson-title').textContent; // Get lesson title

            if (videoId) {
                youtubeIframeModal.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=1&modestbranding=1&rel=0`;
            } else {
                youtubeIframeModal.src = ""; // Clear iframe if no video ID
            }

            if (documentUrl) {
                downloadDocumentButton.href = documentUrl;
                downloadDocumentButton.style.display = 'flex'; // Show button
            } else {
                downloadDocumentButton.style.display = 'none'; // Hide button if no document
            }

            // Update video title in the main section (optional, can be removed if not needed)
            document.querySelector('.video-main-title').textContent = lessonTitle;
            
            videoModal.style.display = 'flex'; // Show the modal
            document.body.style.overflow = 'hidden'; // Prevent scrolling background
        });
    });

    closeButton.addEventListener('click', () => {
        videoModal.style.display = 'none'; // Hide the modal
        youtubeIframeModal.src = ""; // Stop video playback by clearing src
        document.body.style.overflow = ''; // Restore scrolling
    });

    window.addEventListener('click', (event) => {
        if (event.target == videoModal) {
            videoModal.style.display = 'none'; // Hide modal if clicked outside content
            youtubeIframeModal.src = ""; // Stop video playback
            document.body.style.overflow = ''; // Restore scrolling
        }
    });
});
