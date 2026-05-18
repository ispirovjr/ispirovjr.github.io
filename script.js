document.addEventListener('DOMContentLoaded', () => {
    // Scroll reveal animations
    const revealElements = document.querySelectorAll('.reveal');
    
    const revealOnScroll = () => {
        const windowHeight = window.innerHeight;
        const revealPoint = 100;
        
        revealElements.forEach(el => {
            const revealTop = el.getBoundingClientRect().top;
            if (revealTop < windowHeight - revealPoint) {
                el.classList.add('active');
            }
        });
    };
    
    window.addEventListener('scroll', revealOnScroll);
    revealOnScroll(); // Trigger on load
    
    // Navbar background on scroll
    const nav = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    
    if (hamburger) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
        });
    }
    
    // Active link highlighting
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-links a');
    
    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            if (window.scrollY >= (sectionTop - sectionHeight / 3)) {
                current = section.getAttribute('id');
            }
        });
        
        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href').includes(current)) {
                item.classList.add('active');
            }
        });
    });

    // Status Panel Logic
    const statusToggle = document.getElementById('status-toggle');
    const statusPanel = document.getElementById('status-panel');
    const statusRefresh = document.getElementById('status-refresh');
    const statusList = document.getElementById('status-list');
    const globalIndicator = document.getElementById('global-indicator');
    
    if (statusToggle && statusPanel) {
        statusToggle.addEventListener('click', () => {
            statusPanel.classList.toggle('active');
        });
        
        // Close when clicking outside
        document.addEventListener('click', (e) => {
            if (!statusPanel.contains(e.target) && !statusToggle.contains(e.target) && statusPanel.classList.contains('active')) {
                statusPanel.classList.remove('active');
            }
        });
        
        const fetchStatus = async () => {
            try {
                // Add timestamp to prevent caching
                const response = await fetch(`status.json?t=${new Date().getTime()}`);
                if (!response.ok) throw new Error('Status file not found');
                
                const data = await response.json();
                renderStatus(data);
            } catch (error) {
                console.error('Error fetching status:', error);
                statusList.innerHTML = `<div class="status-message">Unable to load status data.</div>`;
            }
        };
        
        const renderStatus = (data) => {
            if (!data.scripts || data.scripts.length === 0) {
                statusList.innerHTML = `<div class="status-message">No active scripts.</div>`;
                globalIndicator.style.backgroundColor = 'var(--text-muted)';
                return;
            }
            
            // Determine global status (running > error > idle)
            let hasRunning = false;
            let hasError = false;
            
            data.scripts.forEach(s => {
                if (s.status === 'running') hasRunning = true;
                if (s.status === 'error') hasError = true;
            });
            
            if (hasRunning) globalIndicator.style.backgroundColor = 'var(--status-running)';
            else if (hasError) globalIndicator.style.backgroundColor = 'var(--status-error)';
            else globalIndicator.style.backgroundColor = 'var(--status-idle)';
            
            statusList.innerHTML = data.scripts.map(script => {
                const date = new Date(script.updated);
                const timeStr = isNaN(date) ? 'Unknown time' : date.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
                
                return `
                    <div class="status-item">
                        <div class="status-item-header">
                            <span class="status-item-name">${script.name}</span>
                            <span class="status-badge ${script.status}">${script.status}</span>
                        </div>
                        <div class="status-message">${script.message}</div>
                        <div class="status-time">Last updated: ${timeStr}</div>
                    </div>
                `;
            }).join('');
        };
        
        if (statusRefresh) {
            statusRefresh.addEventListener('click', fetchStatus);
        }
        
        // Initial fetch and auto-refresh every 60s
        fetchStatus();
        setInterval(fetchStatus, 60000);
    }
});
