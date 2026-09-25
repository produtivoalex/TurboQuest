import fs from 'node:fs';

const EDITAL = 'https://servidor-arquivos.ibfc.org.br/arquivos-publicos/edital-01-2026-ibfc-11.06-final-marcadores.pdf';
const TECNICO = 'https://ftp.ibge.gov.br/edital/PSS_Censo_Agro/2026_02/Edital_2_2026_AC_ACQ_Apostila_de_Estudo_dos_conhecimentos_tecnicos.pdf';
const ALL = ['aca', 'aci', 'aor', 'acr', 'acs'];
const MANAGERS = ['aor', 'acr', 'acs'];
const TECH = ['acr', 'acs'];
const questions = [];

function add(subject, topic, roles, statement, options, answer, explanation, wrong, source = EDITAL, difficulty = 'hard') {
  if (wrong.length !== 5) throw new Error(`Justificativas incompletas: ${topic}`);
  questions.push({
    id: `ibge26-b007-${String(questions.length + 1).padStart(3, '0')}`,
    roles, subject, topic, difficulty, statement, options, answer, explanation,
    whyWrong: wrong.map((reason, index) => index === answer ? `Correta. ${explanation}` : reason),
    sources: [{ title: source === TECNICO ? 'Conhecimentos básicos para o 12º Censo Agropecuário, Florestal e Aquícola' : 'Edital nº 01/2026 — conteúdo programático', locator: source === TECNICO ? 'Apostila de conhecimentos técnicos' : 'Anexo IV', url: source }],
    status: 'review'
  });
}

// Administração e situações gerenciais: cenários que exigem diagnóstico, não definições isoladas.
add('Noções de Administração/Situações Gerenciais','planejamento e controle',MANAGERS,
 'Uma coordenação estabeleceu meta semanal de visitas e, ao fim da semana, comparou o realizado, identificou atraso por falta de transporte e remanejou veículos. Qual etapa corresponde ao remanejamento?',
 ['Fixação da meta','Mensuração do resultado','Diagnóstico da causa','Ação corretiva','Formulação da missão'],3,
 'O remanejamento altera a execução após comparação e diagnóstico do desvio; portanto, é a ação corretiva do processo de controle.',
 ['A meta foi fixada antes da semana.','A mensuração foi a contagem das visitas.','O diagnóstico identificou a falta de transporte.','','A missão descreve finalidade institucional, não medida operacional.']);
add('Noções de Administração/Situações Gerenciais','processo decisório',MANAGERS,
 'Duas soluções reduzem o atraso de uma equipe: contratar transporte adicional ou redistribuir veículos ociosos. Antes de decidir, o gestor compara custo, prazo e impacto em outras equipes. Essa comparação constitui:',
 ['Definição do problema','Avaliação de alternativas','Execução da decisão','Controle posterior','Delegação de autoridade'],1,
 'Os critérios são aplicados a cursos de ação possíveis antes da escolha. Essa é a avaliação de alternativas no processo decisório.',
 ['O atraso já foi reconhecido como problema.','','A execução ocorre depois da escolha.','O controle mede efeitos depois da implementação.','Não há transferência de poder decisório descrita.']);
add('Noções de Administração/Situações Gerenciais','delegação',MANAGERS,
 'Um supervisor autoriza um agente a reorganizar a ordem das visitas dentro de limites definidos, mas mantém o acompanhamento das metas. Qual conclusão é correta?',
 ['A responsabilidade do supervisor desapareceu.','O agente recebeu autoridade delimitada para uma tarefa.','A delegação extinguiu o dever de prestar contas.','O agente passou a definir o objetivo institucional.','O supervisor deixou de exercer controle.'],1,
 'Delegar permite atribuir poder de decisão dentro de limites. O superior continua responsável pelo acompanhamento e pelos resultados da unidade.',
 ['O superior preserva sua responsabilidade gerencial.','','Prestação de contas permanece necessária.','Reordenar visitas não permite mudar o objetivo institucional.','O enunciado afirma que o supervisor acompanha as metas.']);
