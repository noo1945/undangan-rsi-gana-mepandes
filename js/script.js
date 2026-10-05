/**
 * =============================================================
 * DIGITAL WEDDING INVITATION — script.js
 * Elegant Modern Interactive Invitation
 * =============================================================
 *
 * Architecture:
 *   - invitationData: Centralized data configuration
 *   - DOMContentLoaded: Entry point
 *   - initLoading()        : Loading screen
 *   - initOpeningScreen()  : Cover screen & open button
 *   - initCountdown()      : Live countdown timer
 *   - initMusicPlayer()    : Background music toggle
 *   - initGallery()        : Gallery grid & lightbox
 *   - initNavigation()     : Bottom nav & active state
 *   - initScrollAnimation(): Intersection Observer animations
 *   - initRSVP()           : RSVP form & localStorage
 *   - initWishes()         : Guest wishes display
 *   - initCopyToClipboard(): Copy rekening to clipboard
 *   - initBackToTop()      : Scroll-to-top button
 *   - initCalendar()       : Add to Calendar (.ics)
 *   - showToast()          : Toast notification helper
 * =============================================================
 */

'use strict';

/* ============================================================
   INVITATION DATA CONFIG
   Edit values here to personalize the invitation
   ============================================================ */
const invitationData = {
    wedding: {
        // Date for countdown — WITA = UTC+8
        date: '2026-10-11',
        dayName: 'Minggu',
        displayDate: '11 Oktober 2026',
        timezone: 'Asia/Makassar'
    },
    ceremony: {
        title: 'Rsi Gana & Mepandes',
        time: '12.00 – 20.00 WITA',
        venue: 'Dusun Cempaka, Desa Pikat, Kec. DAWAN, Kabupaten Klungkung',
        address: 'Dusun Cempaka, Desa Pikat, Kec. DAWAN, Kabupaten Klungkung',
        mapsUrl: 'https://maps.google.com/?q=Dusun Cempaka, Desa Pikat, Kec. DAWAN, Kabupaten Klungkung'
    },
    reception: {
        title: 'Resepsi',
        time: '18.00 WITA - Selesai',
        venue: 'Dusun Cempaka, Desa Pikat, Kec. DAWAN, Kabupaten Klungkung',
        address: 'Dusun Cempaka, Desa Pikat, Kec. DAWAN, Kabupaten Klungkung',
        mapsUrl: 'https://maps.google.com/?q=Dusun Cempaka, Desa Pikat, Kec. DAWAN, Kabupaten Klungkung'
    },
    bankAccounts: [
        { bank: 'BCA', accountNumber: '1234567890', accountName: 'Bayu Gelgel', elementId: 'copy-bca' },
        { bank: 'Mandiri', accountNumber: '1370098765432', accountName: 'Ayu Savitri', elementId: 'copy-mandiri' }
    ]
};

/* ============================================================
   UTILITY: Show Toast Notification
   ============================================================ */
