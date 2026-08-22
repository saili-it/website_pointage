# Site vitrine Pointage

Site statique de présentation, destiné à `https://pointage.marchepro.ma`.
Pas de build, pas de dépendances : ce sont des fichiers servis tels quels.

```
website/
  index.html            renvoi vers /mobile (la racine n’est pas une page)
  mobile.html           servie sur /mobile — pointage mobile géolocalisé
  pointeuse.html        servie sur /pointeuse — pointeuse + installation + système
  .htaccess             mêmes URLs propres sur un hébergement Apache
  robots.txt
  sitemap.xml
  Dockerfile            image nginx, écoute sur 9090
  docker-compose.yml
  nginx.conf            cache, gzip, en-têtes de sécurité, /healthz
  .dockerignore         exclut les fichiers sources du contexte de build
  assets/
    css/styles.css
    js/config.js        coordonnées de contact et endpoint du formulaire
    js/i18n.js          traductions arabes + titres de page
    js/main.js          langue, menu, vidéo, formulaire
    img/                logo, favicon, visuels app et pointeuses
    video/demo.mp4      vidéo de démonstration
```

## 0. Les deux offres

Le site présente deux solutions, chacune sur sa propre page, à une adresse
courte : **`/mobile`** et **`/pointeuse`**. L’en-tête ne contient plus que la
bascule entre les deux — aucune ancre de section, chaque page se parcourt en
déroulant. La bascule est reprise en pied de page et dans une bande de renvoi
au milieu de chaque page ; le détail des sections reste dans le pied de page.

| Page | Adresse | Offre | Promesse |
| --- | --- | --- | --- |
| `mobile.html` | `/mobile` | **Pointage mobile** | Les employés pointent depuis leur téléphone, dans les zones autorisées. Aucun matériel. |
| `pointeuse.html` | `/pointeuse` | **Pointeuse + système** | Nous fournissons la borne, nos techniciens l'installent, et elle alimente le même logiciel. |

L’en-tête et le pied de page portent en plus un lien sortant **Autres
solutions** vers `https://solutions.marchepro.ma/`, le catalogue MarchePro.
C’est le seul lien du site à quitter le domaine ; il s’ouvre dans un nouvel
onglet et son libellé vit sous la clé `nav.other`.

Les deux formulaires sont identiques, à un champ caché près : `solution` vaut
`Pointage mobile` ou `Pointeuse + système`, ce qui permet de savoir depuis
quelle page la demande a été envoyée.

Les visuels des pointeuses (`assets/img/pointeuse-*.jpg`) ont été découpés dans
les planches produit fournies, puis éclaircis pour que tous les appareils
apparaissent sur le même fond blanc. Pour remplacer un modèle, il suffit de
déposer une photo détourée sur fond blanc au même nom.

## 1. Coordonnées et formulaire

Tout est regroupé dans **`assets/js/config.js`**.

| Clé | Valeur actuelle |
| --- | --- |
| `whatsapp` | `212634593328` — format international **sans `+` ni espaces** |
| `phoneDisplay` / `phoneDial` | `+212 6 34 59 33 28` |
| `contactEmail` | `contact@marchepro.ma` |
| `formEndpoint` | `https://formsubmit.co/ajax/contact@marchepro.ma` — **reste à activer**, voir ci-dessous |

### Réception du formulaire

Un site statique ne peut pas envoyer d'e-mail lui-même : il lui faut un relais.
Le site est configuré avec **FormSubmit**, qui ne demande ni compte ni clé.
Les demandes arrivent sur `contact@marchepro.ma` avec le nom, l'entreprise, le
téléphone, l'e-mail, l'effectif et le nombre de sites.

