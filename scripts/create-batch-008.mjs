import fs from 'node:fs';

const EDITAL='https://servidor-arquivos.ibfc.org.br/arquivos-publicos/edital-01-2026-ibfc-11.06-final-marcadores.pdf';
const TEC='https://ftp.ibge.gov.br/edital/PSS_Censo_Agro/2026_02/Edital_2_2026_AC_ACQ_Apostila_de_Estudo_dos_conhecimentos_tecnicos.pdf';
const EXCEL='https://support.microsoft.com/pt-br/excel/get-started/overview-of-formulas-in-excel';
const CERT='https://cartilha.cert.br/fasciculos/phishing-golpes/fasciculo-phishing-golpes-alta.pdf';
const ALL=['aca','aci','aor','acr','acs'], MAN=['aor','acr','acs'];
const q=[];
function add(subject,topic,roles,statement,options,answer,explanation,url=EDITAL){
  q.push({id:`ibge26-b008-${String(q.length+1).padStart(3,'0')}`,roles,subject,topic,difficulty:'hard',statement,options,answer,explanation,
    whyWrong:options.map((option,i)=>i===answer?`Correta. ${explanation}`:`Incorreta: ${option}. ${explanation}`),
    sources:[{title:url===TEC?'Apostila oficial de conhecimentos técnicos':url===EXCEL?'Suporte Microsoft Excel':url===CERT?'Cartilha CERT.br':'Edital nº 01/2026 — programa da prova',locator:url===TEC?'Conteúdo técnico':'Conteúdo programático e referência conceitual',url}],status:'review'});
}

// Administração — 20 questões, priorizando o cargo ACA, cuja prova tem 35 itens da disciplina.
add('Noções de Administração','funções administrativas',['aca'],'Uma unidade definiu a meta trimestral, distribuiu tarefas entre postos, orientou equipes e comparou os resultados obtidos com a meta. Qual sequência representa essas ações?',
['Controle, direção, organização e planejamento','Planejamento, organização, direção e controle','Organização, planejamento, controle e direção','Direção, planejamento, organização e controle','Planejamento, direção, controle e organização'],1,
'Definir a meta é planejar; distribuir tarefas é organizar; orientar pessoas é dirigir; comparar realizado e previsto é controlar. A ordem acompanha exatamente os quatro fatos narrados.');
add('Noções de Administração','planejamento estratégico',['aca'],'A direção do órgão fixa uma diretriz plurianual para ampliar a qualidade dos dados, enquanto uma equipe define a escala da próxima semana. Qual atividade pertence ao nível estratégico?',
['Elaborar a escala semanal','Distribuir formulários por turno','Fixar a diretriz plurianual','Corrigir um registro individual','Repor um dispositivo defeituoso'],2,
'A diretriz de longo prazo orienta toda a organização e corresponde ao planejamento estratégico. A escala e as medidas pontuais desdobram essa direção em níveis operacionais.');
add('Noções de Administração','planejamento tático',['aca'],'A meta geral de reduzir retrabalho já foi definida. Uma superintendência decide como alocar suas equipes e recursos durante o semestre para cumprir essa meta. Trata-se sobretudo de planejamento:',
['Estratégico institucional','Tático da unidade','Operacional diário','Controle posterior','Auditoria externa'],1,
'O plano da superintendência traduz uma diretriz geral para uma unidade organizacional no horizonte intermediário. Por isso é tático, não a execução diária nem a formulação institucional.');
add('Noções de Administração','eficiência e eficácia',['aca'],'Dois postos atingiram a mesma meta de atendimento e mantiveram a mesma qualidade. O posto A empregou menos horas de trabalho que o B. Comparando apenas esses dados, é correto afirmar que:',
['A foi mais eficaz, mas não se pode avaliar eficiência','B foi mais eficiente por usar mais horas','A foi mais eficiente e ambos foram eficazes','Ambos foram igualmente eficientes por atingir a meta','A foi menos eficaz porque terminou antes'],2,
'Ambos alcançaram a meta, portanto foram eficazes. Com qualidade e resultado iguais, o posto que empregou menos horas utilizou melhor o recurso e foi mais eficiente.');
add('Noções de Administração','efetividade',['aca'],'Uma campanha de atendimento cumpriu todas as metas internas de produção, mas não reduziu a exclusão do público que deveria alcançar. Qual dimensão permanece problemática nesse caso?',
['Organização formal','Efetividade do impacto','Eficiência de recursos necessariamente','Divisão do trabalho','Amplitude de controle'],1,
'Metas internas alcançadas não garantem transformação concreta para o público-alvo. A efetividade examina o efeito externo pretendido, que não foi obtido no cenário descrito.');
add('Noções de Administração','estrutura organizacional',['aca'],'Um funcionário recebe ordens incompatíveis de dois superiores para a mesma atividade, sem regra de precedência. Qual princípio organizacional foi comprometido de modo mais direto?',
['Especialização','Unidade de comando','Departamentalização geográfica','Formalização de rotinas','Centralização financeira'],1,
'A unidade de comando busca clareza sobre a autoridade responsável por orientar o trabalho. Ordens concorrentes e incompatíveis para a mesma tarefa produzem conflito de direção.');
add('Noções de Administração','departamentalização',['aca'],'Um órgão organiza seus postos por regiões do país porque distâncias, acessos e demandas locais diferem bastante. O critério principal de departamentalização é:',
['Por produto','Por cliente','Geográfico','Por processo','Por projeto temporário'],2,
'O agrupamento foi feito segundo a localização territorial das unidades. As diferenças de acesso justificam esse desenho, mas não transformam a classificação em produto ou processo.');
add('Noções de Administração','centralização e descentralização',['aca'],'A sede passa a permitir que gerências locais decidam remanejamentos pequenos dentro de limites orçamentários e metas comuns. Essa mudança caracteriza:',
['Centralização integral','Descentralização de decisões delimitadas','Eliminação da hierarquia','Terceirização da gerência','Ausência de prestação de contas'],1,
'A autoridade de decidir parte da sede para unidades locais, ainda sob limites e objetivos comuns. Descentralizar não extingue hierarquia, responsabilidade ou controles.');
add('Noções de Administração','amplitude de controle',['aca'],'Um supervisor acompanha diretamente 24 agentes, todos em tarefas complexas e geograficamente dispersas. Qual efeito é mais provável caso nenhuma outra condição mude?',
['Maior facilidade automática de acompanhamento individual','Diminuição garantida dos custos totais','Dificuldade de supervisão pela amplitude elevada','Desaparecimento da necessidade de comunicação','Transformação da supervisão em planejamento estratégico'],2,
'Muitos subordinados diretos, somados à complexidade e dispersão, ampliam a carga de coordenação do supervisor. A amplitude de controle deve considerar essas condições.');
add('Noções de Administração','processo decisório',['aca'],'Diante de atraso recorrente, o gestor primeiro delimita quando, onde e em que etapa o atraso ocorre; depois propõe soluções. A primeira providência corresponde a:',
['Identificação e diagnóstico do problema','Execução da alternativa escolhida','Controle de resultados finais','Delegação irrestrita','Avaliação do impacto da solução'],0,
'Antes de escolher soluções, é preciso definir o problema com precisão e levantar suas causas. Localizar quando e onde o atraso ocorre evita agir sobre sintomas isolados.');
add('Noções de Administração','decisão programada',['aca'],'Uma chefia aplica um procedimento previamente definido sempre que um formulário chega sem assinatura. Essa decisão, por ser repetitiva e amparada em regra, é:',
['Não programada','Estratégica inédita','Programada','Intuitiva sem critério','Emergencial de alto grau de incerteza'],2,
'A existência de regra anterior para situação recorrente caracteriza decisão programada. Não se exige criar uma solução inédita a cada formulário incompleto.');
add('Noções de Administração','controle concomitante',['aca'],'Durante a coleta, um painel aponta aumento de inconsistências e a equipe ajusta o procedimento antes de concluir a etapa. Qual tipo de controle predomina?',
['Prévio, pois ocorre antes de qualquer trabalho','Concomitante, pois acompanha a execução','Posterior, pois só compara resultados encerrados','Estratégico, pois substitui metas','Informal, pois não produz registros'],1,
'O painel acompanha uma operação que ainda está em curso e permite correção imediata. Isso distingue o controle concomitante do preventivo e do posterior.');
add('Noções de Administração','indicadores',['aca'],'Uma unidade mede somente o número de atendimentos e ignora retrabalho, completude e satisfação do público. O principal problema dessa avaliação é:',
['Falta de qualquer dado numérico','Uso de indicador único que não cobre qualidade e resultados','Excesso de controle qualitativo','Impossibilidade de calcular produção','Substituição indevida de metas por orçamento'],1,
'O volume informa uma dimensão da atividade, mas não a qualidade nem o resultado útil. Avaliação mais robusta combina indicadores pertinentes sem descartar a produção.');
add('Noções de Administração','organização formal e informal',['aca'],'A estrutura oficial determina que dúvidas técnicas passem por uma chefia; na prática, colegas também se ajudam por mensagens espontâneas. Essa rede de ajuda é exemplo de:',
['Estrutura formal regulamentada','Organização informal','Extinção da cadeia hierárquica','Terceirização administrativa','Controle orçamentário'],1,
'As interações espontâneas entre colegas formam a organização informal. Elas coexistem com a estrutura formal e podem facilitar a circulação de conhecimento sem alterá-la por si só.');
add('Noções de Administração','comunicação',['aca'],'Um memorando foi enviado, mas parte da equipe interpretou o prazo de forma diferente. Qual providência melhor verifica se a mensagem foi realmente compreendida?',
['Contar apenas os destinatários da mensagem','Solicitar retorno sobre o prazo entendido e esclarecer divergências','Repetir o texto sem alteração','Tratar silêncio como concordância inequívoca','Excluir a data do memorando'],1,
'A entrega da mensagem não prova sua compreensão. Pedir retorno sobre o significado recebido fornece feedback e permite eliminar o ruído antes do vencimento do prazo.');
add('Noções de Administração','motivação',['aca'],'Uma chefia aumenta apenas a fiscalização, embora a equipe relate falta de recursos e desconhecimento dos critérios de avaliação. Qual análise é mais adequada?',
['Fiscalização sempre resolve qualquer causa de baixo desempenho','Desempenho pode depender de condições e clareza, não só de esforço individual','A equipe deve receber metas sem recursos','Critérios devem permanecer ocultos para evitar pressão','Motivação é irrelevante para resultados'],1,
'O desempenho decorre também de condições de trabalho e entendimento dos objetivos. Intensificar controle sem resolver recursos e critérios pode manter o problema original.');
add('Noções de Administração','delegação',['aca'],'Uma coordenadora atribui ao assistente a conferência de relatórios e autoriza solicitar correções, mantendo a supervisão do resultado. Qual afirmação é correta?',
['A delegação elimina a responsabilidade da coordenadora','Houve atribuição de tarefa e autoridade compatível, sem abandonar o acompanhamento','O assistente passou a definir a missão institucional','Qualquer controle futuro seria incompatível com delegação','Só existe delegação quando o cargo é extinto'],1,
'Delegar envolve entregar uma tarefa e a autoridade necessária para executá-la dentro de limites. A coordenadora conserva o dever de acompanhar o resultado final.');
add('Noções de Administração','gestão de processos',['aca'],'O fluxo de revisão tem três etapas, mas um mesmo relatório volta duas vezes à etapa inicial por falta de critério claro. Antes de ampliar a equipe, seria mais útil:',
['Mapear o fluxo e a causa do retorno recorrente','Eliminar toda revisão independentemente do risco','Medir somente o número de pessoas','Aumentar etapas sem diagnóstico','Transferir o problema sem registro'],0,
'O retrabalho sugere falha no desenho ou na aplicação dos critérios. Mapear o processo e localizar o ponto de retorno permite corrigir a causa antes de acrescentar recursos.');
add('Noções de Administração','qualidade',['aca'],'Um posto atende rapidamente, mas frequentemente entrega informações incorretas que exigem retorno dos usuários. Qual medida avalia melhor o serviço prestado?',
['Somente a duração média','Somente o número de senhas emitidas','Tempo, correção das informações e retrabalho','Somente o número de funcionários','Apenas o custo do prédio'],2,
'Qualidade de serviço não se reduz à velocidade. A correção da informação e a necessidade de refazer o atendimento afetam o resultado efetivamente recebido pelo usuário.');
add('Noções de Administração','análise SWOT',['aca'],'Em diagnóstico institucional, uma unidade aponta servidores experientes e, separadamente, risco de interrupção por enchentes na região. Na matriz SWOT, esses elementos são:',
['Força interna e ameaça externa','Oportunidade externa e fraqueza interna','Duas fraquezas internas','Duas oportunidades externas','Ameaça interna e força externa'],0,
'Experiência dos servidores é atributo interno favorável, portanto força. Enchentes são fator ambiental externo desfavorável, portanto ameaça; a classificação depende da origem e do efeito.');

