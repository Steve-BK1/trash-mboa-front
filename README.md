# Trash-Mboa

Trash-Mboa est une application web moderne de gestion des déchets et de signalements environnementaux, pensée pour les citoyens, les collecteurs et les administrateurs. Elle permet de signaler, suivre, collecter et administrer les déchets et incidents environnementaux de manière fluide, accessible et sécurisée.

## 🚀 Présentation

Trash-Mboa vise à moderniser la gestion des déchets et la communication entre citoyens et services de collecte. L'application propose une expérience utilisateur moderne, mobile-first, et intègre les meilleures pratiques UI/UX.

## ✨ Fonctionnalités principales

### 👥 Gestion des utilisateurs
- **Authentification sécurisée** : login/register avec gestion JWT, feedbacks, validation, redirections et middleware Next.js
- **Profils utilisateurs** : photo de profil, informations personnelles, gestion des rôles (USER, COLLECTOR, ADMIN)
- **Tableaux de bord personnalisés** : interface adaptée selon le rôle de l'utilisateur

### 🗑️ Signalement de déchets
- **Formulaire multi-étapes** : wizard avec validation progressive et navigation intuitive
- **Géolocalisation avancée** : auto-détection de position GPS, autocomplétion d'adresses avec extraction automatique de la ville
- **Upload de photos** : intégration Cloudinary avec aperçu et gestion d'erreurs
- **Validation robuste** : Formik + Yup pour une validation côté client complète
- **Gestion des déchets** : édition, suppression, suivi de statut avec filtres avancés

### 🚨 Signalements environnementaux
- **Signalements de problèmes** : déchets abandonnés, poubelles pleines, déchets dangereux, problèmes de collecte
- **Interface unifiée** : même expérience utilisateur que les déchets avec wizard multi-étapes
- **Suivi complet** : historique, statuts, géolocalisation

### 🚚 Collectes (pour les collecteurs)
- **Visualisation des collectes** : liste + carte interactive avec marqueurs colorés
- **Validation des collectes** : interface dédiée pour marquer les collectes comme terminées
- **Historique des collectes** : suivi des collectes validées avec graphiques
- **Alertes intelligentes** : collectes urgentes (>24h) et déchets dangereux
- **Filtres avancés** : par ville, type, statut, recherche

### 👨‍💼 Administration
- **Gestion des utilisateurs** : création, modification, suppression avec confirmation
- **Gestion des rôles** : attribution des rôles USER, COLLECTOR, ADMIN
- **Upload de photos** : gestion des photos de profil avec Cloudinary
- **Feedbacks et logs** : notifications, toasts, gestion d'erreurs détaillée

### 🎨 Interface utilisateur moderne
- **Design system cohérent** : basé sur Radix UI et Tailwind CSS
- **Composants accessibles** : Select, AlertDialog, Drawer, Form, etc.
- **Navigation fluide** : sidebar responsive, breadcrumbs, navigation sans rechargement
- **Feedbacks utilisateur** : toasts, loaders, messages d'erreur contextuels
- **Responsive design** : optimisé mobile, tablette et desktop

## 🛠️ Technologies utilisées

### Frontend
- **Next.js 15** : App Router, Middleware, Server Components
- **React 19** : Hooks, Context, Suspense
- **TypeScript** : typage strict pour une meilleure maintenabilité

### Gestion des formulaires & validation
- **Formik** : gestion d'état des formulaires complexes
- **Yup** : validation de schémas robuste
- **React Hook Form** : performance optimisée pour les formulaires simples

### UI/UX
- **Radix UI** : composants primitifs accessibles
- **Tailwind CSS** : design system et responsive design
- **Framer Motion** : animations fluides et transitions
- **Lucide React** : icônes modernes et cohérentes

### Gestion des données
- **TanStack Query** : cache intelligent, synchronisation, optimisations
- **Zustand** : état global léger et performant
- **React Query DevTools** : debugging avancé

### Services externes
- **Cloudinary** : upload et optimisation d'images
- **OpenStreetMap** : cartes et géolocalisation
- **ORS API** : autocomplétion d'adresses

### Cartographie
- **Leaflet** : cartes interactives
- **React-Leaflet** : intégration React
- **Géolocalisation native** : API du navigateur