> #### ⚠️ Une action de votre part est nécessaire, une seule fois
>
> 1. Ouvrez le site et envoyez-vous une demande de test via le formulaire.
> 2. FormSubmit envoie alors un e-mail de confirmation à `contact@marchepro.ma`.
> 3. **Cliquez le lien qu'il contient.**
>
> Tant que ce n'est pas fait, les demandes ne vous sont pas transmises — et le
> visiteur, lui, voit quand même « demande bien reçue ». À faire avant la mise
> en ligne, pas après.

Une fois activé, FormSubmit propose dans votre tableau de bord un identifiant
opaque à utiliser à la place de l'adresse en clair dans l'URL
(`https://formsubmit.co/ajax/<identifiant>`). C'est préférable : ça évite que
l'adresse soit ramassée par les robots dans le code source.

Pour changer de service, remplacez `formEndpoint` dans `config.js` :

| Service | `formEndpoint` | `formAccessKey` |
| --- | --- | --- |
| Web3Forms | `https://api.web3forms.com/submit` | votre clé |
| Formspree | `https://formspree.io/f/VOTRE_ID` | vide |
| *(aucun)* | `""` | — ouvre le client mail du visiteur |

Dans tous les cas, ajoutez le domaine du service à la directive `connect-src`
de la CSP dans [nginx.conf](nginx.conf) — sinon le navigateur bloquera l'envoi.
Les trois services ci-dessus y sont déjà autorisés.

## 2. La vidéo de démonstration

Le fichier est en place : **`assets/video/demo.mp4`** (1920 × 922, 1 min 42 s).
Le cadre s'adapte tout seul au format réel de la vidéo — pas de bandes noires,
et ça reste vrai si vous remplacez le fichier par un autre format.

Si le fichier est absent, le clic affiche « la vidéo arrive bientôt » avec un
lien vers le formulaire : la section reste présentable.

### Ce qui a été fait sur le fichier d'origine

L'enregistrement fourni (`demo vd.mp4`, conservé à la racine) posait trois
problèmes. Le fichier servi les corrige tous les trois :

| | Origine | Servi |
| --- | --- | --- |
| Poids | 92 Mo | **3 Mo** |
| Débit | 7,5 Mbit/s | 244 kbit/s |
| Index `moov` | après les données | en tête (*faststart*) |
| Piste audio | AAC 192 kbit/s, muette | supprimée |
| Résolution | 1920 × 922 | inchangée |

- **Le débit était 30 fois trop élevé** pour une capture d'écran. Réencodé en
  x264 CRF 25 : à l'œil c'est identique, le texte de l'interface reste
  parfaitement lisible.
- **L'index était placé après les données**, donc le navigateur devait
  télécharger tout le fichier avant d'afficher la première image.
- **La piste audio était muette** (volume moyen mesuré à −68,8 dB, soit du
  silence) : 2,4 Mo pour rien. Si vous ajoutez une narration plus tard,
  réencodez sans `-an` et avec `-c:a aac -b:a 96k`.

Commande utilisée, à rejouer si vous refaites l'enregistrement (aucune
installation nécessaire, ffmpeg tourne dans un conteneur) :

```bash
docker run --rm -v "$PWD:/work" -w /work jrottenberg/ffmpeg:6-alpine \
  -i "source.mp4" \
  -c:v libx264 -crf 25 -preset slow -pix_fmt yuv420p -an \
  -movflags +faststart "assets/video/demo.mp4"
```

**Gardez `-movflags +faststart`** : sans lui, la lecture ne démarre qu'une fois
tout le fichier téléchargé.

## 3. Langues

Le site est bilingue **français / arabe**, avec passage automatique en RTL.

- Le français est écrit directement dans les pages HTML : le site reste lisible
  même si le JavaScript ne se charge pas.
- L'arabe vit dans `assets/js/i18n.js`.
- La langue choisie est mémorisée dans le navigateur. `?lang=ar` force l'arabe.

Pour modifier un texte français, éditer la page concernée ; pour l'arabe,
`i18n.js`, en gardant la même clé `data-i18n`.

