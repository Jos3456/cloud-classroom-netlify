// script.js – complete version with all features
document.addEventListener('DOMContentLoaded', function() {
    // ===== PAGE REFERENCES =====
    const pages = {
        home: document.getElementById('home-page'),
        subjects: document.getElementById('subjects-page'),
        pricing: document.getElementById('pricing-page'),
        faq: document.getElementById('faq-page'),
        contact: document.getElementById('contact-page')
    };

    const navLinks = document.querySelectorAll('.nav-link');
    const scheduleBtn = document.getElementById('scheduleBtn');
    const ctaButtons = document.querySelectorAll('[data-page]');

    // ===== PAGE NAVIGATION =====
    function showPage(pageId) {
        Object.values(pages).forEach(page => {
            if (page) page.classList.remove('active-page');
        });
        if (pages[pageId]) {
            pages[pageId].classList.add('active-page');
        }
        navLinks.forEach(link => {
            const linkPage = link.getAttribute('data-page');
            link.classList.toggle('active', linkPage === pageId);
        });
        window.location.hash = pageId;
    }

    function handleNavClick(e) {
        e.preventDefault();
        const pageId = this.getAttribute('data-page');
        if (pageId && pages[pageId]) {
            showPage(pageId);
        }
    }

    navLinks.forEach(link => link.addEventListener('click', handleNavClick));
    ctaButtons.forEach(btn => btn.addEventListener('click', handleNavClick));
    if (scheduleBtn) scheduleBtn.addEventListener('click', handleNavClick);

    // Initial page from hash
    const initialHash = window.location.hash.substring(1);
    showPage(pages[initialHash] ? initialHash : 'home');

    // ===== DARK MODE (dual toggle) =====
    const body = document.body;
    const darkModeIconDesktop = document.getElementById('darkModeIcon');
    const darkModeIconMobile = document.getElementById('darkModeIconMobile');
    const savedTheme = localStorage.getItem('cloudTheme');

    function setDarkMode(isDark) {
        body.classList.toggle('dark-mode', isDark);
        // Update both icons
        if (darkModeIconDesktop) {
            darkModeIconDesktop.classList.toggle('fa-moon', !isDark);
            darkModeIconDesktop.classList.toggle('fa-sun', isDark);
        }
        if (darkModeIconMobile) {
            darkModeIconMobile.classList.toggle('fa-moon', !isDark);
            darkModeIconMobile.classList.toggle('fa-sun', isDark);
        }
        localStorage.setItem('cloudTheme', isDark ? 'dark' : 'light');
    }

    // Apply saved theme
    if (savedTheme === 'dark') {
        setDarkMode(true);
    }

    // Add click listeners to both toggles
    [darkModeIconDesktop, darkModeIconMobile].forEach(icon => {
        if (icon) {
            icon.addEventListener('click', () => {
                const isDark = !body.classList.contains('dark-mode');
                setDarkMode(isDark);
            });
        }
    });

    // ===== MOBILE HAMBURGER MENU =====
    const menuToggle = document.getElementById('menuToggle');
    const mobileLinks = document.querySelectorAll('.mobile-menu a');

    // Close mobile menu when a link is clicked
    mobileLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (menuToggle) {
                menuToggle.checked = false;
            }
        });
    });

    // ===== SUBJECT SELECTION =====
    const subjectCards = document.querySelectorAll('.subject-item');
    const selectedCountSpan = document.getElementById('selectedCount');
    const selectedSummaryDiv = document.getElementById('selectedSummary');

    function updateSelectedCount() {
        const selected = document.querySelectorAll('.subject-item.selected');
        if (selectedCountSpan) {
            selectedCountSpan.textContent = `Selected: ${selected.length}`;
        }
        const subjects = Array.from(selected).map(card => card.dataset.subject);
        localStorage.setItem('selectedSubjects', JSON.stringify(subjects));
        updateSelectedSummary();
    }

    function updateSelectedSummary() {
        if (!selectedSummaryDiv) return;
        
        const subjects = JSON.parse(localStorage.getItem('selectedSubjects') || '[]');
        const plan = localStorage.getItem('selectedPlan') || 'Not selected';
        
        let summaryText = '';
        if (subjects.length > 0) {
            summaryText = `📚 Subjects: ${subjects.join(', ')}`;
        } else {
            summaryText = '📚 No subjects selected yet. Please go to Subjects page.';
        }
        summaryText += ` | 📋 Plan: ${plan}`;
        
        selectedSummaryDiv.textContent = summaryText;
    }

    // Restore previously selected subjects
    const savedSubjects = JSON.parse(localStorage.getItem('selectedSubjects') || '[]');
    subjectCards.forEach(card => {
        if (savedSubjects.includes(card.dataset.subject)) {
            card.classList.add('selected');
        }
    });
    updateSelectedCount();

    subjectCards.forEach(card => {
        card.addEventListener('click', function() {
            this.classList.toggle('selected');
            updateSelectedCount();
        });
    });