function showToast(message, type = 'info', duration = 3500) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = {
        success: 'fa-circle-check',
        error: 'fa-circle-xmark',
        info: 'fa-circle-info'
    };

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <i class="fa-solid ${icons[type] || icons.info}" aria-hidden="true"></i>
        <span>${message}</span>
    `;
    toast.setAttribute('role', 'status');

    container.appendChild(toast);

    // Auto-remove
    const removeToast = () => {
        toast.classList.add('exiting');
        toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };

    setTimeout(removeToast, duration);
}

/* ============================================================
   1. INIT LOADING SCREEN
   ============================================================ */
function initLoading() {
    const loadingScreen = document.getElementById('loading-screen');
    if (!loadingScreen) return;

    // Simulate resource load (minimum display time for elegance)
    const minDisplayTime = 1000;
    const startTime = Date.now();

    window.addEventListener('load', () => {
        const elapsed = Date.now() - startTime;
        const remaining = Math.max(0, minDisplayTime - elapsed);

        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            loadingScreen.addEventListener('transitionend', () => {
                loadingScreen.style.display = 'none';
            }, { once: true });
        }, remaining);
    });

    // Fallback: hide after 4s even if load event doesn't fire
    setTimeout(() => {
        if (!loadingScreen.classList.contains('hidden')) {
            loadingScreen.classList.add('hidden');
        }
    }, 4000);
}

/* ============================================================
   2. INIT OPENING SCREEN
   ============================================================ */
function initOpeningScreen() {
    const openBtn = document.getElementById('open-invitation-btn');
    const openingScreen = document.getElementById('opening-screen');
    const mainContent = document.getElementById('main-content');
    const bottomNav = document.getElementById('bottom-nav');
    const musicPlayer = document.getElementById('music-player');

    if (!openBtn || !openingScreen || !mainContent) return;

    openBtn.addEventListener('click', () => {
        // Animate opening screen out
        openingScreen.classList.add('closed');

        // Reveal main content
        setTimeout(() => {
            mainContent.classList.add('visible');

            // Show navigation
            if (bottomNav) {
                setTimeout(() => bottomNav.classList.add('visible'), 300);
            }

            // Show music player
            if (musicPlayer) {
                setTimeout(() => musicPlayer.classList.add('visible'), 600);
            }

            // Attempt autoplay (allowed since user interacted)
            initMusicAutoplay();

            openingScreen.addEventListener('transitionend', () => {
                openingScreen.style.display = 'none';
            }, { once: true });

        }, 400);

        // Scroll to top smoothly
        setTimeout(() => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 800);
    });
}

/* ============================================================
   3. INIT COUNTDOWN TIMER
   ============================================================ */
function initCountdown() {
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minutesEl = document.getElementById('countdown-minutes');
    const secondsEl = document.getElementById('countdown-seconds');
    const countdownDisplay = document.getElementById('countdown-display');
    const countdownDone = document.getElementById('countdown-done');

    if (!daysEl) return;

    // Target: 20 Dec 2026, [DYNAMIC TIME] WITA (UTC+8)
    // WITA offset = +08:00
    const targetTime = invitationData.wedding.time || '09:00:00';
    const targetDateStr = `${invitationData.wedding.date}T${targetTime}+08:00`;
    const targetDate = new Date(targetDateStr);

    function updateCountdown() {
        // Get current time in WITA (UTC+8)
        const now = new Date();

        const diff = targetDate - now;

        if (diff <= 0) {
            // Wedding day has come!
            if (countdownDisplay) countdownDisplay.style.display = 'none';
            if (countdownDone) countdownDone.style.display = 'block';
            return;
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        // Animate number flip
        function setWithFlip(el, value, pad = 2) {
            const formatted = String(value).padStart(pad, '0');
            if (el.textContent !== formatted) {
                el.style.transform = 'translateY(-5px)';
                el.style.opacity = '0.6';
                setTimeout(() => {
                    el.textContent = formatted;
                    el.style.transform = '';
                    el.style.opacity = '';
                }, 100);
            }
        }

        setWithFlip(daysEl, days, 2);
        setWithFlip(hoursEl, hours);
        setWithFlip(minutesEl, minutes);
        setWithFlip(secondsEl, seconds);
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);
}

/* ============================================================
   4. INIT MUSIC PLAYER
   ============================================================ */
let audioContext = null;

function initMusicPlayer() {
    const musicToggle = document.getElementById('music-toggle');
    const backgroundMusic = document.getElementById('background-music');
    const musicPlayer = document.getElementById('music-player');
    const iconPlay = document.getElementById('music-icon-play');
    const iconPause = document.getElementById('music-icon-pause');

    if (!musicToggle || !backgroundMusic) return;

    let isPlaying = false;

    musicToggle.addEventListener('click', () => {
        if (isPlaying) {
            backgroundMusic.pause();
            setPlayState(false);
        } else {
            backgroundMusic.play().then(() => {
                setPlayState(true);
            }).catch(err => {
                console.warn('Music autoplay blocked:', err);
                showToast('Tidak dapat memutar musik. Coba klik lagi.', 'info');
            });
        }
    });

    function setPlayState(playing) {
        isPlaying = playing;
        musicToggle.setAttribute('aria-pressed', String(playing));

        if (playing) {
            iconPlay.style.display = 'none';
            iconPause.style.display = '';
            musicPlayer.classList.add('playing');
        } else {
            iconPlay.style.display = '';
            iconPause.style.display = 'none';
            musicPlayer.classList.remove('playing');
        }
    }

    // Handle audio end (loop is set in HTML, but just in case)
    backgroundMusic.addEventListener('ended', () => {
        if (!backgroundMusic.loop) {
            setPlayState(false);
        }
    });

    // Global reference for autoplay after opening
    window._musicPlayer = { play: () => backgroundMusic.play().then(() => setPlayState(true)).catch(() => { }) };
}

function initMusicAutoplay() {
    // Triggered after user taps "Buka Undangan" — autoplay is now allowed
    if (window._musicPlayer) {
        window._musicPlayer.play();
    }
}

/* ============================================================
   5. INIT GALLERY & LIGHTBOX
   ============================================================ */
function initGallery() {
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxCounter = document.getElementById('lightbox-counter');

    if (!galleryItems.length || !lightbox) return;

    let currentIndex = 0;
    const totalItems = galleryItems.length;

    // Collect image sources
    const imageSources = Array.from(galleryItems).map(item => {
        const img = item.querySelector('img');
        return {
            src: img ? img.src : '',
            alt: img ? img.alt : 'Gallery photo'
        };
    });

    // Open lightbox
    function openLightbox(index) {
        currentIndex = index;
        lightbox.style.display = 'block';
        document.body.style.overflow = 'hidden';
        loadImage(currentIndex);

        // Trap focus
        lightboxClose.focus();

        // Animate in
        requestAnimationFrame(() => {
            lightbox.style.opacity = '0';
            requestAnimationFrame(() => {
                lightbox.style.transition = 'opacity 0.3s ease';
                lightbox.style.opacity = '1';
            });
        });
    }

    // Close lightbox
    function closeLightbox() {
        lightbox.style.opacity = '0';
        setTimeout(() => {
            lightbox.style.display = 'none';
            lightbox.style.opacity = '';
            lightbox.style.transition = '';
            document.body.style.overflow = '';
        }, 300);
    }

    // Load image at index
    function loadImage(index) {
        const { src, alt } = imageSources[index];
        lightboxImg.style.opacity = '0';
        lightboxImg.src = src;
        lightboxImg.alt = alt;
        lightboxImg.onload = () => {
            lightboxImg.style.transition = 'opacity 0.3s ease';
            lightboxImg.style.opacity = '1';
        };
        lightboxImg.onerror = () => {
            // Show placeholder if image not found
            lightboxImg.style.opacity = '1';
        };

        if (lightboxCounter) {
            lightboxCounter.textContent = `${index + 1} / ${totalItems}`;
        }
    }

    // Navigate
    function navigate(dir) {
        currentIndex = (currentIndex + dir + totalItems) % totalItems;
        loadImage(currentIndex);
    }

    // Event Listeners
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxOverlay) lightboxOverlay.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', () => navigate(-1));
    if (lightboxNext) lightboxNext.addEventListener('click', () => navigate(1));

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (lightbox.style.display !== 'block') return;
        if (e.key === 'ArrowLeft') navigate(-1);
        if (e.key === 'ArrowRight') navigate(1);
        if (e.key === 'Escape') closeLightbox();
    });

    // Touch/swipe support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    lightbox.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    lightbox.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        const diff = touchStartX - touchEndX;
        if (Math.abs(diff) > 50) {
            navigate(diff > 0 ? 1 : -1);
        }
    }, { passive: true });
}

/* ============================================================
   6. INIT NAVIGATION
   ============================================================ */
function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section[id]');

    if (!navItems.length) return;

    // Smooth scroll on click
    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('href');
            const targetEl = document.querySelector(target);
            if (targetEl) {
                const offset = 20; // Bottom nav offset
                const top = targetEl.getBoundingClientRect().top + window.scrollY - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // Active state on scroll using IntersectionObserver
    const navObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.id;
                navItems.forEach(item => {
                    item.classList.toggle('active', item.getAttribute('href') === `#${id}`);
                });
            }
        });
    }, {
        rootMargin: '-30% 0px -60% 0px',
        threshold: 0
    });

    sections.forEach(section => navObserver.observe(section));
}

