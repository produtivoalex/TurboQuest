import fs from 'node:fs';
const URL='https://ftp.ibge.gov.br/edital/PSS_Censo_Agro/2026_02/Edital_2_2026_AC_ACQ_Apostila_de_Estudo_dos_conhecimentos_tecnicos.pdf';
const R=['acr','acs'], q=[];
function add(topic,page,statement,options,answer,explanation,wrong,difficulty='hard'){
  if(wrong.length!==5)throw new Error(topic);
  q.push({id:`ibge26-b007-${String(q.length+71).padStart(3,'0')}`,roles:R,subject:'Conhecimentos Técnicos',topic,difficulty,statement,options,answer,explanation,
    whyWrong:wrong.map((x,i)=>i===answer?`Correta. ${explanation}`:x),sources:[{title:'Conhecimentos básicos para o 12º Censo Agropecuário, Florestal e Aquícola',locator:`p. ${page}`,url:URL}],status:'review'});
}
add('estrutura censitária',12,'Uma equipe precisa encaminhar uma dúvida sobre monitoramento da qualidade em nível estadual. Segundo a estrutura temporária descrita no material, qual unidade exerce essa atribuição?',
 ['Centro Nacional de Qualidade','Centro Estadual de Qualidade','Agência municipal de correios','Posto de atendimento previdenciário','Secretaria municipal de agricultura'],1,
 'O CEQ, vinculado às Superintendências Estaduais, monitora em nível estadual a qualidade dos dados do Censo Agropecuário.',
 ['O CNQ monitora a qualidade em âmbito nacional.','','Correios não integra essa estrutura de qualidade.','Não é unidade da operação censitária.','Não é a unidade definida para monitoramento estadual.']);
add('estrutura censitária',13,'O material descreve os postos censitários como base operacional da supervisão e dos recenseadores. Quanto à sua abrangência territorial, um posto pode atender:',
 ['Apenas um setor censitário','Um município ou conjunto de municípios','Obrigatoriamente uma unidade federativa inteira','Somente a sede nacional do IBGE','Exclusivamente municípios sem área rural'],1,
 'O posto apoia a realização do censo e pode atender a um município ou a um conjunto de municípios, conforme a organização da operação.',
 ['Um posto pode abranger vários setores.','','Abrangência estadual não é obrigatória.','O posto é base local, não somente da sede nacional.','A existência de área rural não exclui a organização do posto.']);
add('atribuições do ACR',16,'Um posto apresenta atraso e alertas no sistema de acompanhamento. Conforme a apostila, qual ação integra diretamente as atribuições do Agente Censitário Regional?',
 ['Apenas aplicar entrevistas sem acompanhar equipes','Monitorar cobertura e cronograma e analisar indicadores operacionais','Substituir a chefia nacional do IBGE','Produzir sozinho todos os mapas do país','Declarar encerrado o censo sem avaliar pendências'],1,
 'O ACR coordena as atividades no âmbito do posto, acompanha equipes, cobertura, prazos, indicadores e alertas operacionais.',
 ['O ACR coordena e acompanha, não se limita à entrevista.','','Sua atuação é no âmbito do posto.','A produção nacional de mapas não é a função descrita.','Pendências integram o acompanhamento do posto.']);
add('atribuições do ACS',17,'Após detectar erros frequentes nos formulários de um recenseador, o responsável direto por orientá-lo e acompanhar sua correção, segundo a estrutura de campo, é:',
 ['O Agente Censitário Supervisor','O candidato inscrito para ACA','Um morador do setor','O operador dos Correios','O produtor entrevistado'],0,
 'O ACS supervisiona recenseadores, realiza treinamento, presta apoio técnico e acompanha a qualidade e a cobertura do trabalho de campo.',
 ['','O ACA apoia atividades administrativas do posto.','Morador não exerce supervisão funcional.','Correios não compõem a cadeia de supervisão.','Informante fornece dados, não supervisiona o agente.']);
