# TruckingCostr AU — approved branding direction

Status: **design direction approved by owner, 21 November 2026**. This document is a design target, not proof that assets are deployed.

## Reference
Owner-supplied “TruckingCostr AU Branding & Design Suite” screenshot (21 November 2026). Retain the original artwork as the visual reference; do not treat a screenshot crop as a production-quality icon.

## Brand system
- Product name: **TruckingCostr AU**.
- Tagline: **Know your costs. Own your road.**
- Primary mark: white heavy truck illustration with orange Australian map outline on deep navy, with TruckingCostr AU lettering.
- Palette: deep navy, safety orange, white; blue and pale grey as secondary colours. Exact colour values must be sampled/approved from source artwork before implementation.
- Look: practical, premium Australian road-freight identity.
- Deliverables: primary logo, Apple and Google icons, launch/splash screen, upgraded landing page, feature icons, and optional decal/merchandise artwork.

## Current implementation audit (21 November 2026)
- `landing.html` has the correct product name/tagline and a navy layout, but uses **gold #ffc629**, no reference truck hero image and a text-only header brand. It does **not** yet match the approved landing-page mock-up.
- `manifest.webmanifest` references `icons/icon-192.png` and `icons/icon-512.png`, but their visual match to the approved artwork is **not verified**.
- No production-ready source logo/splash assets corresponding to the screenshot have been verified in the repository.
- Repository README describes the deployed app as a **public beta**, not a store-ready release.

## Implementation checklist
- [ ] Obtain/export clean original logo and imagery at suitable resolutions; confirm rights for truck photography and fonts.
- [ ] Replace web header/hero imagery and match orange/navy/white palette; preserve accessibility, mobile layout and existing links.
- [ ] Produce platform-specific app icons from original art and update manifest/native assets.
- [ ] Add splash/launch screen and harmonise feature icons.
- [ ] Verify on Android, iOS and desktop; check legibility at small icon sizes.
- [ ] Review current feature claims and remove references to withdrawn features before publication.
- [ ] Test and deploy only after a release review.

Do not spend money on new branding until existing original source assets have been located and checked.
