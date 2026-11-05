const {spawnSync}=require('node:child_process');
const {readFileSync}=require('node:fs');
const {createHash}=require('node:crypto');
const path=require('node:path');

const root=__dirname;
const site='https://daylist.cqzaicjlu.cn/';
const files=['index.html','app.js','style.css'];
const args=process.argv.slice(2);
if(args.some(arg=>!['--verify-only','--once'].includes(arg))){
 console.error('Usage: node publish.cjs [--verify-only] [--once]');process.exit(1);
}
function run(command,argv){
 const result=spawnSync(command,argv,{cwd:root,encoding:'utf8',timeout:45000,
  env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'Never'}});
 if(result.error||result.status!==0)throw new Error(`${command} ${argv.join(' ')} failed: ${result.error?.message||result.stderr||result.stdout}`);
 return result.stdout.trim();
}
function digest(text){return createHash('sha256').update(text.replace(/^\uFEFF/,'').replace(/\r\n/g,'\n')).digest('hex');}
async function verify(){
 const expected=new Map(files.map(file=>[file,digest(readFileSync(path.join(root,file),'utf8'))]));
 const deadline=Date.now()+(args.includes('--once')?0:300000);
 do{
  const results=await Promise.all(files.map(async file=>{
   try{
    const url=new URL(file,site);url.searchParams.set('release-check',Date.now().toString());
    const response=await fetch(url,{signal:AbortSignal.timeout(15000),headers:{'Cache-Control':'no-cache'}});
    if(!response.ok)return `${file}: HTTP ${response.status}`;
    return digest(await response.text())===expected.get(file)?null:`${file}: online content differs`;
   }catch(error){return `${file}: ${error.message}`;}
  }));
  const pending=results.filter(Boolean);
  if(!pending.length){console.log(`Verified online: ${site} (${files.join(', ')})`);return;}
  console.log(`Not verified: ${pending.join('; ')}`);
  if(Date.now()>=deadline)throw new Error('Online verification failed. Publication is not confirmed. The saved commit can be retried.');
  await new Promise(resolve=>setTimeout(resolve,10000));
 }while(true);
}
async function main(){
 if(!args.includes('--verify-only')){
  run(process.execPath,['--check','app.js']);
  console.log(run(process.execPath,['check.cjs']));
  if(run('git',['status','--porcelain']))throw new Error('Commit or resolve local changes before publishing.');
  if(run('git',['branch','--show-current'])!=='main')throw new Error('Publish from main only.');
  if(run('git',['remote','get-url','origin'])!=='https://github.com/Q-Vicent/daylist.git')throw new Error('Unexpected origin. Check the repository before publishing.');
  console.log('Pushing committed main (45-second timeout, interactive login disabled)...');
  run('git',['-c','credential.username=Q-Vicent','push','origin','main']);
  const local=run('git',['rev-parse','HEAD']);
  const remote=run('git',['ls-remote','origin','refs/heads/main']).split(/\s+/)[0];
  if(local!==remote)throw new Error('Remote main does not match the local commit.');
  console.log(`Push confirmed: ${local}. Waiting for website update...`);
 }
 await verify();
}
main().catch(error=>{console.error(error.message);process.exitCode=1;});