add('Noções de Administração/Situações Gerenciais','indicadores de desempenho',MANAGERS,
 'A equipe A realizou mais entrevistas que a equipe B, mas apresentou proporção maior de formulários devolvidos para correção. Qual avaliação é mais adequada?',
 ['A é necessariamente superior porque produziu mais.','B é necessariamente superior porque produziu menos.','É preciso considerar volume e qualidade antes de comparar o desempenho.','O retrabalho não integra avaliação de desempenho.','Nenhum indicador pode ser usado nessa comparação.'],2,
 'Quantidade isolada não mede resultado útil. A comparação deve incluir qualidade, retrabalho e contexto da produção das equipes.',
 ['Ignora devoluções e retrabalho.','Produção menor não prova qualidade maior.','','Retrabalho é dimensão relevante de qualidade.','Indicadores são úteis quando interpretados em conjunto.']);
add('Noções de Administração/Situações Gerenciais','comunicação organizacional',MANAGERS,
 'Uma orientação escrita gerou interpretações divergentes entre postos. Para reduzir o ruído sem perder rastreabilidade, a chefia deve:',
 ['Enviar a mesma mensagem sem explicações.','Substituir todo registro escrito por conversa informal.','Esclarecer a instrução, registrar a versão corrigida e confirmar o entendimento.','Responsabilizar imediatamente todos os postos.','Permitir que cada posto adote seu próprio critério.'],2,
 'A medida combina clareza, registro da orientação vigente e retorno dos destinatários. Assim reduz interpretações distintas e preserva rastreabilidade.',
 ['Repetir texto ambíguo mantém o ruído.','Conversa sem registro prejudica a referência comum.','','Punição não resolve a ambiguidade da mensagem.','Critérios locais distintos reduzem padronização.']);
add('Noções de Administração/Situações Gerenciais','gestão de conflitos',MANAGERS,
 'Duas equipes disputam o mesmo veículo em horários coincidentes. Há horários alternativos e prioridades diferentes. O primeiro passo gerencial mais sólido é:',
 ['Prometer o veículo integralmente às duas.','Determinar uso por sorteio sem conhecer as demandas.','Mapear necessidades, horários e prioridades antes de negociar a alocação.','Retirar o veículo de ambas por prazo indeterminado.','Pedir que cada equipe resolva sem compartilhar informações.'],2,
 'A decisão exige conhecer restrições e prioridade das tarefas. A negociação informada permite reduzir o conflito sem prejudicar desnecessariamente a operação.',
 ['Promessa incompatível aumenta o conflito.','Sorteio ignora prioridade e possibilidade de ajuste.','','Retirada integral não explora alternativas disponíveis.','Falta de informações impede coordenação.']);
add('Noções de Administração/Situações Gerenciais','planejamento',MANAGERS,
 'Uma gerência define que a unidade deve concluir determinada etapa em três meses. Cada posto, então, detalha atividades semanais, responsáveis e recursos. O detalhamento dos postos corresponde principalmente ao:',
 ['Planejamento operacional','Planejamento estratégico de longo prazo','Controle final','Diagnóstico externo','Redesenho da missão'],0,
 'Atividades, responsáveis, recursos e prazos semanais concretizam a execução da meta em nível operacional.',
 ['','O nível estratégico define diretrizes amplas, não tarefas semanais.','Controle verifica resultados durante ou após a execução.','Análise externa pode subsidiar o plano, mas não é o detalhamento descrito.','A missão não é redefinida pela escala semanal.']);
add('Noções de Administração/Situações Gerenciais','liderança',MANAGERS,
 'Um novo agente ainda não domina o aplicativo de coleta; outro domina a ferramenta, mas precisa decidir entre rotas. Uma orientação gerencial ajustada à situação seria:',
 ['Dar a ambos a mesma instrução minuciosa.','Oferecer treinamento técnico ao primeiro e autonomia delimitada ao segundo.','Deixar ambos sem apoio para testar iniciativa.','Transferir todas as decisões ao primeiro agente.','Dispensar acompanhamento dos dois.'],1,
 'O grau de orientação e autonomia deve acompanhar a competência e a tarefa de cada agente. O primeiro precisa de apoio técnico; o segundo pode receber espaço decisório.',
 ['Necessidades diferentes exigem apoio diferente.','','Ausência de apoio compromete aprendizado e controle.','O primeiro ainda não domina a ferramenta.','Autonomia não elimina acompanhamento.']);
