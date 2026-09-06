// Wait for both DOM and deferred scripts to load
document.addEventListener('DOMContentLoaded', initAccordion);

// OR if using async (less reliable for DOM-dependent scripts)
window.addEventListener('load', initAccordion);

function initAccordion() {
  // Auto-open first accordion item if none are open
  const accordions = document.querySelectorAll('.vusion-product-accordion');
  
  accordions.forEach(accordion => {
    if (!accordion.querySelector('.vusion-product-accordion__toggle:checked')) {
      const firstToggle = accordion.querySelector('.vusion-product-accordion__toggle');
      if (firstToggle) firstToggle.checked = true;
    }

    // Smooth scroll into view when opening
    accordion.querySelectorAll('.vusion-product-accordion__label').forEach(label => {
      label.addEventListener('click', function() {
        const checkbox = document.getElementById(this.getAttribute('for'));
        if (checkbox && checkbox.checked) {
          setTimeout(() => {
            this.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          }, 100);
        }
      });
    });
  });
}