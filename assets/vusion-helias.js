(function () {
  if (window.vusionHeliasReveal) return;
  window.vusionHeliasReveal = true;

  var els = document.querySelectorAll(".vusion-helias-reveal");
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
  if (window.vusionHeliasFaq) return;
  window.vusionHeliasFaq = true;

  document.addEventListener("click", function (event) {
    var q = event.target.closest(".vusion-helias-faq__q");
    if (!q) return;

    var item = q.closest(".vusion-helias-faq__item");
    var root = q.closest(".vusion-helias-faq");
    if (!item || !root) return;

    var a = item.querySelector(".vusion-helias-faq__a");
    var isOpen = item.classList.contains("is-open");

    root.querySelectorAll(".vusion-helias-faq__item.is-open").forEach(function (openItem) {
      openItem.classList.remove("is-open");
      var openAnswer = openItem.querySelector(".vusion-helias-faq__a");
      if (openAnswer) openAnswer.style.maxHeight = null;
    });

    if (!isOpen && a) {
      item.classList.add("is-open");
      a.style.maxHeight = a.scrollHeight + "px";
    }
  });
})();