/* ============================================================
   7. INIT SCROLL ANIMATIONS
   ============================================================ */
function initScrollAnimation() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');

    if (!animatedElements.length) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                // Stagger delay for grouped elements
                const delay = entry.target.dataset.delay || 0;
                setTimeout(() => {
                    entry.target.classList.add('animated');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.12,
        rootMargin: '0px 0px -60px 0px'
    });

    animatedElements.forEach((el, i) => {
        // Auto stagger for siblings
        if (!el.dataset.delay) {
            const parent = el.parentElement;
            const siblings = [...parent.querySelectorAll('.animate-on-scroll')];
            const siblingIndex = siblings.indexOf(el);
            if (siblingIndex > 0) {
                el.dataset.delay = siblingIndex * 100;
            }
        }
        observer.observe(el);
    });
}

/* ============================================================
   8. INIT RSVP FORM
   ============================================================ */
function initRSVP() {
    const form = document.getElementById('rsvp-form');
    if (!form) return;

    const nameInput = document.getElementById('rsvp-name');
    const messageInput = document.getElementById('rsvp-message');
    const charCount = document.getElementById('char-count');
    const counterMinus = document.getElementById('counter-minus');
    const counterPlus = document.getElementById('counter-plus');
    const guestCountInput = document.getElementById('guest-count');
    const guestCountGroup = document.getElementById('guest-count-group');
    const attendanceInputs = document.querySelectorAll('input[name="attendance"]');

    // Character counter for message
    if (messageInput && charCount) {
        messageInput.addEventListener('input', () => {
            const len = messageInput.value.length;
            charCount.textContent = `${len} / 500`;
            charCount.style.color = len > 450 ? 'var(--error)' : 'var(--text-muted)';
        });
    }

    // Guest counter buttons
    if (counterMinus && counterPlus && guestCountInput) {
        counterMinus.addEventListener('click', () => {
            const current = parseInt(guestCountInput.value);
            if (current > 1) guestCountInput.value = current - 1;
        });

        counterPlus.addEventListener('click', () => {
            const current = parseInt(guestCountInput.value);
            if (current < 10) guestCountInput.value = current + 1;
        });
    }

    // Hide/show guest count based on attendance
    attendanceInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (guestCountGroup) {
                guestCountGroup.style.display = input.value === 'tidak hadir' ? 'none' : '';
            }
        });
    });

    // Form validation
    function validateForm() {
        let isValid = true;

        // Validate name
        const nameError = document.getElementById('error-name');
        if (!nameInput.value.trim()) {
            if (nameError) nameError.textContent = 'Nama tidak boleh kosong.';
            nameInput.style.borderColor = 'var(--error)';
            isValid = false;
        } else {
            if (nameError) nameError.textContent = '';
            nameInput.style.borderColor = '';
        }

        // Validate attendance
        const attendanceError = document.getElementById('error-attendance');
        const selectedAttendance = [...attendanceInputs].find(i => i.checked);
        if (!selectedAttendance) {
            if (attendanceError) attendanceError.textContent = 'Mohon pilih status kehadiran Anda.';
            isValid = false;
        } else {
            if (attendanceError) attendanceError.textContent = '';
        }

        return isValid;
    }

    // Form submit
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        if (!validateForm()) {
            showToast('Mohon lengkapi semua kolom yang wajib diisi.', 'error');
            return;
        }

        const formData = {
            id: Date.now(),
            name: nameInput.value.trim(),
            attendance: [...attendanceInputs].find(i => i.checked)?.value || '-',
            guestCount: parseInt(guestCountInput?.value || 1),
            message: messageInput?.value.trim() || '',
            timestamp: new Date().toLocaleDateString('id-ID', {
                year: 'numeric', month: 'long', day: 'numeric'
            })
        };

        // Simpan data RSVP ke localStorage
        saveRSVP(formData);

        // Tambah ucapan jika ada pesan
        if (formData.message) {
            addWishCard(formData);
        }

        // Notifikasi berhasil
        showToast('🎉 RSVP berhasil dikirim! Terima kasih.', 'success', 4000);

        // Reset form
        form.reset();
        if (charCount) charCount.textContent = '0 / 500';
        if (guestCountInput) guestCountInput.value = 1;
        if (guestCountGroup) guestCountGroup.style.display = '';

        // Gulir ke ucapan tamu
        setTimeout(() => {
            const wishesSection = document.getElementById('wishes');
            if (wishesSection) {
                wishesSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 1000);
    });

    // Load existing RSVPs
    loadExistingWishes();
}

