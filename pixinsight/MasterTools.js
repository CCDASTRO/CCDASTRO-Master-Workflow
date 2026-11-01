/* CCDASTRO Master Workflow: tool catalog and session plans. No pixel processing. */
var MasterTools = (function () {
   var profiles = [
      {id:"mono", name:"Mono LRGB + Ha / OIII / SII", channels:["L","R","G","B","Ha","OIII","SII"], note:"Calibrate and integrate each filter separately; register all masters to a common reference before channel combination."},
      {id:"osc", name:"OSC broadband", channels:["OSC broadband"], note:"Use the correct CFA pattern in WBPP/FBPP or Debayer. Integrate registered RGB lights to an OSC RGB master."},
      {id:"osc_dual", name:"OSC + Ha/OIII filter sessions", channels:["OSC broadband","Ha/OIII filter"], note:"Calibrate each filter session with matching flats. After integration, open Plate Solve, then NBExtractPI for a linear RGB master. For L-Ultimate choose Ha/OIII with both bandwidths 3 nm. Configure Gaia DR3/SP first."},
      {id:"osc_filters", name:"OSC + Ha/OIII/SII filter sessions", channels:["OSC broadband","Ha/OIII filter","SII/OIII or other NB filter"], note:"Keep different filter datasets separate. Use your filter's documented extraction method; this launcher does not infer emission lines from RGB channels."},
      {id:"osc_mono", name:"OSC + mono Ha / OIII / SII masters", channels:["OSC broadband","Mono Ha","Mono OIII","Mono SII"], note:"Process mono narrowband without debayering. Register OSC and mono masters to the same reference and check scale/crop before combination."}
   ];
   var stages=["Batch preprocessing","Calibration","Preparation / extraction","Subframe analysis","Registration","Integration / masters","Plate solving","Mosaic preparation","OSC narrowband extraction","Channel combination","Diagnostics / logs"];
   var tools = [
      {id:"wbpp",name:"WeightedBatchPreprocessing (WBPP)",stage:"Batch preprocessing",script:"BatchPreprocessing/WBPP.js",note:"Existing pipeline for calibration, registration and integration. PI 1.9.6 / WBPP 3.2 adds ImageAnalysis measurements, blind solving and weight-overshoot protection. Configure inputs and review unattended/interactive options in WBPP."},
      {id:"fbpp",name:"FastBatchPreprocessing (FBPP)",stage:"Batch preprocessing",script:"BatchPreprocessing/FBPP.js",note:"Existing fast batch pipeline. PI 1.9.6 / FBPP 3.2 includes ImageAnalysis, automatic blind solving and weight protection. Configure inputs and review unattended execution in FBPP."},
      {id:"gpustacker",name:"GPUStacker",stage:"Batch preprocessing",script:"GPUStacker.js",note:"Open the separately installed GPUStacker front-end. Configure AstroPipeline, input frames, calibration and output in GPUStacker, then explicitly start processing there. Session folders are not handed off automatically."},
      {id:"calibration",name:"ImageCalibration",stage:"Calibration",process:"ImageCalibration",note:"Select light frames, matching calibration masters and output in the native tool."},
      {id:"cosmetic",name:"CosmeticCorrection",stage:"Preparation / extraction",process:"CosmeticCorrection",note:"Configure defect correction in the native interface, at the appropriate point in your calibration workflow."},
      {id:"debayer",name:"Debayer",stage:"Preparation / extraction",process:"Debayer",note:"OSC only: choose the actual camera CFA pattern. Do not debayer mono filter data."},
      {id:"extract",name:"ChannelExtraction",stage:"Preparation / extraction",process:"ChannelExtraction",note:"Extract image color channels. RGB planes are not automatically pure Ha, OIII or SII."},
      {id:"batch_extract",name:"BatchChannelExtraction",stage:"Preparation / extraction",script:"BatchChannelExtraction/BatchChannelExtraction.js",note:"Batch extraction using the installed script. Choose its inputs and outputs there."},
      {id:"solve",name:"ImageSolver (Plate Solve)",stage:"Plate solving",script:"ImageSolver/ImageSolver.js",note:"Plate-solve the linear dual-band RGB master before NBExtractPI. On PI 1.9.6 choose Automatic, Always or Disabled blind solving in ImageSolver; install/configure its Gaia astrometric index. Earlier versions require coordinate/scale seeds. Configure and solve in the existing tool."},
      {id:"nbextract",name:"NBExtractPI - OSC dual-band Ha/OIII or SII/OIII",stage:"OSC narrowband extraction",script:"NBExtractPI.js",alternates:["Lighthouse/NBExtractPI/NBExtractPI.js"],note:"Existing tool: use a linear, debayered, plate-solved RGB master and configured Gaia DR3/SP XPSD files. L-Ultimate: Ha/OIII, bandwidths 3 nm each; calibrate mixing matrix, then extract channels. SII requires separate SII data; this filter does not record it."},
      {id:"align",name:"StarAlignment",stage:"Registration",process:"StarAlignment",note:"Choose a reference, target frames and output. Register all intended combination masters to a common geometry."},
      {id:"fft",name:"FFTRegistration",stage:"Registration",script:"FFTRegistration/FFTRegistration.js",note:"FFTRegistration 2.1 on PI 1.9.6 matches images with distortion correction; use FeatureRegistration or AstrometricRegistration for mosaics. Confirm suitability for your data."},
      {id:"integrate",name:"ImageIntegration",stage:"Integration / masters",process:"ImageIntegration",note:"Integrate each registered filter group separately. PI 1.9.6 adds Biweight location combination, Standard properties weights from ImageAnalysis, and weight-overshoot protection. Review these explicitly; Average remains the default combination."},
      {id:"drizzle",name:"DrizzleIntegration",stage:"Integration / masters",process:"DrizzleIntegration",note:"Requires appropriate drizzle data from earlier processing. Review drizzle settings and scale in its own interface."},
      {id:"hdr",name:"HDRComposition",stage:"Integration / masters",process:"HDRComposition",note:"Combine registered linear images of the same field with different exposure lengths to preserve bright cores and faint detail. Configure inputs, exposure handling and masks in HDRComposition; this is not HDRMultiscaleTransform."},
      {id:"rgb",name:"ChannelCombination",stage:"Channel combination",process:"ChannelCombination",note:"Assign registered R/G/B or a chosen narrowband palette. This is channel assembly, not frame integration."},
      {id:"lrgb",name:"LRGBCombination",stage:"Channel combination",process:"LRGBCombination",note:"Combine registered luminance and RGB with the native controls."},
      {id:"nbrgb",name:"NBRGBCombination",stage:"Channel combination",script:"NBRGBCombination/NBRGBCombination.js",note:"Installed narrowband/RGB combination script. Follow its own input requirements and supported channel mappings."},
      {id:"analysis",name:"ImageAnalysis (PI 1.9.6)",stage:"Subframe analysis",process:"ImageAnalysis",minBuild:1713,note:"Measure, approve and weight light frames before registration/integration. Replaces SubframeSelector for new work. Review FWHM, eccentricity, gradients, trails and weights in ImageAnalysis; this launcher does not measure or reject frames."},
      {id:"blind",name:"BlindSolver (PI 1.9.6)",stage:"Plate solving",script:"BlindSolver/BlindSolver.js",minBuild:1713,note:"Solve the active image or batches without coordinate/scale seeds. Configure the Gaia astrometric index first. Review output files and use ImageSolver when a full distortion-corrected solution is required."},
      {id:"astroreg",name:"AstrometricRegistration / mosaics (PI 1.9.6)",stage:"Registration",script:"AstrometricRegistration/AstrometricRegistration.js",minBuild:1713,note:"Register through astrometric solutions and build per-filter mosaics. Configure solving, photometric normalization, optional MARS correction, output geometry and resources in the installed script; inputs are not transferred from this plan."},
      {id:"featurereg",name:"FeatureRegistration - lunar / daylight (PI 1.9.6)",stage:"Registration",script:"FeatureRegistration/FeatureRegistration.js",minBuild:1713,note:"Feature-based registration and mosaics for lunar/daylight images. Not intended for deep-sky star fields; use StarAlignment or AstrometricRegistration for those. Configure and execute manually."},
      {id:"spfc",name:"SpectrophotometricFluxCalibration - batch (PI 1.9.6)",stage:"Mosaic preparation",process:"SpectrophotometricFluxCalibration",minBuild:1713,note:"Optional native flux calibration for mosaic preparation. PI 1.9.6 supports target-file batches. Configure Gaia data, camera/filter curves, files and outputs in SPFC; nothing runs automatically."},
      {id:"mgc",name:"MultiscaleGradientCorrection - batch (PI 1.9.6)",stage:"Mosaic preparation",process:"MultiscaleGradientCorrection",minBuild:1713,note:"Optional native MARS gradient correction for frames or mosaics. PI 1.9.6 adds automatic scale factors, edge correction, a reference-mosaic fallback and target-file batches. Configure prerequisites, references and outputs in MGC."},
      {id:"wbpplog",name:"WBPPLogAnalysis (PI 1.9.6)",stage:"Diagnostics / logs",script:"WBPPLogAnalysis/WBPPLogAnalysis.js",minBuild:1713,note:"Inspect WBPP/FBPP logs for errors, excluded frames and abnormal results; export reports from the installed analyzer. This analyzes logs, not image pixels, and does not rerun preprocessing."}
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
   return {profiles:profiles,stages:stages,tools:tools,plan:plan,validate:validate};
})();
if(typeof module!=="undefined")module.exports=MasterTools;
