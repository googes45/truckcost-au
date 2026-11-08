/**
 * COSTR AU shared costing primitives (prototype).
 * Amounts are integer cents. Rates are explicit decimal strings.
 * Pure functions; no regulatory or tax-filing functionality.
 */
export function nonnegativeCents(value, name = 'amount') {
  if (!Number.isSafeInteger(value) || value < 0) throw new RangeError(name + ' must be a non-negative integer number of cents');
  return value;
}
export function positiveNumber(value, name = 'quantity') {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) throw new RangeError(name + ' must be a finite positive number');
  return value;
}
export function nonnegativeNumber(value, name = 'quantity') {
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) throw new RangeError(name + ' must be a finite non-negative number');
  return value;
}
export function sumCents(values) {
  if (!Array.isArray(values)) throw new TypeError('values must be an array');
  return values.reduce((sum, value) => {
    nonnegativeCents(value);
    const next = sum + value;
    if (!Number.isSafeInteger(next)) throw new RangeError('total exceeds safe integer cents');
    return next;
  }, 0);
}
export function margin({ revenueCents, costCents }) {
  nonnegativeCents(revenueCents, 'revenueCents');
  nonnegativeCents(costCents, 'costCents');
  const profitCents = revenueCents - costCents;
  if (!Number.isSafeInteger(profitCents)) throw new RangeError('profit exceeds safe integer cents');
  return { revenueCents, costCents, profitCents, marginPercent: revenueCents === 0 ? null : (profitCents / revenueCents) * 100 };
}
export function unitCost({ costCents, units }) {
  nonnegativeCents(costCents, 'costCents');
  positiveNumber(units, 'units');
  return costCents / units; // cents per unit, displayed with explicit rounding in UI
}
export function jobEstimate({ revenueCents, directCostsCents, allocatedOverheadsCents = 0 }) {
  nonnegativeCents(allocatedOverheadsCents, 'allocatedOverheadsCents');
  const costCents = sumCents([...directCostsCents, allocatedOverheadsCents]);
  return margin({ revenueCents, costCents });
}
export function trucking({ fuelLitres, distanceKm, costCents, revenueCents }) {
  nonnegativeNumber(fuelLitres, 'fuelLitres');
  positiveNumber(distanceKm, 'distanceKm');
  return { litresPer100Km: fuelLitres / distanceKm * 100, costCentsPerKm: unitCost({ costCents, units: distanceKm }), ...margin({ revenueCents, costCents }) };
}
export function heavy({ equipmentHours, mobilisationCents, operatingCents, revenueCents }) {
  positiveNumber(equipmentHours, 'equipmentHours');
  const costCents = sumCents([mobilisationCents, operatingCents]);
  return { costCentsPerHour: unitCost({ costCents, units: equipmentHours }), ...margin({ revenueCents, costCents }) };
}
export function rail({ trainKm, payloadTonnes, operatingCents, accessCents, revenueCents }) {
  positiveNumber(trainKm, 'trainKm');
  positiveNumber(payloadTonnes, 'payloadTonnes');
  const costCents = sumCents([operatingCents, accessCents]);
  return { costCentsPerTrainKm: unitCost({ costCents, units: trainKm }), costCentsPerTonneKm: unitCost({ costCents, units: trainKm * payloadTonnes }), ...margin({ revenueCents, costCents }) };
}
export function aviation({ flightHours, operatingCents, maintenanceReserveCents, landingCents, revenueCents }) {
  positiveNumber(flightHours, 'flightHours');
  const costCents = sumCents([operatingCents, maintenanceReserveCents, landingCents]);
  return { costCentsPerFlightHour: unitCost({ costCents, units: flightHours }), ...margin({ revenueCents, costCents }) };
}
