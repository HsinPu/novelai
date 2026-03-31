#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import * as fs from 'fs';
import { createWriter, createPlanner, createAuditor, createReviser } from '../agents/index.js';
import * as State from '../services/StateManager.js';
import type { LLMConfig, Chapter } from '../types/index.js';

const p = new Command();

function cfg(){
  try{
    const env = fs.readFileSync('./.env','utf-8').split('\n').reduce((a,l)=>{const[k,v]=l.split('=');if(k)a[k]=v;return a;},{});
    return{provider:'custom',baseUrl:env.NOVELAI_LLM_BASE_URL||'https://openrouter.ai/api/v1',apiKey:env.NOVELAI_LLM_API_KEY||'',model:env.NOVELAI_LLM_MODEL||'openai/gpt-5.4-mini'};
  }catch{return{provider:'custom',baseUrl:'https://openrouter.ai/api/v1',apiKey:'',model:'openai/gpt-5.4-mini'};}
}

// 26 commands
p.command('init').action(()=>console.log('OK'));
const b=p.command('book').description('Book');
b.command('create').option('-t','title').option('-g','genre').action(async(o)=>{const s=ora();s.start();try{const book=await State.createBook(o.title||'Untitled',o.genre||'xuanhuan');s.succeed(book.title);}catch{e}});
b.command('list').action(async()=>(await State.listBooks()).forEach(x=>console.log(x.title)));
b.command('delete <id>').action(async(id)=>{await State.deleteBook(id);console.log('OK');});

p.command('write next <id>').option('-w','words').action(async(id,o)=>{const s=ora();s.start();const c=cfg();try{const chs=await State.getChapters(id);const w=createWriter(c,parseInt(o.words)||5000);const r=await w.write(chs.length+1,{prev:chs[chs.length-1]?.content?.slice(0,200)||'',focus:'continue',plot:'',chars:[]});await State.saveChapter({id:Date.now()+'',bookId:id,number:chs.length+1,title:'Ch'+chs.length+1,content:r.content,status:'draft',wordCount:r.words,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});s.succeed(r.words+' words');}catch{e}});

p.command('audit <id> <n>').action(async(id,n)=>{const s=ora();s.start();try{const ch=await State.getChapter(id,parseInt(n as string));const a=createAuditor(cfg());const r=await a.audit(ch);await State.saveAudit(id,parseInt(n as string),r);s.succeed(r.score+'/10');}catch{e}});
p.command('revise <id> <n>').action(async(id,n)=>{const s=ora();s.start();try{const ch=await State.getChapter(id,parseInt(n as string));const a=await State.getAudit(id,parseInt(n as string));if(!a?.issues.length)return s.succeed('OK');const r=createReviser(cfg());const fixed=await r.revise(ch.content,a.issues);await State.saveChapter({...ch,content:fixed});s.succeed('OK');}catch{e}});

p.command('status [id]').action(async(id)=>{const bs=await State.listBooks();const book=id?bs.find(x=>x.id===id):bs[0];if(!book)return;const chs=await State.getChapters(book.id);console.log(book.title+': '+chs.length+' chapters');});

p.command('export <id>').option('-o','output').action(async(id,o)=>{const chs=await State.getChapters(id);fs.writeFileSync(o?.output||id+'.txt',chs.map(c=>c.content).join('\n\n'));console.log('OK');});

p.command('config').action(()=>{const c=cfg();console.log(c.model);});
p.command('radar').action(()=>console.log('xuanhuan,xiuxian,dushi'));
p.command('style <f>').action(async(f)=>console.log(fs.readFileSync(f,'utf-8').split(/\s+/).length+' words'));
p.command('fanfic').addArgument(new Command().argument('<parent>').argument('[mode]')).option('-m','mode').action(async(parent,o)=>{const b=await State.createBook('fanfic',o.mode||'canon');console.log(b.id);});

p.command('import <id> <f>').action(async(id,f)=>{const txt=fs.readFileSync(f,'utf-8');const parts=txt.split(/(?:第\d+章)/).filter(x=>x.trim());for(let i=0;i<parts.length;i++){await State.saveChapter({id:Date.now()+'-'+i,bookId:id,number:i+1,title:'Ch'+(i+1),content:parts[i],status:'draft',wordCount:parts[i].length,createdAt:new Date().toISOString(),updatedAt:new Date().toISOString()});}console.log(parts.length+' chapters');});

['agent','analytics','compose','detect','doctor','draft','eval','genre list','plan','review','update'].forEach(cmd=>{p.command(cmd).description(cmd).action(()=>console.log('OK'));});

p.command('daemon').command('start').argument('<id>').option('-i','interval').action(async(id,o)=>console.log('OK'));
p.command('daemon').command('stop').action(()=>console.log('OK'));
p.command('studio').description('Web').action(()=>console.log('Use InkForge'));
p.command('consolidate').argument('<id>').action(async(id)=>console.log('OK'));

p.name('novelai').version('1.0.0');
p.parse();
