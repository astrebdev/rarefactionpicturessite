document.addEventListener('DOMContentLoaded', () => {

  // ---------- Mobile nav toggle ----------
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      toggle.textContent = nav.classList.contains('open') ? '✕' : '☰';
    });
    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        toggle.textContent = '☰';
      });
    });
  }

  // ---------- Header fades to solid on scroll ----------
  const header = document.querySelector('.site-header');
  if (header) {
    const updateHeader = () => header.classList.toggle('scrolled', window.scrollY > 40);
    window.addEventListener('scroll', updateHeader);
    updateHeader();
  }

  // ---------- Contact form: submit via fetch, no redirect ----------
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const status = document.getElementById('contactFormStatus');
      fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      }).then(res => {
        if (res.ok) {
          status.textContent = 'Message sent — thanks!';
          contactForm.reset();
        } else {
          status.textContent = 'Something went wrong. Try again or email us directly.';
        }
      }).catch(() => {
        status.textContent = 'Something went wrong. Try again or email us directly.';
      });
    });
  }

  // ---------- Movie structured data, built from films-data.js ----------
  if (typeof FILMS !== 'undefined') {
    const splitNames = (str) => (str || '')
      .split(',').map(s => s.trim()).filter(Boolean)
      .map(name => ({ "@type": "Person", "name": name }));

    const graph = Object.values(FILMS).map(f => {
      const directors = splitNames(f.director);
      const actors = splitNames(Array.isArray(f.starring) ? f.starring.join(', ') : f.starring);
      const awardsList = Array.isArray(f.awards) ? f.awards : (f.awards ? [f.awards] : []);

      const movie = {
        "@type": "Movie",
        "name": f.title,
        "datePublished": f.year,
        "productionCompany": { "@type": "Organization", "name": "Rarefaction Pictures" }
      };
      if (directors.length === 1) movie.director = directors[0];
      else if (directors.length > 1) movie.director = directors;
      if (actors.length) movie.actor = actors;
      if (awardsList.length === 1) movie.award = awardsList[0];
      else if (awardsList.length > 1) movie.award = awardsList;
      return movie;
    });

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify({ "@context": "https://schema.org", "@graph": graph });
    document.head.appendChild(script);
  }

  // ---------- Footer year ----------
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // ---------- Work With Us button: matches the page's current color mode ----------
  const wwuBtn = document.querySelector('.hero-wwu-btn');
  if (wwuBtn) {
    const theme = document.documentElement.getAttribute('data-theme');
    const accentByTheme = { blue: 'var(--blue)', orange: 'var(--orange)', red: 'var(--red)' };
    const glowRgbByTheme = { blue: '111,163,199', orange: '232,168,87', red: '225,92,86' };
    wwuBtn.style.background = accentByTheme[theme] || 'var(--orange)';
    const glowRgb = glowRgbByTheme[theme] || glowRgbByTheme.orange;
    wwuBtn.style.boxShadow = `0 0 26px rgba(${glowRgb}, 0.55), 0 0 54px rgba(${glowRgb}, 0.28)`;
  }

  // ================================================================
  // FILM MODAL — shared by every data-film work-card
  // ================================================================
  const backdrop = document.getElementById('filmModalBackdrop');
  const modalTitle = document.getElementById('filmModalTitle');
  const modalMeta = document.getElementById('filmModalMeta');
  const modalFacts = document.getElementById('filmModalFacts');
  const modalAwards = document.getElementById('filmModalAwards');
  const modalVideo = document.getElementById('filmModalVideoEl');
  const modalVideoPlaceholder = document.getElementById('filmModalVideoPlaceholder');
  const modalClose = document.getElementById('filmModalClose');

  function openFilmModal(filmKey) {
    if (typeof FILMS === 'undefined' || !FILMS[filmKey] || !backdrop) return;
    const f = FILMS[filmKey];

    modalTitle.textContent = f.title || '';
    modalMeta.textContent = [f.type, f.year, f.runtime].filter(Boolean).join(' · ');

    // Video vs. placeholder
    if (f.trailerSrc) {
      modalVideo.src = f.trailerSrc;
      if (f.poster) modalVideo.poster = f.poster;
      modalVideo.style.display = 'block';
      modalVideoPlaceholder.style.display = 'none';
      modalVideo.play().catch(() => {}); // if the browser still blocks it, controls let them hit play manually
    } else {
      modalVideo.removeAttribute('src');
      modalVideo.removeAttribute('poster');
      modalVideo.style.display = 'none';
      modalVideoPlaceholder.style.display = 'flex';
    }

    // Facts list — only render fields that have content
    modalFacts.innerHTML = '';
    const factRows = [
      ['Director', f.director],
      ['Producer', f.producer],
      ['Cinematographer', f.dp],
      ['Starring', Array.isArray(f.starring) ? f.starring.join(', ') : f.starring]
    ];
    factRows.forEach(([label, value]) => {
      if (value) {
        const dt = document.createElement('dt');
        dt.textContent = label;
        const dd = document.createElement('dd');
        dd.textContent = value;
        modalFacts.appendChild(dt);
        modalFacts.appendChild(dd);
      }
    });

    // Licensing
    if (f.licensing) {
      const dt = document.createElement('dt');
      dt.textContent = 'Licensing';
      const dd = document.createElement('dd');
      dd.textContent = f.licensing;
      modalFacts.appendChild(dt);
      modalFacts.appendChild(dd);
    }

    // Where to Watch — accepts a plain string, an array of strings, or an
    // array of { label, url } objects (url is optional, makes it a link).
    // A single { label, url } object also works.
    if (f.whereToWatch) {
      const raw = Array.isArray(f.whereToWatch) ? f.whereToWatch : [f.whereToWatch];
      const dt = document.createElement('dt');
      dt.textContent = 'Where to Watch';
      const dd = document.createElement('dd');
      raw.forEach((item, i) => {
        if (i > 0) dd.appendChild(document.createTextNode(', '));
        if (typeof item === 'string') {
          dd.appendChild(document.createTextNode(item));
        } else if (item && item.url) {
          const a = document.createElement('a');
          a.href = item.url;
          a.target = '_blank';
          a.rel = 'noopener';
          a.textContent = item.label || item.url;
          dd.appendChild(a);
        } else if (item && item.label) {
          dd.appendChild(document.createTextNode(item.label));
        }
      });
      modalFacts.appendChild(dt);
      modalFacts.appendChild(dd);
    }

    // Awards — accepts either a string or an array in films-data.js
    modalAwards.innerHTML = '';
    const awardsList = Array.isArray(f.awards) ? f.awards : (f.awards ? [f.awards] : []);
    if (awardsList.length) {
      const h = document.createElement('h4');
      h.className = 'film-modal-awards-label';
      h.textContent = 'Awards';
      modalAwards.appendChild(h);
      const ul = document.createElement('ul');
      awardsList.forEach(a => {
        const li = document.createElement('li');
        li.textContent = a;
        ul.appendChild(li);
      });
      modalAwards.appendChild(ul);
    }

    backdrop.classList.add('open');
    document.body.style.overflow = 'hidden';
    modalClose.focus();
  }

  function closeFilmModal() {
    if (!backdrop) return;
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    modalVideo.pause();
    modalVideo.removeAttribute('src');
    modalVideo.load();
  }

  if (backdrop) {
    modalClose.addEventListener('click', closeFilmModal);
    backdrop.addEventListener('click', (e) => {
      if (e.target === backdrop) closeFilmModal();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && backdrop.classList.contains('open')) closeFilmModal();
    });
  }

  // ---------- Work card click/keyboard handling ----------
  document.querySelectorAll('.work-card[data-film], .work-card[data-youtube]').forEach(card => {
    const activate = () => {
      if (card.dataset.film) {
        openFilmModal(card.dataset.film);
      } else if (card.dataset.youtube) {
        window.open(card.dataset.youtube, '_blank', 'noopener');
      }
    };
    card.style.cursor = 'pointer';
    card.addEventListener('click', activate);
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        activate();
      }
    });
  });

  // ================================================================
  // CINEMATOGRAPHY CAROUSEL (only runs if the markup exists on the page)
  // ================================================================
  const track = document.querySelector('.cine-track');
  const slides = document.querySelectorAll('.cine-slide');
  const prevBtn = document.querySelector('.cine-arrow--prev');
  const nextBtn = document.querySelector('.cine-arrow--next');
  const dotsWrap = document.querySelector('.cine-dots');

  if (track && slides.length) {
    let index = 0;
    const captionEl = document.querySelector('.editorial-split-text p');

    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'cine-dot';
      dot.setAttribute('aria-label', 'Go to slide ' + (i + 1));
      dot.addEventListener('click', () => goTo(i));
      dotsWrap.appendChild(dot);
    });
    const dots = dotsWrap.querySelectorAll('.cine-dot');

    function applyCaption() {
      if (!captionEl) return;
      const newText = slides[index].dataset.caption || '';
      captionEl.classList.add('fading');
      setTimeout(() => {
        captionEl.textContent = newText;
        captionEl.classList.remove('fading');
      }, 300);
    }

    function render() {
      slides.forEach((s, i) => s.classList.toggle('active', i === index));
      dots.forEach((d, i) => d.classList.toggle('active', i === index));
    }
    function goTo(i) {
      index = (i + slides.length) % slides.length;
      render();
      applyCaption();
    }

    prevBtn.addEventListener('click', () => goTo(index - 1));
    nextBtn.addEventListener('click', () => goTo(index + 1));
    render();
    if (captionEl) captionEl.textContent = slides[index].dataset.caption || '';
  }

  // ================================================================
  // REEL PLAYER — shows placeholder until a real <source> is added
  // ================================================================
  const reelVideo = document.querySelector('.reel-video');
  const reelPlaceholder = document.getElementById('reelPlaceholderLabel');
  const reelMuteBtn = document.querySelector('.reel-mute-toggle');

  if (reelVideo) {
    const hasSource = reelVideo.querySelector('source[src]:not([src=""])');
    if (hasSource) {
      if (reelPlaceholder) reelPlaceholder.style.display = 'none';
      reelVideo.style.display = 'block';
    } else {
      if (reelPlaceholder) reelPlaceholder.style.display = 'flex';
      reelVideo.style.display = 'none';
    }
  }

  if (reelMuteBtn && reelVideo) {
    reelMuteBtn.addEventListener('click', () => {
      reelVideo.muted = !reelVideo.muted;
      reelMuteBtn.textContent = reelVideo.muted ? '🔇' : '🔊';
    });
  }

  // ================================================================
  // ABOUT PAGE: team members drive the site's color mode + saturation.
  // Desktop (real hover): mouseenter/mouseleave per member.
  // Touch/no-hover: whichever card is closest to viewport center wins,
  // recalculated on scroll.
  // ================================================================
  const teamMembers = document.querySelectorAll('.team-member[data-member-theme]');
  if (teamMembers.length) {
    const supportsHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    function setActiveMember(member) {
      teamMembers.forEach(m => m.classList.toggle('active-member', m === member));
      if (member) {
        document.documentElement.setAttribute('data-theme', member.dataset.memberTheme);
      }
      // On mouse-leave (member === null), the color mode is intentionally
      // left as-is — it stays on whichever person was last hovered.
    }

    if (supportsHover) {
      teamMembers.forEach(member => {
        member.addEventListener('mouseenter', () => setActiveMember(member));
        member.addEventListener('mouseleave', () => setActiveMember(null));
      });
    } else {
      let ticking = false;
      function updateClosestToCenter() {
        const viewportCenter = window.innerHeight / 2;
        let closest = null;
        let closestDist = Infinity;
        teamMembers.forEach(member => {
          const rect = member.getBoundingClientRect();
          const memberCenter = rect.top + rect.height / 2;
          const dist = Math.abs(memberCenter - viewportCenter);
          if (dist < closestDist) {
            closestDist = dist;
            closest = member;
          }
        });
        setActiveMember(closest);
        ticking = false;
      }
      window.addEventListener('scroll', () => {
        if (!ticking) {
          requestAnimationFrame(updateClosestToCenter);
          ticking = true;
        }
      });
      updateClosestToCenter();
    }
  }

});
