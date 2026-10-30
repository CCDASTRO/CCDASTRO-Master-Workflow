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

const nb=catalog.tools.find(t=>t.id==='nbextract');
assert.equal(nb.stage,'OSC narrowband extraction');
assert.equal(nb.script,'NBExtractPI.js');
assert.deepEqual(nb.alternates,['Lighthouse/NBExtractPI/NBExtractPI.js']);
assert(catalog.tools.some(t=>t.id==='solve'&&t.script==='ImageSolver/ImageSolver.js'));
// Old v0.1.1 plans remain valid when new optional stages are absent.
for(const profile of catalog.profiles){
 const p=catalog.plan(profile,'','',Object.fromEntries(profile.channels.map(c=>[c,''])),{Registration:'align'});
 assert.equal(catalog.validate(p),profile);
}

const resolverSource=ui.slice(ui.indexOf('function installedScript('),ui.indexOf('function scriptHasSignature('));
const vm=require('node:vm');
for(const available of ['NBExtractPI.js','Lighthouse/NBExtractPI/NBExtractPI.js',null]){
 const ctx={CoreApplication:{srcDirPath:'/pi/src'},File:{exists:p=>p==='/pi/src/scripts/'+available}};
 vm.createContext(ctx);vm.runInContext(resolverSource,ctx);
 assert.equal(ctx.installedScript(nb),'/pi/src/scripts/'+(available||'NBExtractPI.js'));
}

// GPUStacker participates in existing plan validation and script resolution.
const gpu=catalog.tools.find(t=>t.id==='gpustacker');
assert.equal(gpu.name,'GPUStacker');assert.equal(gpu.stage,'Batch preprocessing');
assert.equal(gpu.script,'GPUStacker.js');
for(const profile of catalog.profiles){
 const p=catalog.plan(profile,'','',Object.fromEntries(profile.channels.map(c=>[c,''])),{'Batch preprocessing':'gpustacker'});
 assert.equal(catalog.validate(JSON.parse(JSON.stringify(p))),profile);
}
for(const installed of [true,false]){
 const ctx={CoreApplication:{srcDirPath:'/pi/src'},File:{exists:p=>installed&&p==='/pi/src/scripts/GPUStacker.js'}};
 vm.createContext(ctx);vm.runInContext(resolverSource,ctx);assert.equal(ctx.installedScript(gpu),'/pi/src/scripts/GPUStacker.js');
}
console.log('GPUStacker catalog, saved-plan roundtrip and installed/missing path checks passed.');
