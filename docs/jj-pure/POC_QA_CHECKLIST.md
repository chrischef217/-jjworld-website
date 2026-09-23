# JJ PURE — Continuous 3D POC QA Checklist

Status: ACTIVE GATE  
Branch: `feature/jj-pure-3d-poc`  
Draft PR: #1

## Automated gates
- [ ] `node --check public/js/jj-pure-poc.js`
- [ ] `npm run build`
- [ ] Chromium loads `/jj-pure-poc.html?debug=1`
- [ ] WebGL context available
- [ ] No browser `pageerror`
- [ ] No console errors
- [ ] CALM checkpoint responds to scroll
- [ ] PLUMP checkpoint responds to scroll
- [ ] BRIGHT checkpoint responds to scroll
- [ ] 3% Serum checkpoint responds to scroll
- [ ] 5% Cream checkpoint responds to scroll
- [ ] Reverse scroll returns toward CALM without state lock
- [ ] Mobile 390×844 renders the BRIGHT checkpoint without browser error
- [ ] Visual checkpoint screenshots stored as CI artifacts

## PMO visual gates — manual approval required
- [ ] No hard visual cut between CALM and PLUMP
- [ ] No hard visual cut between PLUMP and BRIGHT
- [ ] Pad-to-Serum transition reads as one continuous world
- [ ] 3%→5% transition does not look like a basic slide/fade
- [ ] Motion is premium and physically restrained, not game-like
- [ ] Product hero stops keep packaging identity readable
- [ ] Copy never competes visually with product
- [ ] Desktop scroll feels smooth under fast wheel movement
- [ ] Reverse scroll feels equally coherent
- [ ] Mobile fallback preserves story even with reduced visual complexity
- [ ] `prefers-reduced-motion` path remains usable

## Production blockers
- [ ] Replace procedural product proxies with source-verified GLB models (Issue #2)
- [ ] Final Thai/English hero copy PMO claim review
- [ ] Thai FDA/label/launch gate status confirmed before public advertising deployment
- [ ] Final Cloudflare preview QA
- [ ] Final GitHub PR approval before `main`

## Non-negotiable rule
Do not merge the POC into `main` merely because automated tests pass. Automated QA proves technical execution only; exact product models, motion aesthetics, claims and final brand experience still require GPT(PMO) approval.