// Situações gerenciais — 20 aplicações para AOR, ACR e ACS.
add('Noções de Administração/Situações Gerenciais','priorização',MAN,'A equipe tem duas pendências: corrigir uma falha que bloqueia a transmissão de todos os dados hoje e revisar um relatório de rotina com prazo na próxima semana. O que fazer primeiro?',
['Revisar o relatório por ser mais antigo','Resolver a falha bloqueante e depois programar a revisão','Dividir o tempo igualmente sem avaliar impacto','Adiar ambas até nova ordem','Escolher a tarefa mais simples independentemente do prazo'],1,
'A falha afeta a continuidade imediata de toda a operação; sua urgência e impacto superam os do relatório com prazo posterior. A revisão continua necessária, mas pode ser programada.');
add('Noções de Administração/Situações Gerenciais','conflito de prioridades',MAN,'Dois supervisores solicitam o mesmo veículo para horários coincidentes. Um deslocamento é inadiável e o outro admite remarcação sem prejuízo. A solução gerencial mais fundamentada é:',
['Sortear o veículo sem investigar os prazos','Atender o deslocamento inadiável e negociar a remarcação do outro','Prometer uso integral simultâneo','Cancelar os dois deslocamentos','Entregar o veículo ao supervisor mais antigo'],1,
'A decisão deve considerar restrições, consequências e possibilidade de ajuste. A prioridade objetiva do deslocamento inadiável permite preservar ambas as atividades com negociação.');
add('Noções de Administração/Situações Gerenciais','feedback',MAN,'Após três formulários com o mesmo erro, o gestor conversa com o agente e apresenta exemplos concretos, combina correção e marca nova verificação. Esse feedback é mais útil porque:',
['Foca comportamento observável e ação futura','Rotula a personalidade do agente','Evita indicar o erro específico','Dispensa acompanhamento posterior','Substitui qualquer orientação técnica oficial'],0,
'O retorno usa evidências concretas e estabelece o comportamento esperado e o momento de acompanhamento. Isso favorece aprendizagem sem atribuir o problema à identidade da pessoa.');
add('Noções de Administração/Situações Gerenciais','liderança situacional',MAN,'Um recenseador experiente conhece o procedimento, mas pede autonomia para reorganizar a sequência de visitas sem alterar metas. Um líder ajustado ao contexto deve:',
['Exigir autorização para cada passo trivial','Conceder autonomia delimitada e acompanhar resultados','Retirar todas as metas','Dispensar qualquer prestação de contas','Transferir a decisão sobre normas censitárias ao agente'],1,
'Conhecimento e experiência permitem maior autonomia operacional, desde que as regras e metas permaneçam válidas. Acompanhamento de resultados continua sendo função gerencial.');
add('Noções de Administração/Situações Gerenciais','gestão de riscos',MAN,'Há previsão de chuva intensa no dia de visita a uma área de difícil acesso. O gestor verifica rotas alternativas e combina um plano de contingência antes da saída. Isso exemplifica:',
['Correção de erro já consumado','Prevenção e resposta planejada a risco','Abandono da meta sem avaliação','Controle exclusivamente posterior','Eliminação completa da incerteza'],1,
'O evento ainda não ocorreu, mas pode afetar a atividade. Identificar sua probabilidade e impacto e preparar alternativa é gestão preventiva de riscos; não elimina toda incerteza.');
add('Noções de Administração/Situações Gerenciais','indicadores',MAN,'A taxa de entrevistas concluídas subiu, mas também aumentou a proporção de registros inválidos. Qual decisão evita uma conclusão enganosa sobre o desempenho?',
['Celebrar apenas o volume concluído','Analisar simultaneamente produção válida e retrabalho','Ignorar registros inválidos porque houve produtividade','Descartar todos os indicadores','Reduzir a meta sem avaliar causas'],1,
'Produção bruta não equivale a produção útil. A tendência dos registros inválidos pode anular parte do ganho aparente e requer diagnóstico antes de avaliar a melhoria.');
add('Noções de Administração/Situações Gerenciais','gestão de mudanças',MAN,'Uma nova rotina de transmissão entrou em vigor, mas parte da equipe ainda usa a anterior por desconhecer a alteração. A primeira resposta gerencial eficaz é:',
['Punir todos antes de verificar a comunicação','Comunicar a regra vigente, demonstrar o procedimento e confirmar compreensão','Manter duas rotinas incompatíveis sem registro','Desconsiderar a mudança','Apenas enviar um link sem verificar acesso'],1,
'A causa descrita é falta de conhecimento. Comunicação clara, demonstração e verificação de entendimento atacam a causa e reduzem erros de implantação da nova rotina.');
add('Noções de Administração/Situações Gerenciais','reunião de equipe',MAN,'Uma reunião semanal consome duas horas e termina sem decisões, responsáveis ou prazos. Para melhorar sua utilidade, a coordenação deve:',
['Aumentar o tempo sem pauta','Definir pauta, registrar decisões, responsáveis e prazos','Convidar mais pessoas sem objetivo','Proibir perguntas sobre obstáculos','Substituir qualquer registro por memória individual'],1,
'Reunião operacional útil precisa gerar encaminhamentos verificáveis. Pauta e registro de responsáveis e prazos tornam possível acompanhar a execução e resolver pendências.');
add('Noções de Administração/Situações Gerenciais','distribuição de trabalho',MAN,'Um supervisor atribui as áreas mais difíceis sempre ao mesmo agente porque ele é experiente, sem revisar carga ou oferecer apoio. O principal risco da decisão é:',
['Equidade e sustentabilidade da carga de trabalho','Falta automática de competência do agente','Ausência necessária de qualquer resultado','Extinção da autoridade do supervisor','Impossibilidade de medir distâncias'],0,
'A experiência é critério relevante, mas não justifica sobrecarga permanente. A alocação deve considerar complexidade, recursos, apoio e equilíbrio entre agentes.');
add('Noções de Administração/Situações Gerenciais','controle corretivo',MAN,'Depois do fechamento de uma etapa, a chefia identifica registros duplicados, corrige a base e altera a conferência para evitar recorrência. A correção da base é:',
['Planejamento estratégico','Controle corretivo sobre resultado já produzido','Controle prévio antes da coleta','Delegação de autoridade','Comunicação informal sem evidência'],1,
'Os registros já foram produzidos quando a falha é detectada. Corrigi-los é ação corretiva; a mudança na conferência futura acrescenta uma dimensão preventiva distinta.');
add('Noções de Administração/Situações Gerenciais','comunicação ascendente',MAN,'Um agente informa ao supervisor que uma rota cadastrada está interditada. A informação segue da execução para a chefia e permite ajustar o plano. Esse fluxo é:',
['Descendente','Ascendente','Exclusivamente horizontal','Externo ao órgão','Inexistente, pois a rota foi cadastrada'],1,
'A comunicação parte de um nível operacional e chega ao superior. Esse retorno ascendente alimenta a decisão gerencial com informação do ambiente de execução.');
add('Noções de Administração/Situações Gerenciais','negociação',MAN,'Duas unidades discordam sobre horários de uso de um equipamento. Ambas revelam horários realmente necessários e encontram faixas diferentes. O acordo foi possível por:',
['Ocultar interesses para pressionar','Identificar interesses e alternativas compatíveis','Escolher aleatoriamente uma unidade','Impor perdas iguais sem diagnóstico','Eliminar a necessidade de registrar o uso'],1,
'Quando as necessidades reais não coincidem integralmente, pode-se construir alocação que atenda ambas. Conhecer interesses amplia as opções além das posições iniciais.');
add('Noções de Administração/Situações Gerenciais','metas SMART',MAN,'Uma meta diz apenas “melhorar logo a qualidade”. Qual reformulação facilita a gestão por fornecer resultado mensurável e prazo?',
['Ser mais eficiente de modo geral','Reduzir de 8% para 4% os registros devolvidos até o fim do mês','Fazer o melhor possível sempre','Eliminar todos os erros imediatamente sem avaliar condições','Motivar a equipe sem definir indicador'],1,
'A taxa inicial, a taxa desejada e o prazo permitem acompanhar progresso e verificar cumprimento. As demais formulações deixam ao menos uma dimensão essencial vaga.');
add('Noções de Administração/Situações Gerenciais','prestação de contas',MAN,'Uma chefia delegou remanejamento de visitas e definiu limites de prazo e custo. Ao final, pede registro das decisões tomadas e seus resultados. Isso caracteriza:',
['Contradição, porque delegação proíbe acompanhamento','Prestação de contas compatível com a delegação','Centralização integral das decisões','Anulação automática da autoridade delegada','Substituição do planejamento por punição'],1,
'A autonomia concedida opera dentro de limites e deve ser acompanhada. Registrar decisões e efeitos permite controle e aprendizagem sem retirar a delegação.');
add('Noções de Administração/Situações Gerenciais','capacitação',MAN,'Erros concentraram-se numa função nova do aplicativo, enquanto agentes executam corretamente as rotinas antigas. Qual intervenção melhor responde ao diagnóstico?',
['Treinamento focalizado na função nova com exercício prático','Troca de todos os agentes sem avaliar causa','Repetição integral de conteúdo já dominado','Aumento de metas sem apoio','Suspensão permanente da coleta'],0,
'O padrão de erros delimita uma lacuna específica de competência. Uma prática orientada no novo recurso é mais proporcional e verificável do que medidas indiscriminadas.');
add('Noções de Administração/Situações Gerenciais','controle de qualidade',MAN,'Uma coordenação encontra alto índice de devolução de formulários de uma etapa específica. Para localizar a causa, qual recorte inicial é mais informativo?',
['Apenas o total geral de agentes','Taxa de devolução por etapa e tipo de inconsistência','Somente o valor do orçamento anual','A idade dos prédios da unidade','Número de mensagens enviadas pela chefia'],1,
'O problema já está concentrado em uma etapa. Desagregar por tipo de inconsistência mostra onde e como ocorre a falha, permitindo intervenção mais precisa.');
add('Noções de Administração/Situações Gerenciais','continuidade operacional',MAN,'O único responsável por validar registros ficará ausente amanhã. Há outro agente treinado, mas sem acesso ao sistema. Qual ação preventiva é mais adequada?',
['Aguardar o acúmulo e improvisar depois','Providenciar acesso autorizado e designar substituição antes da ausência','Compartilhar a senha pessoal do titular','Cancelar todas as validações por tempo indeterminado','Autorizar acesso irrestrito sem registro'],1,
'A continuidade exige substituição planejada com permissão própria e adequada. Compartilhar credenciais compromete a segurança e a rastreabilidade da atividade.');
add('Noções de Administração/Situações Gerenciais','tomada de decisão',MAN,'Três rotas são possíveis: a mais curta passa por via interditada, a intermediária está aberta e cabe no prazo, e a mais longa não cabe no prazo. Qual critério elimina a rota curta?',
['Preferência pessoal do gestor','Viabilidade operacional diante da interdição','Menor distância em quilômetros','Quantidade de mapas impressos','Ordem alfabética das localidades'],1,
'A distância menor não torna a rota executável. A interdição é restrição eliminatória; entre as rotas viáveis, prazo e demais critérios podem orientar a escolha.');
add('Noções de Administração/Situações Gerenciais','gestão de conflitos',MAN,'Um supervisor percebe que divergências entre dois agentes decorrem de instruções diferentes recebidas em datas distintas. Antes de tratar o caso como disputa pessoal, deve:',
['Verificar e padronizar a orientação vigente','Trocar ambos de equipe imediatamente','Proibir qualquer registro da divergência','Escolher a versão mais antiga por hábito','Atribuir culpa sem ouvir as partes'],0,
'A causa provável é inconsistência de orientação, não traço pessoal. Identificar a regra atual e comunicá-la igualmente aos envolvidos trata o conflito em sua origem.');
add('Noções de Administração/Situações Gerenciais','análise de causa',MAN,'Uma meta foi descumprida apesar de a equipe ter realizado todas as visitas previstas; parte dos registros não pôde ser transmitida por indisponibilidade do sistema. Qual diagnóstico é mais adequado?',
['Falta de visitas foi a única causa','O gargalo de transmissão deve ser analisado separadamente da execução de campo','Toda a equipe necessariamente trabalhou pouco','A meta nunca existiu','A solução é reduzir o número de campos sem autorização'],1,
'As visitas ocorreram, mas o fluxo ficou interrompido na transmissão. Separar etapas e indicadores evita culpar a atividade de campo por um bloqueio posterior.');

