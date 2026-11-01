# TruckingCostr AU — subscriptions and GST launch setup

Status: payment preparation only. No payment processor or Apple/Google purchase verification is connected and no customer can currently subscribe or be charged. A private server-side subscription schema and authenticated entitlement-read endpoint have now been deployed; these are infrastructure components, not a working checkout.

## Business tax position supplied by owner

The owner has confirmed that the business is GST-registered and has an ABN. Do not place the ABN, GST registration evidence, bank details, tax file number, passwords, API keys or store credentials in source control or chat.

Prices below are proposed Australian customer prices, in AUD, GST-inclusive where the supply is taxable at 10%. Confirm the correct tax treatment for each storefront and customer location with the business's tax adviser before activating sales.

| Internal product ID | Store display name | Price | Billing | Entitlement |
|---|---|---:|---|---|
| `diary_monthly` | Diary Truckie | $5.00 | Monthly | Manual digital work/rest diary |
| `owner_monthly` | Owner-Driver | $14.99 | Monthly | Owner-operator costing toolkit + diary |
| `fleet_monthly` | Fleet Boss | $39.99 | Monthly | Fleet plan + diary (fleet features must be delivered before sale) |

Free Truckie remains $0. Paid plan access must never be inferred from a client-side price label or editable browser storage.

## GST arithmetic at 10% (inclusive prices)

For a GST-inclusive taxable price, GST component = price / 11.

| Price | GST component (rounded) | Amount excluding GST (rounded) |
|---:|---:|---:|
| $5.00 | $0.45 | $4.55 |
| $14.99 | $1.36 | $13.63 |
| $39.99 | $3.64 | $36.35 |

These are illustrative tax components before platform commissions, payment fees, refunds, chargebacks or other adjustments. They are not a forecast of net payout. Reconcile actual platform tax statements and fees in the BAS.

## Required billing architecture

1. **Apple:** create auto-renewable subscription products in App Store Connect, sign the Paid Apps Agreement, submit Australian ABN and proof of GST registration, enter tax forms and bank details. Apple states Australian developers need GST registration evidence to sell apps. Apple proceeds are customer price less applicable taxes and commission.
2. **Google Play:** create subscription products in Play Console and integrate Google Play Billing for digital features. As an Australian developer, enter the ABN in the Play Console payments profile and configure Australian tax information. Google says Australian developers are responsible for determining, charging and remitting GST on Australian Play paid-app and in-app purchases.
3. **Web checkout (if offered):** use a separate Stripe Billing integration with GST-inclusive prices, the correct Australian tax rate, ABN tax ID and compliant tax invoices. Do not use Stripe checkout to bypass Apple/Google billing requirements for digital subscriptions in their stores.
4. **Server-side entitlement service:** verify Apple/Google purchase tokens or receipts on a trusted server; verify Stripe webhook signatures; store the canonical active entitlement server-side; handle renewals, expiry, cancellation, grace periods, refunds, chargebacks, restore purchases and account changes.
5. **Access enforcement:** free, diary, owner and fleet capabilities must be checked against server-verified entitlements. Never trust a client-supplied plan name or a local-storage flag. Lifetime complimentary grants must be checked server-side and bypass recurring billing only when active.
6. **Customer and finance operations:** provide clear renewal/cancellation terms, restore purchases, support contact, privacy disclosures, subscription management links, refund handling, GST/tax invoice process and a reconciliation process for each sales channel.

## Product and compliance guardrails

- The $5 diary is a manual digital work/rest log only. It is not an NHVR-approved Electronic Work Diary (EWD) and must not be marketed as replacing an approved EWD or legally required written work diary.
- Fleet Boss must not be sold as delivering multi-user fleet functionality until fleet roles, sharing, invitations and access isolation are implemented and tested.
- Store prices may vary by country and platform. Maintain the advertised AUD base prices consistently, and confirm storefront price tiers before release.
- Do not claim that the owner receives the full sticker price. Platform commissions, taxes, refunds, foreign exchange and payment fees affect proceeds.
- Keep NHVR's planned official notices channel strictly one-way publish-only. Billing providers and app stores do not gain access to driver/fleet operational records through that channel.

## Launch checklist

- [ ] Confirm legal seller name matches ABN/GST registration and store account entity.
- [ ] Complete Apple Paid Apps Agreement, Australian ABN/GST evidence, tax forms and bank account.
- [ ] Complete Google Play payments profile, ABN/tax details and bank account.
- [ ] Decide whether web subscriptions are needed and open/configure Stripe only if required.
- [ ] Create matching monthly subscription products with the internal IDs above.
- [ ] Implement native Apple and Google purchase flows in store-distributed app builds.
- [ ] Implement server-side purchase verification, subscription webhooks and entitlement database.
- [ ] Implement lifetime-free grant bypass in the same server-side entitlement check.
- [ ] Test new purchase, renewal, cancellation, expiry, grace period, refund, chargeback, restore and cross-device sign-in.
- [ ] Validate GST invoices/statements and BAS reconciliation with the tax adviser.
- [ ] Complete privacy/security review and store review before accepting public payments.

## Official references checked 1 November 2026

- Apple Australian developer tax information: https://developer.apple.com/help/app-store-connect/manage-tax-information/provide-tax-information
- Apple banking setup: https://developer.apple.com/help/app-store-connect/manage-banking-information/enter-banking-information
- Apple proceeds and commission reporting: https://developer.apple.com/help/app-store-connect/getting-paid/view-payments-and-proceeds
- Google Play Australia tax guidance: https://support.google.com/googleplay/android-developer/answer/138000
- Google Play payments policy for digital features: https://support.google.com/googleplay/android-developer/answer/10281818
- Stripe Australian invoice requirements: https://support.stripe.com/questions/issue-invoices-to-australia-and-new-zealand-customers

This document is implementation guidance, not tax or legal advice.
