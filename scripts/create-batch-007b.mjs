import fs from 'node:fs';
const EDITAL = 'https://servidor-arquivos.ibfc.org.br/arquivos-publicos/edital-01-2026-ibfc-11.06-final-marcadores.pdf';
const TECNICO = 'https://ftp.ibge.gov.br/edital/PSS_Censo_Agro/2026_02/Edital_2_2026_AC_ACQ_Apostila_de_Estudo_dos_conhecimentos_tecnicos.pdf';
const ALL = ['aca','aci','aor','acr','acs'], TECH = ['acr','acs'];
const questions = [];
function add(subject, topic, roles, statement, options, answer, explanation, wrong, source=EDITAL, difficulty='hard') {
  if (wrong.length !== 5) throw new Error(`Justificativas incompletas: ${topic}`);
  questions.push({id:`ibge26-b007-${String(questions.length+41).padStart(3,'0')}`,roles,subject,topic,difficulty,statement,options,answer,explanation,
    whyWrong:wrong.map((x,i)=>i===answer?`Correta. ${explanation}`:x),
    sources:[{title:source===TECNICO?'Conhecimentos básicos para o 12º Censo Agropecuário, Florestal e Aquícola':'Edital nº 01/2026 — conteúdo programático',locator:source===TECNICO?'Apostila de conhecimentos técnicos':'Anexo IV',url:source}],status:'review'});
}

// Português: interpretação e gramática aplicadas a textos inéditos.
add('Língua Portuguesa','interpretação de texto',ALL,
 'Leia: “O aumento de visitas concluídas foi acompanhado por mais pedidos de correção. Por isso, a coordenação evitou tratar o número bruto como prova de melhora.” A conclusão coerente com o trecho é:',
 ['A coordenação rejeita qualquer contagem de visitas.','O volume cresceu, mas a qualidade exige análise adicional.','Os pedidos de correção comprovam queda do volume.','O texto afirma que todas as visitas foram inúteis.','A coordenação decidiu interromper a coleta.'],1,
 'O número de visitas cresceu, mas o aumento das correções impede concluir, apenas pelo volume, que houve melhoria global do trabalho.',
 ['O texto questiona o indicador isolado, não toda contagem.','','Correções não demonstram redução de visitas.','Nenhuma inutilidade geral é afirmada.','Não há decisão de interromper a coleta.']);
add('Língua Portuguesa','coesão textual',ALL,
 'Em “O setor foi revisado; entretanto, ainda havia duas pendências”, o conector introduz uma relação de:',
 ['Causa','Finalidade','Oposição','Conclusão','Condição'],2,
 'Entretanto marca oposição ou ressalva: a revisão ocorreu, mas não eliminou todas as pendências.',
 ['Não apresenta a razão da revisão.','Não apresenta o objetivo da revisão.','','Conclusão seria indicada por portanto ou logo.','Não estabelece hipótese condicional.']);
add('Língua Portuguesa','referência pronominal',ALL,
 'Em “A supervisora entregou à agente sua planilha”, a expressão “sua planilha” pode referir-se a duas pessoas. Qual reescrita elimina a ambiguidade e indica que a planilha pertence à agente?',
 ['A supervisora entregou sua planilha à agente.','A supervisora entregou à agente a planilha da agente.','A supervisora, sua planilha, entregou à agente.','A agente entregou sua planilha à supervisora.','A supervisora entregou à agente a própria planilha.'],1,
 'Ao explicitar “a planilha da agente”, a reescrita fixa o possuidor sem depender da interpretação ambígua de “sua”.',
 ['“Sua” continua podendo referir-se à supervisora.','','A inserção não resolve a referência e compromete a frase.','Inverte quem realiza a entrega.','“A própria” pode retomar a supervisora conforme o contexto.']);
add('Língua Portuguesa','concordância verbal',ALL,
 'Ao revisar um relatório da operação censitária, assinale a alternativa em que a concordância está de acordo com a norma-padrão:',
 ['Houveram divergências entre os registros.','Fazem três dias que a equipe retornou.','Existem duas pendências no setor.','Foi identificados novos endereços.','A equipe e a chefia concordou com o ajuste.'],2,
 'Existir é verbo pessoal e concorda com “duas pendências”. Haver com sentido de existir e fazer indicando tempo decorrido ficam no singular.',
 ['Haver existencial é impessoal: houve.','Fazer temporal é impessoal: faz.','','O particípio deveria concordar: foram identificados.','Sujeito composto pede concordaram.']);
