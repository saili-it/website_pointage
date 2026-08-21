# Site vitrine Pointage

Site statique de présentation, destiné à `https://pointage.marchepro.ma`.
Pas de build, pas de dépendances : ce sont des fichiers servis tels quels.

```
website/
  index.html
  robots.txt
  sitemap.xml
  Dockerfile            image nginx, écoute sur 9090
  docker-compose.yml
  nginx.conf            cache, gzip, en-têtes de sécurité, /healthz
  .dockerignore         exclut les fichiers sources du contexte de build
  assets/
    css/styles.css
    js/config.js        coordonnées de contact et endpoint du formulaire
    js/i18n.js          traductions arabes
    js/main.js          langue, menu, vidéo, formulaire
    img/                logo, favicon, visuel de l'application
    video/demo.mp4      vidéo de démonstration
```

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

- Le français est écrit directement dans `index.html` : le site reste lisible
  même si le JavaScript ne se charge pas.
- L'arabe vit dans `assets/js/i18n.js`.
- La langue choisie est mémorisée dans le navigateur. `?lang=ar` force l'arabe.

Pour modifier un texte français, éditer `index.html` ; pour l'arabe,
`i18n.js`, en gardant la même clé `data-i18n`.

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

Seuls `index.html`, `assets/`, `robots.txt` et `sitemap.xml` entrent dans
l'image. Les fichiers sources restés à la racine (`demo vd.mp4`, le PNG
d'origine) sont exclus par [.dockerignore](.dockerignore) — sans quoi 92 Mo
partiraient inutilement vers le démon à chaque build.

### Derrière un reverse proxy

Pour servir `https://pointage.marchepro.ma` avec nginx sur l'hôte :

```nginx
server {
    server_name pointage.marchepro.ma;
    location / {
        proxy_pass http://127.0.0.1:9090;
        proxy_set_header Host              $host;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Puis `certbot --nginx -d pointage.marchepro.ma` pour le HTTPS.

### Mise à jour du site

Les fichiers sont copiés dans l'image, pas montés : après une modification,
il faut reconstruire.

```bash
docker compose up -d --build
```

## 5. Déploiement sans Docker

Téléverser le contenu du dossier `website/` à la racine du sous-domaine.

**Apache / cPanel** — copier les fichiers dans le `public_html` du sous-domaine
`pointage.marchepro.ma`. Rien d'autre : il n'y a ni routage, ni `.htaccess`
nécessaire.

**Nginx** :
```nginx
server {
    server_name pointage.marchepro.ma;
    root /var/www/pointage-site;
    index index.html;
    location / { try_files $uri $uri/ =404; }
}
```

Activer HTTPS (Let's Encrypt) : le site est référencé en `https://` dans les
balises canoniques, le sitemap et `robots.txt`.

## 6. Aperçu local

```bash
cd website
python -m http.server 8080     # puis http://localhost:8080
```

Ouvrir directement `index.html` depuis le disque fonctionne aussi, à ceci près
que la vidéo et les polices distantes peuvent être bloquées par le navigateur.

## 7. Ce qui reste à faire côté contenu

- [x] Coordonnées renseignées dans `config.js`
- [x] Vidéo en place et compressée (92 Mo → 3 Mo)
- [x] Formulaire branché sur FormSubmit
- [ ] **Activer FormSubmit** : envoyer une demande de test puis cliquer le lien
      de confirmation reçu sur contact@marchepro.ma (voir §1)
- [ ] **Ne pas téléverser** `demo vd.mp4` ni le PNG à la racine : ce sont les
      fichiers sources, ils feraient 93 Mo de doublons en ligne
- [ ] Ajouter des références clients / logos si vous en avez (rubrique à créer)
- [ ] Vérifier les tarifs annoncés « sur devis » si vous décidez d'afficher des prix
