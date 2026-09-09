(function () {
  if (window.vusionV360Reveal) return;
  window.vusionV360Reveal = true;

  var els = document.querySelectorAll(".vusion-v360-reveal");
  if (!els.length) return;

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    els.forEach(function (el) {
      el.classList.add("is-in");
    });
    return;
  }

  var io = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-in");
        io.unobserve(entry.target);
      });
    },
    { threshold: 0.12 }
  );

  els.forEach(function (el) {
    io.observe(el);
  });
})();

(function () {
  if (window.vusionV360Faq) return;
  window.vusionV360Faq = true;

  document.addEventListener("click", function (event) {
    var q = event.target.closest(".vusion-v360-faq__q");
    if (!q) return;

    var item = q.closest(".vusion-v360-faq__item");
    var root = q.closest(".vusion-v360-faq");
    if (!item || !root) return;

    var a = item.querySelector(".vusion-v360-faq__a");
    var isOpen = item.classList.contains("is-open");

    root.querySelectorAll(".vusion-v360-faq__item.is-open").forEach(function (openItem) {
      openItem.classList.remove("is-open");
      var openAnswer = openItem.querySelector(".vusion-v360-faq__a");
      if (openAnswer) openAnswer.style.maxHeight = null;
    });

    if (!isOpen && a) {
      item.classList.add("is-open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
})();
