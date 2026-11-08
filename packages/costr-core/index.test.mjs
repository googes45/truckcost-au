import test from 'node:test';
import assert from 'node:assert/strict';
import { sumCents, margin, jobEstimate, trucking, heavy, rail, aviation } from './index.mjs';

test('integer-cent arithmetic and loss-making jobs', () => {
  assert.equal(sumCents([100, 200, 33]), 333);
  assert.deepEqual(margin({ revenueCents: 1000, costCents: 1200 }), { revenueCents: 1000, costCents: 1200, profitCents: -200, marginPercent: -20 });
  assert.equal(jobEstimate({ revenueCents: 1000, directCostsCents: [200, 300], allocatedOverheadsCents: 100 }).profitCents, 400);
});
test('trucking uses actual measured distance and litres', () => {
  const r = trucking({ fuelLitres: 300, distanceKm: 1000, costCents: 150000, revenueCents: 200000 });
  assert.equal(r.litresPer100Km, 30);
  assert.equal(r.costCentsPerKm, 150);
  assert.equal(r.profitCents, 50000);
});
test('heavy equipment hourly costs', () => {
  const r = heavy({ equipmentHours: 10, mobilisationCents: 20000, operatingCents: 80000, revenueCents: 130000 });
  assert.equal(r.costCentsPerHour, 10000);
  assert.equal(r.profitCents, 30000);
});
test('rail tonne kilometre costs', () => {
  const r = rail({ trainKm: 500, payloadTonnes: 1000, operatingCents: 400000, accessCents: 100000, revenueCents: 800000 });
  assert.equal(r.costCentsPerTonneKm, 1);
  assert.equal(r.profitCents, 300000);
});
test('aviation flight-hour maintenance reserves', () => {
  const r = aviation({ flightHours: 2, operatingCents: 90000, maintenanceReserveCents: 10000, landingCents: 20000, revenueCents: 180000 });
  assert.equal(r.costCentsPerFlightHour, 60000);
  assert.equal(r.profitCents, 60000);
});
test('invalid and unsafe inputs are rejected', () => {
  assert.throws(() => sumCents([1.5]));
  assert.throws(() => sumCents([Number.MAX_SAFE_INTEGER, 1]));
  assert.throws(() => trucking({ fuelLitres: 10, distanceKm: 0, costCents: 100, revenueCents: 100 }));
  assert.throws(() => rail({ trainKm: 10, payloadTonnes: 0, operatingCents: 100, accessCents: 0, revenueCents: 100 }));
  assert.equal(margin({ revenueCents: 0, costCents: 0 }).marginPercent, null);
});
