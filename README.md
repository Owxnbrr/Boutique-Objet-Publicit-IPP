# Boutique Objets Publicitaires – IPPCom

Boutique web de **goodies & objets publicitaires personnalisés** : catalogue, catégories, fiches produits (variantes), panier/commandes et espace client.  
> Projet pédagogique – boutique d’objets publicitaires pour l’IPP.

## 🔗 Démo
- Site (Netlify) : https://ippcom-goodies.netlify.app/
- Repo : https://github.com/Owxnbrr/Boutique-Objet-Publicit-IPP

---

## ✨ Fonctionnalités

### 🏠 Vitrine & navigation
- Page d’accueil avec mise en avant de produits / sélections.
- Navigation : **Catalogue**, **Catégories**, **Connexion**.

### 🛍️ Catalogue produits
- Listing des produits avec **pagination**.
- Filtrage par **catégorie** (ex : COOL 2025, OUTLET, Online Exclusives, etc.).
- Fiche produit : galerie, catégorie, **variantes**, sélection de quantité.

### 🧺 Panier & commandes
- Ajout au panier depuis la fiche produit.
- Suivi des commandes via tableau de bord (selon configuration/roles).

### 🧾 Demande de devis
- Demande de devis depuis le site (formulaire intégré au parcours produit).

### 👤 Auth (espace client / admin)
- Connexion / inscription.
- Mot de passe oublié (selon configuration).

### 🔒 Données & services
- Persistance via **Supabase** (auth + base de données).
- Paiement **Stripe** (si activé / configuré).
- Politique cookies & confidentialité (RGPD-friendly).

---

## 🧰 Stack technique
- **Next.js** (App Router)
- **React**
- **TypeScript**
- **Supabase** (auth + base de données)
- Déploiement : **Netlify**

---

## 🚀 Prérequis
- **Node.js ≥ 18**
- npm (ou pnpm / yarn)
- Un projet **Supabase** (URL + clé `anon` au minimum)

---

## ⚙️ Installation

```bash
# 1) Cloner
git clone https://github.com/Owxnbrr/Boutique-Objet-Publicit-IPP.git
cd Boutique-Objet-Publicit-IPP

# 2) Installer
npm install

# 3) Lancer en dev
npm run dev
