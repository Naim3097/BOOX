# Design System Analysis & Implementation Plan

## Reference Analysis (Based on provided image)
The reference image showcases a "Modern Dashboard" aesthetic characterized by:

### 1. Visual Language
- **"Soft & Airy"**: High usage of whitespace, light gray backgrounds (`#F3F4F6` or similar), and pure white cards.
- **"Organic Geometry"**: Heavy use of large border radii. Cards are not just rounded, they are `rounded-3xl` (approx 24px-32px). Buttons and inputs are often pill-shaped (`rounded-full`).
- **"Minimalist Typography"**: Clean, geometric sans-serif font. Headings are bold but approachable.
- **"Floating Elements"**: Cards have subtle, soft shadows rather than harsh borders.

### 2. Key UI Elements
- **Sidebar**: Minimalist, often just icons or clean text with generous padding.
- **Cards**: White background, `rounded-3xl`, soft shadow, ample internal padding (p-6 or p-8).
- **Inputs/Search**: Pill-shaped (`rounded-full`), light background or white with border.
- **Navigation**: Tab-like pills for sub-navigation (e.g., "Today", "Tomorrow").

## Implementation Plan for "One X"

### 1. Typography: "Futuristic & Digital"
To achieve the "minimal, futuristic, digitalise" feel requested:
- **Font Family**: **'Outfit'** (Google Font). It is a geometric sans-serif that feels modern, tech-forward, and clean.
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 700 (Bold).

### 2. Shape System
- **Cards/Containers**: `rounded-3xl` (24px) for main content blocks.
- **Buttons/Inputs**: `rounded-full` (9999px) for interactive elements.
- **Active States**: High contrast (Black background, White text) for active states to match the brand.

### 3. Color Palette (One X Brand)
- **Primary**: Black (`#000000`) - Used for primary buttons, active states, main headings.
- **Accent**: Red (`#DC2626` / `red-600`) - Used for alerts, notifications, or subtle highlights.
- **Background**: Light Gray (`#F8FAFC` / `slate-50`) - Main app background.
- **Surface**: White (`#FFFFFF`) - Card backgrounds.
- **Text**:
    - Headings: Black
    - Body: Slate-500 / Gray-500

### 4. Component Updates
- **Admin Dashboard**:
    - Convert grid layout to use "Bento Box" style cards.
    - Update Sidebar to be cleaner (floating or full height with soft edges).
    - Apply `Outfit` font globally.
- **Booking Wizard**:
    - Update form inputs to be pill-shaped.
    - Update step indicators to be more minimal.

---

## Action Items
1.  [ ] Import 'Outfit' font in `index.html`.
2.  [ ] Configure Tailwind to use 'Outfit' and extend border-radius.
3.  [ ] Refactor `AdminDashboard.tsx` to use new card styles and layout.
4.  [ ] Refactor `BookingForm.tsx` to match the new aesthetic.