add('Noções de Administração/Situações Gerenciais','sistemas abertos',MANAGERS,
 'Uma mudança no acesso a comunidades altera rotas e horários previstos. Ao atualizar o plano com base nessa informação, a organização demonstra:',
 ['Isolamento do ambiente','Adaptação ao ambiente externo','Abandono de seus objetivos','Supressão do controle','Eliminação da divisão de trabalho'],1,
 'Organizações como sistemas abertos recebem informações do ambiente e ajustam processos para continuar perseguindo seus objetivos.',
 ['O plano mudou justamente por informação externa.','','Adaptar meios não equivale a abandonar objetivos.','O ajuste pode reforçar o controle.','As atribuições continuam existindo.']);
add('Noções de Administração/Situações Gerenciais','eficácia e eficiência',MANAGERS,
 'Uma equipe concluiu todas as visitas previstas, mas consumiu o dobro de combustível planejado sem justificativa operacional. Em relação aos indicadores, ela foi:',
 ['Eficaz quanto à meta de visitas, com eficiência de recursos a investigar.','Ineficaz quanto à meta porque gastou mais.','Eficiente por ter atingido qualquer resultado.','Necessariamente ineficaz e eficiente.','Impossível de avaliar em qualquer dimensão.'],0,
 'A eficácia refere-se ao alcance da meta de visitas. O consumo elevado exige análise da eficiência no uso dos recursos; uma dimensão não substitui a outra.',
 ['','A meta de visitas foi atingida.','Alcançar resultado não demonstra uso eficiente dos recursos.','As classificações invertem os fatos narrados.','Há dados suficientes para avaliar ao menos as duas dimensões citadas.']);
add('Noções de Administração/Situações Gerenciais','controle preventivo',MANAGERS,
 'Antes de iniciar a coleta, uma coordenação verifica se os dispositivos estão configurados e se as equipes receberam treinamento. O controle é predominantemente:',
 ['Posterior, pois mede apenas resultados finais.','Preventivo, pois busca evitar falhas antes da execução.','Corretivo, pois reprocessa entrevistas já transmitidas.','Informal, pois não pode usar listas de verificação.','Estratégico, pois muda a missão da instituição.'],1,
 'A verificação antecede a operação e reduz a chance de problemas durante a coleta; por isso é controle preventivo.',
 ['Ainda não há resultado final.','','Nenhuma entrevista já transmitida é corrigida no enunciado.','Listas de verificação podem formalizar a atividade.','Preparar dispositivos não altera a missão institucional.']);
add('Noções de Administração/Situações Gerenciais','qualidade em serviços',MANAGERS,
 'Um posto reduz o tempo médio de atendimento, porém aumenta a taxa de informações incompletas. A conclusão gerencial mais consistente é:',
 ['Houve melhoria inequívoca.','A rapidez isolada não demonstra melhoria da qualidade total.','Informações incompletas não afetam o usuário.','Deve-se abandonar a medição de tempo.','O posto tornou-se necessariamente mais caro.'],1,
 'Tempo e completude são dimensões do serviço. A redução de uma com piora da outra pede avaliação conjunta de qualidade e retrabalho.',
 ['Ignora a piora da completude.','','O usuário pode precisar retornar ou receber serviço incompleto.','Tempo continua sendo indicador útil.','O enunciado não informa custos.']);
add('Noções de Administração/Situações Gerenciais','responsabilidade e autoridade',MANAGERS,
 'Um servidor responde por conferir formulários, mas não pode solicitar correções nem acessar os registros necessários. A falha de desenho organizacional é:',
 ['Excesso de comunicação horizontal.','Incompatibilidade entre responsabilidade atribuída e autoridade ou recursos disponíveis.','Ausência de objetivo institucional.','Controle posterior excessivo.','Planejamento estratégico muito detalhado.'],1,
 'A responsabilidade por um resultado precisa vir acompanhada dos meios e da autoridade necessários para executar e corrigir a tarefa.',
 ['Comunicação horizontal não explica falta de acesso.','','O objetivo de conferir formulários existe.','Não se descreve controle posterior excessivo.','Não há detalhe de planejamento estratégico.']);
