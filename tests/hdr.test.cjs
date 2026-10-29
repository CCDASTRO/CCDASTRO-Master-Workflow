const assert=require('node:assert/strict');
const fs=require('node:fs'),vm=require('node:vm');
const repo=require('node:path').resolve(__dirname,'..');
let closeCount=0,opened=[],failOpen=-1;
function image(w=96,h=96){return {width:w,height:h,numberOfChannels:1,numberOfNominalChannels:1,isColor:false,sample:(x,y)=>0.002+0.00001*((x*13+y*17)%31)};}
function win(path){return {filePath:path,isModified:false,isNull:false,mainView:{image:image()},show(){},forceClose(){this.isNull=true;closeCount++;}};}
const ctx={module:{exports:{}},Set,File:{exists:p=>!p.includes('missing'),directoryExists:()=>false,extractExtension:p=>p.slice(p.lastIndexOf('.'))},
 FileFormat:class{},FileFormatInstance:class{open(path){this.path=path;return [{}];}get keywords(){return [{name:'EXPTIME',value:this.path.includes('short')?'1':this.path.includes('medium')?'10':'100'}];}readImageProperty(){return null;}close(){}},
 HDRComposition:class{canLaunchInterface(){return true;}},ImageWindow:{windows:[],open(p){if(opened.length===failOpen)throw Error('open failed');let w=win(p);opened.push(w);return [w];}}};
vm.createContext(ctx);vm.runInContext(fs.readFileSync(repo+'/pixinsight/HDRPrepare.js','utf8'),ctx);let h=ctx.module.exports;
assert.equal(h.seconds('1000 ms'),1);assert.equal(h.seconds("'2 min'"),120);assert.equal(h.seconds('-1'),null);
assert.equal(h.exposure([{name:'EXPTIME',value:'10'}],10),10);
assert.throws(()=>h.exposure([{name:'EXPTIME',value:'10'}],20),/Conflicting/);
let hs=[{path:'long.xisf',exposure:100},{path:'short.fits',exposure:1},{path:'medium.fit',exposure:10}];
assert.deepEqual(Array.from(h.group(hs)),['short.fits','medium.fit','long.xisf']);
assert.throws(()=>h.group(hs.concat({path:'other.xisf',exposure:10})),/Multiple/);
assert.throws(()=>h.group(hs.map(x=>({...x,exposure:null}))),/Missing/);
assert.throws(()=>h.group(hs.map(x=>({...x,exposure:1}))),/groups/);
const paths=['short.fits','medium.xisf','long.fits'];
let p=h.configure(paths);assert.equal(p.maskBinarizingThreshold,.90);assert.equal(p.maskSmoothness,7);assert.equal(p.maskGrowth,5);assert.equal(p.replaceLargeScales,0);
for(const k of ['autoExposures','rejectBlack','generate64BitResult','outputMasks'])assert.equal(p[k],true);assert.equal(p.closePreviousImages,false);
assert.throws(()=>h.prepare(['short.fits','short.fits','long.fits'],()=>true,()=>true),/different/);
assert.throws(()=>h.prepare(['missing.fits','medium.fits','long.fits'],()=>true,()=>true),/existing/);
assert.throws(()=>h.prepare(['long.fits','medium.fits','short.fits'],()=>true,()=>true),/increase/);
assert.equal(h.prepare(paths,()=>false,()=>{throw Error('must not launch')}),false);assert.equal(closeCount,3);
opened=[];closeCount=0;assert.throws(()=>h.prepare(paths,()=>true,()=>{throw Error('launch failed')}),/launch failed/);assert.equal(closeCount,3);
opened=[];closeCount=0;failOpen=1;assert.throws(()=>h.prepare(paths,()=>true,()=>true),/open failed/);assert.equal(closeCount,1);failOpen=-1;
opened=[];closeCount=0;ctx.ImageWindow.windows=[win(paths[0])];assert.equal(h.prepare(paths,()=>true,()=>true),true);assert.equal(opened.length,2);assert.equal(closeCount,0);
ctx.ImageWindow.windows=[win(paths[0])];ctx.ImageWindow.windows[0].isModified=true;assert.throws(()=>h.prepare(paths,()=>true,()=>true),/unsaved/);
let ws=paths.map(win);ws[2].mainView.image=image(97);assert.throws(()=>h.assess(hs,ws),/identical/);
let ui=fs.readFileSync(repo+'/pixinsight/CCDASTROMasterWorkflow.js','utf8');new vm.Script(ui.replace(/^#.*$/gm,''));assert(!/executeOn\s*\(|executeGlobal\s*\(/.test(fs.readFileSync(repo+'/pixinsight/HDRPrepare.js','utf8')));
console.log('HDR grouping, configuration, validation, cancel/error cleanup, reuse and non-execution checks passed.');
