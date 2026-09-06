document.addEventListener("DOMContentLoaded", function () {
  const singleRadios = document.querySelectorAll('input[name^="Single Size"]');
  const dualRadios = document.querySelectorAll('input[name^="Dual Size"]');

  singleRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        dualRadios.forEach((d) => (d.checked = false));
      }
    });
  });

  dualRadios.forEach((radio) => {
    radio.addEventListener("change", function () {
      if (this.checked) {
        singleRadios.forEach((s) => (s.checked = false));
      }
    });
  });
});
