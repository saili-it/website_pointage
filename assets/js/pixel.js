/* ============================================================================
   Meta Pixel (Facebook).

   L'extrait fourni par Meta est ici, dans un fichier, plutôt qu'en ligne dans
   la page : la CSP du site interdit les scripts en ligne (voir nginx.conf), et
   un fichier servi depuis le site lui-même n'a besoin d'aucune exception.

   L'identifiant vit dans config.js, avec le reste des réglages. Laissé vide,
   rien n'est chargé et aucune requête ne part chez Meta — pensez alors à
   retirer aussi la balise <noscript> du pied des deux pages.
   ========================================================================= */
(function () {
  "use strict";

  var id = (window.POINTAGE_CONFIG || {}).metaPixelId;
  if (!id) return;

  /* Extrait officiel de Meta, repris tel quel. */
  !function (f, b, e, v, n, t, s) {
    if (f.fbq) return; n = f.fbq = function () {
      n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
    };
    if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0';
    n.queue = []; t = b.createElement(e); t.async = !0;
    t.src = v; s = b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t, s);
  }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');

  fbq('init', id);
  fbq('track', 'PageView');
})();
