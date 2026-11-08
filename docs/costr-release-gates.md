# COSTR AU release gates — 9 November 2026

**Status:** TruckingCostr AU is a beta; HeavyCostr AU, RailCostr AU and AeroCostr AU are calculation/UI prototypes only. None of the new products has a production backend, store submission or payment integration.

## Engineering acceptance
- [ ] GitHub Actions tests pass on the exact candidate commit.
- [ ] Independently verify calculation fixtures and Australian cents/GST handling.
- [ ] Validate inputs, overflow, rounding, zero revenue and negative margin.
- [ ] Implement organisation isolation, roles and backend access policies per product.
- [ ] Add encrypted transport, appropriate storage protection, backup/restore and audit logs.
- [ ] Test on real Android and iOS devices, including offline, accessibility and lifecycle behaviour.
- [ ] Set up production monitoring, incident response, privacy and support procedures.

## Commerce and compliance
- [ ] Implement Apple and Google in-app purchases or an applicable approved billing flow, verified server-side.
- [ ] Confirm business identity, tax registration status, payout bank details and GST treatment.
- [ ] Clear all product names/logos and finalise licence and IP documentation.
- [ ] Review each product's privacy policy, terms, data collection disclosures and store metadata.
- [ ] Obtain specialist rail and aviation requirements reviews before any safety/compliance claims.
- [ ] Obtain formal NHVR EWD approval before advertising a legally compliant electronic work diary.
- [ ] Do not claim ATO BAS lodgement or NHVR one-way publisher access before agreements and live integrations.

## Deployment strategy
1. Keep existing TruckingCostr AU beta stable.
2. Validate the shared calculation module, then compare outputs against the existing truck calculator.
3. Deploy **explicitly labelled demo previews** on a separate URL only after QA; no account, payment or official-approval claims.
4. Pilot HeavyCostr with real operator input; then rail and aviation.
5. Publish separate store apps only after individual acceptance gates pass.

## Current evidence
- Shared costing module: `packages/costr-core/index.mjs`
- Unit tests: `packages/costr-core/index.test.mjs`
- Browser preview: `previews/index.html`
- Source checks: `scripts/check-costr-preview.mjs`
- CI workflow: `.github/workflows/costr-expansion-tests.yml`
- Review: GitHub pull request #3 (draft)

**Do not equate committed source, a draft pull request or an unverified CI run with a finished published application.**