add('Noções de Administração/Situações Gerenciais','avaliação de desempenho',MANAGERS,
 'Um gestor avalia agentes apenas pelo número bruto de entrevistas, embora seus setores tenham distâncias e acesso muito diferentes. O principal risco é:',
 ['A comparação perder validade por ignorar condições de trabalho relevantes.','O número bruto medir todas as dimensões da qualidade.','O controle se tornar automaticamente preventivo.','A avaliação eliminar qualquer viés.','Os agentes passarem a trabalhar no mesmo setor.'],0,
 'A comparação precisa considerar contexto e critérios pertinentes. Distância e acessibilidade podem afetar produtividade sem refletir esforço ou competência.',
 ['','Volume isolado não mede qualidade integral.','A avaliação descrita ocorre sobre produção realizada.','Ignorar contexto introduz viés.','Os setores continuam diferentes.']);
add('Noções de Administração/Situações Gerenciais','comunicação e feedback',MANAGERS,
 'Após orientar uma equipe, o supervisor pede que ela descreva como aplicará o procedimento em um caso concreto. Esse pedido serve principalmente para:',
 ['Verificar compreensão por meio de feedback.','Transferir integralmente a responsabilidade ao grupo.','Anular a instrução inicial.','Substituir qualquer documento oficial.','Impedir a manifestação de dúvidas.'],0,
 'A equipe demonstra, com suas próprias palavras, se compreendeu e consegue aplicar a orientação. O retorno permite corrigir ruídos antes da execução.',
 ['','A responsabilidade do supervisor permanece.','A instrução é testada, não anulada.','A verificação complementa o documento oficial.','O procedimento favorece identificação de dúvidas.']);
add('Noções de Administração/Situações Gerenciais','coordenação',MANAGERS,
 'A equipe de campo conclui registros que dependem de validação por outro posto. Sem combinar prazos de entrega e retorno, ambas atingem metas locais, mas a operação atrasa. Falta sobretudo:',
 ['Especialização técnica.','Coordenação entre atividades interdependentes.','Motivação individual.','Autoridade normativa externa.','Um novo objetivo institucional.'],1,
 'As etapas dependem uma da outra. É preciso alinhar prazos, responsabilidades e fluxo de retorno para que o resultado conjunto ocorra no prazo.',
 ['As equipes podem dominar suas tarefas e ainda assim atrasar a cadeia.','','O problema é de integração do fluxo, não de vontade individual.','Nenhuma norma externa é indicada como causa.','O objetivo comum já está definido.']);
add('Noções de Administração/Situações Gerenciais','tomada de decisão',MANAGERS,
 'Em situação urgente, o gestor escolhe uma solução viável com dados incompletos, registra as premissas e prevê revisão após obter novas evidências. Essa conduta:',
 ['É necessariamente irracional.','Combina decisão sob restrição de informação com monitoramento.','Dispensa critérios de decisão.','Garante resultado ótimo.','Impede qualquer ajuste futuro.'],1,
 'A decisão pode ocorrer com informação limitada. Registrar premissas e acompanhar efeitos permite revisar o curso escolhido.',
 ['Urgência não torna toda decisão irracional.','','Critérios continuam necessários.','Solução viável não significa ótima.','A revisão está prevista no enunciado.']);
add('Noções de Administração/Situações Gerenciais','gestão de riscos',MANAGERS,
 'Um posto percebe que a conexão de dados costuma falhar no fim da tarde. Antes do próximo turno, organiza a coleta offline prevista e define horário de sincronização. A medida é:',
 ['Resposta preventiva a um risco identificado.','Correção de um dado já perdido.','Mudança da finalidade da pesquisa.','Eliminação garantida de qualquer falha.','Delegação de toda a operação à equipe de TI.'],0,
 'A falha recorrente foi identificada e o procedimento de contingência preparado antes do turno; isso reduz impacto provável do risco.',
 ['','Não há dado perdido a recuperar no caso.','A finalidade da pesquisa permanece.','Contingência reduz impacto, sem garantir ausência de falhas.','A equipe de campo mantém sua responsabilidade.']);
