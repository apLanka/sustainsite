# Sustainable Infrastructure Design System

## 1. Overview & Creative North Star: "The Digital Arboretum"
This design system moves away from the rigid, sterile grids of traditional construction software. Our Creative North Star is **"The Digital Arboretum"**—an experience that feels as structured as an architectural blueprint but as organic and breathing as the environments we aim to protect. 

To achieve this, we reject "template" layouts. We embrace **Intentional Asymmetry** and **Editorial Breathing Room**. Data is not just "displayed"; it is curated. By using high-contrast typography scales and overlapping surface layers, we create a sense of architectural depth. This system conveys that sustainable construction isn't just about efficiency—it’s about the sophisticated harmony between the built world and the natural one.

---

## 2. Colors & Tonal Architecture
Our palette transitions from the deep, structural roots of the forest to the airy lightness of a sustainable canopy.

### The Palette
*   **Primary (Deep Forest):** `primary` (#012d1d) and `primary_container` (#1b4332). Used for authoritative structural elements and deep-focus backgrounds.
*   **Secondary (Sage Growth):** `secondary` (#0e6c4a) and `secondary_container` (#a0f4c8). Used to highlight "green" progress and positive sustainability metrics.
*   **Tertiary (Construction Vitality):** `tertiary_container` (#5f2f00) and `on_tertiary_container` (#fd8704). Reserved for alerts, high-priority construction blockers, and critical site updates.

### The "No-Line" Rule
Standard 1px borders are strictly prohibited for sectioning. We define space through **Tonal Shifts**. 
*   Place a `surface_container_low` card on a `surface` background to create a boundary.
*   Use `surface_container_highest` for sidebars against a `surface_bright` main canvas.
*   **Boundary = Color Change.** If it’s not a background shift, it’s not a section.

### Glass & Gradient Signature
To elevate the "out-of-the-box" feel, primary CTAs and Hero sections should utilize a **Signature Texture**: a subtle linear gradient from `primary` to `primary_container` at a 135° angle. Floating modals or global navigation should employ **Glassmorphism**—using `surface` at 80% opacity with a 16px backdrop-blur to allow the "site data" to bleed through softly.

---

## 3. Typography: Editorial Authority
We pair **Manrope** (Display/Headlines) with **Inter** (Body/UI) to balance architectural character with technical precision.

*   **Display (LG/MD/SM):** Use Manrope with tight letter-spacing (-0.02em). These are your "billboard" moments for high-level sustainability scores.
*   **Headline (LG/MD):** Manrope. These define major module headings. Use `on_surface_variant` to keep the UI from feeling too heavy.
*   **Title (LG/MD/SM):** Inter (Medium weight). These are the anchors for data cards and project names.
*   **Body (LG/MD/SM):** Inter (Regular). The workhorse for data tables. 
*   **Label (MD/SM):** Inter (Bold, All Caps, +0.05em tracking) for table headers and metadata to ensure high-end legibility.

---

## 4. Elevation & Depth: Tonal Layering
We do not use shadows to create "pop." We use **Layering** to create "meaning."

*   **The Layering Principle:** Think of the UI as stacked sheets of recycled paper.
    *   Base: `surface`
    *   Sections: `surface_container_low`
    *   Interactive Cards: `surface_container_lowest` (White) to create a natural "lift."
*   **Ambient Shadows:** If an element must float (e.g., a "Create Project" FAB), use a shadow tinted with `primary` (e.g., `rgba(27, 67, 50, 0.08)`) with a 32px blur and 8px Y-offset.
*   **The Ghost Border:** If accessibility requires a stroke (e.g., input fields), use `outline_variant` at **20% opacity**. This provides a guide without cluttering the visual field.

---

## 5. Components: The Sustainable Primitive

### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), `on_primary` text, `DEFAULT` (8px) roundedness.
*   **Secondary:** `secondary_container` fill with `on_secondary_container` text. No border.
*   **Tertiary:** Ghost style. No background, `primary` text. Use for low-priority actions like "Cancel."

### Cards & Lists
*   **Rule:** Forbid divider lines. 
*   **Execution:** Use `2.5` (0.5rem) to `4` (0.9rem) spacing units between list items. Separate content blocks by switching from `surface_container_lowest` to `surface_container_low`.

### Data Visualizations
*   **Sustainability Gauges:** Use `secondary` for "Target Reached" and `tertiary` for "Over Budget/Emission."
*   **Grid Lines:** Use `outline_variant` at 10% opacity. Data must feel like it is floating in an airy, open environment.

### Sustainability Badges (Specialty Component)
*   Small chips used for "LEED Certified" or "Carbon Neutral" status.
*   Style: `secondary_fixed` background with a tiny leaf icon. Roundedness: `full`.

### Inputs & Tables
*   **Inputs:** `surface_container_highest` background, no border, `sm` roundedness. On focus, a 2px `primary` bottom-border only.
*   **Tables:** Use `label-md` for headers. Alternating row colors are forbidden; use generous vertical padding (`3` or `3.5` from scale) to maintain legibility.

---

## 6. Do’s and Don’ts

### Do:
*   **Do** use `20` (4.5rem) spacing for outer page margins to create an elite, editorial feel.
*   **Do** overlap elements. A project image can slightly overlap the edge of a data card to break the "grid" feel.
*   **Do** use iconography from nature (leaf, sun, water) alongside construction (crane, bolt) to reinforce the brand's dual mission.

### Don’t:
*   **Don’t** use pure black (#000000) for text. Always use `on_surface` (#191c1d) for a softer, premium look.
*   **Don’t** use "Construction Orange" for anything other than warnings. It is a tool for urgency, not decoration.
*   **Don’t** use hard 90-degree corners. Everything must feel "honed" and approachable (Minimum `DEFAULT` 8px).
*   **Don’t** use shadows on every card. If everything is elevated, nothing is.