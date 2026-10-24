import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
test('180-frame standalone ZIP remains downloadable and reports real size, picker failures and retry success',async({page})=>{
 test.setTimeout(120000);
 await page.goto('/Haunted-Meter-Standalone.html');
 await page.locator('#display-mode').selectOption('overlay');
 await page.locator('#speed').fill('4');
 await page.locator('#export').click();
 await expect(page.locator('.zip-card')).toBeVisible({timeout:90000});
 await expect(page.locator('#export-status')).toContainText('ZIP file ready');
 await expect(page.locator('.zip-card')).toContainText('180 frames');
 const details=await page.locator('.zip-card').evaluate(async card=>{const a=card.querySelector('a'),response=await fetch(a.href),blob=await response.blob();return{size:blob.size,url:a.href,text:card.textContent}});
 expect(details.size).toBeGreaterThan(1000000);expect(details.text).toContain(details.size.toLocaleString('en-US')+' bytes');
 // A failed save must not discard the rendered ZIP or claim success.
 await page.evaluate(()=>{window.showSaveFilePicker=async()=>{throw new DOMException('Test write permission denied','NotAllowedError')}});
 await page.getByRole('button',{name:'Save ZIP',exact:true}).click();
 await expect(page.locator('.save-status')).toContainText('Save failed: Test write permission denied');
 // A disk-write failure must be surfaced and abort the writable stream.
 await page.evaluate(()=>{window.testAborted=false;window.showSaveFilePicker=async()=>({createWritable:async()=>({write:async()=>{throw new Error('Disk full')},abort:async()=>{window.testAborted=true}})})});
 await page.getByRole('button',{name:'Save ZIP',exact:true}).click();await expect(page.locator('.save-status')).toContainText('Save failed: Disk full');expect(await page.evaluate(()=>window.testAborted)).toBe(true);
 // Retry successfully writes the same Blob, then closes it before claiming saved.
 await page.evaluate(()=>{window.testSave={};window.showSaveFilePicker=async options=>{window.testSave.name=options.suggestedName;return{createWritable:async()=>({write:async blob=>{window.testSave.size=blob.size},close:async()=>{window.testSave.closed=true}})}}});
 await page.getByRole('button',{name:'Save ZIP',exact:true}).click();
 await expect(page.locator('.save-status')).toContainText('Saved successfully');
 expect(await page.evaluate(()=>window.testSave)).toEqual({name:'haunted-level-3-transparent.zip',size:details.size,closed:true});
 // Exercise the real native Blob-link download, independent of picker mocks.
 const wait=page.waitForEvent('download');await page.locator('.zip-link').click();const download=await wait;
 await download.saveAs('/tmp/haunted-180-save-test.zip');expect((await fs.stat('/tmp/haunted-180-save-test.zip')).size).toBe(details.size);
 const result=execFileSync('python3',['-c',"import zipfile; z=zipfile.ZipFile('/tmp/haunted-180-save-test.zip'); assert z.testzip() is None; assert len([n for n in z.namelist() if n.endswith('.png')]) == 180; print('180 PNG frames, CRCs valid')"],{encoding:'utf8'});expect(result).toContain('CRCs valid');
 await page.evaluate(()=>{window.showSaveFilePicker=async()=>{throw new DOMException('User cancelled','AbortError')}});await page.getByRole('button',{name:'Save ZIP',exact:true}).click();await expect(page.locator('.save-status')).toContainText('Save cancelled');
 // File URLs and older browsers may lack the picker: fresh-click fallback still works.
 await page.evaluate(()=>{window.showSaveFilePicker=undefined});const again=page.waitForEvent('download');await page.getByRole('button',{name:'Save ZIP',exact:true}).click();expect((await again).suggestedFilename()).toBe(download.suggestedFilename());await expect(page.locator('.save-status')).toContainText('Download requested');
 await page.getByRole('button',{name:'Remove',exact:true}).click();await expect(page.locator('.zip-card')).toHaveCount(0);
});
