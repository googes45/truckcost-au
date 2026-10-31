import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

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
  assert.match(html, /not an NHVR-approved Electronic Work Diary/);
  assert.ok(html.includes('record-keeping-requirements'));
  assert.ok(html.includes('electronic-work-diary-ewd/ewd-register'));
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


test('trip recorder supports truck selection and pauses safely when app backgrounds', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const sw = await readFile(new URL('../sw.js', import.meta.url), 'utf8');
  assert.match(html, /id="tripVehicle"/);
  assert.match(html, /document\.addEventListener\('visibilitychange'/);
  assert.match(html, /Paused — app moved to background/);
  assert.match(sw, /truckcost-au-shell-v8/);
});


test('all inline JavaScript in the app parses without syntax errors', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  const scripts = html.split('<script>').slice(1).map(part => part.split('</script>')[0]);
  assert.ok(scripts.length > 0, 'expected inline app scripts');
  for (const script of scripts) new vm.Script(script[1]);
});


const measuredFuelIntervals = fills => {
  const sorted = fills.filter(x => x.fullTank && num(x.odo) > 0 && num(x.litres) > 0)
    .sort((a,b) => num(a.odo)-num(b.odo));
  const intervals = [];
  for (let i=1;i<sorted.length;i++) {
    const from=sorted[i-1],to=sorted[i],km=num(to.odo)-num(from.odo);
    if(km<=0) continue;
    const included=fills.filter(x=>num(x.odo)>num(from.odo)&&num(x.odo)<=num(to.odo));
    const litres=included.reduce((a,x)=>a+num(x.litres),0);
    const cost=included.reduce((a,x)=>a+num(x.amount),0);
    if(litres>0) intervals.push({km,litres,cost,lPer100:litres/km*100,costPerKm:cost/km});
  }
  return intervals;
};

test('full-tank fuel intervals include partial fills between full fills', () => {
  const fills=[
    {odo:100000,litres:400,amount:800,fullTank:true},
    {odo:100500,litres:200,amount:420,fullTank:false},
    {odo:101000,litres:400,amount:840,fullTank:true}
  ];
  const [i]=measuredFuelIntervals(fills);
  assert.equal(i.km,1000);
  assert.equal(i.litres,600);
  assert.equal(i.cost,1260);
  assert.equal(i.lPer100,60);
  assert.equal(i.costPerKm,1.26);
});

test('fuel interval calculation ignores incomplete or invalid intervals', () => {
  assert.equal(measuredFuelIntervals([
    {odo:1000,litres:100,amount:200,fullTank:true},
    {odo:1000,litres:80,amount:160,fullTank:true},
    {odo:1200,litres:0,amount:0,fullTank:true}
  ]).length,0);
});

test('fuel tracking captures litres, odometer and full-tank boundary', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/id="ffull"/);
  assert.match(html,/pricePerLitre/);
  assert.match(html,/function fuelIntervalStats\(v\)/);
  assert.match(html,/function saveFuel\(\)/);
  assert.match(html,/L\/100 km/);
  assert.match(html,/Fuel cost \/ km/);
});


test('fuel trend alerts require four intervals and flag material deterioration', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/function fuelEfficiencyAlert\(v\)/);
  assert.match(html,/intervals\.length<4/);
  assert.match(html,/change>=15/);
  assert.match(html,/Fuel use is more than 15% above recent average/);
  assert.match(html,/Fuel trend alert/);
});


test('true-cost job estimate uses measured fuel cost and allocates non-fuel truck costs', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/function vehicleNonFuelCostPerKm\(v\)/);
  assert.match(html,/function jobCostBreakdown\(j\)/);
  assert.match(html,/fuelStats\.km\?fuelStats\.costPerKm\*num\(j\.distance\):jobFuel\(j\)/);
  assert.match(html,/truck overhead/);
  assert.match(html,/id="jcostdetail"/);
});

test('minimum charge calculator prices in a requested margin without division by zero', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/function minimumJobRevenue\(cost,marginPercent\)/);
  assert.match(html,/id="jmargin"/);
  assert.match(html,/Minimum revenue for target margin/);
  const revenueFor20Percent=1000/(1-.2);
  assert.equal(revenueFor20Percent,1250);
});


test('tyre lifecycle tracks fitted distance, cost per km and removal odometer', async () => {
  const html=await readFile(new URL('../index.html',import.meta.url),'utf8');
  assert.match(html,/function tyreDistance\(t\)/);
  assert.match(html,/function tyreCostPerKm\(t\)/);
  assert.match(html,/function tyreModal\(\)/);
  assert.match(html,/function retireTyre\(tid\)/);
  assert.match(html,/Tyre lifecycle/);
  assert.match(html,/Record tyre installation/);
});


test('weigh station finder supports driver status reports with freshness limits', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /NHVR weigh stations & weighbridges/);
  assert.match(html, /function saveWeighReport\(siteId\)/);
  assert.match(html, /function latestWeighReport\(siteId\)/);
  assert.match(html, /3\*60\*60\*1000/);
  assert.match(html, /weighReports:Array\.isArray\(s\.weighReports\)/);
  assert.match(html, /All licensed public weighbridges/);
  assert.match(html, /PW-0508/);
  assert.match(html, /PW-0123/);
  assert.match(html, /function weighDirections/);
});


test('national NMI public weighbridge locations are included across every state and territory', async () => {
  const html = await readFile(new URL('../index.html', import.meta.url), 'utf8');
  for (const state of ['ACT','NSW','NT','QLD','SA','TAS','VIC','WA']) assert.match(html, new RegExp("state:'"+state+"'"));
  assert.match(html, /PW-0330/);
  assert.match(html, /PW-0226/);
  assert.match(html, /PW-0502/);
  assert.match(html, /PW-0372/);
  assert.match(html, /PW-0186/);
  assert.match(html, /PW-0050/);
  assert.match(html, /PW-0395/);
  assert.match(html, /NMI_NATIONAL_SITES/);
});
