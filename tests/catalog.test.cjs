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

// PI 1.9.6 additions retain old stage names/defaults and tolerate old plans.
const expected={analysis:['Subframe analysis','ImageAnalysis'],blind:['Plate solving','BlindSolver/BlindSolver.js'],astroreg:['Registration','AstrometricRegistration/AstrometricRegistration.js'],featurereg:['Registration','FeatureRegistration/FeatureRegistration.js'],spfc:['Mosaic preparation','SpectrophotometricFluxCalibration'],mgc:['Mosaic preparation','MultiscaleGradientCorrection'],wbpplog:['Diagnostics / logs','WBPPLogAnalysis/WBPPLogAnalysis.js']};
for(const [id,[stage,target]] of Object.entries(expected)){const tool=catalog.tools.find(t=>t.id===id);assert(tool);assert.equal(tool.stage,stage);assert.equal(tool.process||tool.script,target);assert.equal(tool.minBuild,1713);for(const profile of catalog.profiles){const plan=catalog.plan(profile,'','',Object.fromEntries(profile.channels.map(c=>[c,''])),{[stage]:id});assert.equal(catalog.validate(JSON.parse(JSON.stringify(plan))),profile);}}
for(const t of catalog.tools)assert(catalog.stages.includes(t.stage));
for(const [stage,id] of [['Batch preprocessing','wbpp'],['Registration','align'],['Plate solving','solve'],['Integration / masters','integrate']])assert.equal(catalog.tools.find(t=>t.stage===stage).id,id);
const availability=ui.slice(ui.indexOf('function toolUnavailableReason('),ui.indexOf('function errorMessage('));
for(const build of [1706,1713]){const ctx={CoreApplication:{versionBuild:build},File:{exists:()=>true},installedScript:t=>t.script,ImageAnalysis:function(){},SpectrophotometricFluxCalibration:function(){},MultiscaleGradientCorrection:function(){}};vm.createContext(ctx);vm.runInContext(availability,ctx);for(const id of Object.keys(expected))assert.equal(ctx.toolUnavailableReason(catalog.tools.find(t=>t.id===id)),build<1713?'requires PixInsight 1.9.6':'');ctx.File.exists=()=>false;assert.equal(ctx.toolUnavailableReason(catalog.tools.find(t=>t.id==='blind')),build<1713?'requires PixInsight 1.9.6':'not installed');delete ctx.ImageAnalysis;assert.equal(ctx.toolUnavailableReason(catalog.tools.find(t=>t.id==='analysis')),build<1713?'requires PixInsight 1.9.6':'process not installed');}
const native=ui.slice(ui.indexOf('function openNative('),ui.indexOf('function main('));let launched=[];const ctx={};for(const name of ['ImageAnalysis','SpectrophotometricFluxCalibration','MultiscaleGradientCorrection'])ctx[name]=function(){this.launchInterface=()=>launched.push(name);};vm.createContext(ctx);vm.runInContext(native,ctx);for(const name of Object.keys(ctx).filter(k=>k!=='openNative'))ctx.openNative(name);assert.deepEqual(launched,['ImageAnalysis','SpectrophotometricFluxCalibration','MultiscaleGradientCorrection']);
console.log('PI 1.9.6 choices, stage defaults, legacy plans, availability checks and interface-only native dispatch passed.');