add('instrumentos de trabalho',20,'Em campo, o recenseador vê uma estrada que pode marcar o limite do setor. Para confirmar o perímetro oficial, deve combinar o mapa com:',
 ['A memória de visitas anteriores apenas','O descritivo do setor','O preço dos imóveis da região','Uma rota sugerida por aplicativo externo','O número de moradores entrevistados'],1,
 'O descritivo define textualmente o contorno do setor e deve ser consultado junto ao mapa quando houver dúvida sobre seus limites.',
 ['Memória não substitui instrumento oficial.','','Valor imobiliário não define perímetro censitário.','Rota externa não altera limites oficiais.','Número de entrevistas não identifica a fronteira.']);
add('lista prévia de endereços',21,'A lista prévia do DMC não inclui uma unidade agropecuária encontrada durante o percurso. Qual conduta corresponde à orientação do material?',
 ['Ignorar a unidade por não constar na lista.','Visitá-la e incluí-la na relação de endereços após a verificação.','Entrevistá-la apenas se outro recenseador concordar.','Substituir o endereço por outro da lista.','Registrar a unidade fora do setor sem confirmar localização.'],1,
 'A lista prévia apoia a coleta, mas não limita a cobertura: novos endereços encontrados em campo devem ser visitados e incluídos no DMC.',
 ['A cobertura inclui unidades ausentes da lista.','','A inclusão segue verificação e procedimentos da operação.','Substituição criaria erro de identificação.','Primeiro é preciso confirmar a vinculação territorial.']);
add('lista prévia de endereços',21,'Um endereço da lista prévia não é encontrado após a verificação em campo. Qual atualização a apostila prevê para esse caso?',
 ['Mantê-lo como confirmado sem visita.','Excluí-lo da lista após verificar que não existe em campo.','Inventar coordenada para preservá-lo.','Duplicá-lo em setor vizinho.','Marcar entrevista concluída automaticamente.'],1,
 'A atualização da lista inclui confirmar endereços presentes, adicionar novos e excluir aqueles não encontrados em campo após verificação.',
 ['Confirmação pressupõe presença verificada.','','Coordenada inventada falseia a localização.','Duplicação pode gerar contagem indevida.','Não se conclui entrevista sem unidade e informações.']);
add('escala cartográfica',24,'Em um mapa na escala 1:50.000, a distância entre o posto e uma unidade é de 4 cm. Qual distância aproximada no terreno?',
 ['200 m','500 m','1 km','2 km','20 km'],3,
 'Cada centímetro representa 50.000 cm, ou 500 m. Quatro centímetros representam 2.000 m, equivalentes a 2 km.',
 ['Confunde centímetros do mapa com metros reais.','É a distância de 1 cm no mapa.','Corresponde a 2 cm no mapa.','','Multiplica indevidamente por dez.']);
add('interpretação de mapas',24,'Um símbolo aparece junto a uma via no mapa do setor, mas seu significado não é familiar ao recenseador. Qual procedimento a apostila recomenda antes de interpretá-lo?',
 ['Atribuir o significado mais comum.','Consultar a legenda do mapa.','Ignorar a via.','Perguntar ao primeiro morador e dispensar o mapa.','Alterar o símbolo no DMC.'],1,
 'A legenda relaciona símbolos e significados usados naquele mapa. O material orienta a não interpretar um símbolo antes de consultá-la.',
 ['Símbolos podem variar entre mapas.','','Ignorar a via pode prejudicar orientação.','Informação local pode complementar, não substituir a legenda.','O agente não deve modificar o padrão cartográfico.']);
add('imagem de satélite',27,'Uma construção visível na imagem de satélite não aparece na lista de endereços. Após confirmar que está no setor, o recenseador deve:',
 ['Visitar e registrar a nova unidade no DMC.','Desconsiderar a imagem por não ser uma lista oficial.','Contar a construção como entrevista completa.','Inseri-la em setor distante por conveniência.','Apagar os endereços vizinhos.'],0,
 'A imagem pode revelar unidades não listadas. A apostila orienta verificar em campo, visitar e registrar no DMC os novos endereços pertinentes.',
 ['','A imagem ajuda a detectar omissões possíveis.','Construção observada não equivale a entrevista.','A vinculação deve respeitar o setor correto.','Não há motivo para excluir endereços vizinhos.']);