// Informática — 20 questões para ACI, com ênfase em uso e segurança.
add('Noções de Informática','planilhas eletrônicas',['aci'],'Em uma planilha, A1 contém 12, A2 contém 18 e A3 contém 30. Qual resultado aparece ao inserir =MÉDIA(A1:A3) em A4, sem outros valores no intervalo?',
['12','18','20','30','60'],2,
'A média aritmética soma os três valores e divide pela quantidade de células numéricas: (12 + 18 + 30) / 3 = 20. A soma 60 não é a média solicitada.',EXCEL);
add('Noções de Informática','referência absoluta',['aci'],'A fórmula =B2*$F$1 calcula um valor usando taxa fixa em F1. Ao copiar a fórmula de C2 para C3, qual referência permanecerá exatamente igual?',
['B2','B3','F2','F3','$F$1'],4,
'Os cifrões antes da coluna e da linha tornam $F$1 uma referência absoluta. A referência relativa B2 acompanha a cópia para a linha seguinte e passa a B3.',EXCEL);
add('Noções de Informática','referência mista',['aci'],'Uma fórmula em C2 usa =$A2*B$1. Ao copiá-la para D3, qual expressão resulta do ajuste normal das referências relativas e mistas?',
['=$A3*C$1','=A3*C1','=$B3*C$2','=A2*B1','=$A2*C$1'],0,
'Em $A2, a coluna A fica fixa e a linha avança para 3. Em B$1, a coluna avança para C, mas a linha 1 fica fixa; portanto resulta =$A3*C$1.',EXCEL);
add('Noções de Informática','função CONT.SE',['aci'],'Na coluna A há os valores 4, 7, 7, 9 e 11. Qual resultado a fórmula =CONT.SE(A1:A5;">7") retorna, considerando comparação numérica?',
['1','2','3','4','5'],1,
'O critério estrito >7 seleciona somente 9 e 11. Os dois valores iguais a 7 não entram na contagem, pois o operador usado não inclui igualdade.', 'https://support.microsoft.com/pt-br/excel/get-started/use-the-countif-function-in-microsoft-excel');
add('Noções de Informática','classificação e filtro',['aci'],'Uma planilha contém registros de todos os municípios. O usuário aplica um filtro para mostrar apenas um município, sem excluir linhas. O que ocorre com os demais registros?',
['São apagados definitivamente','Permanecem na base, mas ficam ocultos pela visualização filtrada','São movidos para outra pasta automaticamente','Têm valores convertidos em texto','Passam a integrar a lixeira do sistema'],1,
'O filtro altera quais linhas aparecem na visualização, não remove os registros da base. Ao limpar o filtro, os demais municípios voltam a ser exibidos.');
add('Noções de Informática','ordenação',['aci'],'Uma tabela relaciona nome e pontuação em cada linha. Para ordenar da maior para a menor pontuação sem separar nomes dos valores, o procedimento adequado é:',
['Ordenar apenas a coluna de pontuação isoladamente','Selecionar a tabela inteira e ordenar pela coluna de pontuação em ordem decrescente','Copiar a coluna de nomes para outra planilha','Aplicar um filtro por nome em ordem alfabética','Excluir linhas com pontuação menor'],1,
'Cada linha representa um registro único. Ordenar toda a tabela pela pontuação preserva a associação entre nome e valor; ordenar uma única coluna isolada pode corrompê-la.');
add('Noções de Informática','arquivos e pastas',['aci'],'Um arquivo foi copiado da pasta A para a pasta B, sem comando de exclusão e sem substituição. Qual situação deve ser esperada após a operação?',
['O arquivo existe apenas em B','O arquivo existe em A e em B','O arquivo desaparece das duas pastas','A pasta A é renomeada automaticamente','O arquivo é enviado diretamente à lixeira'],1,
'Copiar cria outra ocorrência do arquivo no destino e preserva a origem. Diferentemente de mover, a operação descrita não retira o arquivo da pasta A.');
add('Noções de Informática','extensões de arquivo',['aci'],'Um arquivo chamado relatorio.csv é aberto em uma planilha. Qual interpretação da extensão é a mais apropriada para evitar confusão com uma pasta de trabalho completa?',
['É sempre um executável','É um formato de texto tabular, sem preservar necessariamente fórmulas e formatação da pasta de trabalho','É um PDF com macros','É uma imagem de alta resolução','É um arquivo compactado com todas as abas'],1,
'CSV armazena dados tabulares como valores separados por delimitador. Ao exportar nesse formato, recursos próprios de uma pasta de trabalho podem não ser preservados.');
add('Noções de Informática','backup',['aci'],'Uma unidade mantém apenas uma cópia dos dados no próprio computador de trabalho. Para reduzir a perda diante de falha física do equipamento, a medida mais adequada é:',
['Renomear o arquivo diariamente','Manter cópias de segurança atualizadas em local independente e testar restauração','Trocar a cor das pastas','Desativar atualizações do sistema','Enviar a senha do computador por e-mail'],1,
'Backup útil precisa estar separado da falha que atinge a origem e ser recuperável. Cópia no mesmo equipamento pode desaparecer junto com o disco; testar restauração confirma utilidade.', 'https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf');
add('Noções de Informática','phishing',['aci'],'Chega mensagem pedindo acesso urgente a um portal por link encurtado e solicitando senha. Mesmo contendo logotipo conhecido, qual conduta reduz o risco de phishing?',
['Digitar a senha para não perder o prazo','Abrir o serviço pelo endereço oficial conhecido e verificar a solicitação por canal independente','Responder à mensagem com o código de verificação','Encaminhar a todos os colegas sem análise','Desativar a autenticação adicional para acelerar'],1,
'Logotipos e tom urgente podem ser falsificados. Acessar o serviço por endereço previamente confiável e confirmar por outro canal evita entregar credenciais à página indicada pelo atacante.',CERT);
add('Noções de Informática','autenticação multifator',['aci'],'Uma conta exige senha e confirmação por aplicativo autenticador. Se a senha vazar, qual é o principal benefício dessa configuração?',
['Impedir qualquer ataque sem exceção','Adicionar barreira que dificulta acesso indevido apenas com a senha','Eliminar a necessidade de proteger o celular','Tornar todas as senhas públicas','Substituir completamente a política de backup'],1,
'O segundo fator torna insuficiente, em regra, conhecer apenas a senha. Ele reduz risco, mas não garante proteção absoluta nem dispensa o cuidado com o dispositivo e códigos.', 'https://cartilha.cert.br/fasciculos/autenticacao/fasciculo-autenticacao.pdf');
add('Noções de Informática','permissões de acesso',['aci'],'Uma pasta contém dados sensíveis e um colaborador precisa apenas lê-los para uma conferência pontual. Qual concessão respeita melhor o princípio do menor privilégio?',
['Acesso administrativo completo e permanente','Permissão de leitura apenas pelo período necessário','Senha compartilhada de outro colaborador','Publicação da pasta sem restrição','Permissão de exclusão para qualquer usuário'],1,
'A autorização deve corresponder à tarefa concreta. Leitura temporária atende à conferência sem conceder alteração, exclusão ou administração desnecessárias.');
add('Noções de Informática','navegadores',['aci'],'Um estudante limpa o histórico de navegação, mas o site ainda mantém sua conta autenticada por cookie de sessão. Qual conclusão é correta?',
['Apagar histórico sempre encerra todas as sessões','Histórico e cookies são dados distintos; pode ser necessário sair da conta ou limpar cookies','Cookies são arquivos de planilha','A autenticação fica armazenada exclusivamente no endereço IP','A conta é apagada no servidor quando o histórico some'],1,
'O histórico lista páginas visitadas, enquanto cookies podem preservar uma sessão autenticada. Limpar um não implica necessariamente excluir o outro ou encerrar sessão no serviço.');
add('Noções de Informática','e-mail',['aci'],'Uma mensagem a cinco destinatários externos exige que cada um não veja os endereços dos demais. Qual campo deve ser usado para esses endereços?',
['Assunto','Para, com todos os endereços','Cc, com todos os endereços','Cco ou cópia oculta','Corpo da mensagem'],3,
'O campo Cco oculta os destinatários entre si na mensagem recebida. Para e Cc exibem os endereços, podendo divulgar contatos sem necessidade.');
add('Noções de Informática','atalhos de teclado',['aci'],'Em um editor, um usuário seleciona um trecho, usa Ctrl+C e depois Ctrl+V em outra posição. Sem usar Ctrl+X, o que ocorre com o trecho original?',
['É removido da origem','Permanece na origem e é reproduzido no destino','É convertido em comentário','É enviado para a lixeira','Não pode ser colado em outro ponto'],1,
'Ctrl+C copia o conteúdo selecionado para a área de transferência; Ctrl+V o insere no destino. Como não houve recorte, o original permanece na posição inicial.');
add('Noções de Informática','editor de texto',['aci'],'Um documento longo contém várias ocorrências de um nome de setor desatualizado. Qual recurso permite localizar e trocar cada ocorrência com conferência antes de aplicar?',
['Localizar e substituir, revisando as ocorrências','Aumentar o tamanho da fonte','Exportar imediatamente como imagem','Fechar o documento sem salvar','Alterar o idioma do teclado'],0,
'Localizar e substituir reúne as ocorrências do termo e possibilita confirmar as alterações. A revisão é importante para evitar substituir partes de palavras ou contextos indevidos.');
add('Noções de Informática','formatação',['aci'],'Ao colar texto de uma fonte externa, o documento recebe fonte e cor indesejadas. Para inserir apenas as palavras e adotar a formatação do destino, deve-se preferir:',
['Colagem como texto sem formatação','Recorte da página inteira','Inserção de captura de tela','Exclusão do documento','Compactação da pasta de trabalho'],0,
'A colagem sem formatação transfere o conteúdo textual sem os estilos de origem. A aparência passa a seguir o documento de destino, evitando fontes e cores importadas.');
add('Noções de Informática','nuvem e sincronização',['aci'],'Um arquivo sincronizado na nuvem é apagado acidentalmente em um dispositivo e a exclusão se propaga aos demais. Qual conclusão sobre sincronização e backup é correta?',
['Sincronização equivale sempre a backup imutável','Sincronização pode propagar erros; cópia recuperável ou histórico de versões continua importante','Nuvem impede toda exclusão acidental','Backup só é útil sem internet','Excluir em um dispositivo nunca afeta os demais'],1,
'Sincronização mantém estados alinhados e pode replicar uma exclusão indesejada. Backup ou versões recuperáveis oferecem caminho de restauração independente do estado atual.');
add('Noções de Informática','redes',['aci'],'Um computador abre páginas internas da rede local, mas não acessa sites externos. Qual conclusão é mais prudente antes de afirmar que toda a rede caiu?',
['A conexão local pode funcionar e o problema estar na saída para a internet ou no DNS','O teclado necessariamente está defeituoso','Todos os arquivos do computador foram apagados','A rede local está comprovadamente indisponível','O monitor deve ser substituído'],0,
'O acesso a páginas internas evidencia que parte da conectividade local funciona. A falha externa pode ter outra causa, como rota, provedor ou resolução de nomes, exigindo diagnóstico.');
add('Noções de Informática','segurança de dispositivos',['aci'],'Um notebook de trabalho será usado em rede Wi-Fi pública. Qual prática reduz exposição sem prometer segurança absoluta?',
['Desativar todas as atualizações','Evitar serviços sensíveis em rede não confiável e usar conexão protegida autorizada','Compartilhar arquivos livremente na rede','Aceitar qualquer certificado inválido','Desabilitar bloqueio de tela'],1,
 'Redes públicas exigem cautela com tráfego e serviços sensíveis. Uma conexão protegida aprovada e o bloqueio de compartilhamentos desnecessários reduzem risco, sem eliminá-lo completamente.','https://cartilha.cert.br/dicas-rapidas/');

