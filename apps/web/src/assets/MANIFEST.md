# Asset Manifest

Per `contracts/ASSET-CONTRACT.md`: every file under `apps/web/public/` is
recorded here with its provenance class before use. Source stage: 7
(`artifacts/brand/raw/`, `EV-20260826-029`).

| Path | Source | Identity | Usage | Rights status | UKBT-required | Alternative |
|---|---|---|---|---|---|---|
| `public/brand/crest-512.png` | `artifacts/brand/raw/brand/crest-512.png` | UK Bangla Tigers crest logo (original, 512×512) | Homepage hero, fallback | UKBT-owned (client-supplied) | Yes | None — canonical source for responsive variants below |
| `public/brand/crest-144.png` | Generated from `crest-512.png` via sharp-cli | Crest resized to 144×144 (84% smaller, 29KB) | REMOVED 2026-09-10 — superseded crop-to-fill derivative, zero references | UKBT-owned (derived from client-supplied) | Yes | `crest-512.png` |
| `public/brand/crest-120.png` | Generated from `crest-512.png` via sharp-cli | Crest resized to 120×120 (87% smaller, 23KB) | REMOVED 2026-09-10 — superseded crop-to-fill derivative, zero references | UKBT-owned (derived from client-supplied) | Yes | `crest-512.png` |
| `public/brand/crest-88.png` | Generated from `crest-512.png` via sharp-cli | Crest resized to 88×88 (92% smaller, 15KB) | REMOVED 2026-09-10 — superseded crop-to-fill derivative, zero references | UKBT-owned (derived from client-supplied) | Yes | `crest-512.png` |
| `public/brand/crest-256.webp` | `artifacts/brand/raw/brand/crest-256.webp` | Same crest, WebP, smaller size | Header logo (44×60), drawer logo (44×60), footer logo (53×72) | UKBT-owned (client-supplied) | Yes | `crest-512.png` |

> **Correction (measured):** the square PNG derivatives above were produced
> with a crop-to-fill resize, which cuts the shield's crown and base point
> (visible at 3× zoom: the shield tip bleeds off the canvas edge). They are
> superseded for logo placements by `crest-256.webp` (256×349, full
> artwork, 28KB). Files removed 2026-09-10 (all branches merged,
> nothing referenced them).
| `public/favicon.svg` | `artifacts/brand/raw/brand/favicon.svg` | Simplified "UBT" monogram favicon | `<link rel="icon">` | UKBT-owned (client-supplied) | Yes | `icon-32.png` |
| `public/icon-32.png` | `artifacts/brand/raw/brand/icon-32.png` | Favicon PNG fallback | `<link rel="icon" sizes="32x32">` | UKBT-owned (client-supplied) | Yes | None |
| `public/icon-180.png` | `artifacts/brand/raw/brand/icon-180.png` | Apple touch icon | `<link rel="apple-touch-icon">` | UKBT-owned (client-supplied) | Yes | None |
| `public/social-card.jpg` | `artifacts/brand/raw/images/social-card/default.jpg` | Official OG/social preview image (crest + wordmark + tagline), 1200x630 | `og:image`, `twitter:image` | UKBT-owned (client-supplied) | Yes | None |
| `public/brand/uppsala-tigers-crest.jpg` | Direct chat upload, `EV-20260831-004` | Uppsala Tigers crest (circular, navy/gold, tiger head + cricket ball + "UPPSALA TIGERS / EST - 2026" wordmark), 1500x1500 | `/franchises` card grid, `/franchises/uppsala-tigers` intro panel | UKBT-owned (client-supplied) | Yes | `crest-512.png` (UK Bangla Tigers crest — used only until this asset was supplied) |
| `public/brand/sponsors/wolffit.jpg` | Direct chat upload, `EV-20260831-007` | WOLFFIT sponsor logo (black background, "FUEL. FOCUS. FITNESS." tagline, ® mark), 1254x1254 | `/about` Sponsors section | **Third-party mark, client-authorised** — this is WOLFFIT's own registered trademark, not a UKBT asset; the club supplied it with the instruction to display it as "Proud Sponsor." The sponsorship relationship itself (i.e. that WOLFFIT has actually agreed to be displayed) is the club's representation, not independently verified by this project — same epistemic posture as the "Client-authorised" photography class below, applied here to a mark rather than a photo. | Yes (as supplied) | None |
| `public/fonts/lato-400.woff2` | `artifacts/brand/raw/fonts/lato-400.woff2` | Lato Regular | Body text, self-hosted | Third-party (cleared) — SIL Open Font License | Yes (PROPOSED typography) | System font stack |
| `public/fonts/lato-700.woff2` | `artifacts/brand/raw/fonts/lato-700.woff2` | Lato Bold | Body emphasis, self-hosted | Third-party (cleared) — SIL Open Font License | Yes (PROPOSED typography) | System font stack |
| `public/fonts/montserrat-variable.woff2` | `artifacts/brand/raw/fonts/montserrat-variable.woff2` | Montserrat Variable | Headings, self-hosted | Third-party (cleared) — SIL Open Font License | Yes (PROPOSED typography) | System font stack |