add('descritivo do setor',30,'Ao comparar mapa e campo, o agente encontra um limite difícil de reconhecer devido a mudanças na paisagem. Qual ação respeita o procedimento descrito?',
 ['Redesenhar o perímetro por conta própria.','Comunicar imediatamente a dificuldade à supervisão.','Coletar livremente em ambos os setores.','Ignorar a parte duvidosa.','Usar exclusivamente o GPS e abandonar o descritivo.'],1,
 'A apostila orienta comunicar inconsistências de limite à supervisão. O recenseador não pode alterar o perímetro do setor por iniciativa própria.',
 ['O agente não tem autorização para mudar o limite.','','Coleta duplicada ameaça a cobertura correta.','Omissão deixa área sem investigação.','GPS auxilia, mas não substitui mapa e descritivo.']);
add('setores a serem excluídos',30,'O descritivo informa que um pequeno setor urbano fica inteiramente dentro do perímetro rural atribuído ao recenseador, mas deve ser excluído. O agente deve:',
 ['Coletar em ambos por estarem no mesmo perímetro externo.','Não coletar no setor excluído, cuja responsabilidade é de outro recenseador.','Apagar o setor urbano do mapa.','Coletar apenas se a distância for curta.','Alterar o código do setor urbano para rural.'],1,
 'Setores internos indicados como excluídos não integram a área de responsabilidade do agente; outro recenseador realizará a coleta ali.',
 ['O descritivo define uma exclusão explícita.','','O agente não modifica a cartografia oficial.','Distância não muda responsabilidade territorial.','Código do setor não pode ser alterado por conveniência.']);
add('estruturas não setorizadas',31,'Uma pequena localidade dentro do setor não foi individualizada em setor próprio. Segundo o descritivo, a equipe deve:',
 ['Ignorá-la porque não recebeu código separado.','Recenseá-la no setor atribuído, com atenção ao acesso e à abordagem.','Exigir que a localidade se torne município.','Transferi-la automaticamente a outro recenseador.','Considerar todas as unidades não recenseáveis.'],1,
 'Estruturas territoriais não setorizadas podem estar dentro do setor e devem ser recenseadas normalmente, com atenção especial à abordagem.',
 ['Ausência de setor próprio não implica ausência de coleta.','','A divisão municipal não depende da equipe de campo.','Não há transferência automática descrita.','A recenseabilidade depende dos conceitos da operação.']);
add('situação e tipo de setor',35,'Na classificação territorial apresentada na apostila, a “situação” do setor está ligada principalmente:',
 ['À distinção entre urbano e rural.','À profissão do produtor.','À quantidade de entrevistas transmitidas.','Ao modelo do DMC.','À idade média dos moradores.'],0,
 'Situação classifica o setor segundo ocupação do espaço, especialmente urbano ou rural; tipo trata características territoriais específicas.',
 ['','Profissão do produtor não classifica a situação do setor.','Produção de entrevistas é indicador operacional.','Equipamento não define setor urbano ou rural.','Idade não é o critério apresentado.']);
add('tipos especiais de setor',36,'Um setor classificado em tipo especial apresenta restrição de acesso. Qual conclusão se ajusta à apostila?',
 ['O tipo pode exigir pré-abordagem específica com responsável pelo local.','Todo setor especial deve ser ignorado.','O tipo substitui a situação urbano-rural.','A equipe pode ultrapassar qualquer restrição sem contato.','A restrição transforma automaticamente a área em massa d’água.'],0,
 'Tipos especiais podem demandar contato e pré-abordagem com informante ou responsável. O tipo acrescenta uma característica operacional ao setor.',
 ['','A visita depende dos critérios da operação, não de exclusão geral.','Situação e tipo são classificações distintas.','Acesso deve respeitar procedimentos previstos.','Massa d’água é classificação territorial distinta.']);