/* ============================================================
   RSVP DATA: localStorage helpers
   (Replace with API calls when backend is ready)
   ============================================================ */

/**
 * Save RSVP data to localStorage
 * @param {Object} data - RSVP form data
 */
function saveRSVP(data) {
    const existing = getRSVPs();
    existing.push(data);
    localStorage.setItem('wedding_rsvp', JSON.stringify(existing));
}

/**
 * Get all RSVP data from localStorage
 * @returns {Array} Array of RSVP objects
 */
function getRSVPs() {
    try {
        return JSON.parse(localStorage.getItem('wedding_rsvp') || '[]');
    } catch {
        return [];
    }
}

/* ============================================================
   9. INIT WISHES DISPLAY
   ============================================================ */
function initWishes() {
    // Wishes are loaded via loadExistingWishes() called from initRSVP
}

/**
 * Render a wish card and prepend to wishes grid
 * @param {Object} data - RSVP / wish data
 */
function addWishCard(data) {
    const container = document.getElementById('wishes-container');
    if (!container || !data.message) return;

    const attendanceText = {
        'hadir': `Hadir · ${data.guestCount} orang`,
        'tidak hadir': 'Tidak Hadir',
        'masih ragu': 'Masih Ragu'
    }[data.attendance] || data.attendance;

    const card = document.createElement('div');
    card.className = 'wish-card';
    card.innerHTML = `
        <div class="wish-quote-icon" aria-hidden="true">❝</div>
        <p class="wish-text">${escapeHtml(data.message)}</p>
        <div class="wish-author">
            <div class="wish-avatar" aria-hidden="true">
                <i class="fa-solid fa-user"></i>
            </div>
            <div class="wish-author-info">
                <span class="wish-author-name">${escapeHtml(data.name)}</span>
                <span class="wish-date">${attendanceText}</span>
            </div>
        </div>
    `;

    // Insert at the beginning (after sample cards)
    const sampleCards = container.querySelectorAll('.wish-card--sample');
    if (sampleCards.length > 0) {
        container.insertBefore(card, sampleCards[0]);
    } else {
        container.insertBefore(card, container.firstChild);
    }
}

