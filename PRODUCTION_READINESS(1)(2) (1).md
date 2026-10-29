# TruckCost AU — production readiness and QA status

## User-reported demo QA (2026-10-29)
- App opens: PASS
- Navigation: PASS
- Job calculator screen: PASS (screen flow only; arithmetic still needs verification)
- Saving/retrieving a job: PASS
- Notes: none provided

## QA candidate v0.5 corrections prepared locally
- Cloud status corrected to LOCAL DEMO; account copy now states local-only storage.
- Dashboard and vehicle cost/km use recorded expenses + maintenance divided by recorded odometer kilometres. Fixed overheads are excluded and disclosed pending a period-based costing model.
- Estimated job fuel shown separately from recorded expenses to reduce double-counting risk.
- Job validation added for positive distance and fuel economy, non-negative revenue/costs, and a required job name.
- Backup restore validates expected top-level arrays before replacing state.
- Receipt screen explicitly states that OCR is not implemented and requires manual field verification.

## Validation performed on the local candidate
- JavaScript syntax check: PASS.
- Expected sample arithmetic independently checked: fuel $1,272.08; profit $2,762.92; margin 57.56%; profit/km $1.95.
- Browser/device QA of the corrected build: NOT YET RUN.
- GitHub Pages deployment of the corrected build: NOT YET VERIFIED.

## Next release gates
1. Upload this candidate to GitHub Pages and run the QA checklist in the package README.
2. Add full schema/version validation and robust input validation to vehicle, expense, fuel, maintenance, and receipt forms.
3. Agree a cost-accounting model: reporting period, odometer baseline, fuel actuals vs estimates, overhead allocation, depreciation, and job-to-truck attribution.
4. Add automated tests for calculation rules, import/export and data migrations.
5. Configure a real backend and authentication only after the costing/data model is stable; then implement tenant isolation, backups, audit trail, privacy/security review, monitoring and recovery tests.
6. Add production OCR only with a real provider, explicit consent, data retention rules and human verification of extracted values.

## Release status
The app remains a demo. No claim is made that the updated candidate is live on GitHub Pages or that secure accounts, cloud sync, payments, or OCR are implemented.