add('identidade autodeclarada',40,'Uma pessoa afirma pertencer a mais de uma comunidade tradicional. Conforme a orientação da apostila, o agente deve:',
 ['Registrar a autodeclaração sem impor identidade única.','Escolher por aparência qual identidade aceitar.','Pedir comprovação familiar para uma das identidades.','Corrigir a declaração com base em opinião de terceiros.','Omitir a informação por não caber em uma identidade única.'],0,
 'O pertencimento é autodeclaratório e pode incluir múltiplas identidades. A orientação proíbe questionar, julgar ou tentar corrigir a declaração.',
 ['','A aparência não substitui a autodeclaração.','Comprovação familiar não é condição indicada.','Opinião de terceiros não prevalece sobre o informante.','A multiplicidade deve ser respeitada.']);
add('áreas de interesse operacional',41,'Uma Área de Interesse Operacional de povo ou comunidade tradicional atravessa parte de dois setores. O que a apostila afirma sobre esse recorte?',
 ['É independente da setorização e pode ser maior ou menor que um setor.','Coincide obrigatoriamente com um único setor.','Elimina os limites de todos os setores envolvidos.','Só existe em capitais.','Impede perguntas específicas no DMC.'],0,
 'AIO é recorte operacional independente dos setores; pode abranger parte de setor, vários setores ou até município inteiro.',
 ['','AIO não precisa coincidir com setor.','O recorte não apaga a setorização oficial.','Não há restrição a capitais.','Perguntas específicas podem aparecer no DMC.']);
add('endereçamento CNEFE',43,'Uma unidade rural não possui endereço formal. Segundo o padrão CNEFE descrito no material, o registro deve:',
 ['Usar referências localmente reconhecidas que permitam individualizar e localizar a unidade.','Inventar número oficial para preencher todos os campos.','Deixar a unidade sem identificação.','Registrar somente o nome do morador.','Substituir o endereço pelo código do município.'],0,
 'Na ausência de endereço formal, a orientação é usar referências reconhecidas localmente que individualizem e possibilitem localizar a unidade.',
 ['','Número inventado gera informação falsa.','A unidade precisa ser localizável.','Nome pessoal não substitui componentes do endereço e pode ferir sigilo.','Município sozinho não individualiza a unidade.']);
add('logradouro e localidade',44,'Em área rural, um acesso não tem nome oficial conhecido, mas moradores o identificam por um nome estável. Qual registro é prioritário nessa situação?',
 ['O nome localmente reconhecido, após buscar a forma oficial.','Uma expressão genérica como “estrada qualquer”.','O nome de um morador que vive perto.','Um nome criado pelo recenseador.','Apenas o CEP municipal.'],0,
 'Apostila prioriza denominação oficial; se inexistente ou não identificável, utiliza-se o nome localmente reconhecido para o logradouro.',
 ['','Termo genérico não identifica bem o lugar.','Nome de pessoa não deve ser usado para identificar unidade.','Nome inventado perde reconhecimento local.','CEP amplo não substitui logradouro.']);
add('componentes do endereço',46,'Duas unidades entram pelo mesmo número de uma estrada, uma na casa da frente e outra nos fundos. Qual componente do endereço ajuda a diferenciá-las?',
 ['Complemento.','CEP sozinho.','Latitude do município.','Tipo do setor.','Nome do entrevistador.'],0,
 'O complemento distingue unidades que compartilham o mesmo número no logradouro; “frente” e “fundos” são exemplos citados.',
 ['','CEP pode ser comum a várias unidades.','Coordenada municipal não individualiza as duas.','Tipo de setor não é componente que distingue entradas.','Nome do entrevistador não integra o endereço.']);
add('ponto de referência',47,'Um endereço rural não tem número nem complemento que permita localizá-lo no logradouro. Conforme o material, o ponto de referência:',
 ['É obrigatório e deve indicar elemento fixo e reconhecível.','É proibido em qualquer endereço rural.','Deve conter o nome completo de um morador.','Substitui automaticamente todos os outros componentes.','Pode ser um elemento temporário que desaparece no dia seguinte.'],0,
 'Nessa situação o ponto de referência é obrigatório; deve ajudar a localizar a unidade por elemento fixo e estável, sem identificar pessoas.',
 ['','O material destaca seu valor em áreas rurais.','Identificação pessoal fere o sigilo estatístico.','Complementa o endereço, não apaga os demais dados.','Elemento instável não ajuda a futura localização.']);
