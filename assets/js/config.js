/* ============================================================================
   LE SEUL FICHIER À MODIFIER AVANT LA MISE EN LIGNE.
   Remplacez les valeurs ci-dessous par vos vraies coordonnées.
   ========================================================================= */

window.POINTAGE_CONFIG = {

  /* Numéro WhatsApp, format international SANS "+" ni espaces.
     Exemple pour +212 6 12 34 56 78  →  "212612345678" */
  whatsapp: "212634593328",

  /* Message pré-rempli quand le prospect ouvre WhatsApp. */
  whatsappMessage: {
    fr: "Bonjour, je souhaite une démonstration de Pointage pour mon entreprise.",
    ar: "مرحباً، أرغب في عرض توضيحي لتطبيق Pointage لشركتي."
  },

  /* Numéro affiché sur le site + utilisé pour le lien "appeler". */
  phoneDisplay: "+212 6 34 59 33 28",
  phoneDial: "+212634593328",

  /* Envoi du formulaire.
     Un site statique ne peut pas envoyer d'e-mail lui-même : il faut un relais.

     Configuré ici avec FormSubmit, qui ne demande ni compte ni clé — les
     demandes arrivent directement sur l'adresse ci-dessous.

     ⚠️ ACTIVATION : à la toute première demande envoyée, FormSubmit expédie
     un e-mail de confirmation à contact@marchepro.ma. Tant que le lien qu'il
     contient n'est pas cliqué, les demandes suivantes ne sont PAS transmises.
     Envoyez-vous donc un test depuis le site, puis confirmez.

     Pour changer de service :
       Web3Forms → "https://api.web3forms.com/submit" + formAccessKey
       Formspree → "https://formspree.io/f/VOTRE_ID"  + formAccessKey vide
     Dans les deux cas, pensez à ajouter le domaine à la directive
     `connect-src` de la CSP, dans nginx.conf.

     Laissez "" pour revenir au repli mailto: (ouvre le logiciel de
     messagerie du visiteur, pré-rempli). */
  formEndpoint: "https://formsubmit.co/ajax/contact@marchepro.ma",
  formAccessKey: "",

  /* Adresse de repli si formEndpoint est vide. */
  contactEmail: "contact@marchepro.ma"
};