add('Língua Portuguesa','concordância nominal',ALL,
 'A frase “Seguem ______ as cópias solicitadas” deve ser completada, na norma-padrão, por:',
 ['anexo','anexos','anexa','anexas','em anexa'],3,
 'O adjetivo “anexas” concorda em gênero e número com “as cópias”, núcleo feminino plural do termo a que se refere.',
 ['Forma masculina singular.','Forma masculina plural.','Forma feminina singular.','','“Em anexa” não é construção adequada.']);
add('Língua Portuguesa','regência verbal',ALL,
 'Segundo a norma-padrão, em “A equipe assistiu ___ treinamento”, com o sentido de presenciar, a lacuna deve receber:',
 ['o','ao','do','pelo','no'],1,
 'Assistir, no sentido de presenciar, rege a preposição a; com artigo masculino o, ocorre a combinação “ao”.',
 ['Falta a preposição exigida nesse sentido.','','De não é a preposição regida aqui.','Por não expressa a regência pedida.','Em não corresponde à regência de assistir no sentido usado.']);
add('Língua Portuguesa','crase',ALL,
 'No período “A equipe retornou ___ unidade e informou o resultado ___ supervisora”, ambas as lacunas devem ser preenchidas por:',
 ['a','à','as','às','há'],1,
 'Retornar a e informar a exigem preposição a; “unidade” e “supervisora” admitem artigo feminino a. Em ambos os casos há crase.',
 ['Faltaria marcar a fusão de preposição e artigo.','','As está no plural e não traz a preposição.','Às é plural, incompatível com os nomes singulares.','Há é forma do verbo haver.']);
add('Língua Portuguesa','pontuação',ALL,
 'Na redação de um relatório sobre endereços, em qual alternativa as vírgulas isolam corretamente um aposto explicativo?',
 ['O CNEFE cadastro de endereços, apoia a localização.','O CNEFE, cadastro de endereços, apoia a localização.','O CNEFE cadastro, de endereços apoia a localização.','O CNEFE, cadastro de endereços apoia, a localização.','O CNEFE cadastro de endereços apoia, a localização.'],1,
 '“Cadastro de endereços” explica o termo anterior e aparece entre duas vírgulas, sem separar o verbo de seu complemento.',
 ['Falta a primeira vírgula do aposto.','','As vírgulas fragmentam o aposto.','A segunda vírgula invade a relação verbo-complemento.','A vírgula separa verbo e complemento.']);
add('Língua Portuguesa','colocação pronominal',ALL,
 'Na norma-padrão, a frase que emprega corretamente o pronome átono após uma palavra atrativa é:',
 ['Não deve-se alterar o registro.','Não se deve alterar o registro.','Jamais faria-se a correção assim.','Quem informou-me o prazo?','Nunca enviou-se o arquivo.'],1,
 'A palavra negativa “não” atrai o pronome átono para antes do verbo: “não se deve”.',
 ['A negativa atrai o pronome para antes do verbo.','','Jamais também atrai o pronome.','Pronome relativo ou interrogativo atrai o pronome átono.','Nunca exige próclise: nunca se enviou.']);
add('Língua Portuguesa','voz verbal',ALL,
 'A transformação correta da frase “A equipe conferiu os formulários” para a voz passiva analítica é:',
 ['Os formulários conferiram a equipe.','Os formulários foram conferidos pela equipe.','A equipe foi conferida pelos formulários.','Conferiram-se a equipe e os formulários.','Os formulários tinham conferido a equipe.'],1,
 'O objeto direto torna-se sujeito paciente; o verbo passa a “foram conferidos” e o agente da passiva é “pela equipe”.',
 ['Inverte agentes sem construir passiva.','','Troca o paciente pela equipe.','Não preserva a relação original entre agente e paciente.','Mantém formulários como agentes da ação.']);
add('Língua Portuguesa','valor semântico',ALL,
 'Em “A equipe revisou o arquivo para que os dados fossem enviados sem erros”, a oração introduzida por “para que” expressa:',
 ['Concessão','Finalidade','Consequência inevitável','Tempo anterior','Comparação'],1,
 '“Para que” introduz o objetivo da revisão: possibilitar envio sem erros. O resultado pretendido não é apresentado como fato já ocorrido.',
 ['Não indica obstáculo superado.','','Objetivo não equivale a consequência necessária.','Não marca momento anterior.','Não compara dois termos.']);
