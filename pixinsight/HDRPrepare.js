/* HDR preparation only: never executes image processing. */
var MasterHDR = (function () {
   function pathKey(path) { var p=String(path).trim().replace(/\\/g,"/");return /^[A-Za-z]:/.test(p)?p.toLowerCase():p; }
   function checkPath(path) {
      path=String(path).trim();
      if(!/\.(xisf|fits?|fts)$/i.test(path)||!File.exists(path)||File.directoryExists(path))throw new Error("Select an existing XISF or FITS master: "+path);
      return path;
   }
   function seconds(value,unit) {
      var text=String(value).replace(/'/g,"").trim(),m=/^([+\-\d.eE]+)\s*(ms|s|sec|seconds?|min|minutes?|h|hours?)?$/i.exec(text);
      if(!m)return null;var n=Number(m[1]),u=(m[2]||unit||"s").toLowerCase();
      if(u==="ms")n/=1000;else if(/^min/.test(u))n*=60;else if(/^h/.test(u))n*=3600;
      return isFinite(n)&&n>0?n:null;
   }
   function exposure(keywords,property) {
      var candidates=[],unit="s";
      (keywords||[]).forEach(function(k){if(k.name==="TIMEUNIT")unit=String(k.value).replace(/'/g,"").trim();});
      (keywords||[]).forEach(function(k){if(/^(EXPTIME|EXPOSURE)$/i.test(k.name)){var n=seconds(k.value,unit);if(n!==null)candidates.push(n);}});
      if(property!==null&&property!==undefined){var n=seconds(property,"s");if(n!==null)candidates.push(n);}
      if(!candidates.length)return null;
      if(candidates.some(function(n){return Math.abs(n-candidates[0])>Math.max(0.001,candidates[0]*0.001);}))throw new Error("Conflicting exposure metadata. Review EXPTIME/EXPOSURE and Instrument:ExposureTime.");
      return candidates[0];
   }
   function readHeader(path) {
      path=checkPath(path);var format=new FileFormat(File.extractExtension(path),true,false),f=new FileFormatInstance(format);
      try {
         var descriptions=f.open(path,"");if(!descriptions||descriptions.length!==1)throw new Error("Expected a single-image master: "+path);
         var keys=[],property=null;try{keys=f.keywords;}catch(ignore){}
         if(format.canStoreImageProperties)try{if(f.imageProperties.some(function(p){return p.id==="Instrument:ExposureTime";}))property=f.readImageProperty("Instrument:ExposureTime");}catch(ignore){}
         return {path:path,exposure:exposure(keys,property),keywords:keys};
      }finally{f.close();}
   }
   function group(headers) {
      if(headers.length<3)throw new Error("Select at least three masters with exposure headers.");
      var seen={},groups=[];
      headers.forEach(function(h){var key=pathKey(h.path);if(seen[key])throw new Error("Duplicate input file: "+h.path);seen[key]=true;
         if(h.exposure===null||!isFinite(h.exposure)||h.exposure<=0)throw new Error("Missing or invalid exposure metadata: "+h.path);
         var g=groups.filter(function(g){return Math.abs(g.exposure-h.exposure)<=Math.max(0.001,h.exposure*0.001);})[0];
         if(!g){g={exposure:h.exposure,files:[]};groups.push(g);}g.files.push(h.path);
      });
      groups.sort(function(a,b){return a.exposure-b.exposure;});
      if(groups.length!==3)throw new Error("Found "+groups.length+" exposure groups; select masters from exactly three distinct exposure lengths.");
      if(groups.some(function(g){return g.files.length!==1;}))throw new Error("Multiple files share an exposure group. Select one integrated master per group; frames are not stacked here.");
      return groups.map(function(g){return g.files[0];});
   }
   function thumbnail(image) {
      var n=64,data=[],values=[];
      for(var y=0;y<n;y++)for(var x=0;x<n;x++){
         var v=0;for(var c=0;c<image.numberOfNominalChannels;c++)v+=image.sample(Math.min(image.width-1,Math.floor((x+0.5)*image.width/n)),Math.min(image.height-1,Math.floor((y+0.5)*image.height/n)),c);
         v/=image.numberOfNominalChannels;if(!isFinite(v))throw new Error("Input has non-finite image samples.");values.push(v);data.push(Math.log(1+Math.max(0,v)*10000));
      }
      values.sort(function(a,b){return a-b;});return {data:data,median:values[values.length>>1]};
   }
   function correlation(a,b,dx,dy) {
      var sa=0,sb=0,saa=0,sbb=0,sab=0,n=0;
      for(var y=4;y<60;y++)for(var x=4;x<60;x++){var av=a[y*64+x],bv=b[(y+dy)*64+x+dx];sa+=av;sb+=bv;saa+=av*av;sbb+=bv*bv;sab+=av*bv;n++;}
      var d=(saa-sa*sa/n)*(sbb-sb*sb/n);return d>1e-12?(sab-sa*sb/n)/Math.sqrt(d):0;
   }
   function assess(headers,windows) {
      var images=windows.map(function(w){return w.mainView.image;}),first=images[0],warnings=[];
      images.forEach(function(im){if(im.width!==first.width||im.height!==first.height||im.numberOfChannels!==first.numberOfChannels||im.isColor!==first.isColor)throw new Error("All three masters must have identical dimensions and channels/color space.");});
      headers.forEach(function(h){var history=h.keywords.filter(function(k){return /^(HISTORY|COMMENT)$/i.test(k.name);}).map(function(k){return String(k.value);}).join(" ");
         if(/HistogramTransformation|GeneralizedHyperbolicStretch|ArcsinhStretch|MaskedStretch/i.test(history))throw new Error("Recorded stretch processing found in "+h.path+". Supply the linear master (STF display stretch is acceptable).");
      });
      var thumbs=images.map(thumbnail);
      if(thumbs.some(function(t){return t.median>0.15;}))warnings.push("A sampled median is above 0.15; this may be stretched data. Bright linear data can also have a high median.");
      warnings.push("Headers and pixel statistics cannot prove linearity. Confirm these are original linear masters, not saved display stretches.");
      for(var i=1;i<3;i++){
         var center=correlation(thumbs[0].data,thumbs[i].data,0,0),best=center,bx=0,by=0;
         for(var dy=-3;dy<=3;dy++)for(var dx=-3;dx<=3;dx++){var score=correlation(thumbs[0].data,thumbs[i].data,dx,dy);if(score>best){best=score;bx=dx;by=dy;}}
         if(best>0.7&&best>center+0.08&&(bx||by))throw new Error("Image content suggests an offset in "+headers[i].path+". Register all masters to the same reference first.");
         if(center<0.85)warnings.push("Registration evidence is inconclusive for "+headers[i].path+" (coarse correlation "+center.toFixed(2)+"). Inspect star alignment at full resolution.");
      }
      warnings.push("Coarse registration checks cannot detect every subpixel shift, rotation or distortion. Confirm common-reference alignment at full resolution.");
      return warnings;
   }
   function configure(paths) {
      var p=new HDRComposition;
      p.images=paths.map(function(path){return [true,path];});p.autoExposures=true;
      p.maskBinarizingThreshold=0.90;p.maskSmoothness=7;p.maskGrowth=5;p.replaceLargeScales=0;
      p.rejectBlack=true;p.generate64BitResult=true;p.outputMasks=true;p.closePreviousImages=false;
      return p;
   }
   function prepare(paths,confirm,launch) {
      if(paths.length!==3)throw new Error("Select short, medium and long masters.");
      paths=paths.map(checkPath);if(new Set(paths.map(pathKey)).size!==3)throw new Error("Choose three different master files.");
      var headers=paths.map(readHeader),known=headers.every(function(h){return h.exposure!==null;});
      if(known&&!(headers[0].exposure<headers[1].exposure&&headers[1].exposure<headers[2].exposure))throw new Error("Exposure headers must increase from short to medium to long. Use Auto-detect exposure groups to sort them.");
      var owned=[],windows=[],success=false;
      try {
         paths.forEach(function(path){var existing=ImageWindow.windows.filter(function(w){return w.filePath&&pathKey(w.filePath)===pathKey(path);});
            if(existing.length>1)throw new Error("Multiple windows are already open for "+path+". Close duplicates first.");
            if(existing.length){if(existing[0].isModified)throw new Error("An input has unsaved changes. Save or close it before preparing: "+path);windows.push(existing[0]);}
            else {var opened=ImageWindow.open(path);owned=owned.concat(opened||[]);if(!opened||opened.length!==1)throw new Error("Expected one image window: "+path);windows.push(opened[0]);}
         });
         var warnings=assess(headers,windows);if(!known)warnings.push("Some exposure headers are absent. Review automatic exposure evaluation in HDRComposition.");
         if(!confirm(warnings))return false;
         var p=configure(paths);if(!p.canLaunchInterface())throw new Error("This PixInsight installation cannot open HDRComposition's interface. No processing was executed.");
         owned.forEach(function(w){w.show();});
         if(!launch(p))throw new Error("HDRComposition interface could not be opened. No processing was executed.");
         success=true;return true;
      }finally {if(!success)owned.forEach(function(w){if(!w.isNull)w.forceClose();});}
   }
   return {seconds:seconds,exposure:exposure,readHeader:readHeader,group:group,configure:configure,assess:assess,prepare:prepare,pathKey:pathKey};
})();
if(typeof module!=="undefined")module.exports=MasterHDR;
