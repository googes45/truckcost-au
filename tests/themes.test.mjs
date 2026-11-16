import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source=readFileSync(new URL('../customer-themes.js',import.meta.url),'utf8');
function loadThemes(){
 const window={};const context=vm.createContext({window,document:{documentElement:{style:{setProperty(){}}}}});
 vm.runInContext(source,context);
 return window.TruckingCostrThemes;
}
test('three distinct palettes are defined',()=>{
 const api=loadThemes();
 assert.deepEqual(Object.keys(api.themes).sort(),['blue','gold','red']);
 assert.notEqual(api.themes.blue.accent,api.themes.red.accent);
});
test('premium theme is denied unless entitlement is explicitly true',()=>{
 const api=loadThemes();
 for(const value of [undefined,null,false,0,'true'])assert.equal(api.effectiveTheme('gold',value),'blue');
 assert.equal(api.effectiveTheme('gold',true),'gold');
 assert.equal(api.effectiveTheme('red',true),'red');
 assert.equal(api.effectiveTheme('invalid',true),'blue');
});
test('preview writes all customer theme CSS variables',()=>{
 const api=loadThemes();const vars={};
 const element={style:{setProperty(k,v){vars[k]=v;}}};
 assert.equal(api.preview('gold',element),'Black, Gold & Chrome');
 for(const key of ['--customer-bg','--customer-panel','--customer-accent','--customer-text'])assert.ok(vars[key]);
});
test('no Stripe secret or service role key is embedded in public billing screen',()=>{
 const source=readFileSync(new URL('../billing-settings.js',import.meta.url),'utf8');
 assert.doesNotMatch(source,/sk_(test|live)_[A-Za-z0-9]{10,}/);
 assert.doesNotMatch(source,/SUPABASE_SERVICE_ROLE_KEY/);
});
