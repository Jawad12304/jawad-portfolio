/* ==========================================================================
   J.Pixels — site behaviour
   Gallery data lives in assets/js/gallery-data.js (generated).
   ========================================================================== */
(function () {
    'use strict';

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    var galleries = window.GALLERY_DATA || {};

    /* ----------------------------------------------------------------------
       Mobile navigation
       ---------------------------------------------------------------------- */
    var menuBtn = document.getElementById('menu-btn');
    var mobileMenu = document.getElementById('mobile-menu');

    function setMenu(open) {
        if (!menuBtn || !mobileMenu) return;
        mobileMenu.hidden = !open;
        menuBtn.setAttribute('aria-expanded', String(open));
        menuBtn.setAttribute('aria-label', open ? 'Close navigation menu' : 'Open navigation menu');
        var icon = menuBtn.querySelector('i');
        if (icon) {
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        }
    }

    if (menuBtn && mobileMenu) {
        menuBtn.addEventListener('click', function () {
            setMenu(mobileMenu.hidden);
        });

        mobileMenu.querySelectorAll('a').forEach(function (link) {
            link.addEventListener('click', function () { setMenu(false); });
        });

        // Collapse the menu if the viewport grows past the mobile breakpoint,
        // otherwise it stays stuck open behind the desktop nav.
        window.matchMedia('(min-width: 768px)').addEventListener('change', function (e) {
            if (e.matches) setMenu(false);
        });
    }

    /* ----------------------------------------------------------------------
       Focus management shared by both dialogs
       ---------------------------------------------------------------------- */
    var FOCUSABLE = 'a[href], button:not([disabled]), input, textarea, [tabindex]:not([tabindex="-1"])';
    var lastFocused = null;

    function trapFocus(container, event) {
        // getClientRects() rather than offsetParent: both dialogs are
        // position:fixed, where offsetParent is unreliable.
        var items = Array.prototype.filter.call(
            container.querySelectorAll(FOCUSABLE),
            function (el) { return el.getClientRects().length > 0; }
        );
        if (!items.length) return;
        var first = items[0];
        var last = items[items.length - 1];
        if (event.shiftKey && document.activeElement === first) {
            event.preventDefault();
            last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
            event.preventDefault();
            first.focus();
        }
    }

    function lockScroll(locked) {
        document.body.style.overflow = locked ? 'hidden' : '';
    }

    /* ----------------------------------------------------------------------
       Gallery modal
       ---------------------------------------------------------------------- */
    var modal = document.getElementById('gallery-modal');
    var modalTitle = document.getElementById('gallery-title');
    var modalGrid = document.getElementById('gallery-grid');
    var modalEmpty = document.getElementById('gallery-empty');
    var modalScroll = document.getElementById('gallery-scroll');
    var closeModalBtn = document.getElementById('close-gallery');
    var currentItems = [];

    function openGallery(key) {
        var data = galleries[key];
        if (!data || !modal) return;

        lastFocused = document.activeElement;
        currentItems = data.items || [];
        modalTitle.textContent = data.title;
        modalGrid.textContent = '';

        var hasItems = currentItems.length > 0;
        modalGrid.hidden = !hasItems;
        modalEmpty.hidden = hasItems;

        currentItems.forEach(function (item, index) {
            // A button, not a div: the lightbox must be reachable by keyboard.
            var btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'masonry-item';
            btn.setAttribute('aria-label', 'View larger: ' + item.alt);

            var img = document.createElement('img');
            img.src = item.thumb;
            img.alt = item.alt;
            img.width = item.w;
            img.height = item.h;
            // The first row is likely above the fold once the modal opens.
            img.loading = index < 4 ? 'eager' : 'lazy';
            img.decoding = 'async';

            btn.appendChild(img);
            btn.addEventListener('click', function () { openLightbox(index); });
            modalGrid.appendChild(btn);
        });

        if (modalScroll) modalScroll.scrollTop = 0;
        modal.classList.add('is-open');
        modal.removeAttribute('aria-hidden');
        lockScroll(true);
        if (closeModalBtn) closeModalBtn.focus();
    }

    function closeGallery() {
        if (!modal) return;
        modal.classList.remove('is-open');
        modal.setAttribute('aria-hidden', 'true');
        lockScroll(false);
        if (lastFocused) lastFocused.focus();
    }

    document.querySelectorAll('.category-card').forEach(function (card) {
        card.addEventListener('click', function () {
            if (card.getAttribute('aria-disabled') === 'true') return;
            openGallery(card.dataset.gallery);
        });
    });

    if (closeModalBtn) closeModalBtn.addEventListener('click', closeGallery);
    if (modal) {
        modal.addEventListener('click', function (e) {
            if (e.target === modal) closeGallery();
        });
    }

    /* ----------------------------------------------------------------------
       Lightbox
       ---------------------------------------------------------------------- */
    var lightbox = document.getElementById('lightbox');
    var lightboxImg = document.getElementById('lightbox-img');
    var lightboxCounter = document.getElementById('lightbox-counter');
    var lightboxClose = document.getElementById('lightbox-close');
    var lightboxPrev = document.getElementById('lightbox-prev');
    var lightboxNext = document.getElementById('lightbox-next');
    var lightboxIndex = 0;

    function showSlide(index) {
        if (!currentItems.length || !lightboxImg) return;
        lightboxIndex = (index + currentItems.length) % currentItems.length;
        var item = currentItems[lightboxIndex];
        lightboxImg.src = item.full;
        lightboxImg.alt = item.alt;
        if (lightboxCounter) {
            lightboxCounter.textContent = (lightboxIndex + 1) + ' of ' + currentItems.length;
        }
    }

    function openLightbox(index) {
        if (!lightbox) return;
        showSlide(index);
        lightbox.classList.add('is-open');
        lightbox.removeAttribute('aria-hidden');
        if (lightboxClose) lightboxClose.focus();
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.remove('is-open');
        lightbox.setAttribute('aria-hidden', 'true');
        // Hand focus back to the grid, not the page — the gallery is still open.
        if (closeModalBtn) closeModalBtn.focus();
    }

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxPrev) lightboxPrev.addEventListener('click', function () { showSlide(lightboxIndex - 1); });
    if (lightboxNext) lightboxNext.addEventListener('click', function () { showSlide(lightboxIndex + 1); });
    if (lightbox) {
        lightbox.addEventListener('click', function (e) {
            if (e.target === lightbox) closeLightbox();
        });
    }

    document.addEventListener('keydown', function (e) {
        var lightboxOpen = lightbox && lightbox.classList.contains('is-open');
        var galleryOpen = modal && modal.classList.contains('is-open');

        if (e.key === 'Escape') {
            if (lightboxOpen) closeLightbox();
            else if (galleryOpen) closeGallery();
            return;
        }

        if (lightboxOpen) {
            if (e.key === 'ArrowLeft') showSlide(lightboxIndex - 1);
            if (e.key === 'ArrowRight') showSlide(lightboxIndex + 1);
            if (e.key === 'Tab') trapFocus(lightbox, e);
        } else if (galleryOpen && e.key === 'Tab') {
            trapFocus(modal, e);
        }
    });

    /* ----------------------------------------------------------------------
       Contact form -> WhatsApp
       ---------------------------------------------------------------------- */
    var form = document.getElementById('contact-form');
    if (form) {
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            var value = function (id) {
                var el = document.getElementById(id);
                return el ? el.value.trim() : '';
            };
            // Every field is encoded. The previous version concatenated raw input
            // with a literal %0A, so any &, # or + broke or truncated the message.
            var lines = [
                'Name: ' + (value('contact-name') || 'Not provided'),
                'Email: ' + (value('contact-email') || 'Not provided'),
                '',
                value('contact-message')
            ].join('\n');
            window.open(
                'https://wa.me/923400178565?text=' + encodeURIComponent(lines),
                '_blank',
                'noopener'
            );
        });
    }

    /* ----------------------------------------------------------------------
       Scroll reveal
       ---------------------------------------------------------------------- */
    var revealTargets = document.querySelectorAll('.reveal');
    if ('IntersectionObserver' in window && !prefersReducedMotion.matches) {
        var observer = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
        revealTargets.forEach(function (el) { observer.observe(el); });
    } else {
        // No observer support, or motion is unwelcome: show everything at once.
        revealTargets.forEach(function (el) { el.classList.add('is-visible'); });
    }

    /* ----------------------------------------------------------------------
       Ambient particle canvas
       Desktop only, paused when the tab is hidden, off entirely under
       prefers-reduced-motion. It is decoration, so it never blocks anything.
       ---------------------------------------------------------------------- */
    var canvas = document.getElementById('tech-canvas');
    var ctx = canvas ? canvas.getContext('2d') : null;
    var particles = [];
    var frame = null;
    var pointer = { x: null, y: null };

    var canAnimate = function () {
        return ctx && !prefersReducedMotion.matches && window.innerWidth >= 1024;
    };

    function seed() {
        particles = [];
        // Capped low: the connection pass is O(n^2) per frame.
        var count = Math.min(Math.floor((window.innerWidth * window.innerHeight) / 26000), 70);
        for (var i = 0; i < count; i++) {
            particles.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.4 + 0.5,
                vx: (Math.random() - 0.5) * 0.34,
                vy: (Math.random() - 0.5) * 0.34
            });
        }
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.x += p.vx;
            p.y += p.vy;

            if (pointer.x !== null) {
                var mx = pointer.x - p.x;
                var my = pointer.y - p.y;
                var d = Math.sqrt(mx * mx + my * my);
                if (d < 150 && d > 0) {
                    var force = (150 - d) / 150 * 1.5;
                    p.x -= (mx / d) * force;
                    p.y -= (my / d) * force;
                }
            }

            if (p.x < 0) p.x = canvas.width;
            if (p.x > canvas.width) p.x = 0;
            if (p.y < 0) p.y = canvas.height;
            if (p.y > canvas.height) p.y = 0;

            ctx.fillStyle = 'rgba(34, 211, 238, 0.4)';
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
        }

        for (var a = 0; a < particles.length; a++) {
            for (var b = a + 1; b < particles.length; b++) {
                var dx = particles[a].x - particles[b].x;
                var dy = particles[a].y - particles[b].y;
                var dist = dx * dx + dy * dy;
                if (dist < 20000) {
                    ctx.strokeStyle = 'rgba(245, 158, 11, ' + (1 - dist / 20000) * 0.13 + ')';
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[a].x, particles[a].y);
                    ctx.lineTo(particles[b].x, particles[b].y);
                    ctx.stroke();
                }
            }
        }

        frame = requestAnimationFrame(draw);
    }

    function stop() {
        if (frame !== null) {
            cancelAnimationFrame(frame);
            frame = null;
        }
        if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    }

    function start() {
        if (!canAnimate()) {
            stop();
            if (canvas) canvas.hidden = true;
            return;
        }
        canvas.hidden = false;
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        seed();
        if (frame === null) frame = requestAnimationFrame(draw);
    }

    if (ctx) {
        var resizeTimer;
        window.addEventListener('resize', function () {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(function () { stop(); start(); }, 200);
        });
        window.addEventListener('mousemove', function (e) {
            pointer.x = e.clientX;
            pointer.y = e.clientY;
        });
        window.addEventListener('mouseout', function () {
            pointer.x = null;
            pointer.y = null;
        });
        // Stop burning CPU and battery while the tab is in the background.
        document.addEventListener('visibilitychange', function () {
            if (document.hidden) stop();
            else start();
        });
        prefersReducedMotion.addEventListener('change', function () { stop(); start(); });
        start();
    }

    /* ----------------------------------------------------------------------
       Small conveniences
       ---------------------------------------------------------------------- */
    var year = document.getElementById('current-year');
    if (year) year.textContent = String(new Date().getFullYear());

    // Label each portfolio card with how many pieces it holds.
    document.querySelectorAll('[data-gallery-count]').forEach(function (el) {
        var data = galleries[el.dataset.galleryCount];
        var n = data && data.items ? data.items.length : 0;
        el.textContent = n ? n + (n === 1 ? ' piece' : ' pieces') : 'Coming soon';
    });
})();
