# Bolt's Performance Journal - Critical Learnings Only

## 2026-09-15 - Oversized Source Image Assets in Static Pages
**Learning:** Raw uploaded assets (such as `uppsala-tigers-crest.jpg` at 1500x1500px / 327KB) used directly in static HTML pages rendered at 220x220px trigger `image-weight` and `page-image-weight` performance gate warnings.
**Action:** Recompress source images to match ~2x retina target display dimensions (e.g. 600x600px progressive JPEG) to achieve ~75-80% file size reduction without losing visual fidelity or changing file paths/references.
