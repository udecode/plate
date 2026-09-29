import { test, expect } from '@playwright/test';
import { writeFileSync } from 'node:fs';
import { createBrowserEditorHarness, recordBrowserRuntimeErrors, installReactRenderProfiler, resetReactRenderProfiler, getReactRenderProfilerSnapshot } from '@platejs/test/playwright';

for (const mode of ['editable','static'] as const) {
  test(`exact streaming route ${mode} observable probe`, async ({page,browser})=>{
    const errors=recordBrowserRuntimeErrors(page);
    const consoleErrors:string[]=[];
    page.on('pageerror',e=>consoleErrors.push(e.message));
    await installReactRenderProfiler(page);
    let result:any={mode,url:'http://localhost:3297/blocks/markdown-streaming-demo',browser:browser.version(),build:'source-first Next development',fixture:'existing columns scenario; no injected 10/50KB source',viewport:{width:1280,height:720}};
    try {
      await page.goto('/blocks/markdown-streaming-demo',{waitUntil:'commit',timeout:60_000});
      const heading=page.getByRole('heading',{name:/^Transformed Chunks/});
      await expect(heading).toBeVisible({timeout:30_000});
      const editable=page.locator('[data-editor="true"]').first();
      await createBrowserEditorHarness(page,'markdown-streaming-demo',editable).ready({editor:'visible'});
      result.before=await editable.evaluate((el:any)=>({handleMethods:Object.keys(el.__pliteBrowserHandle??{}),nodeCount:el.querySelectorAll('[data-editor-node]').length}));
      await page.getByRole('combobox').first().selectOption('columns');
      await page.getByRole('combobox').nth(1).selectOption('10');
      if(mode==='static')await page.getByRole('button',{name:'Switch to PlateStatic',exact:true}).click();
      await resetReactRenderProfiler(page);
      await page.evaluate(()=>{
        const w=window as any;
        const output=[...document.querySelectorAll('h3')].find(e=>e.textContent==='Editor Output')?.parentElement;
        if(!output)throw Error('Output host missing');
        const rows:any[]=[];
        const observer=new MutationObserver(records=>{rows.push({time:performance.now(),records:records.length,text:output.textContent?.slice(0,250)});});
        observer.observe(output,{subtree:true,childList:true,characterData:true});
        const button=document.querySelector('button[aria-label="Start streaming"]');
        const click=(e:Event)=>{if((e.target as Element)?.closest('button')===button)w.__streamEvidence.start=performance.now();};
        document.addEventListener('click',click,true);
        w.__streamEvidence={rows,observer,click,output,start:null};
      });
      await page.getByRole('button',{name:'Start streaming',exact:true}).click();
      await expect(heading).toHaveText(/^Transformed Chunks \(([1-9]\d*)\/\1\)$/,{timeout:20_000});
      const output=page.getByRole('heading',{name:'Editor Output'}).locator('..');
      await expect(output.locator('[class~="group/column"]')).toHaveText(['1','2','3']);
      await expect(output).not.toContainText(/<\/?column(?:Group|_group)/);
      result.observation=await page.evaluate(async()=>{
        const p=(window as any).__streamEvidence;
        const domVerified=performance.now();
        await new Promise(requestAnimationFrame);
        const raf1=performance.now();
        await new Promise(requestAnimationFrame);
        const raf2=performance.now();
        p.observer.disconnect();document.removeEventListener('click',p.click,true);
        return {start:p.start,domVerifiedMs:domVerified-p.start,raf1Ms:raf1-p.start,raf2Ms:raf2-p.start,mutations:p.rows.map((r:any)=>({...r,sinceClickMs:r.time-p.start})),text:p.output.textContent,nodeCount:p.output.querySelectorAll('[data-editor-node]').length,rootHandles:[...p.output.querySelectorAll('[data-editor="true"]')].map((el:any)=>({readOnly:el.getAttribute('data-readonly'),methods:Object.keys(el.__pliteBrowserHandle??{})}))};
      });
      result.profiler=await getReactRenderProfilerSnapshot(page);
      errors.assertNone();
      result.status='passed';
      await page.screenshot({path:`${__dirname}/browser-${mode}.png`,fullPage:false});
    } catch(error) {
      result.status='failed';result.error=String(error);throw error;
    } finally {
      result.consoleErrors=consoleErrors;
      writeFileSync(`${__dirname}/browser-${mode}.json`,JSON.stringify(result,null,2)+'\n');
      errors.stop();
    }
  });
}