add('captura de coordenadas',49,'Numa área rural, o recenseador vai captar coordenadas de um estabelecimento com sede. Onde a apostila recomenda posicionar o DMC?',
 ['Na entrada da edificação que representa a sede, quando houver.','No centro geométrico do município.','Na residência do agente.','Em qualquer estrada distante.','No posto censitário antes da visita.'],0,
 'As coordenadas do endereço devem representar o ponto de acesso à unidade; havendo sede, o local ideal é a entrada da edificação correspondente.',
 ['','Centro municipal não localiza a unidade.','Posição do agente fora do local não representa o endereço.','Estrada distante pode deslocar o ponto.','O posto não corresponde ao acesso ao estabelecimento.']);
add('período de referência',51,'A apostila define data de referência em 31/12/2025 e período de referência de 01/01 a 31/12/2025. Um evento ocorrido em março de 2026 deve ser tratado como:',
 ['Evento dentro do período de 2025.','Evento posterior ao período; não deve ser confundido com acontecimentos de 2025.','Fato ocorrido na data de referência.','Evento automaticamente recenseável por acontecer antes da entrevista.','Dado que altera retroativamente 31/12/2025.'],1,
 'Março de 2026 está fora do período de 2025. A coleta precisa distinguir fatos do período e situação na data de referência da situação posterior.',
 ['Março de 2026 não integra o ano de 2025.','','A data de referência é 31/12/2025.','Data de entrevista não redefine o período.','Fato posterior não altera o passado.']);
add('subsistência',53,'Uma família consome a maior parte dos alimentos que produz e, ocasionalmente, troca uma pequena parte por outros produtos. Conforme a apostila, isso:',
 ['Pode continuar sendo produção de subsistência.','Deixa de ser subsistência por qualquer troca.','É necessariamente atividade industrial.','Prova que não existe exploração agropecuária.','Dispensa a abordagem inicial.'],0,
 'Na produção de subsistência, alimentos atendem necessidades vitais da família; venda ou troca eventual de parte da produção não exclui o conceito.',
 ['','Troca eventual é compatível com o conceito apresentado.','Produção de alimentos não se torna industrial pela troca.','A produção pode caracterizar unidade recenseável.','O enquadramento é feito pelo questionário de abordagem.']);
add('abordagem inicial',53,'Ao olhar pela cerca, o agente vê horta e árvores, mas não sabe se há produção de subsistência ou apenas lazer. Como deve classificar a unidade?',
 ['Por decisão visual imediata do agente.','Pelo questionário de abordagem inicial, após perguntar sobre a atividade.','Pelo tamanho da cerca.','Pela aparência da casa.','Automaticamente como não recenseável.'],1,
 'A aparência não basta para identificar a atividade. A apostila determina perguntar e usar o questionário de abordagem inicial para classificar.',
 ['A observação visual não resolve a finalidade da produção.','','A cerca não define recenseabilidade.','A casa não informa a finalidade produtiva.','A unidade pode produzir para subsistência.']);
add('estabelecimento agropecuário',55,'Uma produção agrícola para subsistência ocorre em área urbana de pequeno tamanho. Qual afirmação está de acordo com o conceito oficial?',
 ['A localização urbana impede o enquadramento.','O pequeno tamanho impede o enquadramento.','Pode ser estabelecimento, pois tamanho, localização e destino para subsistência não o excluem.','Somente venda formal permite recenseamento.','A forma jurídica da unidade deve ser empresarial.'],2,
 'O estabelecimento é definido pela unidade de produção ou exploração; não depende de tamanho, forma jurídica, localização rural ou venda.',
 ['O conceito abrange área urbana.','Não há tamanho mínimo no conceito citado.','','Subsistência é finalidade produtiva admitida.','Pessoa física também pode ser produtora.']);
