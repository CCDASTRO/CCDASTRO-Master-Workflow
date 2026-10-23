const assert=require('node:assert/strict');
const fs=require('node:fs');
const catalog=require('../pixinsight/MasterTools.js');
assert.equal(catalog.profiles.length,5);
assert.equal(new Set(catalog.tools.map(t=>t.id)).size,catalog.tools.length);
for(const profile of catalog.profiles){
 const folders=Object.fromEntries(profile.channels.map(c=>[c,'D:/Sessions/'+c]));
 const selections=Object.fromEntries(catalog.tools.map(t=>[t.stage,t.id]));
 const p=catalog.plan(profile,'D:/Sessions','D:/Masters',folders,selections);
 assert.equal(catalog.validate(JSON.parse(JSON.stringify(p))),profile);
 assert.throws(()=>catalog.validate({...p,selections:{Calibration:'not-a-tool'}}));
 assert.throws(()=>catalog.validate({...p,folders:{}}));
}
assert.throws(()=>catalog.validate({format:'Other',version:1}));
const ui=fs.readFileSync(require('node:path').join(__dirname,'../pixinsight/CCDASTROMasterWorkflow.js'),'utf8');
assert(!/executeOn\s*\(|executeGlobal\s*\(/.test(ui),'Launcher must not execute processing');
for(const t of catalog.tools.filter(t=>t.process))assert(ui.includes('new '+t.process));
assert(ui.includes('--require-signature'));
assert(!ui.includes('#include <pjsr/Sizer.jsh>'),'V8 already supplies the sizer classes');
assert(ui.includes('class MasterDialog extends Dialog'),'Use the native V8 class constructor');
new (require('node:vm').Script)(ui.replace(/^#.*$/gm,''));
console.log('Catalog, session plan roundtrips, rejected invalid choices and launch-only boundaries passed.');
