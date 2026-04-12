export function initSocialShare() {
  // Create social share buttons
  const shareButtons = [
    {
      name: 'Twitter',
      icon: 'fa-brands fa-twitter',
      url: 'https://twitter.com/intent/tweet',
      params: { text: '', url: '', via: 'henrytech' }
    },
    {
      name: 'Facebook',
      icon: 'fa-brands fa-facebook-f',
      url: 'https://www.facebook.com/sharer/sharer.php',
      params: { u: '' }
    },
    {
      name: 'LinkedIn',
      icon: 'fa-brands fa-linkedin-in',
      url: 'https://www.linkedin.com/sharing/share-offsite/',
      params: { url: '', mini: 'true' }
    },
    {
      name: 'Reddit',
      icon: 'fa-brands fa-reddit',
      url: 'https://reddit.com/submit',
      params: { url: '', title: '' }
    },
    {
      name: 'Copy Link',
      icon: 'fa-solid fa-link',
      url: '#',
      params: {}
    }
  ];

  // Add share buttons to post pages
  const postContent = document.querySelector('.post-content, .article-content');
  if (postContent) {
    createShareContainer(postContent);
  }

  function createShareContainer(container) {
    // Check if share container already exists
    if (container.querySelector('.share-container')) return;

    const shareContainer = document.createElement('div');
    shareContainer.className = 'share-container';
    shareContainer.innerHTML = `
      <div class="share-title">Share this article:</div>
      <div class="share-buttons"></div>
    `;

    const buttonsContainer = shareContainer.querySelector('.share-buttons');
    
    shareButtons.forEach(button => {
      const btn = document.createElement('button');
      btn.className = 'share-btn';
      btn.setAttribute('data-platform', button.name);
      btn.innerHTML = `<i class="${button.icon}"></i>`;
      
      btn.addEventListener('click', () => handleShare(button));
      buttonsContainer.appendChild(btn);
    });

    // Insert after the content
    container.parentNode.insertBefore(shareContainer, container.nextSibling);
  }

  function handleShare(button) {
    const url = window.location.href;
    const title = document.title;
    const description = document.querySelector('meta[name="description"]')?.content || '';

    if (button.name === 'Copy Link') {
      copyToClipboard(url);
      showNotification('Link copied to clipboard!');
      return;
    }

    const params = { ...button.params };
    if (params.text !== undefined) params.text = `${title} - ${description}`;
    if (params.url !== undefined) params.url = url;
    if (params.u !== undefined) params.u = url;
    if (params.title !== undefined) params.title = title;

    const shareUrl = `${button.url}?${new URLSearchParams(params).toString()}`;
    window.open(shareUrl, '_blank', 'width=600,height=400');
  }

  function copyToClipboard(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
  }

  function showNotification(message) {
    const notification = document.createElement('div');
    notification.className = 'share-notification';
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      background: var(--primary-color, #A31F34);
      color: white;
      padding: 12px 20px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      z-index: 1000;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateY(0)';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(20px)';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      }, 300);
    }, 3000);
  }

  // Add reading progress bar
  addReadingProgress();

  function addReadingProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'reading-progress';
    progressBar.innerHTML = '<div class="reading-progress-bar"></div>';
    document.body.appendChild(progressBar);

    window.addEventListener('scroll', () => {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scrolled = (winScroll / height) * 100;
      
      const progressBarInner = progressBar.querySelector('.reading-progress-bar');
      if (progressBarInner) {
        progressBarInner.style.width = scrolled + '%';
      }
    });
  }

  // Add back to top button
  addBackToTop();

  function addBackToTop() {
    const backToTop = document.createElement('button');
    backToTop.className = 'back-to-top';
    backToTop.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
    backToTop.setAttribute('aria-label', 'Back to top');
    
    document.body.appendChild(backToTop);

    // Show/hide based on scroll position
    window.addEventListener('scroll', () => {
      if (window.pageYOffset > 300) {
        backToTop.classList.add('visible');
      } else {
        backToTop.classList.remove('visible');
      }
    });

    // Scroll to top
    backToTop.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

// Initialize social sharing when DOM is ready
document.addEventListener('DOMContentLoaded', initSocialShare);

// Reinitialize on page navigation
try {
  swup.hooks.on("page:view", initSocialShare);
} catch (e) {}
