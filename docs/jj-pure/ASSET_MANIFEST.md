# JJ PURE — 3D Asset Manifest

Date: 2026-09-23  
Status: SOURCE REFERENCE LOCK / modeling input

Final 3D models must be built from the real product reference assets below, not from generated hero artwork.

| SKU | Product | Primary Drive reference | Dimensions | Motion role |
|---|---|---|---:|---|
| JJP-PAD-02 | ALOVERA SOOTHING CLEAR ESSENCE TONER PAD | `1b7owmRSI6J-TD46mVgh0yPMxZgN8lUAX` — `Transform_the_yellow_cosmetic_jar_to_green_while_m-1773051473799.png` | 1024×1024 RGBA | CALM MODE |
| JJP-PAD-01 | COLLAGEN CALMING GEL ESSENCE TONER PAD | `10TXGXSUYS-_7l_qDHPtX7fYXfRNe96e7` — `Transform_the_yellow_cosmetic_jar_to_pink_while_ma-1773051468017.png` | 1024×1024 RGBA | PLUMP MODE |
| JJP-PAD-03 | VITA-C BLEMISH TONER PAD | `1TMj6TZP8neDGl-ezTsYr9uDS9Ad1nrYU` — `Extract_only_the_yellow_jar_product_itself_Remove-1772263153222.png` | 1024×1024 RGBA | BRIGHT MODE |
| JJP-SER-01 | PERFECT ALPHA ARBUTIN Whitening Serum | `1aJ7CR57y1Gzcr1onMBQ0OztRltgH_ru2` — `Upscale_this_exact_product_image_to_maximum_resolu-1773342137317.png` | 1024×1984 RGBA | 3% ALPHA-ARBUTIN |
| JJP-CRM-01 | PERFECT ALPHA ARBUTIN Whitening Cream | `1MGb3p2lY_SigvLaPfhNkEplA5kbA1BdK` — `Rotate_and_adjust_the_viewing_angle_of_this_cream_-1772263144922.png` | 1024×1024 RGBA | 5% ALPHA-ARBUTIN |

## Modeling controls

- Preserve real silhouette, translucency/material, lid/cap geometry, label position and front product identity.
- Do not invent official dimensions where source dimensions are unavailable; POC proportions may only be visual approximations.
- Final label textures must be checked against current controlled packaging and Thai label requirements before launch.
- Pad GLBs should expose separate `jar_body`, `lid`, `pad_stack`, and `hero_pad` meshes when feasible.
- Serum/Cream must remain legible at hero stops; geometry should be optimized for web use.

## Shared reusable 3D assets

- `pad_disc.glb`
- `continuity_ring.glb`
- `gel_volume_set.glb`
- `crystal_planes.glb`
- shader/mesh halo

## POC control

The current branch uses procedural proxy geometry only to validate the continuous scroll architecture. Proxy geometry is not approved packaging and must be replaced by verified GLB assets before final visual approval.

Full manifest is source-controlled in Unity Global Drive as `2026-09-23_JJ_PURE_3D_ASSET_MANIFEST_V01.md`.
