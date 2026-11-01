#engine v8
var result={};try{var s=Security.getScriptSignature('C:/Users/chuck/source/repos/ASCOM.CCDASTRO.Temma/CCDASTRO-Master-Workflow/pixinsight/CCDASTROMasterWorkflow.js');result={valid:s.valid,developerId:s.developerId};}catch(e){result.error=String(e);}
File.writeTextFile('C:/Users/chuck/source/repos/ASCOM.CCDASTRO.Temma/CCDASTRO-Master-Workflow/validation/v0.4.0-script-signature.json',JSON.stringify(result,null,2));