## Client-authorised photography

Provenance class added by `ASSET-CONTRACT.md` Amendment 01. Authorisation
is `CLIENT_REQ_010` / `EV-20260826-032` ("treat all supplied photos as
usable club imagery"). Per that amendment, **the client's authorisation
and this project's own verification are recorded as separate fields** —
the first is theirs, the second is ours, and neither is restated as the
other.

Every entry below was viewed at full resolution before staging,
specifically checking for names, captions, or third-party branding baked
into the pixels (the `EV-20260826-031` lesson: a text grep cannot see
inside a raster image).

| Path | Source | Usage | AUTHORISATION | INDEPENDENT_VERIFICATION |
|---|---|---|---|---|
| `public/media/club-feature.webp` | `artifacts/brand/raw/images/gallery/gallery-07.webp` | Feature media slot on the homepage club-intro and About story sections | `CLIENT_REQ_010` / `EV-20260826-032` | Viewed at full resolution. One player on a cricket ground, tiger-striped orange/black kit, mountain backdrop. **No photographer watermark, no sponsor bar, no baked-in names.** The kit is not UKBT navy/gold and carries no UKBT crest, so this is not independently confirmable as UKBT team photography — it is used on the client's authorisation, not on our verification. The individual is not identified and is not captioned. |
| `public/media/team-huddle.webp` | `artifacts/brand/raw/images/gallery/gallery-19.webp` | Homepage hero background (atmospheric, under navy scrim; no identity caption) and team/community media slot | `CLIENT_REQ_010` / `EV-20260826-032` | Viewed at full resolution. Team huddle in green/blue numbered kit, opposition batter in frame. No photographer watermark and no baked-in names; ground-perimeter banners in the background read "STRONGER TOGETHER" (a third-party event/ground mark, disclosed here per Amendment 01 rule 4, not scrubbed). Kit carries no UKBT crest — same caveat as above. |
| `public/media/team-night-action.webp` | `artifacts/brand/raw/images/gallery/gallery-18.webp` | Homepage hero background second slide (atmospheric, under navy scrim; no identity caption) | `CLIENT_REQ_010` / `EV-20260826-032` | Viewed at full resolution 2026-09-09. Night match action: bowler mid-delivery (teal/black kit, number 5), batter and fielder in frame — a genuine multi-player team shot, not a portrait. No photographer watermark and no baked-in names; partial ground sponsor boards in the background read "…PERIA" / "….co.uk" (third-party ground marks, disclosed here per Amendment 01 rule 4, not scrubbed; illegible under the hero scrim). Kit carries no UKBT crest — same caveat as above. Selected over gallery-09/-11 (baked-in "Photography by TOP-KNOCK STUDIOS" credit = third-party rights-holder, plus full Safari T20 Cup sponsor bars) and gallery-20 ("MARIGOT TIGERS" shirts = a different named club). |

### Reviewed and NOT staged, with reasons

Findings from the full-set review (contact sheet of all 20 supplied
gallery images plus hero/leadership/uppsala):

- **Third-party photographer watermarks.** `gallery-04` carries "FSR
  FOTOGRAFIA / www.fsabater.com" across the centre of the frame;
  `gallery-08` carries "Photography by TOP-KNOCK STUDIOS". A visible
  photographer credit is evidence of a **third-party rights-holder**,
  which is a different question from the affiliation doubt
  `CLIENT_REQ_010` resolved. Not staged pending confirmation that UKBT
  holds publication rights.
- **Heavy third-party event branding.** `gallery-08`, `-09`, `-11` carry
  full "Safari T20 Cup 2024" sponsor bars listing other clubs and
  companies (Maverick Titans, Scorpios, Dubai Pelicans, PGI Group, DHM
  Falcon, United Kent CC, Croxwood Events, tapnstay, LION, gsl, Q Leaf
  Care). `gallery-10` carries a "European Cup 2025" banner. Usable, but
  they advertise other organisations across a UKBT page, so they are held
  back rather than used as generic club imagery.
- **Other teams' kit.** `gallery-13` is a **Bangladesh national team**
  shirt; `gallery-17` appears to be a West Indian/Caribbean kit;
  `gallery-03` an Oman kit. Presenting national-team photography as UKBT
  club imagery would misrepresent, regardless of authorisation.
- **Unidentified individual portraits** (`gallery-02`, `-12`, `-14`,
  `-15`, `-16`). Held back: usable as decoration, but this project does
  not caption an unidentified person with a name, and a lone portrait
  invites exactly that.
- `nordic-smash-slide.webp` — remains excluded on `CLIENT_REQ_008`
  grounds (visible "NIPO KHADEM"), unaffected by `CLIENT_REQ_010`.

## Uppsala Tigers squad photography

Provenance: `EV-20260831-008` — a zip of individually named photos
supplied directly for player-card use, distinct from the anonymous
gallery-derived photos above. Originals were HEIF/PNG/JPEG; all
converted to JPEG (no HEIF support outside Safari) and downscaled to
640px max dimension (roster-card size — avoiding the oversupply already
flagged for `crest-512.png` elsewhere in this project). Every photo was
viewed before staging; none carries a photographer watermark.

Affiliation is independently confirmable where an "UPPSALA TIGERS"
wordmark/crest is visible on the subject's own kit in the photo itself.
Where it is not (a national-team jersey, or no team clothing at all),
that is stated plainly — the person's affiliation still rests on the
client's own pairing of name to squad list (`EV-20260831-005`), not on
this project's independent verification, same posture as the
Client-authorised class above.

> **Captain identity (confirmed):** `mohammad-chowdhury-captain.jpg`
> is Mohammad Chowdhury, Club Captain — confirmed by the client directly
> (chat, 2026-09-09; source `artifacts/brand/raw/captain-photo-new.jpg`,
> downscaled 860x960 → 640x714 via sharp-cli). Used as his portrait on
> `/club-captain` (`ProfileHeader`), the homepage and `/players`
> (`CaptainSpotlight`), the `/players` roster card and the Uppsala
> squad list. "UPPSALA TIGERS" wordmark and tiger crest readable on the
> shirt itself, matching his evidenced current franchises (UKBT +
> Uppsala). Wired as `captainPhoto` in `src/content/captain-data.ts`
> (presentation wiring, outside the gated facts). Supersedes
> `mohammad-chowdhury.jpg` (same set, removed 2026-09-10) as the wired
> portrait.

| Path | Person | Kit sponsor marks visible | Affiliation independently confirmable? |
|---|---|---|---|
| `public/media/uppsala-squad/mohammad-chowdhury.jpg` | Mohammad Chowdhury | STEP, NEX Education | Yes — Uppsala Tigers kit. REMOVED 2026-09-10; had been retained on disk, superseded as the wired portrait by `mohammad-chowdhury-captain.jpg` below. |
| `public/media/uppsala-squad/mohammad-chowdhury-captain.jpg` | Mohammad Chowdhury | RS Sports, excel, SMA (kit sponsor marks) | Yes — "UPPSALA TIGERS" wordmark + tiger crest readable on the shirt itself |
| `public/media/uppsala-squad/shakib-al-hasan.jpg` | Shakib Al Hasan | STEP, NEX Education | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/karanbir-singh.jpg` | Karanbir Singh | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/owen-palmer.jpg` | Owen Palmer | STEP | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/shaheryar-butt.jpg` | Shaheryar Butt | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/chad-potgieter.jpg` | Chad Potgieter | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/roushan-singh.jpg` | Roushan Singh | adidas (cap) | **No** — wearing a Portugal national jersey, not Uppsala Tigers club kit |
| `public/media/uppsala-squad/jaspreet-singh.jpg` | Jaspreet Singh | (none) | **No** — wearing an Italy national jersey, not Uppsala Tigers club kit |
| `public/media/uppsala-squad/armaan-randhawa.jpg` | Armaan Randhawa | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/jawid-stanigze.jpg` | Jawid Stanigze | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/chinthaka-rajapaksha.jpg` | Chinthaka Rajapaksha | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/tasaduq-hussain.jpg` | Tasaduq Hussain | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/lemar-momand.jpg` | Lemar Momand | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/humayun-kabir-jyoti.jpg` | Humayun Kabir Jyoti | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/prashant-shukla.jpg` | Prashant Shukla | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/qudratullah-mir-afzal.jpg` | Qudratullah Mir Afzal | STEP; European Cricket Series medal/trophy | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/hamid-mahmood.jpg` | Hamid Mahmood | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/anas-zaheer.jpg` | Anas Zaheer | (none clearly visible) | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/essa-farooq.jpg` | Essa Farooq | STEP, NEX Education | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/shaftab-khalid.jpg` | Shaftab Khalid (Coach) | STEP, NEX Education | Yes — Uppsala Tigers kit |
| `public/media/uppsala-squad/agm-sabbir.jpg` | AGM Sabbir (Team Manager) | none — plain headshot | **No** — no team clothing/branding in frame |
| `public/media/uppsala-squad/md-ashraful-alam.jpg` | MD Ashraful Alam (Logistics Manager) | none — casual outdoor photo | **No** — no team clothing/branding in frame |
| `public/media/uppsala-squad/javed-butt.jpg` | Javed Butt (Team Mentor) | none — casual outdoor photo | **No** — no team clothing/branding in frame |

**Dhrubonil Roy** (the 20th squad member) is pictured via his
owner-supplied portrait from the 2026-09-12 photo drop
(`public/media/players/dhrubonil-roy.webp`, reused on the Uppsala side —
no Uppsala-kit photo of him was supplied, so kit affiliation there rests
on the client's own naming).

## Leadership photography (About Phase 1, owner-authorised)

Authorisation is `EV-20260910-001` (owner confirmation, chat 2026-09-10):
identity of every depicted leader confirmed, no other people,
watermarks, or baked-in names in frame (viewed at full resolution).
Renders on `/about` only, under the ABOUT-CONTRACT authorised exception;
the photo-test pins exactly these files.

| Path | Source | Usage | AUTHORISATION | INDEPENDENT_VERIFICATION |
|---|---|---|---|---|
| `public/media/management-team.webp` | `artifacts/brand/raw/images/leadership/management-team.webp` | Leadership section graphic on `/about` | `EV-20260910-001` | Viewed at full resolution. "INTRODUCING OUR MANAGEMENT TEAM": Mohammad Chowdhury (Founder & CEO), MD Shahidul Alam Ratan (Chairman in graphic; rendered title stays gated "Acting Chairman"), Sayem Rahman (Vice-Chairman). UKBT crest + Nordic Smash T20 event mark baked into the creative (third-party event mark, disclosed not scrubbed). Render removed 2026-09-11 per owner direction (individual roster portraits instead); file + authorisation retained. |
| `public/media/founder-trophy.webp` | `artifacts/brand/raw/images/leadership/management-portrait.webp` | FounderSpotlight side image on `/about` | `EV-20260910-001` | Viewed at full resolution. Mohammad Chowdhury holding the Safari T20 Cup trophy (airport terminal backdrop). Partial terminal signage in the background ("Metro", "Departures" — generic wayfinding, not a rights-holder mark). |
| `public/media/sayem-rahman.jpg` | `artifacts/brand/raw/images/leadership/sayem-rahman.jpg` (owner-supplied 2026-09-10) | Vice-chairman roster card portrait on `/about` | `EV-20260910-001` | Viewed at full resolution. Matches the Sayem Rahman depicted in management-team.webp (same person). Studio-style gradient backdrop, no watermark, no baked-in names. |
| `public/media/shahidul-alam-ratan.webp` | `artifacts/brand/raw/images/leadership/MD Shahidul Alam Ratan.webp` (owner-supplied 2026-09-11) | Acting-chairman roster card portrait on `/about` | `EV-20260911-001` | Viewed at full resolution. Matches the MD Shahidul Alam Ratan depicted in management-team.webp (same person — suit, striped tie, greying temples). Neutral backdrop, no watermark, no baked-in names. Small lapel pins visible (personal dress pins, illegible at render size; disclosed per Amendment 01 rule 4, not scrubbed). |

## About banner background (owner-authorised 2026-09-11)

| Path | Source | Usage |
|---|---|---|
| `public/media/gallery-06.webp` | `artifacts/brand/raw/images/gallery/gallery-06.webp` (byte-identical, SHA256 `94D132BF…F168`, 1400x933, 202KB) | Photographic backdrop of the `/about` PageBanner under a token-navy shade |
| `public/media/gallery-08.jpg` | `artifacts/brand/raw/images/gallery/gallery-08.jpg` (byte-identical, SHA256 `671717C2…7B7B`, 1400x783, 291KB) | Photographic backdrop of the `/players` PageBanner under a token-navy shade |
| `public/media/gallery-10.webp` | `artifacts/brand/raw/images/gallery/gallery-10.webp` (byte-identical, SHA256 `E884D263…E160`, 1400x1002, 230KB) | Photographic backdrop of the `/tournaments` ("Events") PageBanner under a token-navy shade |
| `public/media/gallery-04.webp` | `artifacts/brand/raw/images/gallery/gallery-04.webp` (byte-identical, SHA256 `BF01CC12…7503BF`, 1400x934, 67KB) | Photographic backdrop of the `/contact` ("Contact Us") PageBanner under a token-navy shade |
| `public/media/nordic-smash-slide.jpg` | `artifacts/brand/raw/images/uppsala/nordic-smash-slide.jpg` (byte-identical, SHA256 `29AEE17B…13F2EE`, 1600x649, 202KB) | Graphic backdrop of the `/franchises` ("Our Franchises") PageBanner under a token-navy shade |
| `public/media/gallery-05.webp` | `artifacts/brand/raw/images/gallery/gallery-05.webp` (byte-identical, SHA256 `7FD686A8…0F0BF52`, 1400x933, 56KB) | Photographic backdrop of the `/club-captain` ("Club Captain") PageBanner under a token-navy shade |

Authorisation is explicit owner direction (chat 2026-09-11): the owner
confirmed gallery-06 depicts a UK Bangla Tigers team/event photo. This
first-party confirmation supersedes the "not confirmed" assessment in
`EV-20260826-030` §4 second bullet **for this file only** (see the
amendment appended to that record); `join-us.webp` and `home-hero.webp`
findings are unchanged. gallery-08 (same date) is a new owner-supplied
drop with no prior EV finding; the owner confirmed it depicts a UKBT
squad photo. gallery-10 (same date) is likewise a new owner-supplied
drop with no prior EV finding; the owner confirmed it depicts a UKBT
squad photo. gallery-05 (same date) is likewise a new owner-supplied
drop with no prior EV finding — indoor award presentation (suited
presenter handing a Safari plaque to a player in green/orange kit;
no watermark, no crest legible) — the owner confirmed it depicts a
UKBT player/official. (Note: the "gallery-08/-10" labels in the contact-sheet
review above refer to a different numbering — e.g. that review's
gallery-08 carries a TOP-KNOCK watermark and Safari T20 sponsor bars,
neither of which appears on the raw files staged here; the raw files
are judged on their own pixels.) gallery-04 is the exception that
proves the rule: the raw file visibly carries the same "FSR
FOTOGRAFIA / www.fsabater.com" watermark the contact-sheet review
describes, so that review's rights hold applied to this file — until
the owner (same date) confirmed both UKBT affiliation and publication
rights, superseding the hold for this file only. Viewed at full
resolution: gallery-06 is a squad trophy
celebration in green/red kit with background event boards reading
approximately "Islami Bank ... Cup 2022"; gallery-08 is a squad team
photo in light-blue kit whose chest branding matches the charity-event
marks described in `EV-20260826-030` §7 — disclosed as documentary
background, not scrubbed. gallery-10 is a medal-winning
squad in purple/orange tiger-stripe kit with RTSC European Cup event
boards and STONE & CO./SOL kit marks, no crest visible — likewise
disclosed, dimmed by the navy shade. gallery-04 is live match action
(bowler delivering, batter set, stumps in frame) with the
photographer's mark in the lower third — disclosed, not scrubbed;
the shade dims it with the rest. nordic-smash-slide.jpg is a designed
graphic (not a photograph): Uppsala Tigers overseas-signings panel
for the Nordic Smash T20, six named players with country tags.
**CLIENT_REQ_008 WAIVER (owner chat 2026-09-11, this file and this
use only):** the graphic bakes in "NIPO KHADEM / PORTUGAL" (and faces
for all six); the owner waived the exclusion for this banner use
after the conflict was stated explicitly. The waiver does NOT extend
to rosters, the `.webp` sibling (still excluded), or any other use —
CLIENT_REQ_008 otherwise stands in full. Alt text and all DOM copy
carry no names (contamination gates scan rendered HTML; baked-in
pixel text must not enter the DOM). Background boards/branding are
dimmed by each banner's navy shade behind its title. Each file renders
on its page only.

## Player roster portraits (owner-authorised 2026-09-12)

Source: `artifacts/brand/raw/images/UKBT Players Pictures/` (59 portraits
+ `Players & Managements List.pdf`), `EV-20260912-001`. Owner direction:
use all pictures as UK Bangla Tigers players with picture and name;
roles from the PDF; new filename spellings win over the older roster.
Staged as uniform 320x320 cover-top q70 WebP thumbnails in
`public/media/players/<slug>.webp` (54 files, ~485KB total). 10 HEIF
sources (iPhone 3024x4032) decoded via heic-convert to JPEG
intermediates (Temp only, never staged), then the same thumbnail
pipeline. Faces verified in crops (HEIF, landscape, small-source,
square, official, new-face samples — no decapitation). Forhad Reza
source is 215x290 (mild upscale, acceptable at 160px render).
Excluded: `D4652AE2-….png` (no name — never render an unnamed face);
`Mohammad Chowdhury.jpg` not separately rendered (captain already
pictured). The PDF's printed CIC number stays internal-only, never
rendered. Kit/sponsor marks visible in several portraits (Uppsala
Tigers, Wolf Nutrition UK, Safari) are documentary background,
disclosed not scrubbed. No biographies, statistics, or quotations
were supplied with the files.

| Path | Source | Depicts |
|---|---|---|
| `public/media/players/shakib-al-hasan.webp` | `Shakib Al Hasan (Bangladesh).png` (1113x988) | Shakib Al Hasan |
| `public/media/players/karanbir-singh.webp` | `Karanbir Singh (Austria).heif` (3024x4032) | Karanbir Singh |
| `public/media/players/owen-palmer.webp` | `Owen Palmer (England).png` (1023x1537) | Owen Palmer |
| `public/media/players/shaheryar-butt.webp` | `Shaheryar Butt (Belgium).heif` (3024x4032) | Shaheryar Butt |
| `public/media/players/chad-potgieter.webp` | `Chad Potgieter (South Africa).heif` (3024x4032) | Chad Potgieter |
| `public/media/players/roushan-singh.webp` | `Roushan Singh (Portugal).jpg` (960x960) | Roushan Singh |
| `public/media/players/jaspreet-singh.webp` | `Jaspreet Singh (Italy).jpg` (1577x1600) | Jaspreet Singh |
| `public/media/players/armaan-randhawa.webp` | `Armaan Randhawa (Austria).heif` (3024x4032) | Armaan Randhawa |
| `public/media/players/jawid-stanigze.webp` | `Jawid Stanigze.heif` (3024x4032) | Jawid Stanigze |
| `public/media/players/chinthaka-rajapaksha.webp` | `Chinthaka Rajapaksha.heif` (3024x4032) | Chinthaka Rajapaksha |
| `public/media/players/tasaduq-hussain.webp` | `Tasaduq Hussain.heif` (3024x4032) | Tasaduq Hussain |
| `public/media/players/lemar-momand.webp` | `Lemar Momand.heif` (3024x4032) | Lemar Momand |
| `public/media/players/humayun-kabir-jyoti.webp` | `Humayun Kabir Jyoti.heif` (3024x4032) | Humayun Kabir Jyoti |
| `public/media/players/prashant-shukla.webp` | `Prashant Shukla.png` (1086x1448) | Prashant Shukla |
| `public/media/players/qudratullah-mir-afzal.webp` | `Qudratullah Mir Afzal.png` (1086x1448) | Qudratullah Mir Afzal |
| `public/media/players/hamid-mehmood.webp` | `Hamid Mahmood.png` (1114x1412) | Hamid Mehmood |
| `public/media/players/anas-zaheer.webp` | `Anas Zaheer (U-19).heif` (3024x4032) | Anas Zaheer |
| `public/media/players/essa-farooq.webp` | `Essa Farooq (U-19).png` (1199x1312) | Essa Farooq |
| `public/media/players/mohammad-chowdhury.webp` | `Mohammad Chowdhury.jpg` (1320x1475) | Mohammad Chowdhury (roster card; athlete portrait stays the spotlight image) |
| `public/media/players/dhrubonil-roy.webp` | `Dhrubonil Roy.jpg` (1085x1450) | Dhrubonil Roy |
| `public/media/players/musa-ahmad.webp` | `Musa Ahmad.jpg` (836x1254) | Musa Ahmad |
| `public/media/players/jeremy-martins.webp` | `Jeremy Martins.jpg` (1066x1600) | Jeremy Martins |
| `public/media/players/towker-khan.webp` | `Towker Khan.jpg` (1200x1600) | Towker Khan |
| `public/media/players/forhad-reza.webp` | `Forhad Reza.JPG` (215x290) | Forhad Reza |
| `public/media/players/ellias-sunny.webp` | `Elias Sunny.jpg` (1170x813) | Ellias Sunny |
| `public/media/players/sufyan-mehmood.webp` | `Sufyan Mehmood.jpg` (1072x1600) | Sufyan Mehmood |
| `public/media/players/arafat-bhuiyan.webp` | `Arafat Bhuiyan.jpg` (1016x1210) | Arafat Bhuiyan |
| `public/media/players/shabbir-rahman.webp` | `Shabbir Rahman.jpg` (1077x1078) | Shabbir Rahman |
| `public/media/players/junaid-siddique.webp` | `Junaid Siddique.jpg` (1032x1002) | Junaid Siddique |
| `public/media/players/wayne-parnel.webp` | `Wayne Parnel.jpg` (923x731) | Wayne Parnel |
| `public/media/players/juan-henry.webp` | `Juan Henry.jpg` (800x1200) | Juan Henry (new spelling wins over roster `Juan Henri`) |
| `public/media/players/kenner-lewis.webp` | `Kennar Lewis.jpg` (894x960) | Kenner Lewis |
| `public/media/players/peter-robert.webp` | `Peter Robert.jpg` (856x1074) | Peter Robert (new spelling wins over roster `Pater Robert Harness`) |
| `public/media/players/mark-james.webp` | `Mark James.PNG` (651x946) | Mark James (new spelling wins over roster `Mark James Nunn`) |
| `public/media/players/abu-bakar.webp` | `Abu Bakkar.png` (1169x1346) | Abu Bakar (new name from owner supply; no country stated) |
| `public/media/players/asif-taniwal.webp` | `Asif Taniwal.png` (941x1672) | Asif Taniwal (new name; no country stated) |
| `public/media/players/ayyan-warraich.webp` | `Ayyan Warraich.png` (1086x1448) | Ayyan Warraich (new name; no country stated) |
| `public/media/players/cp-rizwan.webp` | `CP Rizwan.png` (1120x1404) | CP Rizwan (new name; no country stated) |
| `public/media/players/danish-sarhadi.webp` | `Danish Sarhadi.png` (1047x1501) | Danish Sarhadi (new name; no country stated) |
| `public/media/players/ibrahim-maqsood.webp` | `Ibrahim Maqsood.png` (1024x1536) | Ibrahim Maqsood (new name; no country stated) |
| `public/media/players/ibrar-ahmed.webp` | `Ibrar Ahmed.png` (1091x1442) | Ibrar Ahmed (new name; no country stated) |
| `public/media/players/jack-jakir.webp` | `Jack Jakir.png` (1122x1402) | Jack Jakir (new name; no country stated) |
| `public/media/players/junaid-shamsu.webp` | `Junaid Shamsu.png` (1022x1538) | Junaid Shamsu (new name; no country stated) |
| `public/media/players/krish-anand.webp` | `Krish Anand.png` (941x1672) | Krish Anand (new name; no country stated) |
| `public/media/players/muhsin-ali.webp` | `Muhsin Ali.png` (1086x1448) | Muhsin Ali (new name; no country stated) |
| `public/media/players/saghir-ahmad.webp` | `Saghir Ahmad.png` (1254x1254) | Saghir Ahmad (new name; no country stated) |
| `public/media/players/sibet-ahmed.webp` | `Sibet Hussain.png` (1164x1351) | Sibet Ahmed (new name; no country stated) |
| `public/media/players/syed-aziz.webp` | `Syed Aziz.png` (1313x1198) | Syed Aziz (new name; no country stated) |
| `public/media/players/taimoor-ali.webp` | `Taimoor Ali.png` (1254x1254) | Taimoor Ali (new name; no country stated) |
| `public/media/players/zohair-iqbal.webp` | `Zohair Iqbal.png` (1254x1254) | Zohair Iqbal (new name; no country stated) |
| `public/media/players/shaftab-khalid.webp` | `Shaftab Khalid (Coach).png` (1196x1315) | Shaftab Khalid, Coach (Team Officials) |
| `public/media/players/agm-sabbir.webp` | `AGM Sabbir (Team Manager).jpeg` (1400x1600) | AGM Sabbir, Team Manager (Team Officials) |
| `public/media/players/md-ashraful-alam.webp` | `MD Ashraful Alam (Logistics Manager).jpeg` (1479x1600) | MD Ashraful Alam, Logistics Manager (Team Officials) |
| `public/media/players/javed-butt.webp` | `Javed Butt (Team Mentor).jpg` (3024x4032) | Javed Butt, Team Mentor (Team Officials) |

## Explicitly NOT staged to production (per Stage 7G exclusions, extended)

- `home-hero.webp`, `join-us.webp` — team/event
  affiliation not confirmed as UK Bangla Tigers (`EV-20260826-030`).
- `nordic-smash-slide.webp` — **removed after initial staging**: has
  "NIPO KHADEM / PORTUGAL" baked into the photo itself, which
  `CLIENT_REQ_008` requires excluded from any published content
  (`EV-20260826-031`, found on direct visual inspection — a text-content
  grep cannot catch a name inside a raster image). It shipped briefly on
  the Homepage's FranchiseTeaser section before this was caught; both
  that section and the new Our Franchises page now use the crest instead.
  No alternative Uppsala Tigers photo excluding this player exists in
  evidence.

No other file from `artifacts/brand/raw/images/` is staged here.
