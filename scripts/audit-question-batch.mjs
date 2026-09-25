import fs from 'node:fs';

const file=process.argv[2];
if(!file)throw new Error('Uso: node scripts/audit-question-batch.mjs content/.../batch.json');
const expectedArg=process.argv.find(argument=>argument.startsWith('--expected='));
const expected=expectedArg?Number(expectedArg.split('=')[1]):null;
const incoming=JSON.parse(fs.readFileSync(file,'utf8')).questions;
const current=JSON.parse(fs.readFileSync('content/ibge-2026/questions.json','utf8')).questions;
const incomingIds=new Set(incoming.map(item=>item.id));
const other=current.filter(item=>!incomingIds.has(item.id));
const manifest=JSON.parse(fs.readFileSync('content/ibge-2026/banco-manifesto.json','utf8'));
const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const words=text=>new Set(normalize(text).split(' ').filter(word=>word.length>3));
const similarity=(a,b)=>{let common=0;for(const word of a)if(b.has(word))common++;return common/(a.size+b.size-common||1)};
const suspect=/considere o contexto da operacao descrito no edital|a alternativa correta preserva o criterio do enunciado|as demais confundem conceitos|assinale a alternativa correta\.?$/i;
const errors=[];
const seen=new Set(other.map(item=>normalize(item.statement)));
const prior=other.filter(item=>item.status==='approved'&&!suspect.test(normalize(item.statement)+' '+normalize(item.explanation)));
const compared=prior.map(item=>({id:item.id,subject:item.subject,tokens:words(item.statement)}));
for(const [index,item] of incoming.entries()){
  const number=index+1,label=`${item.id||number}`;
  const published=current.find(previous=>previous.id===item.id);
  if(!item.id||published&&JSON.stringify({...published,status:'review'})!==JSON.stringify({...item,status:'review'}))errors.push(`${label}: ID ausente ou conteúdo diverge do publicado`);
  if(item.statement?.length<80||item.explanation?.length<120)errors.push(`${label}: enunciado ou explicação insuficiente`);
  if(suspect.test(normalize(item.statement)+' '+normalize(item.explanation)))errors.push(`${label}: frase genérica/proibida`);
  if(!Array.isArray(item.options)||item.options.length!==5||new Set(item.options.map(option=>String(option).trim().toLowerCase())).size!==5)errors.push(`${label}: alternativas incompletas ou repetidas`);
  if(!Number.isInteger(item.answer)||item.answer<0||item.answer>4)errors.push(`${label}: gabarito inválido`);
  if(!Array.isArray(item.whyWrong)||item.whyWrong.length!==5)errors.push(`${label}: justificativas incompletas`);
  if(!item.sources?.length||item.sources.some(source=>!source.url?.startsWith('https://')||!source.locator))errors.push(`${label}: fonte ou localizador ausente`);
  if(!item.roles?.length||item.roles.some(role=>!manifest.roles.find(row=>row.id===role)?.subjects.some(subject=>subject.name===item.subject)))errors.push(`${label}: disciplina incompatível com cargo`);
  const lengths=item.options.map(option=>option.length),mean=lengths.reduce((sum,length)=>sum+length,0)/5;
  if(lengths[item.answer]===Math.max(...lengths)&&lengths[item.answer]>1.5*mean)errors.push(`${label}: gabarito destacado pelo comprimento`);
  const normalized=normalize(item.statement);
  if(seen.has(normalized))errors.push(`${label}: enunciado repetido`);
  seen.add(normalized);
  const tokens=words(item.statement);
  for(const previous of compared)if(previous.subject===item.subject&&similarity(tokens,previous.tokens)>.72){errors.push(`${label}: semelhante a ${previous.id}`);break}
  compared.push({id:item.id,subject:item.subject,tokens});
  if(item.answer!==index%5)errors.push(`${label}: gabarito não balanceado na posição esperada`);
}
if(expected!==null&&incoming.length!==expected)errors.push(`Lote deve ter ${expected} questões, não ${incoming.length}`);
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const subjects=Object.fromEntries([...new Set(incoming.map(item=>item.subject))].map(subject=>[subject,incoming.filter(item=>item.subject===subject).length]));
console.log(JSON.stringify({status:'aprovado para substituição estrutural',count:incoming.length,subjects,uniqueStatements:seen.size,answerDistribution:[0,1,2,3,4].map(i=>incoming.filter(item=>item.answer===i).length)},null,2));