add('aquicultura',56,'Um pesque-pague compra peixes já criados por terceiros e apenas oferece a pesca aos visitantes. Segundo o exemplo da apostila, esse local:',
 ['É estabelecimento aquícola por qualquer compra de peixe.','Não é enquadrado como estabelecimento agropecuário se não houver criação e engorda próprias.','É sempre classificado como lavoura temporária.','Deve ser recenseado pelo número de visitantes.','É produtor sem área obrigatoriamente.'],1,
 'O material considera pesque-pague estabelecimento quando há criação e engorda de peixes; somente comprar peixes criados não atende esse critério.',
 ['Compra não equivale à criação ou engorda.','','Não há cultivo vegetal descrito.','Visitantes não definem a atividade investigada.','Produtor sem área é situação diferente.']);
add('produtor sem área',57,'Uma pessoa instala colmeias em área de outro estabelecimento e produz mel sem possuir terreno próprio. A apostila orienta:',
 ['Ignorar a atividade por falta de propriedade.','Registrar a atividade e aplicar o questionário como produtor sem área.','Somar a produção obrigatoriamente ao dono da terra.','Entrevistar apenas o proprietário da área.','Classificar a atividade como não produtiva.'],1,
 'O produtor de mel com colmeias em área alheia é exemplo expresso de produtor sem área; a atividade deve ser registrada e investigada.',
 ['Propriedade da terra não é exigência desse caso.','','O produtor da atividade deve ser identificado.','O dono da terra não substitui automaticamente o produtor.','Produção de mel é atividade produtiva.']);
add('propriedade e estabelecimento',60,'Uma propriedade rural foi dividida em duas explorações independentes, conduzidas por produtores diferentes. Segundo a apostila, ela pode conter:',
 ['Exatamente um estabelecimento por possuir matrícula única.','Mais de um estabelecimento agropecuário.','Nenhum estabelecimento por haver dois produtores.','Somente um estabelecimento industrial.','Apenas produtores sem área.'],1,
 'Uma propriedade pode abrigar diferentes explorações sob produtores distintos; cada exploração pode corresponder a um estabelecimento.',
 ['Matrícula ou propriedade não define sozinha a unidade censitária.','','Duas explorações podem ser recenseáveis.','Nada indica atividade industrial.','Os produtores exploram partes da propriedade.']);
add('sede e setor',61,'Um estabelecimento contínuo ocupa áreas em dois setores, e sua sede está no setor A. Em qual setor ele será recenseado?',
 ['No setor A, onde está a sede.','No setor B, se for mais fácil acessar.','Nos dois, com questionário completo em cada.','Em setor escolhido pelo entrevistador.','Em nenhum até dividir a área.'],0,
 'Para estabelecimento que se estende por mais de um setor, a apostila determina recenseamento no setor em que se localiza a sede.',
 ['','Facilidade de acesso não define setor de recenseamento.','Duplicação gera contagem indevida.','A escolha é regulada pelo critério da sede.','Não é necessário dividir a exploração contínua.']);
add('ausência de sede',61,'Um estabelecimento ocupa dois setores censitários, mas não possui sede identificada. A maior parte de suas terras fica no setor B. O recenseamento ocorrerá:',
 ['No setor A por ordem alfabética.','No setor B, onde está a maior parte da área.','Em ambos, dividindo a produção.','Apenas no setor de residência do produtor.','Somente após nova divisão municipal.'],1,
 'Na ausência de sede, o critério indicado é o setor em que está localizada a maior parte das terras do estabelecimento.',
 ['Ordem alfabética não é critério.','','A unidade não deve ser duplicada por setor.','Residência fora da área não substitui esse critério.','Divisão municipal não é condição para a coleta.']);
add('áreas não contínuas',61,'Um produtor explora duas áreas separadas no mesmo município, com os mesmos trabalhadores e administração, mas utiliza conjuntos técnicos totalmente distintos. Para reuni-las em uma unidade, segundo a apostila:',
 ['Basta serem do mesmo produtor.','Basta estarem no mesmo município.','Todas as quatro condições devem ser atendidas; a diferença de recursos técnicos impede reuni-las.','A distância entre as áreas não importa e nenhuma condição é exigida.','A decisão depende somente do nome da fazenda.'],2,
 'A unidade exige simultaneamente mesmo município, recursos técnicos, pessoal e administração. Falta de uma condição separa os estabelecimentos.',
 ['Mesmo produtor não basta.','Município é apenas uma das condições.','','O material exige quatro condições simultâneas.','Nome da fazenda não substitui os critérios.']);