// Língua Portuguesa — 15 questões contextualizadas.
add('Língua Portuguesa','interpretação de texto',ALL,'Leia: “Os dados foram divulgados após revisão adicional. Por isso, o calendário inicial foi alterado.” Qual relação lógica é estabelecida pela expressão “Por isso” entre as frases?',
['Oposição','Conclusão ou consequência','Comparação','Concessão','Alternância'],1,
'A segunda frase apresenta um efeito da revisão mencionada na primeira: a alteração do calendário. “Por isso” introduz consequência, não contraste ou ressalva.');
add('Língua Portuguesa','referência pronominal',ALL,'Leia: “A supervisora entregou à agente a planilha revisada, mas ela solicitou nova conferência.” Sem outro contexto, por que a frase pode gerar ambiguidade?',
['Porque “ela” pode retomar supervisora ou agente','Porque “planilha” não tem artigo','Porque o verbo está no passado','Porque “revisada” está no feminino','Porque o período tem duas orações'],0,
'O pronome feminino singular “ela” é compatível com as duas pessoas mencionadas. Sem indicação adicional, não fica claro quem pediu a nova conferência.');
add('Língua Portuguesa','concordância verbal',ALL,'Assinale a frase que mantém a concordância verbal adequada ao sujeito, no padrão formal, ao relatar a chegada de documentos ao posto.',
['Chegou os relatórios ontem.','Chegaram os relatórios ontem.','Chegou as planilhas ontem.','Chegaram a planilha ontem.','Chega os relatórios ontem.'],1,
'“Os relatórios” é sujeito plural, embora apareça depois do verbo. Por isso, a forma adequada é “chegaram”; as outras opções desrespeitam número ou tempo verbal.');
add('Língua Portuguesa','concordância nominal',ALL,'Uma servidora registra: “Seguem ___ as cópias solicitadas.” Qual palavra completa corretamente a frase se a intenção é dizer que as próprias cópias estão anexadas?',
['anexo','anexos','anexa','anexas','anexado'],3,
'Usado como adjetivo referido a “cópias”, “anexas” concorda em gênero feminino e número plural. Não se trata da locução invariável “em anexo”.');
add('Língua Portuguesa','regência verbal',ALL,'No sentido de “ver”, o verbo assistir é empregado com preposição no padrão formal. Qual frase registra corretamente que a equipe viu a apresentação?',
['A equipe assistiu a apresentação.','A equipe assistiu à apresentação.','A equipe assistiu da apresentação.','A equipe assistiu para a apresentação.','A equipe assistiu com a apresentação.'],1,
'No sentido de presenciar, “assistir” rege a preposição “a”. Diante de “a apresentação”, a preposição funde-se com o artigo feminino, formando “à”.');
add('Língua Portuguesa','crase',ALL,'Uma equipe registrou deslocamentos “de segunda a sexta-feira”. Qual explicação justifica não empregar crase antes de “sexta-feira” nessa expressão de intervalo?',
['Porque sexta-feira é palavra masculina','Porque há apenas a preposição “a” na correlação “de... a...”, sem artigo exigido','Porque nomes de dias nunca admitem artigo','Porque crase é proibida em todas as datas','Porque o verbo está no pretérito'],1,
'Na expressão temporal “de segunda a sexta-feira”, a construção correlativa usa “de” e “a” sem artigo antes dos dias. Sem encontro de dois “a”, não há crase.');
add('Língua Portuguesa','pontuação',ALL,'Considere “Os agentes que concluíram o treinamento receberão acesso.” Sem vírgulas, qual interpretação é favorecida pela oração “que concluíram o treinamento”?',
['Todos os agentes concluíram o treinamento','A oração restringe o grupo de agentes que receberá acesso','A oração é um comentário dispensável sobre todos','Há discurso direto','O acesso já foi concedido a todos'],1,
'Sem vírgulas, a oração relativa funciona como restritiva: seleciona, entre os agentes, aqueles que concluíram o treinamento. A versão isolada por vírgulas teria outro efeito.');
add('Língua Portuguesa','coesão textual',ALL,'Leia: “A equipe terminou a coleta. Entretanto, a revisão ainda não começou.” Qual troca preserva o sentido adversativo do conector destacado?',
['Portanto','Além disso','Contudo','Porque','Conforme'],2,
'“Entretanto” e “contudo” introduzem contraste entre a conclusão da coleta e a ausência de início da revisão. Os demais conectores expressam relações diferentes.');
add('Língua Portuguesa','voz passiva',ALL,'A frase “A equipe revisou os formulários” deve ser passada para a voz passiva analítica, sem alterar tempo verbal nem número do objeto. Qual opção atende a isso?',
['Os formulários foram revisados pela equipe.','Os formulários era revisados pela equipe.','A equipe foi revisada pelos formulários.','Os formulários serão revisados pela equipe.','Revisou-se a equipe pelos formulários.'],0,
'Na passiva analítica, o objeto “os formulários” torna-se sujeito paciente plural; “revisou” no pretérito perfeito corresponde a “foram revisados”.');
add('Língua Portuguesa','ortografia',ALL,'Uma mensagem formal menciona que a equipe fez uma “___” para confirmar os dados. Qual grafia completa a frase com o sentido de verificar ou examinar?',
['chegagem','checagem','xegagem','chequagem','chekagem'],1,
'“Checagem” é a grafia da palavra derivada de checar, no sentido de verificar. A escolha deve observar a escrita convencional, não aproximações fonéticas.');
add('Língua Portuguesa','colocação pronominal',ALL,'No padrão formal escrito, a palavra negativa “não” atrai o pronome átono. Qual redação atende à colocação pronominal em “O sistema ___ deve desligar” com pronome “se”?',
['não deve-se desligar','não se deve desligar','não deve desligar-se, sempre','não deve se desligar-se','se não deve desligar'],1,
'A palavra “não” favorece próclise: “não se deve desligar”. A posição do pronome antes do verbo auxiliar atende à atração sem duplicá-lo.');
add('Língua Portuguesa','concordância com haver',ALL,'Ao registrar o histórico de uma unidade, qual forma está correta no padrão formal se “haver” tem sentido de existir?',
['Houveram muitas reclamações ontem.','Havia muitas reclamações ontem.','Haviam muitas reclamações ontem.','Hão muitas reclamações ontem.','Haverão muitas reclamações ontem.'],1,
'Com sentido de existir, “haver” é impessoal e permanece na terceira pessoa do singular. “Muitas reclamações” não funciona como sujeito que determine flexão plural.');
add('Língua Portuguesa','sentido de conectivos',ALL,'Leia: “Embora o prazo fosse curto, a conferência foi concluída.” A oração iniciada por “Embora” expressa uma circunstância que:',
['É causa direta da conclusão','Contrasta com a conclusão, sem impedi-la','É finalidade da conferência','Apresenta consequência obrigatória','Enumera etapas de trabalho'],1,
'“Embora” introduz concessão: o prazo curto poderia dificultar a conferência, mas não impediu sua conclusão. O vínculo não é causal nem final.');
add('Língua Portuguesa','paralelismo sintático',ALL,'Uma instrução enumera três tarefas com o mesmo padrão: “conferir os dados, validar os registros e ___”. Qual continuação preserva o paralelismo verbal?',
['a transmissão dos arquivos','transmitir os arquivos','os arquivos transmitidos','com transmissão dos arquivos','para os arquivos transmitirem'],1,
'As duas primeiras ações aparecem no infinitivo: conferir e validar. “Transmitir” mantém a enumeração no mesmo padrão sintático e identifica claramente a terceira ação.');
add('Língua Portuguesa','inferência textual',ALL,'Leia: “A unidade manteve atendimento presencial mesmo após disponibilizar o formulário digital.” O que se pode concluir sem acrescentar informação não dada?',
['O atendimento digital substituiu o presencial','O presencial continuou disponível após a opção digital','Todos os usuários preferem atendimento digital','O formulário digital deixou de existir','O presencial atende somente pessoas idosas'],1,
'“Manteve” indica continuidade do atendimento presencial, e “mesmo após” situa essa continuidade depois da oferta digital. Preferências e públicos específicos não são informados.');

