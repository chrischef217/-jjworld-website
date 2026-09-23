# JJ PURE Website — PMO Baseline

Date: 2026-09-23  
Status: WORKING BASELINE / DO NOT TREAT AS PUBLIC CLAIM APPROVAL

## Product architecture

### Toner Pads — experience-led hero
The three pads do **not** currently have a strong enough concentration-led hero story to justify ingredient-first premium positioning.

Use the system:
- **ALOVERA SOOTHING CLEAR ESSENCE TONER PAD** — `CALM MODE`
- **COLLAGEN CALMING GEL ESSENCE TONER PAD** — `PLUMP MODE`
- **VITA-C BLEMISH TONER PAD** — `BRIGHT MODE`

Shared verified fact: all three pad formulas contain **Niacinamide 2%**.

Critical controls:
- Aloe extract is present at 0.01%; do not create a high-concentration aloe story.
- Collagen formula contains `Collagen Water 10.12%`; do not represent this as 10.12% pure collagen.
- Vita-C formula contains Sodium Ascorbyl Phosphate 0.01% and Ascorbic Acid 0.001%; do not imply high-dose Vitamin C.

### Alpha-Arbutin line — concentration-led hero
Verified formula concentrations:
- Serum: **Alpha-Arbutin 3% + Niacinamide 2%**
- Cream: **Alpha-Arbutin 5% + Niacinamide 2%**

Concentration disclosure is a formula fact. It must not be automatically converted into unverified clinical/therapeutic efficacy copy.

## Home-page narrative

1. `YOUR SKIN CHANGES. YOUR CARE SHOULD RESPOND.`
2. Pad system introduction
3. CALM MODE
4. continuous CALM → PLUMP transition
5. PLUMP MODE
6. continuous PLUMP → BRIGHT transition
7. BRIGHT MODE
8. `PREP IS ONLY THE BEGINNING.`
9. Serum — `3% ALPHA-ARBUTIN`
10. morph `3% → 5%`
11. Cream — `5% ALPHA-ARBUTIN`
12. system summary / product-detail entry

The home page is a continuous visual experience; it must not feel like unrelated hero banners stacked vertically.

## Motion architecture

Production target:
- One persistent WebGL stage for the cinematic product sequence.
- Lenis = smooth scroll transport.
- GSAP ScrollTrigger = normalized scroll progress / pin / scrub logic.
- Three.js / React Three Fiber = camera, product, pad, ring/halo, material and lighting transitions.
- DOM = accessible text, navigation and CTA.

Continuity device:
A persistent glass ring/halo changes color/material/scale between product modes instead of disappearing and restarting.

POC gate:
Build and validate `Opening → Calm → Calm/Plump transition → Plump` before implementing the rest of the site.

## Deployment / version control

- Existing repository: `chrischef217/-jjworld-website`
- Existing Cloudflare architecture is retained as reference/foundation.
- POC branch: `feature/jj-pure-3d-poc`
- Draft PR: #1
- Production `main` must not be changed until PMO approval.
- Cloudflare remains the required production hosting direction.

## Source-controlled Drive documents

Stored in `00_Unity_Global_Project_MD_LIVE`:
- `2026-09-23_JJ_PURE_WEBSITE_3D_MOTION_ARCHITECTURE_WORKING_BASELINE.md`
- `2026-09-23_JJ_PURE_5SKU_FACT_MATRIX_V01.md`
- `2026-09-23_JJ_PURE_WEBSITE_IA_COPY_CLAIM_MATRIX_V01.md`
- `2026-09-23_JJ_PURE_SCROLL_MOTION_STORYBOARD_V01.md`
- `2026-09-23_JJ_PURE_WEBSITE_TECH_IMPLEMENTATION_PLAN_V01.md`

## Claim gate

Internal copy must be classified as one of:
- `FACT`
- `INTERPRETATION`
- `CLAIM_GATE`
- `PLACEHOLDER`

No `CLAIM_GATE` text is publishable until the Thai advertising/label review is complete.