add('Noções de Administração/Situações Gerenciais','trabalho em equipe',MANAGERS,
 'Numa reunião, cada integrante apresenta obstáculos da própria etapa, e o grupo combina entregas que dependem umas das outras. O principal ganho dessa prática é:',
 ['Reduzir a interdependência a zero.','Criar entendimento compartilhado e alinhar compromissos.','Substituir a responsabilidade individual.','Eliminar a necessidade de registro.','Aumentar a ambiguidade dos papéis.'],1,
 'A troca de informações torna dependências visíveis e permite pactuar entregas, responsáveis e prazos para o resultado coletivo.',
 ['As atividades continuam interdependentes.','','Responsabilidades individuais permanecem.','Registrar compromissos pode ser necessário.','O alinhamento tende a esclarecer papéis.']);
add('Noções de Administração/Situações Gerenciais','indicadores',MANAGERS,
 'O indicador “entrevistas concluídas por dia” cresce após a equipe deixar casos difíceis para depois. Por que ele não deve ser interpretado sozinho?',
 ['Porque produtividade diária nunca é mensurável.','Porque pode melhorar enquanto cobertura e resolutividade pioram.','Porque qualquer crescimento indica fraude.','Porque não existe meta para entrevistas.','Porque casos difíceis são sempre irrelevantes.'],1,
 'O ganho numérico pode ocultar seleção de casos fáceis. Cobertura, pendências e qualidade precisam compor a avaliação da operação.',
 ['A contagem é mensurável.','','O dado isolado não prova fraude.','Metas podem existir e ainda assim exigir contexto.','Casos difíceis integram a cobertura prevista.']);

// Administração geral para ACA.
add('Noções de Administração','planejamento',['aca'],
 'Um plano define objetivo, responsável, prazo e recurso, mas não estabelece como verificar o cumprimento. Qual elemento falta para permitir acompanhamento consistente?',
 ['Indicador ou critério de avaliação','Nome informal da equipe','Nova missão institucional','Aumento automático do orçamento','Substituição do objetivo por uma atividade'],0,
 'Além de ação, responsável, prazo e recurso, o acompanhamento requer critério de resultado ou indicador que permita comparar o realizado com o esperado.',
 ['','O nome da equipe não mede o resultado.','Não há necessidade de reformular a missão.','Mais orçamento não cria critério de verificação.','Atividade não substitui objetivo mensurável.']);
add('Noções de Administração','organização',['aca'],
 'Em uma unidade, duas pessoas acreditam ser responsáveis pelo mesmo documento, enquanto ninguém cuida de sua guarda final. A função administrativa a ajustar primeiro é:',
 ['Organização das atribuições e do fluxo de trabalho','Motivação por premiação','Controle externo da população','Previsão de receita','Publicidade institucional'],0,
 'A sobreposição e a lacuna de responsabilidades mostram falha na distribuição de tarefas, autoridade e fluxo, aspectos da função organização.',
 ['','Prêmio não define quem guarda o documento.','Não se trata de controle social externo.','Receita não resolve a atribuição.','Divulgação institucional não corrige o fluxo.']);
add('Noções de Administração','documentação e arquivo',['aca'],
 'Uma unidade precisa recuperar rapidamente solicitações recebidas em meses anteriores. Qual prática contribui diretamente para essa necessidade?',
 ['Classificação e registro padronizados dos documentos','Guardar tudo em uma única pasta sem nomes','Eliminar documentos após a leitura','Depender apenas da memória do servidor','Misturar versões sem identificação'],0,
 'Classificação e registro consistentes permitem localizar documentos por critérios definidos, recuperar seu contexto e acompanhar sua tramitação.',
 ['','Uma pasta indiferenciada dificulta busca.','A eliminação exige regras de temporalidade.','Memória individual não oferece rastreabilidade.','Versões não identificadas criam incerteza.']);
add('Noções de Administração','atendimento ao público',['aca'],
 'Uma pessoa procura informação sobre um procedimento, mas o servidor não tem competência para decidir seu pedido. Qual atitude preserva qualidade no atendimento?',
 ['Orientar o canal competente e explicar os passos conhecidos com clareza.','Prometer deferimento para encerrar a conversa.','Negar toda informação por não decidir o pedido.','Encaminhar sem indicar destino.','Registrar decisão que cabe a outra unidade.'],0,
 'O servidor pode orientar de modo claro e encaminhar ao canal responsável, sem prometer decisão que não está autorizado a tomar.',
 ['','Promessa sem competência cria falsa expectativa.','A falta de competência decisória não impede orientação.','Encaminhamento sem destino não ajuda o usuário.','Não se pode decidir em nome de outra unidade.']);