// Raciocínio lógico-quantitativo — 15 problemas com resolução verificável.
add('Raciocínio Lógico Quantitativo','porcentagem',ALL,'Um posto concluiu 84 de 120 visitas previstas e ainda não iniciou as demais. Que percentual da meta de visitas já foi cumprido?',
['60%','65%','70%','75%','84%'],2,
'A fração realizada é 84/120 = 0,7. Convertida em percentual, corresponde a 70%. O denominador é o total planejado, não o número de visitas pendentes.');
add('Raciocínio Lógico Quantitativo','razão e proporção',ALL,'Três agentes, no mesmo ritmo, concluem 72 cadastros em quatro dias. Mantido o rendimento por agente e por dia, quantos cadastros fariam cinco agentes em três dias?',
['60','72','84','90','120'],3,
'Cada agente produz 72/(3×4) = 6 cadastros por dia. Cinco agentes durante três dias somam 15 agentes-dia, produzindo 15×6 = 90 cadastros.');
add('Raciocínio Lógico Quantitativo','média aritmética',ALL,'Em quatro dias, uma equipe fez 12, 16, 20 e 24 entrevistas. Qual deve ser a produção no quinto dia para que a média diária dos cinco dias seja 20?',
['20','24','28','32','36'],2,
'A meta total é 5×20 = 100 entrevistas. Os quatro dias somam 72; faltam 100−72 = 28 entrevistas no quinto dia para alcançar a média exigida.');
add('Raciocínio Lógico Quantitativo','conjuntos',ALL,'Em um grupo de 50 candidatos, 28 estudam Português, 23 estudam Lógica e 9 estudam ambas. Quantos não estudam nenhuma das duas disciplinas?',
['8','9','14','17','31'],0,
'Pela inclusão-exclusão, 28 + 23 − 9 = 42 estudam ao menos uma das duas disciplinas. Logo, 50 − 42 = 8 não estudam nenhuma.');
add('Raciocínio Lógico Quantitativo','probabilidade',ALL,'Uma urna contém quatro cartões verdes, três azuis e um vermelho, todos equiprováveis. Qual a probabilidade de retirar um cartão que não seja azul?',
['3/8','4/8','5/8','6/8','7/8'],2,
'Há oito cartões e cinco não são azuis: quatro verdes e um vermelho. A probabilidade é 5/8; usar 3/8 calcularia justamente o evento oposto.');
add('Raciocínio Lógico Quantitativo','sequências',ALL,'Uma equipe registra 5, 9, 13, 17 e 21 atendimentos em cinco intervalos sucessivos. Mantido o padrão observado, qual será o sexto termo?',
['23','24','25','26','29'],2,
'Cada termo aumenta quatro unidades em relação ao anterior. Somando 4 ao último valor, 21 + 4 = 25; não há multiplicação por razão constante.');
add('Raciocínio Lógico Quantitativo','regra de três',ALL,'Se oito dispositivos iguais precisam de seis horas para processar um lote, quantas horas seriam necessárias com doze dispositivos iguais, trabalhando no mesmo ritmo?',
['3','4','6','8','9'],1,
'O trabalho total equivale a 8×6 = 48 dispositivo-horas. Dividindo por 12 dispositivos, são necessárias 4 horas. A relação entre quantidade de dispositivos e tempo é inversa.');
add('Raciocínio Lógico Quantitativo','lógica proposicional',ALL,'Considere a afirmação “Se o arquivo foi validado, então pode ser transmitido”. Qual é sua contrapositiva logicamente equivalente?',
['Se pode ser transmitido, então foi validado','Se não pode ser transmitido, então não foi validado','Se não foi validado, então não pode ser transmitido','Foi validado e não pode ser transmitido','Não pode ser transmitido ou foi validado'],1,
'A contrapositiva de P→Q é ¬Q→¬P: se não pode ser transmitido, então não foi validado. Ela preserva o valor lógico da condicional original.');
add('Raciocínio Lógico Quantitativo','negação lógica',ALL,'A proposição “Todos os relatórios foram revisados” é falsa. Qual afirmação representa corretamente sua negação lógica, sem dizer mais do que o necessário?',
['Nenhum relatório foi revisado','Pelo menos um relatório não foi revisado','Exatamente um relatório foi revisado','A maioria dos relatórios não foi revisada','Todos os relatórios foram ignorados'],1,
'Negar uma afirmação universal exige encontrar ao menos um contraexemplo. Não é necessário que nenhum, a maioria ou exatamente um dos relatórios deixe de ser revisado.');
add('Raciocínio Lógico Quantitativo','equivalência lógica',ALL,'A instrução exige que o candidato apresente documento e assinatura. Em qual situação a condição composta por “e” é verdadeira?',
['Documento presente e assinatura ausente','Documento ausente e assinatura presente','Ambos ausentes','Documento e assinatura presentes','Qualquer um dos dois presente'],3,
'Uma conjunção P∧Q só é verdadeira quando as duas condições são verdadeiras simultaneamente. A presença de apenas um dos itens não satisfaz a exigência conjunta.');
add('Raciocínio Lógico Quantitativo','juros simples',ALL,'Um valor de R$ 1.000 rende juros simples de 2% ao mês por três meses. Sem taxas ou outros encargos, qual montante é obtido no fim do período?',
['R$ 1.020','R$ 1.040','R$ 1.060','R$ 1.061,21','R$ 1.200'],2,
'Nos juros simples, cada mês rende 2% sobre os R$ 1.000 iniciais: R$ 20. Em três meses, são R$ 60 de juros e montante de R$ 1.060.');
add('Raciocínio Lógico Quantitativo','frações',ALL,'Uma equipe percorreu 2/5 de uma rota pela manhã e 1/4 da mesma rota à tarde. Que fração da rota completa ainda resta percorrer?',
['7/20','9/20','11/20','13/20','3/5'],0,
'As partes percorridas somam 2/5 + 1/4 = 8/20 + 5/20 = 13/20. Falta 1 − 13/20 = 7/20 da rota, usando o mesmo todo como referência.');
add('Raciocínio Lógico Quantitativo','análise combinatória',ALL,'Quatro postos diferentes devem ser visitados uma única vez, em alguma ordem. Se o primeiro posto já foi fixado, quantas ordens distintas restam para os outros três?',
['3','6','8','12','24'],1,
'Com a primeira posição fixa, há 3 escolhas para a segunda, 2 para a terceira e 1 para a quarta. O produto 3×2×1 = 6 dá as ordens possíveis.');
add('Raciocínio Lógico Quantitativo','mediana',ALL,'Cinco tempos de atendimento, em minutos, foram 7, 9, 12, 16 e 40. Qual é a mediana desses valores e por que ela não se iguala ao maior tempo?',
['9 minutos','12 minutos','16 minutos','16,8 minutos','40 minutos'],1,
'Com cinco valores já ordenados, a mediana é o terceiro, 12. Ela representa a posição central, não o maior valor nem a média aritmética afetada pelo 40.');
add('Raciocínio Lógico Quantitativo','variação percentual',ALL,'Uma taxa de inconsistência caiu de 10% para 8%. Qual foi a redução relativa em relação à taxa inicial, distinguindo-a da queda em pontos percentuais?',
['2%','8%','10%','20%','25%'],3,
'A queda absoluta foi de 2 pontos percentuais. Em relação à taxa inicial de 10%, a redução relativa é 2/10 = 20%, que não deve ser confundida com 2%.');

