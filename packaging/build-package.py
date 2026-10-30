"""Build after CodeSign signs the final main script and its local include."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, zipfile

root=Path(__file__).resolve().parent.parent
version='0.3.1'
names=['CCDASTROMasterWorkflow.js','MasterTools.js','HDRPrepare.js','CCDASTROMasterWorkflow.xsgn']
for name in names:
    p=root/'pixinsight'/name
    if not p.is_file():raise SystemExit('Missing '+str(p)+'. Sign the main script before building.')
    if name.endswith('.js'):
        b=p.read_bytes()
        if b.startswith(b'\xef\xbb\xbf') or b'\n' in b.replace(b'\r\n',b''):
            raise SystemExit('Signed source must use UTF-8 without BOM and CRLF: '+name)
out=root/'updates';out.mkdir(exist_ok=True)
manifest=out/'updates.xri'
if manifest.exists() and b'<Signature' in manifest.read_bytes() and f'CCDASTROMasterWorkflow-{version}.zip'.encode() in manifest.read_bytes():
    raise SystemExit('Manifest is already signed. Do not rebuild it. Prepare a new version instead.')
package=out/f'CCDASTROMasterWorkflow-{version}.zip'
with zipfile.ZipFile(package,'w',zipfile.ZIP_DEFLATED) as z:
    for name in names:z.write(root/'pixinsight'/name,'src/scripts/CCDASTROMasterWorkflow/'+name)
sha1=hashlib.sha1(package.read_bytes()).hexdigest()
date=datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')
xml=f'''<?xml version="1.0" encoding="UTF-8"?>
<xri version="1.0">
  <description><p>CCDASTRO Master Workflow - existing tools for session masters.</p></description>
  <platform os="all" arch="noarch" version="1.9.5:1.9.6">
    <package fileName="{package.name}" sha1="{sha1}" type="script" releaseDate="{date}">
      <title>CCDASTRO Master Workflow {version}</title>
      <description><p>A launch-only session planner for existing calibration, registration, integration and channel-combination tools. Includes mono LRGB/Ha/OIII/SII, OSC, OSC with filter sessions and OSC with mono narrowband data. Folder entries are a checklist, not automatic tool inputs. No processing runs automatically.</p></description>
    </package>
  </platform>
</xri>
'''
manifest.write_bytes(xml.replace('\n','\r\n').encode('utf-8'))
print('Built '+str(package))
print('Next: verify the script signature in PixInsight, then sign '+str(manifest))
print('After manifest signing, verify both signatures and publish these exact bytes. Do not rebuild.')