Le titre et la description de chaque page sont traduits eux aussi. Ils sont
regroupés dans `i18n.js` sous `meta`, indexés par la valeur de l'attribut
`data-page` porté par la balise `<html>` (`mobile` pour `mobile.html`,
`pointeuse` pour `pointeuse.html`). Une nouvelle page a donc besoin de son propre
`data-page` et de l'entrée `meta` correspondante.

> Une même clé `data-i18n` doit porter **le même texte français** partout où
> elle apparaît : le repli français est mémorisé une seule fois par clé, la
> dernière occurrence de la page gagnant. C'est pour ça que le lien « Nos
> modèles » du pied de page utilise `footer.models` et non `nav.models`.

## 4. Déploiement avec Docker (port 9090)

```bash
cd website
docker compose up -d --build     # http://localhost:9090
```

Ou sans compose :

```bash
docker build -t pointage-site:latest .
docker run -d --name pointage-site -p 9090:9090 --restart unless-stopped pointage-site:latest
```

nginx écoute sur **9090 à l'intérieur du conteneur** comme à l'extérieur : pas
de translation de port à retenir, et ça reste juste derrière un reverse proxy.

Ce que la configuration fait pour vous ([nginx.conf](nginx.conf)) :

| | |
| --- | --- |
| Cache | HTML revalidé à chaque visite, CSS/JS 1 jour, images et vidéo 30 jours. Les noms de fichiers ne sont pas versionnés : un cache long sur le HTML vous empêcherait de voir vos propres mises à jour. |
| Compression | gzip sur HTML/CSS/JS/SVG uniquement. Volontairement pas sur MP4 ni PNG : déjà compressés, et gziper une vidéo casse les requêtes par plage. |
| Vidéo | `Accept-Ranges: bytes` — la démo se lit en streaming et reste navigable à la souris (vérifié : `206 Partial Content`). |
| Sécurité | `nosniff`, `X-Frame-Options`, `Referrer-Policy` et une CSP qui autorise Google Fonts et les trois services de formulaire, rien d'autre. |
| Santé | `GET /healthz` → `200 ok`, branché sur le `HEALTHCHECK` Docker. |

Le conteneur tourne en **lecture seule** (`read_only: true`), avec les seuls
répertoires temporaires de nginx montés en tmpfs, et `no-new-privileges`.

Seuls `index.html`, `mobile.html`, `pointeuse.html`, `assets/`, `robots.txt` et
`sitemap.xml` entrent dans l'image. Les fichiers sources restés à la racine (`demo vd.mp4`,
les PNG d'origine) sont exclus par [.dockerignore](.dockerignore) — sans quoi
92 Mo partiraient inutilement vers le démon à chaque build.

> Si vous ajoutez une page, pensez à l'ajouter aussi à la ligne `COPY` du
> [Dockerfile](Dockerfile) : la copie est explicite, page par page.

### Derrière un reverse proxy → https://pointage.marchepro.ma

Le vhost hôte est prêt dans
[deploy/pointage.marchepro.ma.conf](deploy/pointage.marchepro.ma.conf) :

```bash
sudo cp deploy/pointage.marchepro.ma.conf /etc/nginx/sites-available/pointage
sudo ln -s /etc/nginx/sites-available/pointage /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d pointage.marchepro.ma
```

Certbot ajoute lui-même le bloc `443`, les certificats et la redirection
HTTP → HTTPS. Le DNS doit déjà pointer sur le serveur avant de le lancer :
`dig +short pointage.marchepro.ma` doit renvoyer l'IP de la machine.

`nginx.conf` (celui du conteneur) n'a **rien à changer** pour le domaine : son
`server_name` contient déjà `pointage.marchepro.ma` et un `_` attrape-tout, donc
il répond quel que soit le `Host` transmis par le proxy.

### Une fois le HTTPS en place : refermer le 9090

Tant que le compose publie `9090:9090`, le site reste joignable en clair sur
`http://IP:9090`, ce qui contourne le HTTPS et crée un doublon pour Google.
Dans `docker-compose.yml` :