// Informática básica — 5 questões exclusivas do cargo AOR.
add('Noções Básicas de Informática','armazenamento',['aor'],'Um computador fica sem conexão com a internet, mas o agente precisa abrir um arquivo salvo apenas no próprio dispositivo. Qual recurso é suficiente para acessar esse arquivo?',
['Armazenamento local funcional','Servidor de e-mail externo','Navegador obrigatoriamente conectado','Conta em rede social','Sincronização imediata na nuvem'],0,
'Se o arquivo está armazenado localmente, o acesso depende do dispositivo e de seu sistema de arquivos, não de conexão externa. Serviços na nuvem só seriam necessários em outro cenário.');
add('Noções Básicas de Informática','arquivos e pastas',['aor'],'Uma equipe deseja organizar arquivos de cada mês sem alterar o conteúdo dos documentos. Qual ação cria uma estrutura que permite separar esses arquivos por período?',
['Criar uma pasta para cada mês e mover os arquivos correspondentes','Renomear todos os documentos com o mesmo nome','Excluir os arquivos mais antigos','Desativar a busca de arquivos','Converter todas as pastas em imagens'],0,
'Pastas permitem agrupar arquivos por critério escolhido, como o mês. Criá-las e alocar cada documento preserva o conteúdo e facilita a localização posterior.');
add('Noções Básicas de Informática','segurança digital',['aor'],'Uma pessoa recebe e-mail que diz ser do suporte e pede a senha do sistema para “confirmar cadastro”. Qual procedimento mais seguro deve adotar?',
['Informar a senha porque a mensagem cita o órgão','Não fornecer a senha e confirmar o pedido por canal oficial independente','Responder com a senha apenas se houver logotipo','Publicar a senha em grupo para pedir opinião','Desabilitar a verificação adicional antes de responder'],1,
'Pedidos de senha por mensagem são sinal de risco mesmo com aparência oficial. A verificação por canal independente evita confiar no endereço e no conteúdo controlados por possível fraudador.',CERT);
add('Noções Básicas de Informática','cópia de segurança',['aor'],'Um arquivo essencial está em um único pendrive. Se esse dispositivo falhar, o trabalho pode ser perdido. Qual providência reduz diretamente esse risco?',
['Criar e verificar uma cópia de segurança em outro meio autorizado','Alterar o nome do pendrive','Abrir o arquivo mais vezes','Aumentar o brilho da tela','Deixar o pendrive conectado continuamente'],0,
'Uma segunda cópia, em meio independente e passível de restauração, evita depender do único pendrive. Renomear ou abrir o arquivo não cria redundância dos dados.', 'https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf');
add('Noções Básicas de Informática','navegação na web',['aor'],'Ao digitar diretamente um endereço conhecido no navegador, o usuário evita seguir um link recebido por mensagem suspeita. Qual risco essa escolha procura reduzir?',
['Cair em página falsa indicada pelo link','Esquecer a senha do dispositivo','Perder a formatação de planilhas','Alterar o fuso horário do computador','Duplicar automaticamente arquivos locais'],0,
'Links em mensagens podem levar a páginas falsas visualmente semelhantes às legítimas. Usar um endereço previamente conhecido reduz a dependência do destino escolhido pelo remetente.',CERT);