add('Noções de Administração','controle',['aca'],
 'Ao conferir um processo antes do envio, o servidor encontra documento obrigatório ausente e solicita sua inclusão. A conferência funciona como:',
 ['Controle preventivo no fluxo','Avaliação exclusivamente estratégica','Delegação de autoridade','Mudança de objetivo institucional','Publicidade externa'],0,
 'A conferência intercepta a falha antes que o processo avance, permitindo correção no fluxo e reduzindo retrabalho posterior.',
 ['','A ação é operacional, não revisão estratégica da instituição.','Não se descreve transferência de autoridade.','O objetivo permanece o mesmo.','Não há divulgação externa no caso.']);

// Informática básica específica do AOR: tarefas e riscos operacionais.
add('Noções Básicas de Informática','arquivos e pastas',['aor'],
 'Um agente precisa preservar a planilha original e trabalhar em uma versão separada. Qual operação atende diretamente a esse objetivo?',
 ['Mover o arquivo para outra pasta.','Copiar o arquivo e renomear a cópia.','Excluir o arquivo original.','Criar apenas um atalho.','Alterar a extensão do original.'],1,
 'Copiar cria outra instância do arquivo; renomear a cópia ajuda a distinguir as versões sem alterar o original.',
 ['Mover altera a localização, sem criar versão separada.','','Excluir elimina a referência original.','Atalho aponta para o mesmo arquivo.','Mudar extensão não duplica o conteúdo.']);
add('Noções Básicas de Informática','planilhas e filtros',['aor'],
 'Uma lista tem registros de cinco municípios. O agente quer visualizar somente os de um município sem apagar os demais. Deve usar:',
 ['Classificação crescente do arquivo inteiro.','Filtro pelo valor da coluna município.','Exclusão das outras linhas.','Função SOMA na coluna município.','Renomeação da planilha.'],1,
 'O filtro seleciona temporariamente as linhas que atendem ao critério. Os demais registros permanecem na planilha.',
 ['Classificar muda a ordem, mas não oculta os demais.','','Excluir remove informações.','SOMA opera com valores numéricos.','Renomear não modifica a visualização das linhas.']);
add('Noções Básicas de Informática','CONT.SE',['aor'],
 'Na planilha, B2:B21 contém a situação de vinte registros, com os textos “Pendente” e “Concluído”. Qual fórmula conta os pendentes?',
 ['=SOMA(B2:B21;"Pendente")','=CONT.SE(B2:B21;"Pendente")','=MÉDIA(B2:B21)','=CONT.SE("Pendente";B2:B21)','=CLASSIFICAR(B2:B21)'],1,
 'CONT.SE recebe intervalo e critério, nessa ordem. A função conta as células de B2:B21 cujo conteúdo é Pendente.',
 ['SOMA não conta ocorrências de texto.','','MÉDIA não serve para contar categorias textuais.','Os argumentos de CONT.SE estão invertidos.','Classificar ordena ou reorganiza, sem contar pendências.']);
add('Noções Básicas de Informática','SOMA e MÉDIA',['aor'],
 'As células C2:C5 contêm 4, 6, 8 e 10 visitas. Para obter o número médio de visitas por dia, o agente deve usar:',
 ['=SOMA(C2:C5)','=MÉDIA(C2:C5)','=CONT.SE(C2:C5;">0")','=MÁXIMO(C2:C5)','=MÍNIMO(C2:C5)'],1,
 'A função MÉDIA soma os quatro valores e divide pela quantidade de células numéricas; o resultado é 7 visitas por dia.',
 ['SOMA retorna 28, não 7.','','CONT.SE retorna a contagem de células positivas.','MÁXIMO retorna 10.','MÍNIMO retorna 4.']);
add('Noções Básicas de Informática','operação offline',['aor'],
 'Durante uma queda de sinal, um aplicativo autorizado permite salvar registros localmente. Antes de tentar a transmissão, o agente deve:',
 ['Apagar os registros locais e refazer a coleta.','Verificar se foram salvos e sincronizar pelo fluxo previsto quando a conexão voltar.','Enviar cópias por aplicativo pessoal.','Trocar a senha para uma senha compartilhada.','Marcar todos como transmitidos manualmente.'],1,
 'Salvar localmente não equivale a transmitir. O agente deve preservar os dados, verificar o estado dos registros e seguir a sincronização prevista.',
 ['Apagar dados aumenta o risco de perda.','','Canal pessoal pode violar controles da operação.','Senha compartilhada compromete a segurança.','Marcação manual não comprova transmissão.']);