/**
 * Load and display existing wishes from localStorage
 */
function loadExistingWishes() {
    const rsvps = getRSVPs();
    rsvps
        .filter(r => r.message)
        .reverse() // Most recent first
        .forEach(r => addWishCard(r));
}

/**
 * Escape HTML entities to prevent XSS
 * @param {string} str
 * @returns {string}
 */
function escapeHtml(str) {
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

/* ============================================================
   10. INIT COPY TO CLIPBOARD
   ============================================================ */
function initCopyToClipboard() {
    invitationData.bankAccounts.forEach(account => {
        const btn = document.getElementById(account.elementId);
        if (!btn) return;

        btn.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(account.accountNumber);
                showToast(`✓ Nomor rekening ${account.bank} berhasil disalin!`, 'success');

                // Umpan balik visual pada tombol
                const btnSpan = btn.querySelector('span');
                const btnIcon = btn.querySelector('i');
                const originalText = btnSpan ? btnSpan.textContent : '';

                if (btnSpan) btnSpan.textContent = 'Tersalin!';
                if (btnIcon) {
                    btnIcon.classList.remove('fa-copy');
                    btnIcon.classList.add('fa-check');
                }
                btn.style.background = 'var(--primary-color)';
                btn.style.color = 'var(--white)';

                setTimeout(() => {
                    if (btnSpan) btnSpan.textContent = originalText;
                    if (btnIcon) {
                        btnIcon.classList.remove('fa-check');
                        btnIcon.classList.add('fa-copy');
                    }
                    btn.style.background = '';
                    btn.style.color = '';
                }, 2000);

            } catch (err) {
                // Fallback untuk browser lama
                const textArea = document.createElement('textarea');
                textArea.value = account.accountNumber;
                textArea.style.position = 'fixed';
                textArea.style.opacity = '0';
                document.body.appendChild(textArea);
                textArea.select();
                document.execCommand('copy');
                document.body.removeChild(textArea);
                showToast(`✓ Nomor rekening ${account.bank} berhasil disalin!`, 'success');
            }
        });
    });
}

