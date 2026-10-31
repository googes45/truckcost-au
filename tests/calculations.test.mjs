import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

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
  assert.ok(Math.abs(jobFuel({distance:1420,fuel:2.4,fuelPrice:2.15}) - 1272.0833333333335) < 1e-9);
});
test('job profit includes fuel, tolls, driver and other costs', () => {
  assert.ok(Math.abs(jobProfit({revenue:4800,distance:1420,fuel:2.4,fuelPrice:2.15,tolls:145,driver:620,other:0}) - 2762.9166666666665) < 1e-9);
});
test('vehicle cost per km includes direct and annual fixed costs', () => {
  const v={id:1,odo:684200,initialOdo:640000,finance:2100,insurance:420,regoCost:180};
  const expenses=[{vehicleId:1,amount:1850}], maintenance=[{vehicleId:1,amount:980}];
  assert.ok(Math.abs(vehicleCostPerKm(v,expenses,maintenance)-0.752262443438914) < 1e-12);
});
test('invalid numeric input is normalised safely', () => {
  assert.equal(num('not-a-number'),0);
  assert.equal(jobFuel({distance:100,fuel:0,fuelPrice:2}),2000);
});
test('manifest icon paths resolve to committed files', async () => {
  const manifest = JSON.parse(await readFile(new URL('../manifest.webmanifest', import.meta.url), 'utf8'));
  for (const icon of manifest.icons) {
    assert.equal(icon.src.startsWith('icons/'), true);
    await readFile(new URL('../' + icon.src, import.meta.url));
  }
});
test('service worker cache shell includes the manifest and both icons', async () => {
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(sw, /manifest\.webmanifest/);
  assert.match(sw, /icons\/icon-192\.png/);
  assert.match(sw, /icons\/icon-512\.png/);
});

test('financial reporting UI includes date ranges, period shortcuts and CSV export', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /setReportPeriod\('quarter'\)/);
  assert.match(html, /function reportData\(\)/);
  assert.match(html, /function exportReportCsv\(\)/);
  assert.match(html, /Estimated job profit/);
  assert.match(html, /Recorded expenses/);
});


test('GPS trip recorder and manual work diary are present with clear beta limitations', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /function startTrip\(\)/);
  assert.match(html, /function resumeTrip\(\)/);
  assert.match(html, /function stopTrip\(\)/);
  assert.match(html, /function haversineKm\(a,b\)/);
  assert.match(html, /function diaryModal\(\)/);
  assert.match(html, /function saveDiaryEntry\(\)/);
  assert.match(html, /function exportDiaryCsv\(\)/);
  assert.match(html, /not an NHVR-approved Electronic Work Diary/);\n  assert.match(html, /nhvr.gov.au\\/safety-accreditation-compliance\\/fatigue-management\\/record-keeping-requirements/);\n  assert.match(html, /nhvr.gov.au\\/safety-accreditation-compliance\\/fatigue-management\\/electronic-work-diary-ewd\\/ewd-register/);
  assert.match(html, /navigator\.geolocation\.watchPosition/);
  assert.match(html, /trips:Array\.isArray\(s\.trips\)/);
  assert.match(html, /diaryEntries:Array\.isArray\(s\.diaryEntries\)/);
});


test('maintenance watch and GPS trip-to-job workflow are present', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /function maintenanceAlertsHtml\(\)/);
  assert.match(html, /function exportTripsCsv\(\)/);
  assert.match(html, /function jobFromTrip\(tripId\)/);
  assert.match(html, /Use distance in job/);
  assert.match(html, /GPS accuracy poor/);
  assert.match(html, /not continuous fleet telematics/);
  assert.match(html, /trips:\[\],diaryEntries:\[\],activeTrip:null/);
});
