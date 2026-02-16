(function () {
  "use strict";

  var gdpr = window.__gdpr && typeof window.__gdpr === "object" ? window.__gdpr : {};
  window.__gdpr = gdpr;

  var DEBUG = false;

  function log() {
    if (DEBUG && window.console && console.log) {
      console.log.apply(console, arguments);
    }
  }

  var CONFIG = {
    key: "gdpr_consent_v1",
    version: 1,
    gaId: "G-SJZZD3T4X4",
    policyUrl: "/privacy.html"
  };
  var FAB_POS_KEY = "gdpr_fab_pos_v1";

  var STRINGS = {
    en: {
      title: "Privacy settings",
      step1Body: "We use Plausible analytics which is cookie free and always on. Google Analytics is optional. You can change your choice anytime via Privacy settings.",
      acceptClose: "Accept and close",
      moreOptions: "More options",
      continueWithoutGa: "Continue without Google Analytics",
      privacyPolicy: "Privacy policy",
      strictlyNecessary: "Strictly necessary",
      plausibleAnalytics: "Plausible analytics",
      googleAnalytics: "Google Analytics",
      linkedIn: "LinkedIn outbound links",
      alwaysOn: "Always on",
      noCookies: "No cookies set by us",
      accept: "Accept",
      refuse: "Refuse",
      rejectAll: "Reject all",
      acceptAll: "Accept all",
      saveExit: "Save and exit",
      settingsButton: "Privacy settings",
      closeLabel: "Close",
      preferencesDesc: "Select your preferences for optional analytics."
    },
    "pt-PT": {
      title: "Definicoes de privacidade",
      step1Body: "Usamos o Plausible, que nao usa cookies e esta sempre ativo. O Google Analytics e opcional. Pode alterar a sua escolha a qualquer momento em Definicoes de privacidade.",
      acceptClose: "Aceitar e fechar",
      moreOptions: "Mais opcoes",
      continueWithoutGa: "Continuar sem Google Analytics",
      privacyPolicy: "Politica de privacidade",
      strictlyNecessary: "Estritamente necessario",
      plausibleAnalytics: "Plausible analytics",
      googleAnalytics: "Google Analytics",
      linkedIn: "Links externos do LinkedIn",
      alwaysOn: "Sempre ativo",
      noCookies: "Nao definimos cookies",
      accept: "Aceitar",
      refuse: "Recusar",
      rejectAll: "Rejeitar tudo",
      acceptAll: "Aceitar tudo",
      saveExit: "Guardar e sair",
      settingsButton: "Definicoes de privacidade",
      closeLabel: "Fechar",
      preferencesDesc: "Selecione as suas preferencias de analytics opcionais."
    },
    fr: {
      title: "Parametres de confidentialite",
      step1Body: "Nous utilisons Plausible, sans cookies et toujours actif. Google Analytics est optionnel. Vous pouvez changer votre choix a tout moment via Parametres de confidentialite.",
      acceptClose: "Accepter et fermer",
      moreOptions: "Plus d options",
      continueWithoutGa: "Continuer sans Google Analytics",
      privacyPolicy: "Politique de confidentialite",
      strictlyNecessary: "Strictement necessaire",
      plausibleAnalytics: "Plausible analytics",
      googleAnalytics: "Google Analytics",
      linkedIn: "Liens sortants LinkedIn",
      alwaysOn: "Toujours actif",
      noCookies: "Aucun cookie defini par nous",
      accept: "Accepter",
      refuse: "Refuser",
      rejectAll: "Tout refuser",
      acceptAll: "Tout accepter",
      saveExit: "Enregistrer et quitter",
      settingsButton: "Parametres de confidentialite",
      closeLabel: "Fermer",
      preferencesDesc: "Selectionnez vos preferences pour les analytics optionnels."
    }
  };

  var SUPPORTED_LANGS = ["en", "pt-PT", "fr"];

  function resolveLang(lang) {
    if (!lang || typeof lang !== "string") return null;
    if (lang === "pt-PT") return "pt-PT";
    if (lang.indexOf("pt") === 0) return "pt-PT";
    if (lang.indexOf("fr") === 0) return "fr";
    if (lang.indexOf("en") === 0) return "en";
    return null;
  }

  function detectLang() {
    var langs = [];
    if (navigator.languages && navigator.languages.length) {
      langs = navigator.languages;
    } else if (navigator.language) {
      langs = [navigator.language];
    }

    for (var i = 0; i < langs.length; i++) {
      var resolved = resolveLang(langs[i]);
      if (resolved) return resolved;
    }

    return "en";
  }

  var state = {
    lang: detectLang(),
    gaAllowed: null,
    hasConsent: false,
    gaLoaded: false,
    pendingGa: false,
    overlayOpen: false
  };

  var memoryConsent = null;
  var overlay = null;
  var modal = null;
  var step1 = null;
  var step2 = null;
  var closeBtn = null;
  var settingsBtn = null;
  var acceptBtn = null;
  var moreBtn = null;
  var continueBtn = null;
  var rejectAllBtn = null;
  var acceptAllBtn = null;
  var saveBtn = null;
  var gaAcceptBtn = null;
  var gaRefuseBtn = null;
  var lastActive = null;

  function getStrings() {
    return STRINGS[state.lang] || STRINGS.en;
  }

  function readConsent() {
    try {
      var raw = localStorage.getItem(CONFIG.key);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (
          parsed &&
          typeof parsed === "object" &&
          parsed.version === CONFIG.version &&
          typeof parsed.ga === "boolean"
        ) {
          return parsed;
        }
      }
    } catch (e) {
      log("LocalStorage read failed", e);
    }

    if (memoryConsent && typeof memoryConsent.ga === "boolean") {
      return memoryConsent;
    }

    return null;
  }

  function writeConsent(gaAllowed) {
    var payload = {
      ga: !!gaAllowed,
      lang: state.lang,
      ts: new Date().toISOString(),
      version: CONFIG.version
    };

    try {
      localStorage.setItem(CONFIG.key, JSON.stringify(payload));
    } catch (e) {
      log("LocalStorage write failed", e);
      memoryConsent = payload;
    }

    return payload;
  }

  function getGtag() {
    if (typeof window.gtag === "function") {
      return window.gtag;
    }

    window.dataLayer = window.dataLayer || [];
    window.gtag = function gtag() {
      window.dataLayer.push(arguments);
    };

    return window.gtag;
  }

  function loadGa() {
    if (state.gaLoaded) return;

    state.gaLoaded = true;
    var gtag = getGtag();

    gtag("consent", "default", {
      analytics_storage: "granted"
    });

    var script = document.createElement("script");
    script.async = true;
    script.src = "https://www.googletagmanager.com/gtag/js?id=" + encodeURIComponent(CONFIG.gaId);
    document.head.appendChild(script);

    gtag("js", new Date());
    gtag("config", CONFIG.gaId, {
      anonymize_ip: true
    });
  }

  function enableGa() {
    if (!state.gaLoaded) {
      loadGa();
    }

    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "granted"
      });
    }
  }

  function disableGa() {
    if (typeof window.gtag === "function") {
      window.gtag("consent", "update", {
        analytics_storage: "denied"
      });
    }

    deleteGaCookies();
  }

  function applyConsent(consent) {
    if (!consent) return;

    state.hasConsent = true;
    state.gaAllowed = !!consent.ga;

    var resolvedLang = resolveLang(consent.lang);
    if (resolvedLang) {
      state.lang = resolvedLang;
    }

    if (state.gaAllowed) {
      enableGa();
    } else {
      disableGa();
    }
  }

  function getCookieNames() {
    if (!document.cookie) return [];

    var pairs = document.cookie.split(";");
    var names = [];

    for (var i = 0; i < pairs.length; i++) {
      var part = pairs[i].trim();
      if (!part) continue;
      var eq = part.indexOf("=");
      var name = eq === -1 ? part : part.slice(0, eq);
      if (name) names.push(name);
    }

    return names;
  }

  function isGaCookie(name) {
    var lower = name.toLowerCase();
    if (lower === "_ga" || lower.indexOf("_ga") === 0) return true;
    if (lower.indexOf("_gid") === 0 || lower.indexOf("_gat") === 0) return true;
    return lower.indexOf("ga") !== -1;
  }

  function getDomainVariants(hostname) {
    var domains = [];
    if (!hostname) return domains;

    domains.push(hostname);
    var parts = hostname.split(".");

    for (var i = 0; i < parts.length - 1; i++) {
      var slice = parts.slice(i).join(".");
      if (slice.indexOf(".") === -1) continue;
      domains.push("." + slice);
    }

    return domains;
  }

  function expireCookie(name, domain, path) {
    var cookie = name + "=; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=" + path + ";";
    if (domain) {
      cookie += " domain=" + domain + ";";
    }
    document.cookie = cookie;
  }

  function deleteGaCookies() {
    // Best effort. HttpOnly cookies or cookies on different domains/paths cannot be removed from JS.
    var names = getCookieNames();
    if (!names.length) return;

    var hostname = location.hostname;
    var domains = getDomainVariants(hostname);
    var paths = ["/"];
    var currentPath = location.pathname || "/";

    if (currentPath && currentPath !== "/") {
      paths.push(currentPath);
    }

    for (var i = 0; i < names.length; i++) {
      var name = names[i];
      if (!isGaCookie(name)) continue;

      for (var p = 0; p < paths.length; p++) {
        expireCookie(name, null, paths[p]);
        for (var d = 0; d < domains.length; d++) {
          expireCookie(name, domains[d], paths[p]);
        }
      }
    }
  }

  function setToggleState(allowed) {
    state.pendingGa = !!allowed;

    if (!gaAcceptBtn || !gaRefuseBtn) return;

    gaAcceptBtn.classList.toggle("is-active", state.pendingGa);
    gaRefuseBtn.classList.toggle("is-active", !state.pendingGa);
    gaAcceptBtn.setAttribute("aria-pressed", state.pendingGa ? "true" : "false");
    gaRefuseBtn.setAttribute("aria-pressed", !state.pendingGa ? "true" : "false");
  }

  function setView(view) {
    if (!step1 || !step2 || !modal) return;

    var isStep1 = view === "step1";
    step1.hidden = !isStep1;
    step2.hidden = isStep1;
    modal.setAttribute("aria-describedby", isStep1 ? "gdpr-desc" : "gdpr-pref-desc");

    if (!isStep1) {
      var currentChoice = state.gaAllowed === null ? false : state.gaAllowed;
      setToggleState(currentChoice);
    }
  }

  function updateDismissControls() {
    var canClose = state.hasConsent;
    if (closeBtn) {
      closeBtn.hidden = !canClose;
      closeBtn.setAttribute("aria-hidden", canClose ? "false" : "true");
      closeBtn.setAttribute("tabindex", canClose ? "0" : "-1");
    }
  }

  function openOverlay(view) {
    if (!overlay) return;

    lastActive = document.activeElement;
    state.overlayOpen = true;
    updateDismissControls();
    setView(view || "step1");

    overlay.classList.add("is-open");
    overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("gdpr-no-scroll");

    if (modal) {
      modal.focus();
    }
  }

  function closeOverlay(force) {
    if (!overlay) return;
    if (!force && !state.hasConsent) return;

    state.overlayOpen = false;
    overlay.classList.remove("is-open");
    overlay.setAttribute("aria-hidden", "true");
    document.body.classList.remove("gdpr-no-scroll");

    if (lastActive && typeof lastActive.focus === "function") {
      lastActive.focus();
    }
  }

  function trapFocus(event) {
    if (!overlay || !state.overlayOpen || event.key !== "Tab") return;

    var focusable = overlay.querySelectorAll(
      "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
    );

    if (!focusable.length) return;

    var first = focusable[0];
    var last = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === first) {
      last.focus();
      event.preventDefault();
    } else if (!event.shiftKey && document.activeElement === last) {
      first.focus();
      event.preventDefault();
    }
  }

  function handleKeydown(event) {
    if (!state.overlayOpen) return;

    if (event.key === "Escape") {
      if (state.hasConsent) {
        closeOverlay(false);
      }
      return;
    }

    trapFocus(event);
  }

  function readFabPos() {
    try {
      var raw = localStorage.getItem(FAB_POS_KEY);
      if (!raw) return null;
      var parsed = JSON.parse(raw);
      if (parsed && typeof parsed.x === "number" && typeof parsed.y === "number") {
        return parsed;
      }
    } catch (e) {
      log("Fab position read failed", e);
    }
    return null;
  }

  function writeFabPos(x, y) {
    try {
      localStorage.setItem(FAB_POS_KEY, JSON.stringify({ x: x, y: y }));
    } catch (e) {
      log("Fab position write failed", e);
    }
  }

  function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  }

  function placeFab(btn, pos) {
    if (!btn || !pos) return;
    var rect = btn.getBoundingClientRect();
    var margin = 8;
    var maxX = window.innerWidth - rect.width - margin;
    var maxY = window.innerHeight - rect.height - margin;
    var left = clamp(pos.x, margin, Math.max(margin, maxX));
    var top = clamp(pos.y, margin, Math.max(margin, maxY));
    btn.style.left = left + "px";
    btn.style.top = top + "px";
    btn.style.right = "auto";
    btn.style.bottom = "auto";
    btn.dataset.dragged = "true";
  }

  function initFabDrag(btn) {
    if (!btn || !window.PointerEvent) return;

    var saved = readFabPos();
    if (saved) {
      requestAnimationFrame(function () {
        placeFab(btn, saved);
      });
    }

    window.addEventListener("resize", function () {
      var current = readFabPos();
      if (current) placeFab(btn, current);
    });

    var pointerId = null;
    var startX = 0;
    var startY = 0;
    var startLeft = 0;
    var startTop = 0;
    var moved = false;
    var threshold = 4;

    function onPointerMove(e) {
      if (pointerId === null || e.pointerId !== pointerId) return;
      var dx = e.clientX - startX;
      var dy = e.clientY - startY;
      if (!moved && Math.hypot(dx, dy) >= threshold) moved = true;
      var rect = btn.getBoundingClientRect();
      var margin = 8;
      var maxX = window.innerWidth - rect.width - margin;
      var maxY = window.innerHeight - rect.height - margin;
      var nextLeft = clamp(startLeft + dx, margin, Math.max(margin, maxX));
      var nextTop = clamp(startTop + dy, margin, Math.max(margin, maxY));
      btn.style.left = nextLeft + "px";
      btn.style.top = nextTop + "px";
      btn.style.right = "auto";
      btn.style.bottom = "auto";
      btn.dataset.dragged = "true";
    }

    function stopDrag() {
      if (pointerId === null) return;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
      window.removeEventListener("pointercancel", onPointerUp);
      btn.classList.remove("is-dragging");
      if (moved) {
        btn.__suppressClick = true;
        setTimeout(function () { btn.__suppressClick = false; }, 0);
        writeFabPos(parseFloat(btn.style.left) || startLeft, parseFloat(btn.style.top) || startTop);
      }
      pointerId = null;
    }

    function onPointerUp(e) {
      if (pointerId !== e.pointerId) return;
      try { btn.releasePointerCapture(pointerId); } catch (err) {}
      stopDrag();
    }

    btn.addEventListener("pointerdown", function (e) {
      if (e.button !== 0) return;
      pointerId = e.pointerId;
      var rect = btn.getBoundingClientRect();
      startX = e.clientX;
      startY = e.clientY;
      startLeft = rect.left;
      startTop = rect.top;
      moved = false;
      btn.classList.add("is-dragging");
      try { btn.setPointerCapture(pointerId); } catch (err) {}
      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
      window.addEventListener("pointercancel", onPointerUp);
    });
  }

  function buildUI() {
    if (document.querySelector(".gdpr-overlay")) return;

    var t = getStrings();

    overlay = document.createElement("div");
    overlay.className = "gdpr-overlay";
    overlay.setAttribute("aria-hidden", "true");

    overlay.innerHTML =
      "<div class=\"gdpr-modal\" role=\"dialog\" aria-modal=\"true\" aria-labelledby=\"gdpr-title\" aria-describedby=\"gdpr-desc\" tabindex=\"-1\">" +
        "<div class=\"gdpr-header\">" +
          "<h2 id=\"gdpr-title\" class=\"gdpr-title\">" + t.title + "</h2>" +
          "<button type=\"button\" class=\"gdpr-close\" data-gdpr-close aria-label=\"" + t.closeLabel + "\">X</button>" +
        "</div>" +
        "<div class=\"gdpr-step\" data-gdpr-step=\"1\">" +
          "<p id=\"gdpr-desc\" class=\"gdpr-desc\">" + t.step1Body + "</p>" +
          "<div class=\"gdpr-actions\">" +
            "<button type=\"button\" class=\"gdpr-btn primary\" data-gdpr-accept>" + t.acceptClose + "</button>" +
            "<button type=\"button\" class=\"gdpr-btn secondary\" data-gdpr-more>" + t.moreOptions + "</button>" +
          "</div>" +
          "<div class=\"gdpr-links\">" +
            "<button type=\"button\" class=\"gdpr-link\" data-gdpr-continue>" + t.continueWithoutGa + "</button>" +
            "<a class=\"gdpr-link\" href=\"" + CONFIG.policyUrl + "\">" + t.privacyPolicy + "</a>" +
          "</div>" +
        "</div>" +
        "<div class=\"gdpr-step\" data-gdpr-step=\"2\" hidden>" +
          "<p id=\"gdpr-pref-desc\" class=\"gdpr-pref-desc\">" + t.preferencesDesc + "</p>" +
          "<div class=\"gdpr-list\">" +
            "<div class=\"gdpr-row\">" +
              "<div>" +
                "<div class=\"gdpr-row-title\">" + t.strictlyNecessary + "</div>" +
                "<div class=\"gdpr-row-sub\">" + t.alwaysOn + "</div>" +
              "</div>" +
              "<div class=\"gdpr-row-state\">" + t.alwaysOn + "</div>" +
            "</div>" +
            "<div class=\"gdpr-row\">" +
              "<div>" +
                "<div class=\"gdpr-row-title\">" + t.plausibleAnalytics + "</div>" +
                "<div class=\"gdpr-row-sub\">" + t.alwaysOn + "</div>" +
              "</div>" +
              "<div class=\"gdpr-row-state\">" + t.alwaysOn + "</div>" +
            "</div>" +
            "<div class=\"gdpr-row\">" +
              "<div>" +
                "<div class=\"gdpr-row-title\">" + t.googleAnalytics + "</div>" +
                "<div class=\"gdpr-row-sub\">" + t.accept + " / " + t.refuse + "</div>" +
              "</div>" +
              "<div class=\"gdpr-toggle\" role=\"group\" aria-label=\"" + t.googleAnalytics + "\">" +
                "<button type=\"button\" data-gdpr-ga=\"accept\" aria-pressed=\"false\">" + t.accept + "</button>" +
                "<button type=\"button\" data-gdpr-ga=\"refuse\" aria-pressed=\"false\">" + t.refuse + "</button>" +
              "</div>" +
            "</div>" +
            "<div class=\"gdpr-row\">" +
              "<div>" +
                "<div class=\"gdpr-row-title\">" + t.linkedIn + "</div>" +
                "<div class=\"gdpr-row-sub\">" + t.noCookies + "</div>" +
              "</div>" +
              "<div class=\"gdpr-row-state\">" + t.noCookies + "</div>" +
            "</div>" +
          "</div>" +
          "<div class=\"gdpr-footer\">" +
            "<button type=\"button\" class=\"gdpr-btn secondary\" data-gdpr-reject-all>" + t.rejectAll + "</button>" +
            "<button type=\"button\" class=\"gdpr-btn secondary\" data-gdpr-accept-all>" + t.acceptAll + "</button>" +
            "<button type=\"button\" class=\"gdpr-btn primary\" data-gdpr-save>" + t.saveExit + "</button>" +
          "</div>" +
        "</div>" +
      "</div>";

    document.body.appendChild(overlay);

    settingsBtn = document.createElement("button");
    settingsBtn.type = "button";
    settingsBtn.className = "gdpr-fab";
    settingsBtn.textContent = t.settingsButton;
    document.body.appendChild(settingsBtn);

    modal = overlay.querySelector(".gdpr-modal");
    step1 = overlay.querySelector("[data-gdpr-step='1']");
    step2 = overlay.querySelector("[data-gdpr-step='2']");
    closeBtn = overlay.querySelector("[data-gdpr-close]");
    acceptBtn = overlay.querySelector("[data-gdpr-accept]");
    moreBtn = overlay.querySelector("[data-gdpr-more]");
    continueBtn = overlay.querySelector("[data-gdpr-continue]");
    rejectAllBtn = overlay.querySelector("[data-gdpr-reject-all]");
    acceptAllBtn = overlay.querySelector("[data-gdpr-accept-all]");
    saveBtn = overlay.querySelector("[data-gdpr-save]");
    gaAcceptBtn = overlay.querySelector("[data-gdpr-ga='accept']");
    gaRefuseBtn = overlay.querySelector("[data-gdpr-ga='refuse']");

    if (acceptBtn) {
      acceptBtn.addEventListener("click", function () {
        var payload = writeConsent(true);
        applyConsent(payload);
        closeOverlay(true);
      });
    }

    if (continueBtn) {
      continueBtn.addEventListener("click", function () {
        var payload = writeConsent(false);
        applyConsent(payload);
        closeOverlay(true);
      });
    }

    if (moreBtn) {
      moreBtn.addEventListener("click", function () {
        openOverlay("step2");
      });
    }

    if (closeBtn) {
      closeBtn.addEventListener("click", function () {
        closeOverlay(false);
      });
    }

    if (settingsBtn) {
      settingsBtn.addEventListener("click", function () {
        if (settingsBtn.__suppressClick) return;
        openOverlay("step2");
      });
      initFabDrag(settingsBtn);
    }

    if (gaAcceptBtn) {
      gaAcceptBtn.addEventListener("click", function () {
        setToggleState(true);
      });
    }

    if (gaRefuseBtn) {
      gaRefuseBtn.addEventListener("click", function () {
        setToggleState(false);
      });
    }

    if (rejectAllBtn) {
      rejectAllBtn.addEventListener("click", function () {
        setToggleState(false);
        var payload = writeConsent(false);
        applyConsent(payload);
        closeOverlay(true);
      });
    }

    if (acceptAllBtn) {
      acceptAllBtn.addEventListener("click", function () {
        setToggleState(true);
        var payload = writeConsent(true);
        applyConsent(payload);
        closeOverlay(true);
      });
    }

    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        var payload = writeConsent(state.pendingGa);
        applyConsent(payload);
        closeOverlay(true);
      });
    }

    overlay.addEventListener("click", function (event) {
      if (event.target === overlay) {
        closeOverlay(false);
      }
    });

    document.addEventListener("keydown", handleKeydown);
  }

  function init() {
    var existing = readConsent();
    if (existing) {
      state.hasConsent = true;
      state.gaAllowed = !!existing.ga;
      var resolved = resolveLang(existing.lang);
      if (resolved) {
        state.lang = resolved;
      }
    }

    buildUI();

    if (existing) {
      applyConsent(existing);
    } else {
      openOverlay("step1");
    }
  }

  gdpr.state = state;
  gdpr.openPreferences = function () {
    openOverlay("step2");
  };
  gdpr.getConsent = function () {
    return readConsent();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
