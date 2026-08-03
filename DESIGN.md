---
name: Digital Synagogue Board
description: Fullscreen kiosk display of prayer times, zmanim, and announcements for a synagogue sanctuary
colors:
  ink: "oklch(0.17 0.02 255)"
  ink-raised: "oklch(0.22 0.022 255 / 0.55)"
  paper: "oklch(0.96 0.012 90)"
  paper-dim: "oklch(0.92 0.014 90 / 0.68)"
  amber: "oklch(0.74 0.09 82)"
  amber-soft: "oklch(0.74 0.09 82 / 0.4)"
  slate: "oklch(0.68 0.05 240)"
  rose: "oklch(0.6 0.15 25)"
typography:
  display:
    fontFamily: "Assistant, Arial, Helvetica, sans-serif"
    fontSize: "clamp(4rem, 9vw, 9rem)"
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "normal"
  headline:
    fontFamily: "Assistant, Arial, Helvetica, sans-serif"
    fontSize: "clamp(2.5rem, 5vw, 5.5rem)"
    fontWeight: 800
    lineHeight: 1
  title:
    fontFamily: "Assistant, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.5rem, 2vw, 2.25rem)"
    fontWeight: 800
  body:
    fontFamily: "Assistant, Arial, Helvetica, sans-serif"
    fontSize: "clamp(1.5rem, 2.2vw, 2.75rem)"
    fontWeight: 400
    lineHeight: 1.3
  label:
    fontFamily: "Assistant, Arial, Helvetica, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
    letterSpacing: "0.02em"
rounded:
  sm: "10px"
  md: "16px"
spacing:
  sm: "0.75rem"
  md: "1.5rem"
  lg: "3vw"
components:
  board-panel:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "1.75rem"
  board-panel-urgent:
    backgroundColor: "{colors.ink-raised}"
    textColor: "{colors.paper}"
    rounded: "{rounded.md}"
    padding: "1.75rem"
---

# Design System: Digital Synagogue Board

## 1. Overview

**Creative North Star: "The Quiet Announcement Board"**

A synagogue board is read from across a room, often in the middle of prayer, often by someone older whose eyes are tired by evening. It doesn't need to impress; it needs to resolve instantly. The system rejects the previous "royal parochet" language entirely: gold corner brackets, ornate hairline frames, and stock arch/mosaic/star background art. That approach borrowed the visual grammar of a plaque or a certificate, and it fought the content instead of carrying it. The new system is flat, dark, and quiet. Depth comes from a single raised panel tone against a near-black ink field, not from beveled gold trim. Identity comes from one deliberate accent per color family, not from decorative pattern art.

Each of the five theme families (blue, ruby, emerald, ivory, teal) is a genuinely different palette, not a different picture on the same frame — the "full palette" strategy applied at the family level. Within a single screen, the palette stays disciplined: one background, one raised-panel tone, one accent used for numbers and labels, one reserved alert color for urgent messages.

**Key Characteristics:**
- Flat ink field, no image backgrounds, no gold corner ornaments.
- One accent hue per theme family, used deliberately (times, labels, active states) not decoratively.
- Type carries all the hierarchy: size and weight, not framing.
- Urgent state (red alert, urgent messages) is the only place saturation spikes — everywhere else stays composed.

## 2. Colors

The palette is dark-first (a screen read in a dim or mixed-light sanctuary), built from one neutral scale plus a rotating single accent per theme family.

### Primary
- **Amber** (`oklch(0.74 0.09 82)`): the default family's accent. Desaturated warm gold — enough warmth to feel like a synagogue, not enough saturation to feel like a trophy. Used only for: grand-time digits, screen kickers, active panel borders, small marks. Never for large fills.

### Secondary
- **Slate** (`oklch(0.68 0.05 240)`): the "teal" family's accent — a cool, calm blue-gray substitute for the old teal image theme. Same role as amber, different hue.

### Tertiary
- **Rose** (`oklch(0.6 0.15 25)`): reserved for the "ruby" family's accent AND, system-wide, for urgent messages and alert chrome. The one color allowed to run hot.

### Neutral
- **Ink** (`oklch(0.17 0.02 255)`): the board's background. Near-black, tinted barely blue so it never reads as pure `#000`.
- **Ink Raised** (`oklch(0.22 0.022 255 / 0.55)`): panel surfaces. One step up from ink, translucent so the ink field still breathes through.
- **Paper** (`oklch(0.96 0.012 90)`): primary text — a warm off-white, never pure `#fff`.
- **Paper Dim** (`oklch(0.92 0.014 90 / 0.68)`): secondary text, captions, detail lines.

### Family variants (replace the old 25 image themes)
- **Blue (default):** ink + amber accent.
- **Ruby:** deep maroon-tinted ink + rose accent.
- **Emerald:** deep green-tinted ink + a muted emerald accent (`oklch(0.68 0.1 155)`).
- **Ivory:** the one light theme — warm cream field (`oklch(0.95 0.015 85)`) with ink-colored text and a deep bronze accent (`oklch(0.4 0.08 70)`). For rooms with strong ambient daylight where a dark screen washes out.
- **Teal:** deep teal-tinted ink + slate accent.