add('Noções Básicas de Informática','logs de transmissão',['aor'],
 'O aplicativo informa que um lote não foi recebido. O registro de transmissão mostra horário, identificador e erro retornado. Esses dados servem principalmente para:',
 ['Diagnosticar a falha e comprovar o estado da tentativa.','Substituir definitivamente o lote não recebido.','Garantir que o lote chegou apesar do erro.','Divulgar credenciais de acesso.','Eliminar a necessidade de nova tentativa.'],0,
 'O log oferece evidências do que ocorreu na tentativa de transmissão e orienta diagnóstico ou nova ação; não substitui os dados do lote.',
 ['','Metadados de transmissão não contêm necessariamente o lote.','Uma mensagem de erro não comprova recebimento.','Credenciais não devem ser divulgadas.','Pode ser necessário retransmitir pelo procedimento.']);
add('Noções Básicas de Informática','integridade dos dados',['aor'],
 'Uma planilha foi alterada após a revisão sem que se saiba por quem. Qual controle ajudaria a investigar a mudança?',
 ['Histórico de versões e identificação de usuário.','Redução do brilho da tela.','Renomeação do computador.','Uso exclusivo de letras maiúsculas.','Remoção de todas as fórmulas.'],0,
 'Histórico de versões e contas individuais permitem comparar alterações e atribuir ações, favorecendo integridade e rastreabilidade.',
 ['','Brilho não registra alterações.','Nome do computador não identifica cada edição.','Caixa alta não preserva histórico.','Remover fórmulas pode destruir informação útil.']);
add('Noções Básicas de Informática','confidencialidade',['aor'],
 'Um arquivo com dados de trabalho deve ser enviado a outra equipe autorizada. Qual configuração melhor limita a exposição?',
 ['Link público sem prazo.','Permissão somente aos destinatários necessários.','Senha publicada no mesmo grupo aberto.','Cópia em pasta compartilhada com todos.','Desativação dos registros de acesso.'],1,
 'Conceder acesso apenas a quem precisa reduz circulação indevida de dados e facilita identificar responsabilidades pelo uso.',
 ['Link público amplia a exposição.','','Senha em grupo aberto perde proteção.','Pasta ampla concede acesso excessivo.','Logs ajudam a acompanhar acessos.']);
add('Noções Básicas de Informática','Android e aplicativos',['aor'],
 'Um aplicativo de coleta solicita atualização. Antes de instalar uma versão recebida por mensagem informal, o agente deve:',
 ['Seguir o canal oficial de atualização definido pela operação.','Instalar imediatamente o arquivo recebido.','Compartilhar o pacote com toda a equipe.','Desativar o bloqueio de tela.','Ignorar qualquer atualização, mesmo a oficial.'],0,
 'Aplicativos de trabalho devem ser atualizados por canais autorizados; arquivos informais podem ser adulterados ou incompatíveis.',
 ['','Origem informal não garante autenticidade.','Propagar pacote suspeito amplia o risco.','Bloqueio de tela protege acesso ao dispositivo.','Atualizações oficiais podem corrigir falhas e riscos.']);
add('Noções Básicas de Informática','Wi-Fi e dados móveis',['aor'],
 'O dispositivo exibe Wi-Fi conectado, mas a transmissão falha porque a rede local está sem acesso à internet. A explicação correta é:',
 ['Conexão ao Wi-Fi não garante acesso à internet.','Wi-Fi e internet são sinônimos.','A transmissão sempre ocorre por Bluetooth.','O aplicativo necessariamente apagou os dados.','O problema prova que a senha do usuário expirou.'],0,
 'O Wi-Fi estabelece conexão com a rede local; essa rede pode não estar conectada à internet ou ao serviço exigido pelo aplicativo.',
 ['','Rede local pode existir sem rota para a internet.','Bluetooth não é implicado no enunciado.','Falha de rede não prova apagamento.','Nada indica expiração de senha.']);