add('Língua Portuguesa','reescrita',ALL,
 'Qual reescrita preserva o sentido de “Se os dados estiverem consistentes, a transmissão será autorizada”?',
 ['A transmissão será autorizada embora os dados estejam inconsistentes.','A consistência dos dados basta, segundo a frase, para autorizar a transmissão.','A transmissão foi autorizada antes da conferência.','A consistência é consequência obrigatória da transmissão.','A transmissão será proibida mesmo com dados consistentes.'],1,
 'A oração com “se” estabelece condição suficiente para a autorização no enunciado; a paráfrase mantém essa relação condicional.',
 ['Introduz concessão e inconsistência não afirmadas.','','Muda o tempo e antecipa a autorização.','Inverte a direção da relação apresentada.','Contradiz o resultado previsto para dados consistentes.']);
add('Língua Portuguesa','ambiguidade',ALL,
 'Em um registro de campo, a frase “O agente falou com o supervisor no veículo” é ambígua porque:',
 ['“No veículo” pode indicar onde ocorreu a conversa ou onde estava o supervisor.','“Agente” admite apenas sentido químico.','Não há verbo na frase.','“Supervisor” é pronome indefinido.','O tempo verbal é obrigatoriamente futuro.'],0,
 'O adjunto “no veículo” pode ligar-se ao evento de falar ou à posição do supervisor, produzindo duas leituras sem contexto adicional.',
 ['','O contexto usa agente como pessoa.','“Falou” é o verbo.','Supervisor é substantivo.','“Falou” está no pretérito perfeito.']);
add('Língua Portuguesa','acentuação',ALL,
 'Assinale o par em que as duas palavras devem receber acento gráfico segundo a ortografia vigente:',
 ['ideia e jiboia','saude e pais (nação)','voo e enjoo','assembleia e colmeia','heroico e paranoico'],1,
 '“Saúde” e “país” apresentam hiatos com u/i tônicos nas condições previstas pela regra de acentuação.',
 ['Ideia e jiboia perderam acento no acordo vigente.','','Voo e enjoo não levam acento atualmente.','Assembleia e colmeia não são acentuadas.','Heroico e paranoico não recebem acento gráfico.']);
add('Língua Portuguesa','coesão referencial',ALL,
 'Em “O mapa foi atualizado. Esse documento orientará as próximas visitas”, a expressão “esse documento”:',
 ['Retoma “o mapa” e mantém a progressão do texto.','Anuncia necessariamente outro documento.','Indica oposição entre os períodos.','Substitui o verbo atualizar.','Elimina a referência territorial.'],0,
 'A expressão retoma o elemento mencionado antes e evita repetição literal, mantendo clara a continuidade temática entre as duas frases.',
 ['','Não há apresentação obrigatória de novo documento.','Não funciona como conector adversativo.','Retoma um nome, não o verbo.','A referência ao mapa continua identificável.']);
add('Língua Portuguesa','paralelismo',ALL,
 'Em um relatório, a redação “É necessário conferir os registros, a validação dos dados e transmitir o lote” apresenta falta de paralelismo. Qual versão a corrige?',
 ['É necessário conferir os registros, validar os dados e transmitir o lote.','É necessário a conferência dos registros, validar os dados e o lote.','É necessário os registros, dados e a transmissão.','É necessário conferir, os registros validar e transmitir o lote.','É necessário conferir os registros, da validação e transmissão.'],0,
 'A enumeração usa três verbos no infinitivo com estrutura semelhante: conferir, validar e transmitir.',
 ['','Mistura expressão nominal e verbal.','Não mantém as três ações pretendidas.','A pontuação e os complementos comprometem a estrutura.','“Da validação” rompe a sequência de infinitivos.']);
add('Língua Portuguesa','interpretação de conectores',ALL,
 'Leia: “A equipe concluiu a revisão, porque o prazo permitiu uma segunda conferência.” Nesse contexto, “porque” introduz:',
 ['Uma justificativa causal para a conclusão da revisão.','Uma condição futura para revisar.','Uma oposição ao prazo.','Uma comparação entre equipes.','Uma finalidade ainda não alcançada.'],0,
 'A disponibilidade de prazo é apresentada como causa ou explicação para a possibilidade de concluir a revisão.',
 ['','Não há hipótese condicional.','O conector não expressa contraste.','Não há comparação.','O trecho relata revisão concluída, não objetivo futuro.']);
