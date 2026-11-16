'use strict';
/* Preview only until verified payment entitlements and secure preference writes exist. */
(() => {
 const root=document.documentElement;
 const themes=window.TruckingCostrThemes;
 const css=document.createElement('style');
 css.textContent='body.theme-preview{background:var(--customer-bg)!important;color:var(--customer-text)!important}body.theme-preview .card{background:var(--customer-panel)!important}body.theme-preview .btn:not(.secondary):not(.danger){background:var(--customer-accent)!important;color:#fff!important}body.theme-preview .eyebrow{color:var(--customer-accent)!important}';
 document.head.appendChild(css);
 window.openThemeSettings=()=>{
  const c=document.getElementById('content');if(!c)return;
  c.innerHTML='<div class="hero"><div class="eyebrow">Account settings</div><h1>Appearance</h1><p class="muted">Try a theme before choosing your subscription.</p></div><div class="card"><label for="themeChoice">Colour scheme</label><select id="themeChoice"><option value="blue">Dark Blue & Silver</option><option value="gold">Black, Gold & Chrome</option><option value="red">Black, Red & White</option></select><div id="themeNotice" class="small muted" style="margin-top:12px">Blue & Silver is the default. Premium theme saving is not yet available.</div><div class="actions" style="margin-top:14px"><button class="btn secondary" onclick="resetThemePreview()">Reset preview</button><button class="btn secondary" onclick="go(\'more\')">Back</button></div></div>';
  document.getElementById('themeChoice').addEventListener('change',e=>{
   const name=themes.preview(e.target.value,root);
   document.body.classList.add('theme-preview');
   document.getElementById('themeNotice').textContent='Previewing '+name+'. This is not saved to your account.';
  });
 };
 window.resetThemePreview=()=>{
  themes.preview('blue',root);document.body.classList.remove('theme-preview');
  const sel=document.getElementById('themeChoice');if(sel)sel.value='blue';
  const note=document.getElementById('themeNotice');if(note)note.textContent='Preview reset to the default Dark Blue & Silver.';
 };
})();
