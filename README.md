# Boutique Objet Publicité – IPP

Application web de boutique d’objets publicitaires réalisée avec **Next.js** et **TypeScript**.  
Le projet propose une interface pour présenter un catalogue de produits, gérer les commandes
et administrer le contenu via un tableau de bord.

> Projet pédagogique – boutique d’objets publicitaires pour l’IPP.

---

## ✨ Fonctionnalités

- 🛍️ **Catalogue produits**
  - Listing des objets publicitaires (images, descriptions, prix, catégories).
- 🧺 **Gestion des commandes**
  - Création de commandes à partir des produits.
  - Suivi des dernières commandes sur le dashboard.
- 👤 **Espace client / admin**
  - Tableau de bord avec vue synthétique (dernières commandes, stats, etc.).
- 💾 **Persistance des données avec Supabase**
  - Base de données hébergée.
- 📱 **Interface responsive**
  - Adaptation sur desktop, tablette et mobile.
    
---

## 🧰 Stack technique

- [Next.js](https://nextjs.org/) (App Router)
- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Supabase](https://supabase.com/) pour la base de données 
- CSS via `globals.css`

---

## 🚀 Prérequis

- **Node.js** ≥ 18  
- **npm** (ou `pnpm` / `yarn` si tu modifies les commandes)
- Un projet **Supabase** (URL + clé `anon` au minimum)

---

## ⚙️ Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/Owxnbrr/Boutique-Objet-Publicit-IPP.git
cd Boutique-Objet-Publicit-IPP

# 2. Installer les dépendances
npm install

# 3. Lancer le serveur de dev
npm run dev