add('Língua Portuguesa','concordância e impessoalidade',ALL,
 'Em “Havia três formulários pendentes”, a substituição por “existir”, preservando tempo e sentido, resulta em:',
 ['Existia três formulários pendentes.','Existiam três formulários pendentes.','Existiriam três formulários pendentes.','Existe três formulários pendentes.','Existindo três formulários pendentes.'],1,
 'Haver com sentido de existir é impessoal e fica no singular; existir é pessoal e concorda com “três formulários” no pretérito imperfeito.',
 ['Existir deve concordar com o sujeito plural.','','Muda para o futuro do pretérito.','Além da concordância, muda o tempo verbal.','Gerúndio não substitui a oração finita.']);
add('Língua Portuguesa','regência nominal',ALL,
 'Em “O relatório é compatível ___ os registros transmitidos”, qual preposição completa adequadamente a frase?',
 ['a','de','com','por','em'],2,
 'O adjetivo “compatível” admite a construção “compatível com”, indicando concordância ou possibilidade de coexistência entre relatório e registros.',
 ['Não é a relação nominal usual no contexto.','“De” não completa a regência indicada.','','“Por” não expressa a relação pretendida.','“Em” não é a preposição exigida aqui.']);
add('Língua Portuguesa','pontuação e sentido',ALL,
 'Compare: “Os agentes que receberam treinamento revisaram os dados” e “Os agentes, que receberam treinamento, revisaram os dados”. A segunda frase:',
 ['Apresenta “que receberam treinamento” como explicação sobre todos os agentes referidos.','Restringe os agentes a um subconjunto treinado.','Nega que houve treinamento.','Afirma que ninguém revisou os dados.','Troca o tempo verbal da revisão.'],0,
 'As vírgulas tornam a oração adjetiva explicativa: o treinamento é atribuído ao conjunto de agentes mencionado, sem restringi-lo a parte dele.',
 ['','A leitura restritiva pertence à primeira frase, sem vírgulas.','O treinamento continua afirmado.','A revisão continua afirmada.','O verbo permanece no mesmo tempo.']);

// Lógica: contas auditáveis e inferências com uma única resposta.
add('Raciocínio Lógico Quantitativo','porcentagem',ALL,
 'De 240 entrevistas previstas, 180 foram concluídas. Qual percentual da meta ainda falta cumprir?',
 ['15%','20%','25%','30%','75%'],2,
 'Faltam 60 entrevistas. A razão 60/240 equivale a 0,25, ou 25% da meta inicial.',
 ['15% corresponde a 36 entrevistas.','20% corresponde a 48.','','30% corresponde a 72.','75% é a parte já concluída.']);
add('Raciocínio Lógico Quantitativo','razão',ALL,
 'Em um posto, a razão entre formulários revisados e pendentes é 3:2. Se há 50 formulários nessas duas situações, quantos estão revisados?',
 ['15','20','25','30','35'],3,
 'A razão total tem 5 partes; cada parte representa 10 formulários. Os revisados correspondem a 3 partes, ou 30.',
 ['Não corresponde a 3 de 5 partes de 50.','20 é a quantidade pendente.','Metade ignora a razão 3:2.','','35 exigiria razão diferente.']);
add('Raciocínio Lógico Quantitativo','conjuntos',ALL,
 'Entre 60 agentes, 34 dominam planilhas, 29 dominam mapas digitais e 12 dominam ambas as ferramentas. Quantos dominam pelo menos uma delas?',
 ['39','46','51','63','75'],2,
 'Pela inclusão e exclusão, 34 + 29 - 12 = 51. As 12 pessoas da interseção não podem ser contadas duas vezes.',
 ['Subtrai mais pessoas do que a interseção.','Não resulta da união dos conjuntos dados.','','63 conta a interseção duas vezes.','Supera o total de agentes.']);
add('Raciocínio Lógico Quantitativo','negação de quantificadores',ALL,
 'Ao negar formalmente a afirmação “Todos os setores foram revisados e transmitidos”, obtém-se:',
 ['Nenhum setor foi revisado nem transmitido.','Ao menos um setor não foi revisado ou não foi transmitido.','Todos os setores foram revisados ou transmitidos.','Ao menos um setor foi revisado e transmitido.','Nenhum setor foi transmitido.'],1,
 'Negar o universal produz existência de exceção; negar a conjunção produz disjunção: falta revisão ou transmissão em pelo menos um setor.',
 ['A negação não exige que todos falhem.','','Troca e por ou sem negar o universal.','Uma ocorrência correta não nega que todos sejam corretos.','A negação não exige ausência total de transmissão.']);
