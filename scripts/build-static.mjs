import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const destination=path.join(root,'_site');
async function filesIn(folder){
  const entries=await readdir(path.join(root,folder),{withFileTypes:true});
  const results=await Promise.all(entries.filter(entry=>!entry.name.startsWith('.')).map(entry=>entry.isDirectory()?filesIn(`${folder}/${entry.name}`):`${folder}/${entry.name}`));
  return results.flat();
}
const files=['index.html',...await filesIn('src'),...await filesIn('public')].sort();
const sources=await Promise.all(files.map(async file=>({file,body:await readFile(path.join(root,file))})));
const hash=createHash('sha256');for(const source of sources)hash.update(source.file).update(source.body);
const version=hash.digest('hex').slice(0,12);
for(const {file,body} of sources){
  const output=path.join(destination,file);await mkdir(path.dirname(output),{recursive:true});
  let content=body;
  if(file.endsWith('.js'))content=body.toString('utf8').replace(/(from\s+['"])(\.\.?\/[^'"?]+\.js)(?:\?[^'"]*)?(['"])/g,`$1$2?v=${version}$3`);
  if(file.endsWith('.html'))content=body.toString('utf8').replace(/(\.\/src\/[^"'?]+\.(?:js|css))(?:\?[^"']*)?(["'])/g,`$1?v=${version}$2`);
  await writeFile(output,content);
}
await writeFile(path.join(destination,'.nojekyll'),'');
console.log(`Static game staged in _site (${files.length} files, version ${version}).`);
