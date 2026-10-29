#engine v8
#feature-id CCDASTROMasterWorkflow : CCDASTRO > Master Workflow
#feature-info Open existing calibration, registration, integration and combination tools from one session checklist.
#include <pjsr/StdButton.jsh>
#include <pjsr/StdIcon.jsh>
#include <pjsr/DataType.jsh>
#include "MasterTools.js"
#include "HDRPrepare.js"

var TITLE="CCDASTRO Master Workflow 0.3.0";
var selectedTool=null;
function installedScript(tool) {
   var root=CoreApplication.srcDirPath+"/scripts/";
   var paths=[tool.script].concat(tool.alternates||[]);
   for(var i=0;i<paths.length;i++)if(File.exists(root+paths[i]))return root+paths[i];
   return root+tool.script;
}
function scriptHasSignature(path) {
   if(!File.exists(path.replace(/\.js$/i,".xsgn")))return false;
   var signature=Security.getScriptSignature(path);
   if(!signature||!signature.valid)throw new Error("The installed script signature is invalid. Reinstall it through its official repository.");
   return true;
}
function errorMessage(e){return e && e.message ? e.message : String(e);}
class MasterDialog extends Dialog {
 constructor() {
   super();
   var self=this;this.folders={};this.choices={};
   this.windowTitle=TITLE;
   function label(text){var l=new Label(self);l.text=text;return l;}
   function button(text,fn){var b=new PushButton(self);b.text=text;b.onClick=fn;return b;}
   function folderRow(caption) {
      var row=new HorizontalSizer;row.spacing=6;var l=label(caption);l.setFixedWidth(150);row.add(l);
      var edit=new Edit(self);edit.setMinWidth(360);row.add(edit,100);
      row.add(button("Browse...",function(){var d=new GetDirectoryDialog;d.caption=caption;d.initialPath=edit.text;if(d.execute())edit.text=d.directory;}));
      return {row:row,edit:edit};
   }
   this.sizer=new VerticalSizer;this.sizer.margin=12;this.sizer.spacing=8;
   var note=label("<b>Existing tools, one place.</b> Choose your data and open a tool below. Configure and run processing in that tool.<br/>Folder entries are a saved checklist; they are not automatically loaded into the tools.");note.useRichText=true;note.wordWrapping=true;this.sizer.add(note);
   this.profile=new ComboBox(this);MasterTools.profiles.forEach(function(p){self.profile.addItem(p.name);});this.sizer.add(this.profile);
   this.profileNote=label("");this.profileNote.wordWrapping=true;this.profileNote.setMinWidth(710);this.sizer.add(this.profileNote);
   this.root=folderRow("Session root");this.output=folderRow("Output / masters");this.sizer.add(this.root.row);this.sizer.add(this.output.row);
   this.folderBox=new GroupBox(this);this.folderBox.title="Dataset folders (optional; one row per filter group)";this.folderBox.sizer=new VerticalSizer;this.folderBox.sizer.margin=8;this.folderBox.sizer.spacing=4;
   this.folderRows=[];
   ["L","R","G","B","Ha","OIII","SII","OSC broadband","Ha/OIII filter","SII/OIII or other NB filter","Mono Ha","Mono OIII","Mono SII"].forEach(function(name){
      // Controls must be children of the group to collapse hidden rows correctly.
      var wrap=new Control(self.folderBox);wrap.sizer=new HorizontalSizer;wrap.sizer.spacing=6;
      var l=new Label(wrap);l.text=name;l.setFixedWidth(175);wrap.sizer.add(l);
      var e=new Edit(wrap);wrap.sizer.add(e,100);
      var b=new PushButton(wrap);b.text="Browse...";b.onClick=function(){var d=new GetDirectoryDialog;d.caption=name;d.initialPath=e.text||self.root.edit.text;if(d.execute())e.text=d.directory;};wrap.sizer.add(b);
      self.folders[name]=e;self.folderRows.push({name:name,control:wrap});self.folderBox.sizer.add(wrap);
   });this.sizer.add(this.folderBox);
   var toolBox=new GroupBox(this);toolBox.title="Choose an existing method";toolBox.sizer=new VerticalSizer;toolBox.sizer.margin=8;toolBox.sizer.spacing=5;
   var stages=["Batch preprocessing","Calibration","Preparation / extraction","Registration","Integration / masters","Plate solving","OSC narrowband extraction","Channel combination"];
   stages.forEach(function(stage){
      var wrap=new Control(toolBox);wrap.sizer=new HorizontalSizer;wrap.sizer.spacing=6;
      var l=new Label(wrap);l.text=stage;l.setFixedWidth(175);wrap.sizer.add(l);
      var combo=new ComboBox(wrap);var items=MasterTools.tools.filter(function(t){return t.stage===stage;});
      items.forEach(function(t){combo.addItem(t.name+(t.script&&!File.exists(installedScript(t))?" (not installed)":""));});wrap.sizer.add(combo,100);self.choices[stage]={combo:combo,items:items};
      var open=new PushButton(wrap);open.text="Open tool";open.onClick=function(){
         var tool=items[combo.currentItem];
         try {
            if(tool.script){var path=installedScript(tool);if(!File.exists(path))throw new Error("This script is not installed: "+path);scriptHasSignature(path);}
            selectedTool=tool;self.saveSettings();self.ok();
         }catch(e){new MessageBox(errorMessage(e),TITLE,StdIcon.Error,StdButton.Ok).execute();}
      };wrap.sizer.add(open);
      combo.onItemSelected=function(i){self.details.text=items[i].note;};toolBox.sizer.add(wrap);
   });this.sizer.add(toolBox);
   var hdrBox=new GroupBox(this);hdrBox.title="HDR Composition — three exposure masters";hdrBox.sizer=new VerticalSizer;hdrBox.sizer.margin=8;hdrBox.sizer.spacing=4;
   this.hdrSlots=[];
   var hdrFilters=[["XISF / FITS masters","*.xisf *.fits *.fit *.fts"]];
   ["Short","Medium","Long"].forEach(function(name){
      var wrap=new Control(hdrBox);wrap.sizer=new HorizontalSizer;wrap.sizer.spacing=6;
      var l=new Label(wrap);l.text=name;l.setFixedWidth(75);wrap.sizer.add(l);
      var edit=new Edit(wrap);wrap.sizer.add(edit,100);self.hdrSlots.push(edit);
      var browse=new PushButton(wrap);browse.text="Browse...";browse.onClick=function(){var d=new OpenFileDialog;d.caption="Select "+name.toLowerCase()+" exposure master";d.filters=hdrFilters;d.initialPath=edit.text;if(d.execute())edit.text=d.fileName;};wrap.sizer.add(browse);hdrBox.sizer.add(wrap);
   });
   try{var savedHDR=Settings.read("CCDASTRO/MasterWorkflow/hdrMasters",DataType_String);if(Settings.lastReadOK){var paths=JSON.parse(savedHDR);if(Array.isArray(paths)&&paths.length===3)paths.forEach(function(p,i){self.hdrSlots[i].text=String(p);});}}catch(ignore){}
   var hdrNote=new Label(hdrBox);hdrNote.wordWrapping=true;hdrNote.text="Use registered linear masters of one field at three exposure lengths. Preparation opens inputs and a configured native interface; it never runs HDRComposition.";hdrBox.sizer.add(hdrNote);
   var hdrButtons=new HorizontalSizer;hdrButtons.spacing=6;
   var detect=new PushButton(hdrBox);detect.text="Auto-detect exposure groups";detect.onClick=function(){try{
      var d=new OpenFileDialog;d.caption="Select one master per exposure group";d.multipleSelections=true;d.filters=hdrFilters;if(!d.execute())return;
      var paths=MasterHDR.group(d.fileNames.map(MasterHDR.readHeader));paths.forEach(function(path,i){self.hdrSlots[i].text=path;});
   }catch(e){new MessageBox(errorMessage(e),TITLE,StdIcon.Error,StdButton.Ok).execute();}};hdrButtons.add(detect);hdrButtons.addStretch();
   var prepare=new PushButton(hdrBox);prepare.text="Prepare HDRComposition";prepare.onClick=function(){var paths=self.hdrSlots.map(function(edit){return edit.text.trim();});Settings.write("CCDASTRO/MasterWorkflow/hdrMasters",DataType_String,JSON.stringify(paths));self.saveSettings();selectedTool={hdrPaths:paths};self.ok();};hdrButtons.add(prepare);hdrBox.sizer.add(hdrButtons);this.sizer.add(hdrBox);
   this.details=label("WBPP/FBPP cover multiple stages. Use individual tools for a manual route; do not automatically repeat stages already completed by a batch pipeline.");this.details.wordWrapping=true;this.sizer.add(this.details);
   var reopenNote=label("Opening a tool closes this launcher. Reopen Master Workflow for the next stage; your folder entries and choices are remembered.");reopenNote.wordWrapping=true;this.sizer.add(reopenNote);
   this.currentPlan=function(){var p=MasterTools.profiles[self.profile.currentItem],f={},s={};p.channels.forEach(function(c){f[c]=self.folders[c].text;});stages.forEach(function(k){var c=self.choices[k];s[k]=c.items[c.combo.currentItem].id;});return MasterTools.plan(p,self.root.edit.text,self.output.edit.text,f,s);};
   this.applyPlan=function(p){var profile=MasterTools.validate(p);self.profile.currentItem=MasterTools.profiles.indexOf(profile);self.root.edit.text=p.sessionRoot;self.output.edit.text=p.outputFolder;Object.keys(p.folders).forEach(function(k){if(self.folders[k])self.folders[k].text=p.folders[k];});Object.keys(p.selections).forEach(function(k){var c=self.choices[k];if(c)c.items.forEach(function(t,i){if(t.id===p.selections[k])c.combo.currentItem=i;});});self.refresh();};
   this.saveSettings=function(){Settings.write("CCDASTRO/MasterWorkflow/plan",DataType_String,JSON.stringify(self.currentPlan()));};
   this.refresh=function(){var p=MasterTools.profiles[self.profile.currentItem];self.profileNote.text=p.note;self.folderRows.forEach(function(r){r.control.visible=p.channels.indexOf(r.name)>=0;});self.adjustToContents();};
   this.profile.onItemSelected=function(){self.refresh();};
   var actions=new HorizontalSizer;actions.spacing=8;
   actions.add(button("Save session plan...",function(){try{var d=new SaveFileDialog;d.caption="Save Master Workflow plan";d.filters=[["JSON plan","*.json"]];d.initialPath="MasterWorkflow-plan.json";if(d.execute())File.writeTextFile(d.fileName,JSON.stringify(self.currentPlan(),null,2));}catch(e){new MessageBox(errorMessage(e),TITLE,StdIcon.Error,StdButton.Ok).execute();}}));
   actions.add(button("Load session plan...",function(){try{var d=new OpenFileDialog;d.filters=[["JSON plan","*.json"]];if(d.execute())self.applyPlan(JSON.parse(File.readTextFile(d.fileName)));}catch(e){new MessageBox(errorMessage(e),TITLE,StdIcon.Error,StdButton.Ok).execute();}}));
   actions.addStretch();actions.add(button("Close",function(){self.saveSettings();self.cancel();}));this.sizer.add(actions);
   this.refresh();try{var saved=Settings.read("CCDASTRO/MasterWorkflow/plan",DataType_String);if(Settings.lastReadOK)this.applyPlan(JSON.parse(saved));}catch(ignore){}
   this.setMinWidth(790);this.adjustToContents();
 }
}
function openNative(id) {
   var process;
   switch(id){
   case "ImageCalibration":process=new ImageCalibration;break;
   case "CosmeticCorrection":process=new CosmeticCorrection;break;
   case "Debayer":process=new Debayer;break;
   case "ChannelExtraction":process=new ChannelExtraction;break;
   case "StarAlignment":process=new StarAlignment;break;
   case "ImageIntegration":process=new ImageIntegration;break;
   case "DrizzleIntegration":process=new DrizzleIntegration;break;
   case "HDRComposition":process=new HDRComposition;break;
   case "ChannelCombination":process=new ChannelCombination;break;
   case "LRGBCombination":process=new LRGBCombination;break;
   default:throw new Error("Unsupported native process.");
   }
   process.launchInterface();
}
function main() {
   var dialog=new MasterDialog;
   if(!dialog.execute()||!selectedTool)return;
   try{
      if(selectedTool.hdrPaths){
         MasterHDR.prepare(selectedTool.hdrPaths,function(warnings){return new MessageBox(warnings.join("\n\n")+"\n\nI confirm these are linear masters registered to a common reference. Prepare the process for review?",TITLE,StdIcon.Warning,StdButton.Yes,StdButton.No).execute()===StdButton.Yes;},function(p){return p.launchInterface();});
      }else if(selectedTool.script){
         var path=installedScript(selectedTool);if(/["\r\n]/.test(path))throw new Error("Invalid script path.");
         var shell=File.systemTempDirectory+"/CCDASTRO_MasterLaunch_"+Date.now()+".scp";
         var requireSignature=scriptHasSignature(path);
         File.writeTextFile(shell,'run -x '+(requireSignature?'--require-signature ':'')+'"'+path.replace(/\\/g,"/")+'"\n');
         var pid=ExternalProcess.startDetached(CoreApplication.filePath,["--execute="+CoreApplication.instance+":"+shell]);
         if(!(pid>0)){File.remove(shell);throw new Error("PixInsight could not queue the tool launch.");}
      }else openNative(selectedTool.process);
   }catch(e){new MessageBox(errorMessage(e),TITLE,StdIcon.Error,StdButton.Ok).execute();}
}
main();
