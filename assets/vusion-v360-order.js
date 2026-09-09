(function () {
  var root = document.querySelector("[data-v360-order]");
  if (!root || window.vusionV360Order) return;
  window.vusionV360Order = true;

  var configEl = root.querySelector("[data-v360-order-config]");
  var config = {};
  try {
    config = JSON.parse(configEl.textContent);
  } catch (error) {
    return;
  }

  var params = new URLSearchParams(window.location.search);
  var aliases = { p350: "v360", euphoria: "v360-pro", v360: "v360", "v360-pro": "v360-pro" };
  var modelKey = aliases[params.get("model")] || config.defaultModel || "v360-pro";
  var model = config.models[modelKey] || config.models["v360-pro"] || config.models.v360;
  var warrantyOn = false;
  var step = 1;
  var maxStep = 4;

  var state = {
    leftFaceplate: "",
    rightFaceplate: "",
    cable: "",
    initials: "",
    caseName: "",
    band: "",
    impressions: "Sending new",
    impressionRef: "",
  };

  var els = {
    tabs: root.querySelectorAll("[data-order-tab]"),
    panels: root.querySelectorAll("[data-order-panel]"),
    name: root.querySelector("[data-summary-name]"),
    sub: root.querySelector("[data-summary-sub]"),
    image: root.querySelector("[data-summary-image]"),
    base: root.querySelector("[data-summary-base]"),
    left: root.querySelector("[data-summary-left]"),
    right: root.querySelector("[data-summary-right]"),
    cable: root.querySelector("[data-summary-cable]"),
    warranty: root.querySelector("[data-summary-warranty]"),
    total: root.querySelector("[data-summary-total]"),
    warrantyInput: root.querySelector("[data-warranty-input]"),
    termsInput: root.querySelector("[data-terms-input]"),
    checkout: root.querySelector("[data-order-checkout]"),
    error: root.querySelector("[data-order-error]"),
    cableInput: root.querySelector("[data-field-cable]"),
    initialsInput: root.querySelector("[data-field-initials]"),
    caseNameInput: root.querySelector("[data-field-case-name]"),
    bandInput: root.querySelector("[data-field-band]"),
    impressionRefInput: root.querySelector("[data-field-impression-ref]"),
    impNew: root.querySelector("[data-imp-new]"),
    impFile: root.querySelector("[data-imp-file]"),
    rvLeft: root.querySelector("[data-review-left]"),
    rvRight: root.querySelector("[data-review-right]"),
    rvCable: root.querySelector("[data-review-cable]"),
    rvInitials: root.querySelector("[data-review-initials]"),
    rvCaseName: root.querySelector("[data-review-case-name]"),
    rvBand: root.querySelector("[data-review-band]"),
    rvWarranty: root.querySelector("[data-review-warranty]"),
    rvImpStatus: root.querySelector("[data-review-imp-status]"),
    rvImpRef: root.querySelector("[data-review-imp-ref]"),
  };

  function formatMoney(cents) {
    var format = config.moneyFormat || "${{amount}}";
    var value = (Math.abs(Number(cents) || 0) / 100).toFixed(2);
    var amount = value.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
    var comma = value.replace(".", ",").replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1.");
    var noDecimals = String(Math.round((Number(cents) || 0) / 100));
    return format
      .replace(/\{\{\s*amount_with_comma_separator\s*\}\}/g, comma)
      .replace(/\{\{\s*amount_no_decimals_with_comma_separator\s*\}\}/g, noDecimals.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1."))
      .replace(/\{\{\s*amount_no_decimals\s*\}\}/g, noDecimals.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"))
      .replace(/\{\{\s*amount_with_apostrophe_separator\s*\}\}/g, amount.replace(/,/g, "'"))
      .replace(/\{\{\s*amount\s*\}\}/g, amount);
  }

  function selectedSwatch(group) {
    var selected = root.querySelector('[data-swatch-group="' + group + '"] [aria-checked="true"]');
    return selected ? selected.getAttribute("data-value") : "";
  }

  function setError(message) {
    if (!els.error) return;
    els.error.hidden = !message;
    els.error.textContent = message || "";
  }

  function markInvalid(input, invalid) {
    if (!input) return;
    input.classList.toggle("is-invalid", Boolean(invalid));
    input.setAttribute("aria-invalid", invalid ? "true" : "false");
  }

  function validateStep(n) {
    setError("");
    if (n === 2) {
      var cableOk = Boolean(els.cableInput && els.cableInput.value);
      var initialsOk = Boolean(els.initialsInput && els.initialsInput.value.trim());
      var caseOk = Boolean(els.caseNameInput && els.caseNameInput.value.trim());
      markInvalid(els.cableInput, !cableOk);
      markInvalid(els.initialsInput, !initialsOk);
      markInvalid(els.caseNameInput, !caseOk);
      if (!cableOk || !initialsOk || !caseOk) {
        setError("Choose a cable and add initials and a name for the case.");
        return false;
      }
    }
    if (n === 3 && state.impressions === "Already on file") {
      var refOk = Boolean(els.impressionRefInput && els.impressionRefInput.value.trim());
      markInvalid(els.impressionRefInput, !refOk);
      if (!refOk) {
        setError("Add the impression reference or previous order number.");
        return false;
      }
    }
    if (n === 4) {
      if (!model || !model.variantId) {
        setError("V360 products are not assigned yet. Add them in the theme editor.");
        return false;
      }
      if (model.available === false) {
        setError("This model is sold out. Turn on Continue selling when out of stock, or add inventory, then try again.");
        return false;
      }
      if (els.termsInput && !els.termsInput.checked) {
        setError("Accept the terms to continue to checkout.");
        return false;
      }
    }
    return true;
  }

  function goStep(n) {
    if (n > step && !validateStep(step)) return;
    if (n < 1 || n > maxStep) return;
    step = n;
    els.panels.forEach(function (panel) {
      panel.classList.toggle("is-active", Number(panel.getAttribute("data-order-panel")) === n);
    });
    els.tabs.forEach(function (tab) {
      var tabStep = Number(tab.getAttribute("data-order-tab"));
      tab.classList.toggle("is-active", tabStep === n);
      tab.classList.toggle("is-done", tabStep < n);
      tab.setAttribute("aria-current", tabStep === n ? "step" : "false");
    });
    if (n === 4) fillReview();
    root.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function updateSummary() {
    state.leftFaceplate = selectedSwatch("leftFaceplate");
    state.rightFaceplate = selectedSwatch("rightFaceplate");
    state.cable = els.cableInput ? els.cableInput.value : "";
    state.initials = els.initialsInput ? els.initialsInput.value.trim() : "";
    state.caseName = els.caseNameInput ? els.caseNameInput.value.trim() : "";
    state.band = els.bandInput ? els.bandInput.value.trim() : "";
    state.impressionRef = els.impressionRefInput ? els.impressionRefInput.value.trim() : "";
    warrantyOn = Boolean(els.warrantyInput && els.warrantyInput.checked);

    if (els.name) els.name.textContent = model.title;
    if (els.sub) els.sub.textContent = model.subtitle;
    if (els.image && model.image) {
      els.image.src = model.image;
      els.image.alt = model.title;
      els.image.hidden = false;
    }
    if (els.base) els.base.textContent = model.price || "—";
    if (els.left) els.left.textContent = state.leftFaceplate || "—";
    if (els.right) els.right.textContent = state.rightFaceplate || "—";
    if (els.cable) els.cable.textContent = state.cable || "Not selected";
    if (els.warranty) {
      els.warranty.textContent = warrantyOn && config.warranty ? "+ " + config.warranty.price : "—";
    }
    var total = (model.priceCents || 0) + (warrantyOn && config.warranty ? config.warranty.priceCents : 0);
    if (els.total) els.total.textContent = formatMoney(total);
    if (els.checkout) {
      els.checkout.disabled = !(els.termsInput && els.termsInput.checked && step === 4);
    }
  }

  function fillReview() {
    updateSummary();
    if (els.rvLeft) els.rvLeft.textContent = state.leftFaceplate || "—";
    if (els.rvRight) els.rvRight.textContent = state.rightFaceplate || "—";
    if (els.rvCable) els.rvCable.textContent = state.cable || "—";
    if (els.rvInitials) els.rvInitials.textContent = state.initials || "—";
    if (els.rvCaseName) els.rvCaseName.textContent = state.caseName || "—";
    if (els.rvBand) els.rvBand.textContent = state.band || "—";
    if (els.rvWarranty) {
      els.rvWarranty.textContent = warrantyOn && config.warranty ? "Added (" + config.warranty.price + ")" : "Not added";
    }
    if (els.rvImpStatus) els.rvImpStatus.textContent = state.impressions;
    if (els.rvImpRef) {
      els.rvImpRef.textContent =
        state.impressions === "Already on file"
          ? state.impressionRef || "—"
          : "We’ll email the exact subject after you pay";
    }
  }

  function properties() {
    var props = {
      "Left faceplate": state.leftFaceplate,
      "Right faceplate": state.rightFaceplate,
      Cable: state.cable,
      Initials: state.initials,
      "Name on case": state.caseName,
      Impressions: state.impressions,
    };
    if (state.band) props.Band = state.band;
    if (state.impressions === "Already on file" && state.impressionRef) {
      props["Impression reference"] = state.impressionRef;
    } else if (state.impressions === "Sending new") {
      var inbox = config.impressionsEmail || "info@vusionaudio.com";
      props["Impression files"] = "New email to " + inbox + " — subject: V360 impressions + order number";
      props["Impression inbox"] = inbox;
    }
    return props;
  }

  function checkout() {
    fillReview();
    if (!validateStep(2)) {
      goStep(2);
      return;
    }
    if (!validateStep(3)) {
      goStep(3);
      return;
    }
    if (!validateStep(4)) return;

    var items = [
      {
        id: model.variantId,
        quantity: 1,
        properties: properties(),
      },
    ];
    if (warrantyOn && config.warranty && config.warranty.variantId) {
      items.push({
        id: config.warranty.variantId,
        quantity: 1,
        properties: { "For": model.title },
      });
    }

    els.checkout.disabled = true;
    els.checkout.classList.add("is-loading");
    setError("");

    fetch(config.cartAddUrl || window.routes.cart_add_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ items: items }),
    })
      .then(function (response) {
        return response.json().then(function (body) {
          return { ok: response.ok, body: body };
        });
      })
      .then(function (result) {
        if (!result.ok || result.body.status) {
          throw new Error(result.body.description || result.body.message || "Could not add this order to checkout.");
        }
        window.location.href = config.checkoutUrl || "/checkout";
      })
      .catch(function (error) {
        setError(error.message || "Could not add this order to checkout.");
        els.checkout.disabled = false;
        els.checkout.classList.remove("is-loading");
      });
  }

  root.querySelectorAll("[data-swatch-group]").forEach(function (group) {
    var buttons = group.querySelectorAll("[data-value]");
    if (buttons[0] && !group.querySelector('[aria-checked="true"]')) {
      buttons[0].setAttribute("aria-checked", "true");
      buttons[0].classList.add("is-selected");
    }
    buttons.forEach(function (button) {
      button.addEventListener("click", function () {
        buttons.forEach(function (other) {
          other.setAttribute("aria-checked", "false");
          other.classList.remove("is-selected");
        });
        button.setAttribute("aria-checked", "true");
        button.classList.add("is-selected");
        updateSummary();
      });
    });
  });

  root.querySelectorAll("[data-impression]").forEach(function (pill) {
    pill.addEventListener("click", function () {
      root.querySelectorAll("[data-impression]").forEach(function (other) {
        other.classList.remove("is-selected");
        other.setAttribute("aria-checked", "false");
      });
      pill.classList.add("is-selected");
      pill.setAttribute("aria-checked", "true");
      state.impressions = pill.getAttribute("data-impression");
      if (els.impNew) els.impNew.hidden = state.impressions !== "Sending new";
      if (els.impFile) els.impFile.hidden = state.impressions !== "Already on file";
      updateSummary();
    });
  });

  ["cableInput", "initialsInput", "caseNameInput", "bandInput", "impressionRefInput"].forEach(function (key) {
    if (!els[key]) return;
    els[key].addEventListener("input", updateSummary);
    els[key].addEventListener("change", updateSummary);
  });

  if (els.warrantyInput) els.warrantyInput.addEventListener("change", updateSummary);
  if (els.termsInput) els.termsInput.addEventListener("change", updateSummary);

  root.querySelectorAll("[data-go-step]").forEach(function (button) {
    button.addEventListener("click", function () {
      goStep(Number(button.getAttribute("data-go-step")));
    });
  });

  els.tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      var target = Number(tab.getAttribute("data-order-tab"));
      if (target <= step) goStep(target);
    });
  });

  if (els.checkout) els.checkout.addEventListener("click", checkout);

  updateSummary();
})();
