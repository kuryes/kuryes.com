# Kuryes.com - Kuryelerin Platformu

A modern, static website for Turkey's transparent courier platform. Built with HTML, TailwindCSS, and Vanilla JavaScript.

## 🚀 Features

- **Static & Fast**: No database, optimized for speed
- **SEO Optimized**: Meta tags, OpenGraph, structured data
- **PWA Ready**: Service worker, manifest, offline support
- **Responsive Design**: Mobile-first approach
- **Glassmorphism UI**: Modern, clean design with glass effects
- **Dynamic Favicon**: Color cycling every 30 seconds
- **Form Integration**: Formspree integration for all forms
- **Telegram Integration**: Forum with Telegram embed

## 📁 Project Structure

```
kuryes.com/
├── index.html              # Main landing page
├── kurye-tabani.html       # Courier registration
├── freelance.html          # Find courier (demo)
├── rehber.html            # Guides and documentation
├── ilanlar.html           # Job listings
├── forum.html             # Telegram forum
├── kazanc.html            # Earnings calculator
├── css/
│   └── styles.css         # Custom styles
├── js/
│   └── app.js             # Main JavaScript
├── public/
│   ├── img/               # Images and assets
│   └── favicon/           # Dynamic favicon set
├── manifest.json          # PWA manifest
├── service-worker.js      # PWA service worker
└── README.md              # This file
```

## 🎨 Design System

### Colors
- **Primary Red**: #FF3131 (logo/CTA)
- **Accent Turquoise**: #00C8FF (links/outline)
- **Support Yellow**: #FFD60A (icons/badges)
- **Support Orange**: #FF7A00 (icons/badges)
- **Background**: #F8FBFD
- **Text**: #1C1C1C
- **Muted**: #6F6F6F

### Typography
- **Primary**: Poppins (headings)
- **Secondary**: Inter (body text)

## 🔧 Setup Instructions

1. **Clone/Download** the project files
2. **Replace Formspree IDs** in forms:
   - `FORMSPREE_ID_KUR` in kurye-tabani.html
   - `FORMSPREE_ID_GONDER` in freelance.html
   - `FORMSPREE_ID_ILAN` in ilanlar.html
3. **Add Images**:
   - Replace placeholder images in `/public/img/`
   - Add favicon files in `/public/favicon/`
4. **Deploy** to Netlify/Vercel or any static hosting

## 📱 Pages Overview

### 🏠 Index (index.html)
- Hero section with CTA buttons
- City cards (All cities active, Antalya has "Lansman" badge, others show "2026")
- Info cards (Rehber, İş İlanları, Forum)
- Live stats counter

### 👤 KuryeTabanı (kurye-tabani.html)
- Single form for courier registration
- Platform preferences (checkboxes)
- Document upload (optional)
- Formspree integration

### 🚚 Freelance (freelance.html)
- Demo courier finding interface
- Address inputs with map integration
- Photo upload with retention notice
- Price calculator (demo)
- WhatsApp integration

### 📚 Rehber (rehber.html)
- Required documents list
- P1 certificate guide
- Prohibited items list
- Tax/accounting guide

### 💼 İş İlanları (ilanlar.html)
- Filterable job listings
- Empty state with CTA
- Add job modal with form
- Formspree integration

### 💬 Forum (forum.html)
- Telegram embed integration
- City-specific rooms
- Rules and guidelines
- Community features

### 💰 Kazanç (kazanc.html)
- Earnings calculator
- Deduction simulator
- Interactive sliders
- Real-time calculations

## 🛠 Technical Features

### JavaScript (app.js)
- **Dynamic Favicon**: Color cycling (Red → Yellow → Orange → Turquoise)
- **City Selector**: localStorage-based city management
- **Price Calculator**: Haversine formula for distance calculation
- **Form Handler**: Formspree integration
- **Mobile Menu**: Responsive navigation

### CSS (styles.css)
- **Glassmorphism**: Backdrop blur effects
- **Custom Animations**: Fade, slide, pulse effects
- **Responsive Design**: Mobile-first approach
- **Accessibility**: Focus states, reduced motion support
- **Print Styles**: Optimized for printing

### PWA Features
- **Service Worker**: Caching strategy
- **Manifest**: App-like experience
- **Offline Support**: Basic offline functionality
- **Install Prompt**: Add to home screen

## 🔗 Integrations

- **Formspree**: Form submissions
- **Telegram**: Forum integration
- **Google Maps**: Address selection (placeholder)
- **WhatsApp**: Direct messaging

## 📊 SEO Features

- Meta tags for all pages
- OpenGraph images
- Structured data
- Sitemap ready
- Mobile-optimized

## 🚀 Deployment

The project is ready for deployment on:
- **Netlify**: Drag & drop or Git integration
- **Vercel**: Git integration
- **GitHub Pages**: Static hosting
- **Any static hosting**: Upload files

## 📝 TODO Items

- [ ] Replace `FORMSPREE_ID_*` with actual Formspree form IDs
- [ ] Add actual favicon files (PNG format)
- [ ] Add OpenGraph image (1200x630 PNG)
- [ ] Configure Telegram group URLs
- [ ] Add Google Maps API key (optional)
- [ ] Test all forms and integrations

## 🎯 Performance Targets

- **Lighthouse Mobile Score**: ≥ 90
- **First Contentful Paint**: < 2s
- **Largest Contentful Paint**: < 2.5s
- **Cumulative Layout Shift**: < 0.1

## 📞 Support

For technical support or questions:
- **Infrastructure**: Kaysia.co
- **Project**: Kuryes.com

---

**© 2025 Kuryes — Altyapı: Kaysia.co**