The five old motif suffixes (parochet/arches/stars/mosaic/pomegranates) collapse into one rendering per family — the picker keeps its five-per-family options for continuity with existing saved configs, but they now render identically. Motif was always decorative noise; the family is the real choice.

### Named Rules
**The One Accent Rule.** Each screen has exactly one accent color (from its family). It marks numbers, labels, and active states. It is never a fill, never a background, never more than a thin border.

**The No-Frame Rule.** No gold corner brackets, no beveled inset rings, no background photography. Depth is ink vs. ink-raised, nothing else.

## 3. Typography

**Display Font:** Assistant (variable, Hebrew + Latin subsets), with Arial/Helvetica fallback.

**Character:** One typeface, doing all the work through weight and scale. Assistant's Hebrew forms stay legible at extreme sizes, which is the whole job here — this board has no room for a second, decorative typeface.

### Hierarchy
- **Display** (800, `clamp(4rem, 9vw, 9rem)`, line-height 0.95): grand clock time, the single biggest number on any screen.
- **Headline** (800, `clamp(2.5rem, 5vw, 5.5rem)`, line-height 1): screen titles, composed-screen headings.
- **Title** (800, `clamp(1.5rem, 2vw, 2.25rem)`): panel/content-block headings.
- **Body** (400, `clamp(1.5rem, 2.2vw, 2.75rem)`, line-height 1.3): message bodies, halacha text, list detail lines. Read at distance, so never below ~1.5rem effective size even in dense layouts.
- **Label** (700, 1.25rem, letter-spacing 0.02em): kickers, sync timestamps, small metadata.

### Named Rules
**The Weight-Over-Ornament Rule.** Hierarchy is built with size and weight contrast (≥1.25 ratio between adjacent steps) and color (paper vs. paper-dim), never with borders, icons, or frames around a heading.

## 4. Elevation

Flat by default. There are no drop shadows and no glassmorphism on the board itself — the ink/ink-raised contrast is the only depth cue, because shadows read as fussy at kiosk viewing distance and add nothing legible from three meters away. The one exception is the urgent-alert overlay, which is a full-screen state change, not a surface: it uses a slow pulse (background color, not a shadow) to read as urgent without vibrating.

### Named Rules
**The Flat-Field Rule.** Panels sit directly on the ink field via background-color contrast alone. If a panel needs to feel more important, raise its accent-border opacity or promote its type scale — never add a shadow.

## 5. Components

### Board Panel (`board-panel`)
- **Shape:** 16px corner radius — a gentle curve, not sharp, not pill.
- **Background:** ink-raised, translucent over the ink field.
- **Border:** 1px solid, accent color at low opacity (~25%). No inner rings, no corner brackets.
- **Urgent state:** border shifts to rose at higher opacity (~55%) plus a slow (2.6s) opacity pulse on the border only — never a full-panel color pulse.
- **Important state:** border shifts to the family accent at full opacity. No extra ring.
- **Internal Padding:** 1.75rem (scales down slightly on small viewports).

### Screen Title
- **Style:** a small uppercase-weight label (kicker) in the accent color, optionally followed by a thin 3rem accent-soft rule, then the headline in paper. No icon mark — the old crown glyph is removed entirely.

### Composed Content Block
- Same visual language as Board Panel: ink-raised background, 16px radius, 1px accent-soft border, no corner brackets.

### Alert Banner / Alarm Overlay
- **Style:** unchanged in spirit — these are functional emergency states, not decorative chrome, and are allowed to be loud (rose/red, pulsing) where every other surface stays composed. Keep existing pill banner and full-screen pulse treatment; only re-tie their color to the `rose` token so they're part of the same system instead of a one-off amber/red mix.

### Board Frame (header/footer)
- **Style:** a single 1px accent-soft border under the header and above the footer. Synagogue name in headline weight, address in label weight/accent color as the kicker. No crown icon, no ornament marks in the corners.

## 6. Do's and Don'ts

### Do:
- **Do** use exactly one accent color per screen (the active family's), reserved for numbers, labels, and thin borders.
- **Do** rely on ink vs. ink-raised for all depth; keep every panel flat otherwise.
- **Do** keep the urgent/rose treatment exclusive to alerts and urgent messages, so it stays meaningful when it appears.
- **Do** size type for distance first — check readability at a simulated 3-4m viewing distance before shipping a screen layout.

### Don't:
- **Don't** reintroduce background photography or textured images on the board (`royal-*` assets stay unused).
- **Don't** use gold corner brackets, beveled inset box-shadow rings, or a decorative outer frame border — this was the previous system's exact failure mode.
- **Don't** use a crown, star, or other iconographic mark as decoration in headers or titles.
- **Don't** use a card grid, gradient text, or glassmorphism anywhere on the board (cross-project ban, doubly true here).
- **Don't** let a screen carry more than one accent color at once, even across its family variants.