### Notifications & feedback
- **Sonner** : toasts modernes et accessibles
- **React Hot Toast** : notifications contextuelles

## 📝 Installation

### Prérequis
- Node.js 18+ 
- pnpm, yarn ou npm
- Git

### 1. Cloner le dépôt

```bash
git clone https://github.com/AlfredLandry1/trash-boa-front.git
cd trash-boa-front
```

### 2. Installer les dépendances

```bash
pnpm install
# ou
yarn install
# ou
npm install
```

### 3. Configuration des variables d'environnement

Créer un fichier `.env.local` à la racine du projet :

```env
# API Backend
NEXT_PUBLIC_API_URL=http://localhost:3002

# Cloudinary (optionnel pour le développement)
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset

# Autres configurations
NEXT_PUBLIC_APP_NAME=Trash Mboa
```

### 4. Lancer le serveur de développement

```bash
pnpm dev
# ou
yarn dev
# ou
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 🎯 Avantages du système

### 🔐 Sécurité
- **Authentification JWT** : tokens sécurisés avec refresh automatique
- **Middleware Next.js** : protection des routes sensibles
- **Validation multi-niveaux** : client + serveur
- **Gestion d'erreurs** : feedback contextuel et sécurisé

### ♿ Accessibilité
- **WCAG 2.1** : navigation clavier, lecteurs d'écran, contraste
- **ARIA labels** : descriptions pour les composants complexes
- **Focus management** : navigation logique et visible
- **Responsive** : adapté à tous les écrans

### 🚀 Performance
- **React Query** : cache intelligent et synchronisation
- **Code splitting** : chargement à la demande
- **Optimisation des images** : Cloudinary avec formats modernes
- **Bundle optimization** : Tree shaking et lazy loading

### 🎨 Expérience utilisateur
- **Design system cohérent** : composants réutilisables
- **Feedback instantané** : toasts, loaders, validations
- **Navigation fluide** : SPA sans rechargement
- **Formulaires intelligents** : auto-sauvegarde, validation progressive

## 📦 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── dashboard/         # Tableaux de bord par rôle
│   ├── login/            # Authentification
│   └── register/         # Inscription
├── components/            # Composants réutilisables
│   ├── ui/              # Composants UI de base
│   ├── auth/            # Composants d'authentification
│   ├── dashboard/       # Composants spécifiques dashboard
│   └── layout/          # Composants de mise en page
├── hooks/               # Hooks personnalisés
│   ├── use-*-api.ts    # Hooks pour les APIs
│   └── use-*.ts        # Hooks utilitaires
├── lib/                 # Utilitaires et configurations
│   ├── api-*.ts        # Clients API
│   ├── auth.ts         # Logique d'authentification
│   └── utils.ts        # Fonctions utilitaires
├── store/              # Gestion d'état global
│   └── auth-store-*.ts # Stores d'authentification
└── types/              # Définitions TypeScript
```

## 🔧 Scripts disponibles

```bash
# Développement
pnpm dev              # Serveur de développement
pnpm build            # Build de production
pnpm start            # Serveur de production
pnpm lint             # Vérification du code
pnpm type-check       # Vérification TypeScript

# Tests (à implémenter)
pnpm test             # Tests unitaires
pnpm test:e2e         # Tests end-to-end
```

## 🧪 Comptes de test

L'application inclut des comptes de test pour chaque rôle :

- **Admin** : `admin@trashmboa.com` / `password123`
- **Collecteur** : `collector@trashmboa.com` / `password123`
- **Utilisateur** : `user@trashmboa.com` / `password123`

## 📱 Compatibilité

- **Navigateurs** : Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- **Mobile** : iOS 12+, Android 8+
- **Écrans** : 320px - 4K (responsive design)

## 🤝 Contribution

Les contributions sont les bienvenues ! Voici comment contribuer :

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

### Standards de code
- **TypeScript strict** : typage complet
- **ESLint + Prettier** : formatage automatique
- **Conventional Commits** : messages de commit standardisés
- **Tests** : couverture de code (à implémenter)

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 📞 Contact

- **GitHub** : [AlfredLandry1](https://github.com/AlfredLandry1)
- **Projet** : [trash-boa-front](https://github.com/AlfredLandry1/trash-boa-front)

---

**Trash-Mboa** - Moderniser la gestion des déchets pour un avenir plus propre 🌱
