# TruckingCostr AU — owner actions required before commercial release

The development work that can be completed through the connected GitHub and Supabase projects is being handled in the repository. These remaining items require the account holder, a physical device, a platform approval or an external authority.

## One-time owner actions

1. **Supabase Auth callback allow-list**
   - Open Supabase Dashboard → Authentication → URL Configuration.
   - Keep the existing GitHub Pages redirect.
   - Add this exact Redirect URL: `truckingcostrau://auth/callback`.
   - Save the change. This is needed for native email confirmation and password reset.

2. **Apple App Store Connect**
   - Create the app record using bundle ID `au.com.truckingcostr.app` (subject to availability).
   - Complete the Paid Apps Agreement, Australian tax information and banking details if subscriptions will be sold.
   - Configure the app's privacy answers, screenshots, support URL and review contact.
   - The current iOS CI output is an unsigned simulator build, not an App Store archive. A signed archive requires Apple distribution signing/provisioning through the owner's account.

3. **Google Play Console**
   - Create the app record using application ID `au.com.truckingcostr.app` (subject to availability).
   - Complete the app content, data safety, account deletion URL and store listing.
   - The current Android CI output is a debug APK, not a signed release AAB. A production AAB needs Play App Signing / upload-key setup through the owner's account.

4. **Physical-device checks**
   - Install the debug APK on a supported Android phone and test sign-up, confirmation link, sign-in, password reset, account deletion, GPS permission, trip recording, export/restore and app resume.
   - Run the equivalent checks on a real iPhone using a signed development/TestFlight build.
   - Use a licensed driver for any road test. The owner does not need to drive or hold a current driver's licence to own or publish the app.

## External approvals and services

- **Subscriptions:** Store products, StoreKit 2 and Google Play Billing purchase verification, notifications, renewal/refund/restore processing and paid-feature gates still need implementation and testing. No customer can currently buy a plan.
- **ATO/BAS:** Direct BAS lodgement requires the appropriate ATO SBR software-provider registration, technical onboarding, supported scope and testing. User-entered reminders are not an ATO integration.
- **NHVR notices:** The one-way publisher channel must remain inactive until NHVR authorises a publisher arrangement. No NHVR access to driver data or return-data feed is to be introduced.
- **Fleet Boss:** Do not sell until fleet roles, invitations, shared workspaces and tenant isolation are complete and tested.
- **Public community feeds:** Jokes and weighbridge reports are not live as shared feeds. Moderation, reporting and abuse-handling controls are required before public user-generated content is enabled.

## Security

Never send passwords, Apple/Google credentials, signing keys, bank details, TFN or Supabase service-role secrets in chat or commit them to GitHub. Enter them only in the official platform dashboards or secure local signing environment.