add('Raciocínio Lógico Quantitativo','condicional',ALL,
 'Considere a regra “Se o arquivo foi validado, então pode ser transmitido”. Sabe-se apenas que o arquivo pode ser transmitido. Qual conclusão é logicamente válida?',
 ['Foi validado necessariamente.','Não foi validado.','A regra, sozinha, não permite concluir se foi validado.','A regra é falsa.','O arquivo já foi transmitido.'],2,
 'A permissão de transmissão pode decorrer de outras condições não excluídas. Afirmar o consequente não prova o antecedente.',
 ['É a falácia de afirmar o consequente.','A permissão também não prova ausência de validação.','','Nenhum fato contradiz a regra.','Poder transmitir difere de ter transmitido.']);
add('Raciocínio Lógico Quantitativo','média aritmética',ALL,
 'Uma equipe fez 12, 16, 18 e 14 visitas em quatro dias. Quantas visitas precisa fazer no quinto dia para obter média de 16 visitas por dia?',
 ['16','18','20','22','24'],2,
 'Para média 16 em cinco dias, o total deve ser 80. Nos quatro primeiros dias houve 60 visitas; faltam 20.',
 ['Com 16, o total seria 76.','Com 18, seria 78.','','Com 22, seria 82.','Com 24, seria 84.']);
add('Raciocínio Lógico Quantitativo','equações',ALL,
 'Um posto enviou 12 formulários a mais que outro. Juntos enviaram 88. Quantos formulários enviou o posto de menor produção?',
 ['32','36','38','40','50'],2,
 'Se o menor enviou x, o outro enviou x+12. Então 2x+12=88, logo 2x=76 e x=38.',
 ['Somado a 44, daria 76.','Somado a 48, daria 84.','','Somado a 52, daria 92.','50 é o volume do posto maior.']);
add('Raciocínio Lógico Quantitativo','sequências',ALL,
 'Os números 4, 7, 13, 22 e 34 seguem acréscimos de 3, 6, 9 e 12. Qual é o próximo termo?',
 ['43','46','49','52','58'],2,
 'Os acréscimos aumentam de 3 em 3. O próximo é 15; portanto, 34 + 15 = 49.',
 ['Usaria acréscimo de 9.','Usaria acréscimo de 12 outra vez.','','Usaria acréscimo de 18.','Usaria acréscimo de 24.']);
add('Raciocínio Lógico Quantitativo','probabilidade',ALL,
 'Em uma caixa há quatro fichas verdes, três azuis e uma vermelha. Uma ficha é retirada ao acaso. Qual a probabilidade de NÃO ser azul?',
 ['3/8','4/8','5/8','6/8','7/8'],2,
 'São oito fichas ao todo. Cinco não são azuis (quatro verdes e uma vermelha), portanto a probabilidade é 5/8.',
 ['3/8 é a probabilidade de ser azul.','Conta apenas as verdes.','','Inclui uma ficha azul indevidamente.','Exclui somente a vermelha.']);
add('Raciocínio Lógico Quantitativo','argumentação',ALL,
 'Premissas: “Nenhum registro incompleto é transmitido” e “Alguns registros do lote foram transmitidos”. Conclui-se necessariamente que:',
 ['Todos os registros do lote estão completos.','Alguns registros do lote estão completos.','Nenhum registro do lote está completo.','Todos os registros completos foram transmitidos.','Há registro incompleto transmitido.'],1,
 'Se nenhum incompleto é transmitido, todo registro que de fato foi transmitido é completo. Como alguns foram transmitidos, alguns são completos.',
 ['As premissas não abrangem todos os registros.','','Contradiz a existência de transmitidos completos.','A recíproca não é garantida.','Contradiz a primeira premissa.']);

if(questions.length!==30)throw new Error(`Bloco Português/Lógica incompleto: ${questions.length}`);
const file='content/ibge-2026/batches/batch-007b.json';
fs.writeFileSync(file,JSON.stringify({batch:'batch-007b',status:'review',generatedBy:'curadoria nesta conversa',questions},null,2)+'\n');
console.log(`Salvas ${questions.length} questões em ${file}`);
