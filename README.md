# Emory Woods Apartments

Marketing website for Emory Woods Apartments — a 24-acre wooded residential community in Decatur, Georgia, minutes from Emory University.

## Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + CSS custom properties
- **Animation**: Framer Motion
- **Maps**: Leaflet / React Leaflet
- **Package Manager**: Yarn

## Pages

| Route | Description |
|---|---|
| `/` | Home — hero, amenities, floor plans, neighborhood, contact |
| `/photo-gallery` | Photo gallery with category filters and lightbox |
| `/listings` | Available unit listings |
| `/listings/[slug]` | Individual listing detail |

## Getting Started

```bash
yarn install
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---|---|
| `yarn dev` | Start development server |
| `yarn build` | Production build |
| `yarn start` | Start production server |
| `yarn lint` | Run ESLint |

## Project Structure

```
src/
  app/
    page.tsx              # Home page
    layout.tsx            # Root layout (fonts, metadata)
    globals.css           # Global styles + CSS variables
    photo-gallery/        # Photo gallery page
    listings/             # Listings pages
    api/contact/          # Contact form API route
  components/
    ScrollHero.tsx        # Full-screen scroll hero
    FloorPlansSection.tsx # Floor plan cards with tilt effect
    AmenitiesSection.tsx  # Amenities grid
    NeighborhoodSection.tsx
    AboutSection.tsx
    ContactSection.tsx    # Contact form + info
    SiteFooter.tsx
    ImageLightbox.tsx     # Portal-based image lightbox
    ListingsMap.tsx       # Leaflet map
    SideDots.tsx          # Scroll position indicator
    ThemeProvider.tsx     # Dark/light theme context
    ThemeToggle.tsx       # Theme toggle button
public/
  LogoWhite.png
  LogoBlack.png
  studio_render.png       # Floor plan renders
  2bedroom_render.png
  3bedroom_render.png
  studio_01-05.png        # Gallery photos
  2bedroom_01-04.png
  3bedroom_01-05.png
```

## Contact

- **Phone**: (404) 634-3777
- **Fax**: (404) 634-9694
- **Email**: leasing@emorywoods.com
- **Address**: 2085 Powell Ln, Decatur, GA 30033
