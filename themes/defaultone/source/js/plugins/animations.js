export function initAnimations() {
  // Prevent multiple initializations
  if (window.animationsInitialized) {
    return;
  }
  window.animationsInitialized = true;

  // Smooth scroll animations for elements as they come into view
  const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('animate-in')) {
        entry.target.classList.add('animate-in');
      }
    });
  }, observerOptions);

  // Observe elements for animation (exclude masonry, links, and archive items which have their own animation)
  const animatedElements = document.querySelectorAll('.animate-on-scroll, .post-card');
  animatedElements.forEach(el => {
    if (el) observer.observe(el);
  });

  // Add animations to archive items
  const archiveItems = document.querySelectorAll('.archive-item, .article-item');
  archiveItems.forEach((item, index) => {
    // Initial fade-in animation
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
      }, 100);
    }, index * 100);
  });

  // Add hover effects and animations to links cards
  const linkCards = document.querySelectorAll('.links-card');
  linkCards.forEach((card, index) => {
    // Initial fade-in animation
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      }, 100);
    }, index * 150);
    
    // Hover effects
    card.addEventListener('mouseenter', function() {
      this.style.transform = 'translateY(-5px) scale(1.02)';
      this.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
    });
    
    card.addEventListener('mouseleave', function() {
      this.style.transform = 'translateY(0) scale(1)';
    });
  });

  // Add ripple effect to buttons
  const buttons = document.querySelectorAll('.btn, .nav-link');
  buttons.forEach(button => {
    if (button) {
      button.style.position = 'relative';
      button.style.overflow = 'hidden';
      button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.5)';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple-animation 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        this.appendChild(ripple);
        
        setTimeout(() => {
          if (ripple.parentNode) {
            ripple.remove();
          }
        }, 600);
      });
    }
  });

  // Parallax effect for hero section
  const heroSection = document.querySelector('#hero, .page-header');
  if (heroSection) {
    let ticking = false;
    const updateParallax = () => {
      const scrolled = window.pageYOffset;
      const parallax = heroSection.querySelector('.hero-content, .page-title');
      if (parallax) {
        const speed = 0.5;
        parallax.style.transform = `translateY(${scrolled * speed}px)`;
      }
      ticking = false;
    };
    
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateParallax);
        ticking = true;
      }
    });
  }

  // Typing animation for hero subtitle
  const subtitle = document.querySelector('.hero-subtitle, .site-subtitle');
  if (subtitle && !subtitle.classList.contains('typed') && subtitle.textContent) {
    const text = subtitle.textContent.trim();
    if (text) {
      subtitle.textContent = '';
      subtitle.classList.add('typed');
      
      let i = 0;
      const typeWriter = setInterval(() => {
        if (i < text.length) {
          subtitle.textContent += text.charAt(i);
          i++;
        } else {
          clearInterval(typeWriter);
        }
      }, 50);
    }
  }

  // Floating animation for masonry items (only after they're loaded)
  const masonryItems = document.querySelectorAll('.masonry-item');
  masonryItems.forEach((item, index) => {
    // Add fade-in animation after masonry is loaded
    setTimeout(() => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(20px)';
      item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
      
      setTimeout(() => {
        item.style.opacity = '1';
        item.style.transform = 'translateY(0)';
        item.classList.add('float-animation');
        item.style.animationDelay = `${index * 0.1}s`;
      }, 100);
    }, index * 100);
  });

  // Add glow effect on focus for input fields
  const inputs = document.querySelectorAll('input, textarea');
  inputs.forEach(input => {
    input.addEventListener('focus', function() {
      this.classList.add('input-glow');
    });
    
    input.addEventListener('blur', function() {
      this.classList.remove('input-glow');
    });
  });
}

// Initialize animations when DOM is ready
document.addEventListener('DOMContentLoaded', initAnimations);

// Reinitialize animations on page navigation
try {
  swup.hooks.on("page:view", initAnimations);
} catch (e) {}
