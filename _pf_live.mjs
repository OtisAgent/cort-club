import { chromium } from 'playwright';
const b = await chromium.launch();
const ctx = await b.newContext({ viewport:{width:390,height:840}, deviceScaleFactor:2,
  userAgent:'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1' });
const p = await ctx.newPage();
try {
  const r = await p.goto('https://www.cortclub.co.uk/pages/cort-partners', {waitUntil:'domcontentloaded', timeout:45000});
  console.log('status', r && r.status());
  await p.waitForTimeout(2500);
  // jump to the apply form
  await p.evaluate(()=>{const a=document.querySelector('#apply');if(a)a.scrollIntoView();});
  await p.waitForTimeout(800);
  // pick a long option in a ships_direct-style select if present
  const sel = await p.$('select[name="ships_direct"]');
  if(sel){ await p.selectOption('select[name="ships_direct"]', {index:1}).catch(()=>{}); }
  await p.waitForTimeout(400);
  await p.screenshot({ path:'/tmp/pf/live.png', fullPage:false });
  // measure input vs select heights live
  const m = await p.evaluate(()=>{
    const inp=document.querySelector('.cp2 .field input:not([type=hidden])');
    const s=document.querySelector('.cp2 .field select');
    if(!inp||!s) return {err:'fields not found'};
    return {inputH:inp.offsetHeight, selectH:s.offsetHeight, padR:getComputedStyle(s).paddingRight, appearance:getComputedStyle(s).appearance};
  });
  console.log(JSON.stringify(m));
} catch(e){ console.log('ERR', e.message); }
await b.close();