/* ============================================================
   11. INIT BACK TO TOP
   ============================================================ */
function initBackToTop() {
    const backToTop = document.getElementById('back-to-top');
    if (!backToTop) return;

    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });
}

/* ============================================================
   12. INIT CALENDAR — Add to Google Calendar / .ics
   ============================================================ */
function initCalendar() {
    const calBtn = document.getElementById('add-calendar-btn');
    if (!calBtn) return;

    calBtn.addEventListener('click', (e) => {
        e.preventDefault();

        const startDate = '20261011T040000Z'; // 12:00 WITA = 04:00 UTC
        const endDate = '20261011T120000Z';   // 20:00 WITA = 12:00 UTC

        const title = encodeURIComponent(`Upacara Rsi Gana & Mepandes`);
        const details = encodeURIComponent(
            `Rsi Gana & Mepandes\n` +
            `11 Oktober 2026\n` +
            `12.00 WITA - 20.00 WITA\n\n` +
            `${invitationData.ceremony.venue}`
        );
        const location = encodeURIComponent(
            `${invitationData.ceremony.venue}, ${invitationData.ceremony.address}`
        );

        const googleCalUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${startDate}/${endDate}&details=${details}&location=${location}`;

        window.open(googleCalUrl, '_blank', 'noopener,noreferrer');
    });
}

/* ============================================================
   13. HERO PARTICLE ANIMATION
   ============================================================ */
function initParticles() {
    const container = document.querySelector('.hero-particles');
    if (!container) return;

    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.cssText = `
            position: absolute;
            width: ${Math.random() * 4 + 2}px;
            height: ${Math.random() * 4 + 2}px;
            border-radius: 50%;
            background: rgba(212, 175, 120, ${Math.random() * 0.4 + 0.1});
            left: ${Math.random() * 100}%;
            top: ${Math.random() * 100}%;
            animation: float-particle ${Math.random() * 8 + 6}s ease-in-out infinite;
            animation-delay: ${Math.random() * 6}s;
        `;
        container.appendChild(particle);
    }

    // Add keyframes if not already added
    if (!document.getElementById('particle-style')) {
        const style = document.createElement('style');
        style.id = 'particle-style';
        style.textContent = `
            @keyframes float-particle {
                0%, 100% { transform: translateY(0) translateX(0); opacity: 0.3; }
                25% { transform: translateY(-20px) translateX(10px); opacity: 0.8; }
                50% { transform: translateY(-35px) translateX(-5px); opacity: 0.5; }
                75% { transform: translateY(-15px) translateX(-15px); opacity: 0.7; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ============================================================
   14. RIPPLE EFFECT ON BUTTONS
   ============================================================ */
function initRippleEffect() {
    const buttons = document.querySelectorAll('.btn-submit, .btn-maps, .btn-open-invitation, .btn-copy');

    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            const ripple = document.createElement('span');
            ripple.style.cssText = `
                position: absolute;
                width: 0;
                height: 0;
                left: ${x}px;
                top: ${y}px;
                transform: translate(-50%, -50%);
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.25);
                animation: ripple-effect 0.6s ease-out forwards;
                pointer-events: none;
                z-index: 0;
            `;

            // Ensure button has position relative
            if (!['relative', 'absolute', 'fixed'].includes(getComputedStyle(btn).position)) {
                btn.style.position = 'relative';
            }
            btn.style.overflow = 'hidden';
            btn.appendChild(ripple);
            ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
        });
    });

    // Add ripple keyframes
    if (!document.getElementById('ripple-style')) {
        const style = document.createElement('style');
        style.id = 'ripple-style';
        style.textContent = `
            @keyframes ripple-effect {
                to { width: 300px; height: 300px; opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
}

/* ============================================================
   15. LAZY LOAD GALLERY IMAGES WITH GRADIENT PLACEHOLDER
   ============================================================ */
function initLazyLoad() {
    const galleryImages = document.querySelectorAll('.gallery-item img');
    const gradients = [
        'linear-gradient(135deg, #F4E8D0, #DFC89A)',
        'linear-gradient(135deg, #E8D4B0, #C9A96E)',
        'linear-gradient(135deg, #FAF7F2, #F0E4CC)',
        'linear-gradient(135deg, #EDD9B5, #D4AF78)',
        'linear-gradient(135deg, #F9F1E4, #E8C98A)',
        'linear-gradient(135deg, #DFC89A, #BF9857)',
        'linear-gradient(135deg, #F4E8D0, #C9A96E)',
        'linear-gradient(135deg, #FAF7F2, #EDD9B5)',
    ];

    galleryImages.forEach((img, i) => {
        const parent = img.parentElement;

        // Apply gradient background while loading
        parent.style.background = gradients[i % gradients.length];

        // Add gallery icon overlay as placeholder
        const placeholder = document.createElement('div');
        placeholder.setAttribute('aria-hidden', 'true');
        placeholder.style.cssText = `
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            color: rgba(139, 111, 71, 0.3);
            pointer-events: none;
            transition: opacity 0.3s ease;
        `;
        placeholder.innerHTML = '<i class="fa-solid fa-camera"></i>';
        parent.style.position = 'relative';
        parent.appendChild(placeholder);

        img.addEventListener('load', () => {
            placeholder.style.opacity = '0';
            setTimeout(() => placeholder.remove(), 300);
        });

        img.addEventListener('error', () => {
            // Keep placeholder visible if image fails
            img.style.display = 'none';
        });
    });
}

/* ============================================================
   16. DYNAMIC URL PARAMS
   ============================================================ */
function initUrlParams() {
    const urlParams = new URLSearchParams(window.location.search);

    // 1. Parse Guest Name (?to=Nama)
    const guestParam = urlParams.get('to');
    if (guestParam) {
        const guestNameEl = document.getElementById('guest-name');
        const guestGreetingEl = document.getElementById('guest-greeting');
        if (guestNameEl && guestGreetingEl) {
            const sanitizedName = guestParam.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            guestNameEl.textContent = sanitizedName;
            guestGreetingEl.style.display = 'block';
        }
    }

    // 2. Parse Time (?time=13:00 or 1pm)
    const timeParam = urlParams.get('time');
    if (timeParam) {
        const timeLower = timeParam.toLowerCase().replace(/\s/g, '');
        let hours = 9;
        let mins = 0;

        const timeMatch = timeLower.match(/^(\d{1,2})(?::(\d{2}))?(am|pm)?/);
        if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            mins = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
            const isPM = timeMatch[3] === 'pm';
            const isAM = timeMatch[3] === 'am';

            if (isPM && hours < 12) hours += 12;
            if (isAM && hours === 12) hours = 0;

            const eventTime = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:00`;
            invitationData.wedding.time = eventTime;

            const heroTimeEl = document.getElementById('hero-time');
            if (heroTimeEl) {
                heroTimeEl.textContent = `${String(hours).padStart(2, '0')}.${String(mins).padStart(2, '0')} WITA`;
            }
        }
    } else {
        invitationData.wedding.time = '09:00:00';
    }
}

/* ============================================================
   ENTRY POINT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all modules
    initUrlParams();
    initLoading();
    initOpeningScreen();
    initCountdown();
    initMusicPlayer();
    initGallery();
    initNavigation();
    initScrollAnimation();
    initRSVP();
    initWishes();
    initCopyToClipboard();
    initBackToTop();
    initCalendar();
    initParticles();
    initRippleEffect();
    initLazyLoad();

    console.info(
        '%c🕉️ Undangan Upacara %c Rsi Gana & Mepandes ',
        'background: #8B6F47; color: #FAF7F2; padding: 4px 8px; border-radius: 4px 0 0 4px; font-weight: bold;',
        'background: #D4AF78; color: #2C2416; padding: 4px 8px; border-radius: 0 4px 4px 0;'
    );
});