add('Noções Básicas de Informática','classificação de dados',['aor'],
 'Uma tabela contém as colunas município, setor e data. Para ver primeiro os setores mais recentes dentro de cada município, deve-se:',
 ['Classificar apenas a coluna data isoladamente.','Classificar a tabela por município e, em seguida, por data decrescente.','Filtrar somente os setores mais recentes e apagar os demais.','Somar os valores da coluna município.','Renomear os arquivos por ordem alfabética.'],1,
 'A ordenação em vários níveis agrupa os registros por município e organiza as datas dentro de cada grupo, preservando as linhas completas.',
 ['Ordenar uma coluna isolada pode desalinhar os registros.','','Filtrar não produz a ordenação solicitada e apagar perde dados.','Município é categoria textual, não soma.','Nome de arquivo não reorganiza linhas da tabela.']);
add('Noções Básicas de Informática','recortar e copiar',['aor'],
 'Um agente precisa retirar um arquivo de uma pasta e colocá-lo em outra, sem deixar cópia na pasta de origem. Deve usar:',
 ['Copiar e colar.','Recortar e colar.','Criar atalho.','Duplicar e renomear.','Abrir e fechar o arquivo.'],1,
 'Recortar e colar move o item para o destino, enquanto copiar e colar preserva uma cópia no local original.',
 ['Copiar mantém o original.','','Atalho referencia o arquivo sem movê-lo.','Duplicar cria outra instância.','Abrir e fechar não muda a pasta.']);
add('Noções Básicas de Informática','backup',['aor'],
 'Uma equipe faz cópia de segurança, mas nunca testa a recuperação. O principal risco dessa prática é:',
 ['A cópia existir e não ser restaurável quando necessária.','A cópia sempre ficar mais rápida.','Os arquivos originais se tornarem automaticamente públicos.','O antivírus deixar de funcionar.','A internet ser desativada permanentemente.'],0,
 'O teste de restauração verifica integridade e procedimento. Sem ele, pode-se descobrir tarde demais que a cópia está incompleta ou inutilizável.',
 ['','Velocidade de cópia não é o risco principal.','Backup não publica arquivos automaticamente.','Antivírus é mecanismo independente.','Não há relação necessária com desativação da internet.']);
add('Noções Básicas de Informática','perfis e senhas',['aor'],
 'Dois agentes usam a mesma conta para registrar operações distintas. Qual consequência prejudica mais diretamente a auditoria?',
 ['Fica difícil atribuir cada ação ao agente que a realizou.','A tela fica necessariamente mais lenta.','O sistema perde a função de imprimir.','O arquivo muda automaticamente de formato.','O Wi-Fi deixa de funcionar.'],0,
 'Credenciais individuais permitem ligar ações a responsáveis. Conta compartilhada enfraquece rastreabilidade e dificulta apurar erros ou acesso indevido.',
 ['','Desempenho não decorre necessariamente da conta compartilhada.','Impressão é assunto distinto.','Formato do arquivo não depende desse compartilhamento.','Wi-Fi pode funcionar normalmente.']);
add('Noções Básicas de Informática','gráficos em planilhas',['aor'],
 'Para comparar o número de visitas concluídas por cinco postos, qual visualização costuma ser mais adequada?',
 ['Gráfico de colunas, com um valor por posto.','Mapa sem dados territoriais.','Gráfico de dispersão com um único ponto.','Imagem decorativa sem escala.','Histograma que mistura os cinco postos em uma classe.'],0,
 'Colunas permitem comparar magnitudes de categorias discretas, como postos, mantendo a identificação de cada valor.',
 ['','Mapa exige finalidade espacial e dados apropriados.','Um ponto não compara cinco postos.','Imagem sem escala não permite leitura quantitativa.','A agregação sugerida esconde a comparação entre postos.']);

const expected = 40;
if (questions.length !== expected) throw new Error(`Bloco parcial: ${questions.length}/${expected}`);
const file = 'content/ibge-2026/batches/batch-007a.json';
fs.writeFileSync(file, JSON.stringify({ batch: 'batch-007a', status: 'review', generatedBy: 'curadoria nesta conversa', questions }, null, 2) + '\n');
console.log(`Salvas ${questions.length} questões em ${file}`);
