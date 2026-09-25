import fs from 'node:fs';

const files=['a','b','c'].map(part=>`content/ibge-2026/batches/batch-007${part}.json`);
const questions=files.flatMap(file=>JSON.parse(fs.readFileSync(file,'utf8')).questions);
if(questions.length!==107)throw new Error(`Quantidade inesperada: ${questions.length}`);

// Complementos editoriais específicos para explicações que precisavam de contexto adicional.
const detail={
  7:' O nível estratégico já definiu o objetivo; aqui os postos transformam essa diretriz em tarefas de execução.',
  11:' A avaliação ocorre antes de qualquer entrevista e permite corrigir preparação insuficiente.',
  26:' Mover o arquivo não deixaria duas versões disponíveis para comparar ou voltar ao documento inicial.',
  27:' Assim, a visualização muda, mas a base conserva os registros dos cinco municípios.',
  28:' O critério entre aspas é comparado ao conteúdo textual de cada célula do intervalo indicado.',
  29:' SOMA retornaria 28; CONT.SE contaria células, enquanto MÉDIA calcula 28 dividido por 4.',
  37:' Ao final, a pasta de origem não terá mais o item movido, exatamente como o enunciado exige.',
  40:' Cada posto aparece como categoria separada, facilitando a comparação visual entre os cinco totais.',
  42:' A segunda oração contraria a expectativa de que a revisão tivesse resolvido todas as pendências.',
  43:' A locução original não define se a planilha é da supervisora ou da agente; a versão escolhida define.',
  45:' A lacuna funciona como predicativo referente às cópias, e não ao verbo “seguem”.',
  46:' O sentido de prestar assistência tem construção distinta, mas não é o sentido da frase proposta.',
  48:' Sem uma das vírgulas, o segmento pode deixar de funcionar como explicação isolada do nome.',
  49:' A posição depois da palavra “não” e antes de “deve” preserva a próclise exigida nessa construção.',
  50:' O tempo verbal original é preservado, e “formulários” exige concordância no masculino plural.',
  54:' Em “país”, o i tônico forma sílaba própria; em “saúde”, ocorre o mesmo com o u tônico.',
  56:' A versão mistura “conferir” e “transmitir” com o substantivo “validação”, quebrando a enumeração.',
  57:' O texto atribui ao prazo disponível a oportunidade de realizar a conferência adicional.',
  61:' O denominador é a meta completa, não o número já realizado; 180/240, ou 75%, é a parte concluída.',
  62:' Os 20 restantes são pendentes; a soma 30 + 20 recupera o total de 50 informado.',
  63:' O total de 60 serve apenas para contextualizar; nove agentes não dominam nenhuma das duas ferramentas.',
  66:' A conta considera o total de cinco dias, e não somente a média dos quatro dias já observados.',
  67:' O posto maior enviou 50, confirmando que a soma dos dois volumes é 38 + 50 = 88.',
  68:' O padrão está nas diferenças, não em multiplicação por uma razão constante.',
  69:' O evento complementar de “ser azul” inclui as verdes e a vermelha; 3/8 + 5/8 = 1.',
  78:' A escala do material oficial usa exatamente 500 m por centímetro, permitindo o cálculo sem arredondamento.',
  101:' Esse critério substitui a localização da sede apenas porque o enunciado informa que ela inexiste.',
  103:' A separação por via não cria automaticamente duas áreas não contínuas para fins da definição censitária.',
  104:' Quando cada herdeiro ocupa uma parte independente, a regra é distinta e pode haver estabelecimentos separados.',
  107:' A regra muda se cada família decide individualmente o que produzir e o destino da produção.'
};
for(const [number,note] of Object.entries(detail)){
  const q=questions[Number(number)-1];q.explanation+=note;q.whyWrong[q.answer]=`Correta. ${q.explanation}`;
}

// Equilibra o gabarito sem alterar a associação entre alternativa e justificativa.
for(const [index,q] of questions.entries()){
  const desired=index%5, shift=(desired-q.answer+5)%5;
  if(shift){const rotate=items=>items.map((_,i)=>items[(i-shift+5)%5]);q.options=rotate(q.options);q.whyWrong=rotate(q.whyWrong);q.answer=desired;}
}

const master=JSON.parse(fs.readFileSync('content/ibge-2026/questions.json','utf8')).questions;
const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const seen=new Set(master.map(q=>normalize(q.statement)));
const ids=new Set(master.map(q=>q.id));
const roleSubjects={aca:new Set(['Língua Portuguesa','Raciocínio Lógico Quantitativo','Noções de Administração']),aci:new Set(['Língua Portuguesa','Raciocínio Lógico Quantitativo','Noções de Informática']),aor:new Set(['Língua Portuguesa','Raciocínio Lógico Quantitativo','Noções de Administração/Situações Gerenciais','Noções Básicas de Informática']),acr:new Set(['Língua Portuguesa','Raciocínio Lógico Quantitativo','Noções de Administração/Situações Gerenciais','Conhecimentos Técnicos']),acs:new Set(['Língua Portuguesa','Raciocínio Lógico Quantitativo','Noções de Administração/Situações Gerenciais','Conhecimentos Técnicos'])};
const errors=[];
for(const [index,q] of questions.entries()){
  const where=index+1;
  if(ids.has(q.id))errors.push(`${where}: ID duplicado`);ids.add(q.id);
  const statement=normalize(q.statement);if(seen.has(statement))errors.push(`${where}: enunciado duplicado`);seen.add(statement);
  if(q.statement.length<80)errors.push(`${where}: enunciado curto`);
  if(q.explanation.length<120)errors.push(`${where}: explicação curta (${q.explanation.length})`);
  if(q.options.length!==5||new Set(q.options.map(x=>x.trim().toLowerCase())).size!==5)errors.push(`${where}: alternativas repetidas/incompletas`);
  if(q.whyWrong.length!==5||q.whyWrong.some(x=>x.length<15))errors.push(`${where}: justificativas insuficientes`);
  if(q.answer!==index%5)errors.push(`${where}: gabarito deslocado`);
  if(!q.roles?.length||q.roles.some(role=>!roleSubjects[role]?.has(q.subject)))errors.push(`${where}: cargo incompatível`);
  if(!q.sources?.length||!q.sources[0].url.startsWith('https://'))errors.push(`${where}: fonte ausente`);
}
if(errors.length){console.error(errors.join('\n'));process.exit(1)}
const distribution=Object.fromEntries([...new Set(questions.map(q=>q.subject))].map(s=>[s,questions.filter(q=>q.subject===s).length]));
const file='content/ibge-2026/batches/batch-007.json';
fs.writeFileSync(file,JSON.stringify({batch:'batch-007',status:'review',generatedBy:'curadoria nesta conversa',distribution,questions},null,2)+'\n');
console.log(JSON.stringify({file,count:questions.length,distribution,answers:[0,1,2,3,4].map(n=>questions.filter(q=>q.answer===n).length),errors},null,2));