// Conhecimentos técnicos — 5 itens ancorados na apostila oficial do IBGE.
add('Conhecimentos Técnicos','estabelecimento agropecuário',['acr','acs'],'Um produtor administra duas áreas usadas na mesma atividade agropecuária, sob uma única gestão e próximas entre si. Para o conceito censitário, qual característica precisa ser analisada antes de contá-las separadamente?',
['A cor das edificações','A unidade de administração e as regras de continuidade das áreas','O número de nomes comerciais','O modelo do veículo do produtor','A existência de aplicativo bancário'],1,
'O estabelecimento é definido pela unidade de produção sob uma administração, observadas as regras territoriais de continuidade. A mera existência de duas áreas não basta para dois estabelecimentos.',TEC);
add('Conhecimentos Técnicos','produtor sem área',['acr','acs'],'Um trabalhador cria animais em área de terceiro, assume decisões sobre sua criação e não dispõe de área própria. A ausência de propriedade de terra, por si só, significa que sua atividade deve ser ignorada?',
['Sim, somente proprietários são investigados','Não; é preciso aplicar as regras oficiais para produtor sem área','Sim, desde que os animais sejam pequenos','Não, mas deve-se inventar uma área fictícia','Sim, caso haja apenas um responsável'],1,
'A investigação censitária não se limita à propriedade da terra. A apostila prevê situações de produtor sem área; a classificação depende das condições de produção descritas, não de inventar terreno.',TEC);
add('Conhecimentos Técnicos','coordenadas geográficas',['acr','acs'],'Durante uma visita, o dispositivo registra coordenadas geográficas do ponto coletado. Qual interpretação é adequada para a utilidade dessas coordenadas na operação censitária?',
['Identificam uma posição espacial, mas não substituem automaticamente todos os demais dados do estabelecimento','Representam apenas o nome do produtor','São uma medida de produção em toneladas','Dispensam toda conferência territorial','São equivalentes ao número de trabalhadores'],0,
'Coordenadas localizam um ponto na superfície terrestre e apoiam a referência espacial da coleta. Elas não descrevem, sozinhas, características produtivas nem eliminam verificações de campo.',TEC);
add('Conhecimentos Técnicos','setor censitário',['acr','acs'],'Um recenseador recebe mapa de setor e descrição de limites antes de iniciar visitas. Qual uso conjunto desses materiais está mais alinhado à finalidade operacional?',
['Confirmar a área de trabalho e evitar omissões ou invasão de setor vizinho','Substituir toda entrevista por leitura do mapa','Definir preços de produtos agrícolas','Classificar a escolaridade dos moradores','Apagar endereços não desenhados no mapa'],0,
'Mapa e descrição ajudam a reconhecer limites e percorrer a área atribuída de modo completo. A delimitação orienta a coleta, mas não substitui entrevista nem autoriza descartar registros sem verificação.',TEC);
add('Conhecimentos Técnicos','CNEFE',['acr','acs'],'Ao conferir a lista de endereços de um setor, a equipe encontra um endereço existente que não consta da relação inicial. Qual interpretação evita tratar a listagem como retrato imutável do território?',
['O endereço deve ser ignorado porque não constava da lista','A lista de endereços é instrumento de apoio e inconsistências exigem verificação conforme o procedimento oficial','O endereço prova que o mapa inteiro está errado','Deve-se criar automaticamente outro setor censitário','A equipe pode alterar qualquer limite sem autorização'],1,
'O cadastro de endereços apoia a operação, mas o campo pode revelar omissões ou mudanças. A ocorrência deve ser verificada e tratada pelo procedimento oficial, sem ignorá-la nem alterar limites livremente.',TEC);

if(q.length!==100)throw new Error(`Esperadas 100 questões; geradas ${q.length}`);
// Distribuição equilibrada do gabarito, sem mexer no vínculo entre alternativas e justificativas.
for(const [index,item] of q.entries()){
  const wanted=index%5, shift=(wanted-item.answer+5)%5;
  if(shift){const rotate=a=>a.map((_,i)=>a[(i-shift+5)%5]);item.options=rotate(item.options);item.whyWrong=rotate(item.whyWrong);item.answer=wanted;}
}
const distribution=Object.fromEntries([...new Set(q.map(x=>x.subject))].map(s=>[s,q.filter(x=>x.subject===s).length]));
fs.writeFileSync('content/ibge-2026/batches/batch-008.json',JSON.stringify({batch:'batch-008',status:'review',generatedBy:'curadoria nesta conversa',distribution,questions:q},null,2)+'\n');
console.log(JSON.stringify({count:q.length,distribution,answers:[0,1,2,3,4].map(i=>q.filter(x=>x.answer===i).length)},null,2));