```yaml
    ports:
      - "127.0.0.1:9090:9090"
```

puis `docker compose up -d`. Le proxy y accède toujours, Internet non.
Côté pare-feu, seuls 80 et 443 ont besoin d'être ouverts.

### Mise à jour du site

Les fichiers sont copiés dans l'image, pas montés : après une modification,
il faut reconstruire.

```bash
docker compose up -d --build
```

## 5. Déploiement sans Docker

Téléverser le contenu du dossier `website/` à la racine du sous-domaine.

**Apache / cPanel** — copier les fichiers dans le `public_html` du sous-domaine
`pointage.marchepro.ma`, **`.htaccess` compris** : c’est lui qui sert `/mobile`
et `/pointeuse` sans extension et qui renvoie la racine sur `/mobile`.

**Nginx** :
```nginx
server {
    server_name pointage.marchepro.ma;
    root /var/www/pointage-site;

    location = /           { return 301 /mobile; }
    location = /index.html { return 301 /mobile; }
    location ~ "^/(.+)\.html$" { return 301 /$1; }

    # L’extension implicite : /mobile sert mobile.html.
    location / { try_files $uri $uri.html $uri/ =404; }
}
```

La configuration complète — redirections, cache, en-têtes — est celle du
conteneur, dans [nginx.conf](nginx.conf) ; `.htaccess` en est l’équivalent
Apache. **Les deux doivent rester cohérents.**

