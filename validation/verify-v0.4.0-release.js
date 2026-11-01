#engine v8
var result={};
try {
var a=Security.getScriptSignature('C:/Users/chuck/source/repos/ASCOM.CCDASTRO.Temma/CCDASTRO-Master-Workflow/pixinsight/CCDASTROMasterWorkflow.js');
var b=Security.getXMLSignature('C:/Users/chuck/source/repos/ASCOM.CCDASTRO.Temma/CCDASTRO-Master-Workflow/updates/updates.xri');
result={script:{valid:a.valid,developerId:a.developerId},manifest:{valid:b.valid,developerId:b.developerId}};
result.ok=a.valid&&b.valid&&a.developerId==='CCDASTRO'&&b.developerId==='CCDASTRO';
}catch(e){result={ok:false,error:String(e)};}
File.writeTextFile('C:/Users/chuck/source/repos/ASCOM.CCDASTRO.Temma/CCDASTRO-Master-Workflow/validation/v0.4.0-final-signatures.json',JSON.stringify(result,null,2));
