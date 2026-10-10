import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync(new URL('../index.html',import.meta.url),'utf8');

function executableInlineScripts(source){
  const scripts=[];
  for(const match of source.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/gi)){
    const attrs=match[1]||'';
    const code=match[2]||'';
    if(/\bsrc\s*=/.test(attrs))continue;
    if(/\btype\s*=\s*["'](?:module|application\/json|importmap)["']/i.test(attrs))continue;
    if(code.trim())scripts.push(code);
  }
  return scripts;
}

test('all executable inline JavaScript in index.html compiles',()=>{
  const scripts=executableInlineScripts(html);
  assert.ok(scripts.length>0,'expected at least one executable inline script');
  scripts.forEach((code,index)=>{
    assert.doesNotThrow(()=>new vm.Script(code,{filename:`index.inline.${index}.js`}),`inline script ${index} must compile`);
  });
});
