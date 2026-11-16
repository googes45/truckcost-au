'use strict';
/* TruckingCostr AU: appearance preview. Paid unlock must come from a trusted billing backend. */
window.TruckingCostrThemes = (() => {
 const themes = Object.freeze({
  blue:{name:'Dark Blue & Silver',bg:'#091a34',panel:'#142e52',accent:'#168bfa',text:'#e8eef8'},
  gold:{name:'Black, Gold & Chrome',bg:'#101010',panel:'#242424',accent:'#e5b84f',text:'#e9edf2'},
  red:{name:'Black, Red & White',bg:'#141414',panel:'#2b2022',accent:'#ef2636',text:'#ffffff'}
 });
 function preview(theme='blue',element=document.documentElement){
  const t=themes[theme]||themes.blue;
  element.style.setProperty('--customer-bg',t.bg);
  element.style.setProperty('--customer-panel',t.panel);
  element.style.setProperty('--customer-accent',t.accent);
  element.style.setProperty('--customer-text',t.text);
  return t.name;
 }
 function effectiveTheme(savedTheme,verifiedEntitlement){
  return verifiedEntitlement===true && Object.hasOwn(themes,savedTheme)?savedTheme:'blue';
 }
 return Object.freeze({themes,preview,effectiveTheme});
})();