// ===== CLEAR SUBJECTS BUTTON with custom modal =====
const clearBtn = document.getElementById('clearSubjectsBtn');
const confirmModal = document.getElementById('confirmModal');
const modalAccept = document.getElementById('modalAccept');
const modalDecline = document.getElementById('modalDecline');

if (clearBtn && confirmModal) {
    clearBtn.addEventListener('click', function() {
        confirmModal.classList.add('active');
    });

    modalAccept.addEventListener('click', function() {
        // Remove 'selected' class from ALL subject cards
        document.querySelectorAll('.subject-item').forEach(card => {
            card.classList.remove('selected');
        });
        
        // Clear localStorage
        localStorage.removeItem('selectedSubjects');
        localStorage.removeItem('selectedPlan');
        
        // Update the selected count display
        if (selectedCountSpan) {
            selectedCountSpan.textContent = 'Selected: 0';
        }
        
        // Update the contact page summary
        updateSelectedSummary();
        
        // Hide modal
        confirmModal.classList.remove('active');
    });

    modalDecline.addEventListener('click', function() {
        confirmModal.classList.remove('active');
    });

    // Optional: close modal if clicking outside
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            confirmModal.classList.remove('active');
        }
    });
}

    // ===== PLAN SELECTION (PRICING PAGE) =====
    document.querySelectorAll('.choose-plan').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const priceCard = this.closest('.price-card');
            const planName = priceCard ? priceCard.dataset.plan : 'Custom';
            localStorage.setItem('selectedPlan', planName);
            showPage('contact');
        });
    });

    // ===== CONTACT PAGE OBSERVER =====
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.target.id === 'contact-page' && mutation.target.classList.contains('active-page')) {
                updateSelectedSummary();
                if (dateInput) {
                    dateInput.min = new Date().toISOString().split('T')[0];
                }
            }
        });
    });
    if (pages.contact) observer.observe(pages.contact, { attributes: true, attributeFilter: ['class'] });

    // ===== BOOKING FORM (FORMSPREE) =====
    const dateInput = document.getElementById('appointment-date');
    const timeSelect = document.getElementById('appointment-time');
    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const curriculumSelect = document.getElementById('curriculum');
    const bookingForm = document.getElementById('bookingForm');
    const emailStatus = document.getElementById('emailStatus');

    if (dateInput) {
        dateInput.min = new Date().toISOString().split('T')[0];
    }

    if (bookingForm) {
        bookingForm.addEventListener('submit', async function(e) {
            e.preventDefault();

            const name = nameInput.value.trim();
            const email = emailInput.value.trim();
            const phone = phoneInput.value.trim();
            const date = dateInput.value;
            const time = timeSelect.value;
            const curriculum = curriculumSelect ? curriculumSelect.value : '';

            if (!name || !email || !phone || !date || !time || !curriculum) {
                alert('Please fill in all required fields.');
                return;
            }

            const selectedSubjects = JSON.parse(localStorage.getItem('selectedSubjects') || '[]');
            if (selectedSubjects.length === 0) {
                alert('Please select at least one subject on the Subjects page before booking.');
                return;
            }

            const formData = new FormData(bookingForm);
            formData.append('subjects', selectedSubjects.join(', '));
            formData.append('plan', localStorage.getItem('selectedPlan') || 'Not selected');

            emailStatus.textContent = '⏳ Sending...';
            emailStatus.style.color = '';

            try {
                const response = await fetch(bookingForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: { 'Accept': 'application/json' }
                });

                if (response.ok) {
                    emailStatus.textContent = '✅ Booking request sent! I’ll get back to you soon.';
                    emailStatus.style.color = 'green';
                    bookingForm.reset();
                } else {
                    const data = await response.json();
                    emailStatus.textContent = data.errors
                        ? `❌ Error: ${data.errors.map(e => e.message).join(', ')}`
                        : '❌ Something went wrong. Please try again.';
                    emailStatus.style.color = 'red';
                }
            } catch (error) {
                emailStatus.textContent = '❌ Network error. Please check your connection.';
                emailStatus.style.color = 'red';
                console.error('Formspree error:', error);
            }
        });
    }

    // ===== PROGRESS BAR DISPLAY =====
    const targetAmount = 200000;
    const targetSpan = document.getElementById('targetAmount');
    if (targetSpan) targetSpan.textContent = targetAmount.toLocaleString();

    let currentAmount = parseInt(localStorage.getItem('diplomaFund')) || 0;
    const currentSpan = document.getElementById('currentAmount');
    const progressFill = document.getElementById('progressBarFill');

    function updateProgressBar() {
        if (currentSpan) currentSpan.textContent = currentAmount.toLocaleString();
        if (progressFill) {
            const percent = Math.min(100, (currentAmount / targetAmount) * 100);
            progressFill.style.width = percent + '%';
            progressFill.textContent = percent.toFixed(0) + '%';
        }
    }
    updateProgressBar();
});