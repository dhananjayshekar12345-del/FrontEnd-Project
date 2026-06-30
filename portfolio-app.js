document.addEventListener('DOMContentLoaded', () => {
  // ── CUSTOM CURSOR ──
  const cursor = document.getElementById('customCursor');
  const cursorRing = document.getElementById('customCursorRing');
  
  if (cursor && cursorRing) {
    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    
    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
    });
    
    // Smooth trailing effect for cursor ring
    const renderRing = () => {
      const ease = 0.15;
      ringX += (mouseX - ringX) * ease;
      ringY += (mouseY - ringY) * ease;
      
      cursorRing.style.transform = `translate(${ringX}px, ${ringY}px) translate(-50%, -50%)`;
      requestAnimationFrame(renderRing);
    };
    renderRing();
    
    // Grow cursor on click/hover clickable items
    const clickables = document.querySelectorAll('a, button, input, textarea, .clickable');
    clickables.forEach(item => {
      item.addEventListener('mouseenter', () => {
        cursor.style.width = '20px';
        cursor.style.height = '20px';
        cursorRing.style.width = '48px';
        cursorRing.style.height = '48px';
        cursorRing.style.borderColor = 'var(--accent2)';
      });
      item.addEventListener('mouseleave', () => {
        cursor.style.width = '10px';
        cursor.style.height = '10px';
        cursorRing.style.width = '32px';
        cursorRing.style.height = '32px';
        cursorRing.style.borderColor = 'var(--accent)';
      });
    });
  }

  // ── THEME TOGGLE ──
  const themeToggleBtn = document.getElementById('themeToggle');
  const themeIcon = document.getElementById('themeIcon');
  
  // Check local storage for preference
  const currentTheme = localStorage.getItem('theme');
  if (currentTheme === 'light') {
    document.body.classList.add('light-theme');
    themeIcon.classList.replace('fa-moon', 'fa-sun');
  }
  
  themeToggleBtn.addEventListener('click', () => {
    document.body.classList.toggle('light-theme');
    const isLight = document.body.classList.contains('light-theme');
    
    if (isLight) {
      themeIcon.classList.replace('fa-moon', 'fa-sun');
      localStorage.setItem('theme', 'light');
    } else {
      themeIcon.classList.replace('fa-sun', 'fa-moon');
      localStorage.setItem('theme', 'dark');
    }
  });

  // ── MOBILE MENU TOGGLE ──
  const mobileNavToggle = document.getElementById('mobileNavToggle');
  const navMenu = document.getElementById('navMenu');
  
  mobileNavToggle.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    const icon = mobileNavToggle.querySelector('i');
    if (navMenu.classList.contains('active')) {
      icon.classList.replace('fa-bars', 'fa-xmark');
    } else {
      icon.classList.replace('fa-xmark', 'fa-bars');
    }
  });

  // Close mobile menu when links are clicked
  document.querySelectorAll('#navMenu a').forEach(link => {
    link.addEventListener('click', () => {
      navMenu.classList.remove('active');
      const icon = mobileNavToggle.querySelector('i');
      icon.classList.replace('fa-xmark', 'fa-bars');
    });
  });

  // ── STATS COUNTER ANIMATION ──
  const stats = document.querySelectorAll('.stat-number');
  
  const startCounterAnimation = (element) => {
    const target = parseFloat(element.getAttribute('data-target'));
    const decimals = parseInt(element.getAttribute('data-decimals') || '0');
    const noPlus = element.getAttribute('data-no-plus') === 'true';
    const suffix = noPlus ? '' : '+';
    const duration = 2000; // ms
    const startTime = performance.now();
    
    const updateCounter = (currentTime) => {
      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);
      
      // Easing out quadratic
      const easeProgress = progress * (2 - progress);
      const currentValue = easeProgress * target;
      
      if (decimals > 0) {
        element.textContent = currentValue.toFixed(decimals);
      } else {
        element.textContent = Math.floor(currentValue) + suffix;
      }
      
      if (progress < 1) {
        requestAnimationFrame(updateCounter);
      } else {
        if (decimals > 0) {
          element.textContent = target.toFixed(decimals);
        } else {
          element.textContent = target + suffix;
        }
      }
    };
    
    requestAnimationFrame(updateCounter);
  };

  const observerOptions = {
    threshold: 0.5,
    triggerOnce: true
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        startCounterAnimation(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  stats.forEach(stat => statsObserver.observe(stat));

  // ── SCROLL SPY (ACTIVE LINK HIGHLIGHTING) ──
  const sections = document.querySelectorAll('section');
  const navLinks = document.querySelectorAll('#navMenu a');
  
  window.addEventListener('scroll', () => {
    let current = '';
    const scrollPos = window.pageYOffset || document.documentElement.scrollTop;
    
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
        current = section.getAttribute('id');
      }
    });
    
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${current}`) {
        link.classList.add('active');
      }
    });
  });

  // ── CONTACT FORM SUBMISSION ──
  const contactForm = document.getElementById('contactForm');
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toastMsg');
  
  const showToast = (message) => {
    toastMsg.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
      toast.classList.remove('show');
    }, 4000);
  };
  
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate API request submission
    const submitBtn = contactForm.querySelector('.submit-btn');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
    submitBtn.disabled = true;
    
    setTimeout(() => {
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      showToast('Thank you! Your message was sent successfully.');
      contactForm.reset();
    }, 1500);
  });
});
