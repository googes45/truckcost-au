import test from 'node:test';
import assert from 'node:assert/strict';

const num = n => { const v = Number(n); return Number.isFinite(v) ? v : 0; };
const jobFuel = j => num(j.distance) / Math.max(.1, num(j.fuel)) * num(j.fuelPrice);
const jobProfit = j => num(j.revenue) - jobFuel(j) - num(j.tolls) - num(j.driver) - num(j.other);
const annualFixed = v => num(v.finance) * 12 + num(v.insurance) * 12 + num(v.regoCost);
const vehicleCostPerKm = (v, expenses, maintenance) => {
  const km = Math.max(1, num(v.odo) - num(v.initialOdo));
  const direct = expenses.filter(e => e.vehicleId === v.id).reduce((a,e) => a + num(e.amount), 0)
    + maintenance.filter(e => e.vehicleId === v.id).reduce((a,e) => a + num(e.amount), 0);
  return (direct + annualFixed(v)) / km;
};

test('job fuel cost is distance divided by km/L times fuel price', () => {
  assert.equal(jobFuel({distance: 1420, fuel: 2.4, fuelPrice: 2.15}), 1271.4583333333333);
});

test('job profit includes fuel, tolls, driver and other costs', () => {
  assert.equal(jobProfit({revenue: 4800, distance: 1420, fuel: 2.4, fuelPrice: 2.15, tolls: 145, driver: 620, other: 0}), 2763.5416666666665);
});

test('vehicle cost per km includes direct and annual fixed costs', () => {
  const v = {id: 1, odo: 684200, initialOdo: 640000, finance: 2100, insurance: 420, regoCost: 180};
  const expenses = [{vehicleId: 1, amount: 1850}];
  const maintenance = [{vehicleId: 1, amount: 980}];
  assert.ok(Math.abs(vehicleCostPerKm(v, expenses, maintenance) - 0.8363348416289593) < 1e-12);
});

test('invalid numeric input does not become a huge cost', () => {
  assert.equal(num('not-a-number'), 0);
  assert.equal(jobFuel({distance: 100, fuel: 0, fuelPrice: 2}), 2000);
});