add('rios e estradas na área',62,'Uma estrada corta ao meio terras de uma exploração. Conforme a apostila, esse fato isolado:',
 ['Caracteriza obrigatoriamente áreas não contínuas.','Não caracteriza descontinuidade da área do estabelecimento.','Cria dois municípios.','Impede qualquer coleta agropecuária.','Transforma o estabelecimento em produtor sem área.'],1,
 'Rios, estradas ou ferrovias que cortam terras não caracterizam, por si, descontinuidade da área do estabelecimento.',
 ['O material diz expressamente o contrário.','','Estrada não cria divisão municipal.','A coleta pode prosseguir normalmente.','Há terras exploradas, diferentemente do exemplo de produtor sem área.']);
add('sucessão e partilha',65,'Um estabelecimento está em partilha, e os herdeiros concordam em mantê-lo como uma única exploração. Segundo o material, deve-se:',
 ['Recenseá-lo como uma unidade, obtendo informações do inventariante, representante ou condômino responsável.','Criar um questionário por herdeiro independentemente da exploração.','Omiti-lo até o fim da partilha.','Escolher o herdeiro mais velho como produtor.','Recensear apenas a área registrada no inventário.'],0,
 'Com consenso entre herdeiros, o material orienta um estabelecimento e indica quem pode prestar as informações.',
 ['','A separação só se aplica a situações como ocupação individual das partes.','Partilha em andamento não impede a coleta.','Idade não é critério de informante.','A unidade de exploração orienta o recenseamento.']);
add('litígio',65,'Há disputa judicial sobre uma exploração. Para identificar o produtor na data de referência, a apostila determina considerar:',
 ['Quem detinha o título mais antigo.','Quem era economicamente responsável pela exploração naquela data.','Quem compareceu primeiro ao posto.','Quem reside mais perto da sede.','O autor da ação judicial obrigatoriamente.'],1,
 'No litígio, o produtor é a pessoa que respondia economicamente pela exploração na data de referência, independentemente da posição processual.',
 ['Título antigo pode não indicar exploração atual.','','Ordem de comparecimento não é critério.','Proximidade residencial é irrelevante.','Ser autor da ação não prova responsabilidade econômica.']);
add('estabelecimento sem produção',65,'Um estabelecimento existente em 31/12/2025 perdeu a produção do ano por evento climático. Segundo o material, ele:',
 ['Não deve ser recenseado por ausência de colheita.','Deve ser recenseado e ter registrado o motivo da ausência de produção.','Só será recenseado se vender produtos em 2026.','Deve ser classificado como residência de lazer.','É necessariamente produtor sem área.'],1,
 'O material inclui estabelecimentos existentes na data de referência sem produção por razões climáticas e manda registrar o motivo em Observações do DMC.',
 ['Ausência de produção no período não exclui a unidade existente.','','Venda posterior não é requisito indicado.','Perda de produção não converte a exploração em lazer.','A unidade possui área no enunciado.']);
add('exploração comunitária',66,'Em uma área comunitária, as famílias trabalham juntas na mesma produção e dividem os resultados. Qual orientação de questionário consta da apostila?',
 ['Um questionário para a produção coletiva.','Um questionário para cada família, mesmo sem produção individual.','Nenhum questionário por ser área coletiva.','Um questionário para cada parcela municipal.','Somente cadastro de endereço sem produção.'],0,
 'Quando a produção é coletiva e dividida entre as famílias, a apostila determina preencher apenas um questionário.',
 ['','Questionários individuais aplicam-se à produção individualizada.','Exploração coletiva pode ser recenseável.','Parcela municipal não é o critério descrito.','A produção deve ser investigada.']);
if(q.length!==37)throw new Error(`Bloco técnico incompleto: ${q.length}`);
const file='content/ibge-2026/batches/batch-007c.json';fs.writeFileSync(file,JSON.stringify({batch:'batch-007c',status:'review',generatedBy:'curadoria nesta conversa',questions:q},null,2)+'\n');console.log(`Salvas ${q.length} questões em ${file}`);
