# TruckCost AU — deployment starter

This folder contains the recovered TruckCost AU HTML prototype and the missing Progressive Web App (PWA) support files.

## Publish a test version with GitHub Pages
1. Sign in to GitHub and create a **new public repository** named `truckcost-au` (or use a private repository with a hosting service that supports it).
2. Upload the contents of this folder to the repository root. Make sure `index.html`, `manifest.webmanifest`, `sw.js`, and the `icons` folder are at the top level as shown.
3. In the repository, open **Settings → Pages**. Under build/deployment, select **Deploy from a branch**, choose `main` and `/ (root)`, then save.
4. Wait for GitHub Pages to publish, then open the URL shown on the Pages settings screen.
5. On Android Chrome, open that HTTPS URL, tap the browser menu, and choose **Install app** or **Add to Home screen** if offered.

## Important limitations
- This is a prototype and stores app records locally in the browser; it does not yet have secure server-side accounts or cloud synchronisation.
- Sign-in in the prototype is a demonstration only. Do not use real passwords or treat it as secure authentication.
- Receipt processing is a demo workflow and does not provide verified OCR/accounting integration.
- Before using real business records, test all calculations and backup/restore. Keep independent backups.
- A public repository makes its code public. Do not upload real customer, vehicle, financial, or other private data to the repository.