Activer HTTPS (Let's Encrypt) : le site est référencé en `https://` dans les
balises canoniques, le sitemap et `robots.txt`.

## 6. Aperçu local

```bash
cd website
python -m http.server 8080     # puis http://localhost:8080
```

Ouvrir directement `index.html` depuis le disque fonctionne aussi : les pages
se lient entre elles en relatif (`mobile.html`, `pointeuse.html`) précisément
pour ça — un lien en `/mobile` pointerait sur la racine du disque. Seules la
vidéo et les polices distantes peuvent être bloquées par le navigateur.

Les adresses courtes `/mobile` et `/pointeuse` ne s’obtiennent qu’avec nginx ou
Apache (voir §4 et §5) ; `python -m http.server` ne connaît pas l’extension
implicite et sert donc `mobile.html`. C’est sans conséquence : sur le serveur,
`mobile.html` est redirigé en 301 vers `/mobile`.

## 7. Référencement (SEO)

### Mots-clés visés

Une page = une intention. Ne pas viser les mêmes requêtes sur les deux pages,
elles se feraient concurrence dans les résultats.

| | `/mobile` | `/pointeuse` |
| --- | --- | --- |
| **Principal** | logiciel de pointage des employés | pointeuse biométrique Maroc |
| | application de pointage GPS | pointeuse empreinte digitale |
| **Secondaires** | pointage à distance, pointage mobile, gestion des présences, suivi des heures de travail, pointage chantier, feuille de temps, export paie | badgeuse, pointeuse reconnaissance faciale, pointeuse badge RFID, contrôle d'accès, installation pointeuse, pointeuse multi-sites |
| **Arabe** | برنامج تسجيل حضور الموظفين | آلة بصمة |

Ces mots sont placés là où ils comptent : `<title>`, `<meta description>`,
le `<h1>`, les `<h2>` et le premier paragraphe. Il n'y a **pas** de balise
`<meta name="keywords">` : Google l'ignore depuis 2009, elle n'apporte rien.

Le titre et la description de chaque page sont écrits à deux endroits — en dur
dans le `<head>` et dans le bloc `meta` de [i18n.js](assets/js/i18n.js), qui
les retraduit au changement de langue. **Les deux doivent rester identiques
en français**, sinon le titre change tout seul au chargement de la page.

### Balisage structuré

Chaque page porte un seul bloc JSON-LD, un `@graph` qui décrit :

| Nœud | Rôle |
| --- | --- |
| `Organization` | L'entreprise, avec le téléphone, l'e-mail et le lien Facebook (`sameAs`). Le même `@id` sur les deux pages : c'est ce qui dit aux moteurs qu'il s'agit d'une seule entité. |
| `WebSite` / `WebPage` | Le site et la page courante, rattachés à l'organisation. |
| `SoftwareApplication` | Page mobile : l'application, avec sa liste de fonctionnalités. |
| `Product` + `Service` | Page pointeuse : le matériel et la prestation d'installation. |
| `FAQPage` | Les questions de la section FAQ, recopiées mot pour mot. |

> Les questions du JSON-LD doivent rester **identiques** au texte visible de la
> section `#faq`. Si vous modifiez une réponse dans la page, modifiez-la aussi
> dans le `<head>`, sinon le balisage devient faux.

À savoir : depuis août 2023, Google ne montre plus les FAQ en résultat enrichi
pour les sites d'entreprise. Le balisage reste utile pour la compréhension du
site et pour Bing, mais il ne fera pas apparaître d'accordéon dans Google.

Les prix ne sont pas déclarés : tout est sur devis, et annoncer `0 MAD`
ferait afficher « gratuit ». Le jour où des tarifs publics existent, les
ajouter dans `offers` rendra la fiche éligible aux résultats enrichis.

### Adresses et exploration

- Une seule adresse canonique par page, `/mobile` et `/pointeuse`, reprise à
  l'identique dans `canonical`, `og:url`, le sitemap et les liens internes.
- `hreflang` `fr` / `ar` / `x-default`. L'arabe n'ayant pas d'URL propre
  (il est rendu côté client), c'est une déclaration de principe : pour un vrai
  référencement en arabe, il faudrait des pages servies séparément.
- [sitemap.xml](sitemap.xml) liste les deux pages avec leur `lastmod` — à
  remettre à jour quand le contenu change vraiment.
- [robots.txt](robots.txt) n'interdit rien : bloquer les redirections
  empêcherait les moteurs de les suivre.

### À faire une fois en ligne

1. **Google Search Console** — ajouter le domaine, vérifier la propriété, y
   soumettre `https://pointage.marchepro.ma/sitemap.xml`. C'est là que se
   lisent les requêtes réelles, qui doivent ensuite guider les mots-clés.
2. **Bing Webmaster Tools** — même chose, l'import depuis Search Console suffit.
3. **Fiche d'établissement Google** — le levier le plus fort pour « pointeuse
   Casablanca » et assimilés. Demande une adresse et une ville réelles.
4. **Facebook** — donner un nom d'utilisateur à la page (`facebook.com/…` au
   lieu de `profile.php?id=…`), puis remplacer le lien dans le pied de page et
   dans `sameAs`. Y publier les liens vers les deux pages.
5. Faire pointer les autres sites MarchePro vers celui-ci, et l'inverse.

## 8. Ce qui reste à faire côté contenu

- [x] Coordonnées renseignées dans `config.js`
- [x] Vidéo en place et compressée (92 Mo → 3 Mo)
- [x] Formulaire branché sur FormSubmit
- [ ] **Activer FormSubmit** : envoyer une demande de test puis cliquer le lien
      de confirmation reçu sur contact@marchepro.ma (voir §1)
- [x] Page « Pointeuse + système » en ligne, avec la gamme, l'installation et
      les tarifs sur devis
- [ ] **Ne pas téléverser** `demo vd.mp4` ni les PNG à la racine : ce sont les
      fichiers sources, ils feraient 93 Mo de doublons en ligne
- [ ] Confirmer la gamme réellement proposée : les six modèles affichés
      viennent des planches produit, à ajuster si le catalogue diffère
- [ ] Ajouter des références clients / logos si vous en avez (rubrique à créer)
- [ ] Vérifier les tarifs annoncés « sur devis » si vous décidez d'afficher des prix
