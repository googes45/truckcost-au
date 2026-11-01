# TruckingCostr AU — store listing draft

Status: internal draft only. Do not submit until the native builds, physical-device checks, store billing, privacy declarations and review notes are final.

## Store identity

- App name: TruckingCostr AU
- Android short description: Know your truck costs, fuel use, job margins and trip records.
- iOS subtitle: Truck costs, fuel, jobs and trip records
- Developer contact: jeemswelding2@gmail.com
- Website: https://googes45.github.io/truckcost-au/
- Privacy policy: https://googes45.github.io/truckcost-au/privacy.html
- Account deletion URL (Google Play data deletion form/link): https://googes45.github.io/truckcost-au/delete-account.html
- Terms: https://googes45.github.io/truckcost-au/terms.html
- Proposed Android application ID: au.com.truckingcostr.app
- Proposed iOS bundle ID: au.com.truckingcostr.app

## Store description

Know what your truck really costs.

TruckingCostr AU is an Australian trucking tool for owner-drivers and operators who want a clearer picture of their running costs and job figures.

Features in the current beta:
- Save truck details, odometer readings and operating costs.
- Record fuel fills and compare measured full-tank intervals against kilometres travelled.
- Estimate job revenue, direct costs, overheads and job margins from the figures you enter.
- Track tyre fitment, tyre cost per kilometre and maintenance reminders.
- Record GPS trips, routes, distance and GPS speed while the app is active and location permission is granted.
- Keep a manual driver work/rest diary.
- Browse a starter directory of public weighbridge and inspection locations.
- Back up and restore your workspace using JSON export, and export selected reports as CSV.
- Sign in for a private cloud workspace that syncs between supported devices.

Important limitations:
- The manual diary is not an NHVR-approved Electronic Work Diary and does not calculate legal fatigue limits or replace required statutory records.
- GPS recording can be interrupted when the app is suspended or the device is locked. It is not continuous fleet telematics.
- Job, cost, fuel and margin figures are estimates based on user-entered information, not accounting or tax advice.
- The weighbridge directory may be incomplete or out of date. Confirm site access and operating status with the operator.
- ATO/BAS tools are user-entered reminders only. There is no ATO connection, verified BAS preparation or direct lodgement.
- The NHVR notice channel is not connected or endorsed by NHVR.
- Public joke and shared weighbridge-report feeds are not live in this beta.
- Subscription purchases are not enabled.

## App Review notes draft

Provide a reviewer demo account or confirm that the built-in demo workspace is available in the submitted binary. Keep backend services online for review.

Explain that:
- The app is a truck operating-cost and job-estimate tool.
- GPS is optional and is used only when the user starts trip recording.
- The manual diary is not an approved EWD.
- ATO reminders do not connect to the ATO and do not lodge a BAS.
- No NHVR endorsement or partnership is claimed.
- Account deletion is available from More Stuff → Delete account & cloud data.
- If subscriptions are not enabled in the review binary, state that clearly and do not list unavailable in-app purchase products.

## Privacy and data-safety preparation

The app may process:
- Account email address and authentication/session identifiers.
- Truck, registration, odometer and maintenance details.
- Job revenue, costs, fuel purchases, expenses and tyre records.
- Optional trip route, GPS coordinates, timestamps, speed and distance.
- Manual diary entries and user-entered ATO/BAS reminder dates.
- Workspace backups created by the user.

Cloud workspace data is stored in the Supabase project hosted in Sydney, Australia. Some workspace data is also stored locally in the device/browser profile. JSON exports are plain files. The app does not currently use advertising or an analytics SDK.

Before completing store privacy/data-safety forms, re-check the final binary and all SDK behaviour. Declare the location and business/financial information accurately. Do not claim that data is encrypted end-to-end or that background GPS is continuous.

## Still required before submission

- Final app icon, screenshots and store feature graphics for each store's required sizes.
- Confirm bundle/application ID availability and store product identifiers.
- Supabase Auth Redirect URLs allow-list entry: truckingcostrau://auth/callback.
- Real iPhone and Android device tests, including account creation, email confirmation, sign-in, sign-out, account deletion, GPS permissions, file export/restore and app resume.
- Complete StoreKit 2 and Google Play Billing purchase verification before showing subscriptions.
- App-specific privacy/data-safety declarations and age/content rating.
- Store metadata, reviewer demo access, support process and signed production builds.
- Review Apple App Review Guideline 4.2: the native app must provide a genuinely useful app experience, not just a repackaged website.
