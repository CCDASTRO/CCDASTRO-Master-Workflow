[CmdletBinding()]
param()
$ErrorActionPreference='Stop'
$taskRoot=Split-Path -Parent $PSScriptRoot
$taskVersion='0.4.0'
$taskNames=@('CCDASTROMasterWorkflow.js','MasterTools.js','HDRPrepare.js','CCDASTROMasterWorkflow.xsgn')
$taskSignature=Join-Path $taskRoot 'pixinsight/CCDASTROMasterWorkflow.xsgn'
$taskUtf8=[Text.UTF8Encoding]::new($false)
foreach($taskName in $taskNames){
    $taskPath=Join-Path $taskRoot ('pixinsight/'+$taskName)
    if(-not(Test-Path -LiteralPath $taskPath -PathType Leaf)){throw "Missing release input: $taskPath"}
    if($taskName.EndsWith('.js')){
        $taskBytes=[IO.File]::ReadAllBytes($taskPath)
        if(($taskBytes.Length -ge 3 -and $taskBytes[0] -eq 239 -and $taskBytes[1] -eq 187 -and $taskBytes[2] -eq 191) -or [regex]::IsMatch([IO.File]::ReadAllText($taskPath),'(?<!\r)\n')){throw "Source must use CRLF and UTF-8 without BOM: $taskName"}
        if((Get-Item -LiteralPath $taskPath).LastWriteTimeUtc -gt (Get-Item -LiteralPath $taskSignature).LastWriteTimeUtc){throw 'Source changed after signing. Sign and verify the final script before packaging.'}
    }
}
$taskSource=[IO.File]::ReadAllText((Join-Path $taskRoot 'pixinsight/CCDASTROMasterWorkflow.js'))
if($taskSource -notmatch ('var TITLE="CCDASTRO Master Workflow '+[regex]::Escape($taskVersion)+'";')){throw 'Package version does not match the launcher title.'}
$taskReport=Join-Path $taskRoot 'validation/v0.4.0-script-signature.json'
if(-not(Test-Path -LiteralPath $taskReport)){throw 'Verify the signed script in PixInsight with validation/verify-v0.4.0-script.js before packaging.'}
$taskVerified=Get-Content -LiteralPath $taskReport -Raw | ConvertFrom-Json
if($taskVerified.valid -ne $true -or $taskVerified.developerId -ne 'CCDASTRO' -or (Get-Item -LiteralPath $taskReport).LastWriteTimeUtc -lt (Get-Item -LiteralPath $taskSignature).LastWriteTimeUtc){throw 'Native script verification is invalid or stale. Run validation/verify-v0.4.0-script.js in PixInsight.'}
$taskUpdates=Join-Path $taskRoot 'updates'
$taskManifest=Join-Path $taskUpdates 'updates.xri'
$taskPackageName="CCDASTROMasterWorkflow-$taskVersion.zip"
if(Test-Path -LiteralPath $taskManifest){$taskExisting=[IO.File]::ReadAllText($taskManifest);if($taskExisting.Contains('<Signature') -and $taskExisting.Contains($taskPackageName)){throw 'This version manifest is already signed. Do not rebuild it.'}}
$taskStage=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '.stage'))
if($taskStage -ne [IO.Path]::GetFullPath((Join-Path $taskRoot 'packaging/.stage'))){throw 'Refusing staging operations outside this project packaging/.stage.'}
$taskPayload=Join-Path $taskStage 'src/scripts/CCDASTROMasterWorkflow'
if(Test-Path -LiteralPath $taskStage){Remove-Item -LiteralPath $taskStage -Recurse -Force}
New-Item -ItemType Directory -Path $taskPayload -Force | Out-Null
try{
    foreach($taskName in $taskNames){Copy-Item -LiteralPath (Join-Path $taskRoot ('pixinsight/'+$taskName)) -Destination (Join-Path $taskPayload $taskName)}
    $taskPackage=Join-Path $taskUpdates $taskPackageName
    Compress-Archive -Path (Join-Path $taskStage 'src') -DestinationPath $taskPackage -CompressionLevel Optimal -Force
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    $taskArchive=[IO.Compression.ZipFile]::OpenRead($taskPackage)
    try{
        $taskEntries=@($taskArchive.Entries | Where-Object {$_.Name -ne ''})
        if($taskEntries.Count -ne $taskNames.Count){throw 'Unexpected ZIP file count.'}
        foreach($taskName in $taskNames){if(-not($taskEntries | Where-Object {$_.FullName.Replace('\','/') -ceq ('src/scripts/CCDASTROMasterWorkflow/'+$taskName)})){throw "ZIP entry missing: $taskName"}}
    }finally{$taskArchive.Dispose()}
    $taskHash=(Get-FileHash -LiteralPath $taskPackage -Algorithm SHA1).Hash.ToLowerInvariant()
    $taskDate=(Get-Date).ToUniversalTime().ToString('yyyyMMddHHmmss')
    $taskXml=@"
<?xml version="1.0" encoding="UTF-8"?>
<xri version="1.0">
  <description><p>CCDASTRO Master Workflow - existing tools for session masters.</p></description>
  <platform os="all" arch="noarch" version="1.9.5:1.9.6">
    <package fileName="$taskPackageName" sha1="$taskHash" type="script" releaseDate="$taskDate">
      <title>CCDASTRO Master Workflow $taskVersion</title>
      <description><p>Launch-only session planning with PI 1.9.6 ImageAnalysis, BlindSolver, astrometric/lunar registration, mosaic calibration and WBPP log analysis choices. Five acquisition profiles and existing plans remain supported. Folder entries are a checklist, not automatic tool inputs. No processing runs automatically.</p></description>
    </package>
  </platform>
</xri>
"@
    [xml]$taskParsed=$taskXml
    if($taskParsed.xri.platform.package.sha1 -ne $taskHash){throw 'Manifest checksum validation failed.'}
    [IO.File]::WriteAllText($taskManifest,($taskXml -replace '\r?\n',"`r`n"),$taskUtf8)
    Write-Output "Built: $taskPackage"
    Write-Output "SHA-1: $taskHash"
    Write-Warning 'Manifest is unsigned. Sign updates/updates.xri, verify both signatures in PixInsight, then publish these exact files.'
}finally{
    if([IO.Path]::GetFullPath($taskStage) -ne [IO.Path]::GetFullPath((Join-Path $taskRoot 'packaging/.stage'))){throw 'Refusing cleanup outside packaging/.stage.'}
    if(Test-Path -LiteralPath $taskStage){Remove-Item -LiteralPath $taskStage -Recurse -Force}
}
