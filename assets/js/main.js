/* ============================================================================
   Pointage — comportements du site vitrine.
   Aucune dépendance : le site reste lisible et navigable si ce script échoue.
   ========================================================================= */
(function () {
  "use strict";

  var CFG = window.POINTAGE_CONFIG || {};
  var DICT = window.POINTAGE_I18N || { ar: {}, fr: {}, meta: {} };
  var html = document.documentElement;

  /* ------------------------------------------------------------------
     0. Aperçu depuis le disque
     Les pages se lient entre elles par /mobile et /pointeuse : ce sont les
     adresses servies en ligne, et c'est ce qui doit figurer dans le HTML
     pour que les moteurs suivent des liens directs, sans redirection.
     En file:// une barre initiale désigne la racine du disque : on repasse
     alors sur les noms de fichiers, le temps de la relecture locale.
     ------------------------------------------------------------------ */
  if (location.protocol === "file:") {
    var LOCAL = { "/mobile": "mobile.html", "/pointeuse": "pointeuse.html" };
    [].forEach.call(document.querySelectorAll('a[href^="/"]'), function (a) {
      var href = a.getAttribute("href");
      var cut = href.indexOf("#");
      var hash = cut > -1 ? href.slice(cut) : "";
      var page = cut > -1 ? href.slice(0, cut) : href;
      if (LOCAL[page]) a.setAttribute("href", LOCAL[page] + hash);
    });
  }

  /* ------------------------------------------------------------------
     1. Traduction
     Le français vit dans le HTML : on le mémorise au chargement pour
     pouvoir y revenir sans avoir à le dupliquer dans le dictionnaire.
     ------------------------------------------------------------------ */
  var nodes = [].slice.call(document.querySelectorAll("[data-i18n]"));
  var frText = {};
  nodes.forEach(function (el) {
    frText[el.getAttribute("data-i18n")] = el.textContent;
  });

  function t(key, lang) {
    if (lang === "ar") return (DICT.ar && DICT.ar[key]) || frText[key] || key;
    return (DICT.fr && DICT.fr[key]) || frText[key] || key;
  }

  function setLang(lang, persist) {
    lang = lang === "ar" ? "ar" : "fr";

    html.setAttribute("lang", lang);
    html.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");

    nodes.forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var value = lang === "ar" ? (DICT.ar && DICT.ar[key]) : frText[key];
      if (value) el.textContent = value;
    });

    /* Chaque page a son propre titre et sa propre description : la clé est
       portée par <html data-page="…">. */
    var page = html.getAttribute("data-page") || "mobile";
    var pageMeta = (DICT.meta && DICT.meta[page]) || null;
    var meta = (pageMeta && pageMeta[lang]) || null;
    if (meta) {
      document.title = meta.title;
      var d = document.querySelector('meta[name="description"]');
      if (d) d.setAttribute("content", meta.description);
    }

    [].forEach.call(document.querySelectorAll(".lang-switch button"), function (b) {
      var on = b.getAttribute("data-lang") === lang;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on ? "true" : "false");
    });

    wireContactLinks(lang);

    try { if (persist) localStorage.setItem("pointage-lang", lang); } catch (e) {}
  }

  [].forEach.call(document.querySelectorAll(".lang-switch button"), function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-lang"), true);
    });
  });

  /* Priorité : ?lang= dans l'URL, puis choix mémorisé, puis langue du navigateur. */
  var urlLang = (location.search.match(/[?&]lang=(ar|fr)\b/) || [])[1];
  var savedLang = null;
  try { savedLang = localStorage.getItem("pointage-lang"); } catch (e) {}
  var navLang = (navigator.language || "fr").slice(0, 2) === "ar" ? "ar" : "fr";
  setLang(urlLang || savedLang || navLang, false);

  /* ------------------------------------------------------------------
     2. Liens de contact (WhatsApp, téléphone, prise de rendez-vous)
     Alimentés depuis config.js pour qu'il n'y ait qu'un seul endroit
     à modifier avant la mise en ligne.
     ------------------------------------------------------------------ */
  function wireContactLinks(lang) {
    var waMsg = (CFG.whatsappMessage && CFG.whatsappMessage[lang]) || "";
    var waHref = CFG.whatsapp
      ? "https://wa.me/" + CFG.whatsapp + (waMsg ? "?text=" + encodeURIComponent(waMsg) : "")
      : null;

    [].forEach.call(document.querySelectorAll('[data-cfg="whatsapp"]'), function (a) {
      if (waHref) a.href = waHref; else a.remove();
    });

    [].forEach.call(document.querySelectorAll('[data-cfg="phone"]'), function (a) {
      if (CFG.phoneDial) a.href = "tel:" + CFG.phoneDial.replace(/\s+/g, "");
    });

    [].forEach.call(document.querySelectorAll(".phone-text"), function (el) {
      if (CFG.phoneDisplay) el.textContent = CFG.phoneDisplay;
    });
  }

  /* ------------------------------------------------------------------
     3. En-tête : ombre au défilement + menu mobile
     ------------------------------------------------------------------ */
  var header = document.getElementById("siteHeader");
  var onScroll = function () {
    header.classList.toggle("is-stuck", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var toggle = document.getElementById("navToggle");
  var nav = document.getElementById("primaryNav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ------------------------------------------------------------------
     4. Vidéo de démonstration
     Le fichier n'est pas encore fourni : on teste sa présence au clic.
     Déposez-le dans assets/video/demo.mp4 et le lecteur s'active seul.
     ------------------------------------------------------------------ */
  var frame = document.getElementById("videoFrame");
  var playBtn = document.getElementById("videoPlay");
  var note = document.getElementById("videoNote");

  if (frame && playBtn) {
    playBtn.addEventListener("click", function () {
      var src = frame.getAttribute("data-src");
      var video = document.createElement("video");
      video.setAttribute("controls", "");
      video.setAttribute("playsinline", "");
      video.setAttribute("preload", "auto");
      video.src = src;

      video.addEventListener("error", function () {
        /* Pas de fichier : on remet l'affiche et on invite à demander une démo. */
        frame.style.aspectRatio = "";
        frame.innerHTML = "";
        frame.appendChild(poster);
        frame.appendChild(playBtn);
        if (note) note.hidden = false;
      });

      /* Le cadre épouse le format réel de la vidéo (l'enregistrement actuel est
         en 1920 × 922, pas en 16/9) : sans ça on aurait des bandes noires. */
      video.addEventListener("loadedmetadata", function () {
        if (video.videoWidth && video.videoHeight) {
          frame.style.aspectRatio = video.videoWidth + " / " + video.videoHeight;
        }
      });

      video.addEventListener("loadeddata", function () {
        if (note) note.hidden = true;
        video.play().catch(function () {});
      });

      var poster = frame.querySelector(".video-poster");
      frame.innerHTML = "";
      frame.appendChild(video);
    });
  }

  /* ------------------------------------------------------------------
     5. Formulaire de demande de démonstration
     ------------------------------------------------------------------ */
  var form = document.getElementById("demoForm");
  var status = document.getElementById("formStatus");

  function say(msgKey, kind) {
    status.textContent = t(msgKey, html.getAttribute("lang"));
    status.className = "form-status" + (kind ? " is-" + kind : "");
  }

  function buildMailto(data) {
    var lines = [
      "Nom : " + data.name,
      "Entreprise : " + data.company,
      "Téléphone : " + data.phone,
      "E-mail : " + data.email,
      "Employés : " + data.employees,
      "Sites : " + data.sites,
      "",
      data.message || ""
    ];
    return "mailto:" + (CFG.contactEmail || "contact@marchepro.ma") +
      "?subject=" + encodeURIComponent("Demande de démo Pointage — " + data.company) +
      "&body=" + encodeURIComponent(lines.join("\n"));
  }

  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();

      /* Piège à robots : rempli = on fait semblant d'avoir réussi. */
      if (form.querySelector('[name="_gotcha"]').value) { say("form.ok", "ok"); return; }

      var required = ["f-name", "f-company", "f-phone", "f-email"];
      var invalid = false;
      required.forEach(function (id) {
        var el = document.getElementById(id);
        var bad = !el.value.trim() || (el.type === "email" && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(el.value));
        el.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !invalid) { el.focus(); invalid = true; }
      });
      if (invalid) { say("form.err", "error"); return; }

      var data = {};
      new FormData(form).forEach(function (v, k) { if (k !== "_gotcha") data[k] = v; });
      data.lang = html.getAttribute("lang");
      data.subject = "Demande de démo Pointage — " + data.company;
      /* FormSubmit lit `_subject` ; les autres relais ignorent la clé. */
      data._subject = data.subject;
      data._captcha = "false";
      data._template = "table";

      /* Sans endpoint configuré : repli sur le client mail du visiteur. */
      if (!CFG.formEndpoint) {
        say("form.mailto", "ok");
        window.location.href = buildMailto(data);
        return;
      }

      if (CFG.formAccessKey) data.access_key = CFG.formAccessKey;

      var btn = form.querySelector('button[type="submit"]');
      btn.disabled = true;
      say("form.sending");

      fetch(CFG.formEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(data)
      })
        .then(function (r) {
          if (!r.ok) throw new Error("HTTP " + r.status);
          say("form.ok", "ok");
          form.reset();
        })
        .catch(function () { say("form.fail", "error"); })
        .then(function () { btn.disabled = false; });
    });
  }

  /* ------------------------------------------------------------------
     6. Révélation au défilement + année du copyright
     ------------------------------------------------------------------ */
  var revealables = document.querySelectorAll(
    ".section-head, .card, .compare-col, .step, .uc, .video-wrap, .contact-card, .contact-copy"
  );

  if ("IntersectionObserver" in window) {
    [].forEach.call(revealables, function (el) { el.classList.add("reveal"); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        io.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    [].forEach.call(revealables, function (el) { io.observe(el); });
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();
