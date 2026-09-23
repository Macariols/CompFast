---
name: Mercado Retail Dynamic
colors:
  surface: '#fbf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fbf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae8e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#4b4731'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0f0'
  outline: '#7c775f'
  outline-variant: '#cdc7aa'
  surface-tint: '#6a5f00'
  primary: '#6a5f00'
  on-primary: '#ffffff'
  primary-container: '#ffe600'
  on-primary-container: '#726600'
  inverse-primary: '#dec800'
  secondary: '#0058bb'
  on-secondary: '#ffffff'
  secondary-container: '#1171e7'
  on-secondary-container: '#fefcff'
  tertiary: '#006d32'
  on-tertiary: '#ffffff'
  tertiary-container: '#7bff9d'
  on-tertiary-container: '#007637'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#fde400'
  primary-fixed-dim: '#dec800'
  on-primary-fixed: '#201c00'
  on-primary-fixed-variant: '#504700'
  secondary-fixed: '#d8e2ff'
  secondary-fixed-dim: '#adc6ff'
  on-secondary-fixed: '#001a41'
  on-secondary-fixed-variant: '#004493'
  tertiary-fixed: '#78fc9b'
  tertiary-fixed-dim: '#5adf81'
  on-tertiary-fixed: '#00210b'
  on-tertiary-fixed-variant: '#005224'
  background: '#fbf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
typography:
  display-lg:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '700'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-md:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 26px
  headline-sm:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 22px
  price-hero:
    fontFamily: Inter
    fontSize: 36px
    fontWeight: '300'
    lineHeight: 40px
    letterSpacing: -0.01em
  price-card:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '400'
    lineHeight: 28px
  price-fraction:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 14px
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
  badge:
    fontFamily: Inter
    fontSize: 11px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-2xs: 0.125rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
---

## Brand & Style

This design system draws inspiration from dynamic Latin American marketplace leaders, delivering an approachable, high-velocity, and utility-driven e-commerce experience. The aesthetic balances intense commercial urgency with uncompromising clarity, legibility, and transactional confidence.

- **Brand Personality:** Accessible, trustworthy, pragmatic, energetic, and value-oriented.
- **Target Audience:** Broad consumer demographic and high-volume merchant sellers seeking frictionless discovery, immediate price transparency, and dependable logistical tracking.
- **Visual Style:** Modern Utility Marketplace. The interface relies on a signature high-energy yellow header/brand anchor, pristine white content containers, subtle architectural separation, and purposeful semantic accents (action blue, logistics green, and urgency red).

## Colors

The palette establishes immediate recognition while strictly isolating functional responsibilities to prevent cognitive fatigue.

- **Primary Brand Yellow (`#FFE600` / `#FFF159` tint):** Reserved for high-level navigational anchors, top navigation bars, key banners, and prime brand accents. Never used for destructive states or body text.
- **Interactive Blue (`#3483FA`):** Dedicated to primary transactional buttons ("Comprar agora"), inline text links, navigation tab active indicators, and focal interactive elements.
- **Fulfillment & Offer Green (`#00A650`):** Communicates customer value, including discount percentages ("30% OFF"), free shipping markers ("Frete grátis"), and positive transactional statuses ("Pago", "Entregue").
- **Urgency & Alert Red (`#D93025`):** Reserved for flash offers ("PROMOÇÃO DO DIA"), stock depletion warnings, countdown clocks, and negative operational statuses ("Cancelado").
- **Neutrals & Surfaces:**
  - Background Canvas: `#EDEDED` or `#F5F5F5` provides soft contrast against pure white cards.
  - Surface Containers: Pure `#FFFFFF` for product tiles, forms, and admin modules.
  - Text Primary: `#333333` ensures accessible reading contrast without the harshness of pure black.
  - Text Secondary: `#666666` for metadata, shipping subtexts, and secondary labels.
  - Borders & Hairlines: `#E6E6E6` for crisp component segmentation.

## Typography

Typography centers on **Inter**, prioritizing rapid scanability, tabular numerical alignment, and localized currency readability.

- **Currency Formatting:** Monetary figures use split visual hierarchy. The currency symbol (`R$`) and integer values retain baseline scale, while cents/fractions appear as elevated superscript or reduced scale (`price-fraction`), minimizing cognitive friction during rapid comparative shopping.
- **Weights & Hierarchy:** Regular (`400`) handles body copy, descriptions, and standard pricing. Semi-bold (`600`) anchors item headers and form controls. Bold (`700`) is preserved strictly for actionable badges, percentage reductions, and high-impact promo banners.

## Layout & Spacing

