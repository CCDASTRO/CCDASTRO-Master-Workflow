/* CCDASTRO Master Workflow: tool catalog and session plans. No pixel processing. */
var MasterTools = (function () {
   var profiles = [
      {id:"mono", name:"Mono LRGB + Ha / OIII / SII", channels:["L","R","G","B","Ha","OIII","SII"], note:"Calibrate and integrate each filter separately; register all masters to a common reference before channel combination."},
      {id:"osc", name:"OSC broadband", channels:["OSC broadband"], note:"Use the correct CFA pattern in WBPP/FBPP or Debayer. Integrate registered RGB lights to an OSC RGB master."},
      {id:"osc_dual", name:"OSC + Ha/OIII filter sessions", channels:["OSC broadband","Ha/OIII filter"], note:"Calibrate each filter session with matching flats. After integration, open Plate Solve, then NBExtractPI for a linear RGB master. For L-Ultimate choose Ha/OIII with both bandwidths 3 nm. Configure Gaia DR3/SP first."},
      {id:"osc_filters", name:"OSC + Ha/OIII/SII filter sessions", channels:["OSC broadband","Ha/OIII filter","SII/OIII or other NB filter"], note:"Keep different filter datasets separate. Use your filter's documented extraction method; this launcher does not infer emission lines from RGB channels."},
      {id:"osc_mono", name:"OSC + mono Ha / OIII / SII masters", channels:["OSC broadband","Mono Ha","Mono OIII","Mono SII"], note:"Process mono narrowband without debayering. Register OSC and mono masters to the same reference and check scale/crop before combination."}
   ];
   var tools = [
      {id:"wbpp",name:"WeightedBatchPreprocessing (WBPP)",stage:"Batch preprocessing",script:"BatchPreprocessing/WBPP.js",note:"Existing pipeline for calibration, registration and integration. Configure lights, calibration frames, grouping, CFA and output in WBPP."},
      {id:"fbpp",name:"FastBatchPreprocessing (FBPP)",stage:"Batch preprocessing",script:"BatchPreprocessing/FBPP.js",note:"Alternative existing batch pipeline. Review its own options and tradeoffs before running."},
      {id:"calibration",name:"ImageCalibration",stage:"Calibration",process:"ImageCalibration",note:"Select light frames, matching calibration masters and output in the native tool."},
      {id:"cosmetic",name:"CosmeticCorrection",stage:"Preparation / extraction",process:"CosmeticCorrection",note:"Configure defect correction in the native interface, at the appropriate point in your calibration workflow."},
      {id:"debayer",name:"Debayer",stage:"Preparation / extraction",process:"Debayer",note:"OSC only: choose the actual camera CFA pattern. Do not debayer mono filter data."},
      {id:"extract",name:"ChannelExtraction",stage:"Preparation / extraction",process:"ChannelExtraction",note:"Extract image color channels. RGB planes are not automatically pure Ha, OIII or SII."},
      {id:"batch_extract",name:"BatchChannelExtraction",stage:"Preparation / extraction",script:"BatchChannelExtraction/BatchChannelExtraction.js",note:"Batch extraction using the installed script. Choose its inputs and outputs there."},
      {id:"solve",name:"ImageSolver (Plate Solve)",stage:"Plate solving",script:"ImageSolver/ImageSolver.js",note:"Plate-solve the linear dual-band RGB master before NBExtractPI. Configure the image scale/coordinates and solve in the existing tool."},
      {id:"nbextract",name:"NBExtractPI - OSC dual-band Ha/OIII or SII/OIII",stage:"OSC narrowband extraction",script:"NBExtractPI.js",alternates:["Lighthouse/NBExtractPI/NBExtractPI.js"],note:"Existing tool: use a linear, debayered, plate-solved RGB master and configured Gaia DR3/SP XPSD files. L-Ultimate: Ha/OIII, bandwidths 3 nm each; calibrate mixing matrix, then extract channels. SII requires separate SII data; this filter does not record it."},
      {id:"align",name:"StarAlignment",stage:"Registration",process:"StarAlignment",note:"Choose a reference, target frames and output. Register all intended combination masters to a common geometry."},
      {id:"fft",name:"FFTRegistration",stage:"Registration",script:"FFTRegistration/FFTRegistration.js",note:"Alternative registration script. Confirm its suitability and limitations for your data."},
      {id:"integrate",name:"ImageIntegration",stage:"Integration / masters",process:"ImageIntegration",note:"Integrate each registered filter group separately. Set normalization, weights and rejection in ImageIntegration."},
      {id:"drizzle",name:"DrizzleIntegration",stage:"Integration / masters",process:"DrizzleIntegration",note:"Requires appropriate drizzle data from earlier processing. Review drizzle settings and scale in its own interface."},
      {id:"hdr",name:"HDRComposition",stage:"Integration / masters",process:"HDRComposition",note:"Combine registered linear images of the same field with different exposure lengths to preserve bright cores and faint detail. Configure inputs, exposure handling and masks in HDRComposition; this is not HDRMultiscaleTransform."},
      {id:"rgb",name:"ChannelCombination",stage:"Channel combination",process:"ChannelCombination",note:"Assign registered R/G/B or a chosen narrowband palette. This is channel assembly, not frame integration."},
      {id:"lrgb",name:"LRGBCombination",stage:"Channel combination",process:"LRGBCombination",note:"Combine registered luminance and RGB with the native controls."},
      {id:"nbrgb",name:"NBRGBCombination",stage:"Channel combination",script:"NBRGBCombination/NBRGBCombination.js",note:"Installed narrowband/RGB combination script. Follow its own input requirements and supported channel mappings."}
   ];
   function plan(profile,root,output,folders,selections) {
      if(!profile || !profiles.some(function(p){return p.id===profile.id;}))throw new Error("Choose a supported acquisition profile.");
      return {format:"CCDASTRO-Master-Workflow",version:1,profile:profile.id,sessionRoot:root,outputFolder:output,folders:folders,selections:selections,
         note:"Planning paths only. Configure and run each existing tool explicitly. No files were processed."};
   }
   function validate(p) {
      if(!p || p.format!=="CCDASTRO-Master-Workflow" || p.version!==1)throw new Error("Not a supported Master Workflow plan.");
      var profile=profiles.filter(function(x){return x.id===p.profile;})[0];if(!profile)throw new Error("Unknown acquisition profile.");
      if(typeof p.sessionRoot!=="string" || typeof p.outputFolder!=="string" || !p.folders || !p.selections)throw new Error("Incomplete plan.");
      profile.channels.forEach(function(c){if(typeof p.folders[c]!=="string")throw new Error("Missing folder entry: "+c);});
      Object.keys(p.selections).forEach(function(stage){if(!tools.some(function(t){return t.stage===stage&&t.id===p.selections[stage];}))throw new Error("Unknown tool choice.");});
      return profile;
   }
   return {profiles:profiles,tools:tools,plan:plan,validate:validate};
})();
if(typeof module!=="undefined")module.exports=MasterTools;
