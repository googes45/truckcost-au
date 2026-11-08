# COSTR AU core costing prototype

A dependency-free, **non-production** ES module for shared calculations across TruckingCostr AU, HeavyCostr AU, RailCostr AU and AeroCostr AU.

Run `node --test packages/costr-core/index.test.mjs`.

All currency inputs use integer **Australian cents**. Quantities use explicit units; unit costs are returned as cents per unit without presentation rounding. Cost inputs are supplied by the caller, and this module does **not** calculate GST, depreciation, financing, legal fatigue, tax lodgement, aviation dispatch or rail safety compliance.

This is intentionally isolated from the deployed TruckingCostr beta until parity tests, validation and a migration plan are completed. Do not wire into live billing or compliance claims.