The layout model is anchored by a fixed-width grid with responsive fluid scaling:
- **Breakpoints:** Mobile (`< 768px`), Tablet (`768px – 1023px`), Desktop (`1024px – 1280px`), Wide Desktop (`> 1280px`). Max container width is clamped at `1200px` for catalog discovery and content views.
- **Grid Architecture:** 12-column grid on desktop with `1.5rem` (24px) gutters; 4-column grid on mobile with `1rem` (16px) gutters.
- **Rhythm:** An 8pt spatial grid regulates component layouts (`space-xs` to `space-2xl`), while a 4pt micro-step (`space-2xs`) controls micro-alignments such as price superscripts, inline tags, and compact table cells.

## Elevation & Depth

Visual hierarchy uses flat surfaces atop a cool neutral canvas (`#EDEDED`), supplemented by delicate ambient shadows:

- **Level 0 (Flat Canvas):** Neutral `#EDEDED` base for global backgrounds.
- **Level 1 (Card & Content Surface):** `#FFFFFF` surfaces with a 1px border (`#E6E6E6`) or an ambient drop shadow: `0 1px 2px 0 rgba(0, 0, 0, 0.08)`. Used for product listing cards, feed feeds, and standard data widgets.
- **Level 2 (Interactive Hover & Elevated Tiles):** Elevated on mouse-hover or active state: `0 4px 12px 0 rgba(0, 0, 0, 0.12)`, combined with an ultra-light border shift (`#D9D9D9`).
- **Level 3 (Overlays & Dropdowns):** Floating filters, checkout sheets, and autocomplete drawers: `0 8px 24px -4px rgba(0, 0, 0, 0.16)`.

## Shapes

The design system maintains a balanced, practical curvature profile (`Soft` / level `1`):

- **Default Corners (`4px` / `0.25rem`):** Applied to product cards, input fields, admin tables, square product imagery, and primary/secondary button containers.
- **Large Corners (`8px` / `0.5rem`):** Reserved for elevated modals, checkout panels, and promo spotlight containers.
- **Pill Badges (`9999px`):** Reserved solely for commercial incentive pills ("30% OFF", "FRETE GRÁTIS", "PROMOÇÃO DO DIA") and status indicator chips.

## Components

### Buttons
- **Primary Transactional:** Solid `#3483FA` background, `#FFFFFF` text, `4px` border radius, `44px` minimum height, semi-bold typography. Hover state darkens to `#2968C8`.
- **Secondary Action:** Light tint background (`rgba(52, 131, 250, 0.1)`), `#3483FA` text, no border. Used for "Adicionar ao carrinho".
- **Tertiary / Outline:** Transparent background, `1px` solid `#3483FA` border, `#3483FA` text.

### Product & Promo Badges
- **Discount Percentage:** Text color `#00A650`, transparent background or tinted light green (`rgba(0, 166, 80, 0.1)`), bold uppercase styling (e.g., `30% OFF`).
- **Lightning / Daily Deal:** Solid `#D93025` background, `#FFFFFF` text, bold `10px` uppercase text with `0.5rem` horizontal padding.
- **Fulfillment / Logistics:** `#00A650` text with lightning bolt or truck iconography, indicating "Frete grátis" or full platform shipping.

### Input Fields & Search
- **Global Header Search:** Embedded within the `#FFE600` header. Large `40px` height white bar with subtle inset shadow, `#333333` text, placeholder `#999999`, right-aligned icon search trigger with vertical divider.
- **Standard Form Fields:** White surface, `1px` border in `#CCCCCC`, `4px` radius. Focus ring: `2px` solid `#3483FA` without offset.

### Product Cards
- Contained within `#FFFFFF` background with `1px` border `#E6E6E6` and `4px` radius.
- Includes a dedicated 1:1 aspect ratio image frame, title clamped to 2 lines, prominent price grouping (`R$` + integer + decimal), green logistics text beneath, and a heart favorite button positioned top-right.

### Admin Table & Status Badges
- **Table Structure:** Pure white container, `#F8F9FA` header row with bold muted labels (`#666666`), `1px` bottom borders (`#EEEEEE`), row hover tint `#F5F8FF`.
- **Order Status Badges:**
  - *Pago*: Background `rgba(0, 166, 80, 0.15)`, text `#008A42`.
  - *Pendente*: Background `rgba(255, 170, 0, 0.15)`, text `#B27B00`.
  - *Preparando*: Background `rgba(52, 131, 250, 0.15)`, text `#2060C0`.
  - *Entregue*: Background `#E6F7EE`, text `#00A650`, border `1px` solid `#B3E6CA`.
  - *Cancelado*: Background `rgba(217, 48, 37, 0.12)`, text `#D93025`.