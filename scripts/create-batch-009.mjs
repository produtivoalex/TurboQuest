import fs from 'node:fs';

const EDITAL='https://servidor-arquivos.ibfc.org.br/arquivos-publicos/edital-01-2026-ibfc-11.06-final-marcadores.pdf';
const TEC='https://anexos.cdn.selecao.net.br/uploads/747/concursos/423/anexos/c3b6eba1-4aa5-4320-9af8-adc570bcc26c.pdf';
const MS='https://support.microsoft.com/pt-br/excel/get-started/overview-of-formulas-in-excel';
const MSCOUNT='https://support.microsoft.com/pt-br/excel/get-started/use-the-countif-function-in-microsoft-excel';
const CERT='https://cartilha.cert.br/';
const ENAP='https://repositorio.enap.gov.br/bitstream/1/5592/10/analista_adm_area_1.pdf';
const ALL=['aca','aci','aor','acr','acs'], MAN=['aor','acr','acs'], TECH=['acr','acs'];
const q=[];
function add(subject,topic,roles,statement,options,answer,explanation,url=EDITAL,locator='Anexo IV'){
  q.push({id:`ibge26-b009-${String(q.length+1).padStart(3,'0')}`,roles,subject,topic,difficulty:'hard',statement,options,answer,explanation,
    whyWrong:options.map((option,i)=>i===answer?`Correta. ${explanation}`:`A alternativa “${option}” não resolve o caso. ${explanation}`),
    sources:[{title:url===TEC?'Conhecimentos básicos para o 12º Censo Agropecuário, Florestal e Aquícola':url===EDITAL?'Edital nº 01/2026 — conteúdo programático':url===CERT?'Cartilha de Segurança para Internet — CERT.br':url===ENAP?'Administração geral — ENAP':'Documentação oficial Microsoft',locator,url}],status:'review'});
}
const technical=(topic,page,statement,options,answer,explanation)=>add('Conhecimentos Técnicos',topic,TECH,statement,options,answer,explanation,TEC,`p. ${page}`);

// 26 itens técnicos: cada situação foi confrontada com a página indicada da apostila.
technical('limites do setor',20,'Um recenseador encontra no mapa uma estrada que parece marcar o setor, mas o descritivo situa o limite em um córrego paralelo. Qual instrumento deve usar para confirmar o contorno antes de entrar na área?',
 ['Somente a imagem do mapa, pois prevalece sobre qualquer texto','O descritivo, confrontado com o mapa e as referências em campo','A opinião de um morador, mesmo contrariando os documentos','A divisão municipal, ignorando o limite setorial','A rota mais curta, ainda que ultrapasse o perímetro'],1,
 'O descritivo define textualmente todo o contorno e complementa o mapa. A aparente divergência exige confronto com referências de campo e, se persistir, comunicação à supervisão; não autoriza redefinir o setor.');
technical('setores excluídos',30,'O mapa de um setor rural mostra um pequeno setor urbano totalmente contido nele, identificado como “setor a ser excluído”. Há hortas nesse núcleo. Como o recenseador do setor rural deve proceder?',
 ['Coletar o núcleo porque ele tem hortas','Coletar apenas as hortas e deixar os demais endereços','Não coletar no núcleo excluído; ele cabe ao responsável pelo outro setor','Incorporar o núcleo ao seu setor após avisar o morador','Eliminar o núcleo do mapa para simplificar o percurso'],2,
 'O item de exclusão indica território que, embora esteja dentro do perímetro externo, pertence a outro setor de coleta. A existência de produção não transfere a responsabilidade ao recenseador do setor envolvente.');
technical('alteração de limites',30,'Em campo, uma porteira foi deslocada e o recenseador suspeita que o limite indicado no descritivo esteja difícil de reconhecer. Qual decisão respeita o procedimento da apostila?',
 ['Redesenhar o setor no DMC antes de entrevistar','Pedir ao produtor que escolha a divisa mais conveniente','Comunicar a dificuldade à supervisão e não alterar o perímetro por conta própria','Cobrir também o setor vizinho para evitar omissão','Desconsiderar o descritivo e seguir a cerca atual'],2,
 'A apostila determina comunicar imediatamente inconsistências à supervisão e proíbe o recenseador de alterar o perímetro. Uma cerca nova pode não coincidir com o limite censitário definido.');
technical('mapa e descritivo',23,'Uma estrada rural tem duas entradas para a mesma localidade. Antes de iniciar as visitas, qual uso combinado do mapa e do descritivo reduz omissões sem invadir outro setor?',
 ['Planejar o percurso com o mapa e verificar pelo descritivo onde cada entrada cruza o limite','Usar só a entrada mais próxima, presumindo que as duas pertencem ao setor','Percorrer toda a localidade, mesmo além do contorno descrito','Substituir o descritivo por coordenadas obtidas de um morador','Alterar o contorno para incluir as duas entradas'],0,
 'O mapa orienta deslocamento e referências visuais; o descritivo confirma o perímetro. As entradas podem cruzar setores diferentes, de modo que proximidade não basta para definir responsabilidade.');
technical('CNEFE e endereço formal',43,'Uma propriedade possui placa com logradouro oficial e também um apelido usado por vizinhos. Ao registrar o endereço no padrão CNEFE, qual informação deve receber prioridade?',
 ['O apelido, mesmo quando o nome oficial é conhecido','O logradouro formal; a referência local pode complementar a localização','Apenas coordenadas, dispensando o endereço escrito','O nome do proprietário no campo logradouro','Uma abreviação criada pelo recenseador'],1,
 'O padrão prioriza o endereço formal e usa referências localmente reconhecidas quando aquele falta ou não basta. O nome do proprietário não substitui componente de endereço nem é livre para registro.');
technical('logradouro rural',44,'Uma via de acesso rural não tem nome oficial identificável, mas todos a conhecem por “Estrada do Cedro”. Segundo a apostila, qual registro é preferível para o logradouro?',
 ['O nome localmente reconhecido, sem abreviação desnecessária','O número da propriedade vizinha como logradouro','A expressão genérica “zona rural” no lugar do nome','Um nome inventado para padronizar a planilha','O CEP sem qualquer referência à via'],0,
 'Na falta do nome oficial, a orientação é usar prioritariamente a denominação localmente reconhecida. “Zona rural” não individualiza o logradouro, e CEP não substitui esse componente.');
technical('localidade',44,'Dois endereços ficam na área rural de um município, mas um está no Assentamento Aurora e outro na Comunidade Lagoa. Que registro de localidade melhor permite distingui-los?',
 ['“Zona rural” para ambos, pois o município é o mesmo','O nome específico de cada assentamento ou comunidade','Somente a sigla do estado','A distância até a capital, sem nome local','O nome do entrevistado em vez da localidade'],1,
 'Localidade é o nome pelo qual o lugar é conhecido; assentamentos e comunidades são exemplos expressos. A indicação genérica “zona rural” perde a distinção necessária entre os dois endereços.');
technical('modificador e complemento',46,'Em um logradouro existem os números 12 e 12A; dentro do imóvel 12A há Casa 1 e Casa 2. Qual par de componentes diferencia, respectivamente, 12A e as duas casas?',
 ['Complemento e CEP','Modificador e complemento','Ponto de referência e localidade','Localidade e modificador','CEP e ponto de referência'],1,
 'A letra A modifica a numeração 12, por isso é modificador. “Casa 1” e “Casa 2” distinguem unidades com o mesmo número e modificador, funcionando como complementos.');
technical('ponto de referência',47,'Uma construção rural não possui número nem complemento que permita localizá-la no logradouro. Há uma ponte fixa próxima. Qual registro é exigido para facilitar sua localização?',
 ['Um ponto de referência descritivo, como “primeira casa após a ponte”','O nome completo do morador como referência pública','Um número fictício escolhido pela equipe','O CEP de qualquer povoado vizinho','A omissão do endereço por falta de numeração'],0,
 'Sem número ou complemento localizador, a apostila torna obrigatório o ponto de referência. Ele deve usar marco fixo e estável; identificar a pessoa no endereço viola a orientação de sigilo.');
technical('sigilo no endereço',47,'Um agente sugere registrar “casa da senhora Maria Silva” como ponto de referência, porque todos a conhecem. Qual objeção decorre diretamente da apostila?',
 ['Pontos de referência nunca podem conter palavras','Componentes do endereço não podem identificar pessoas','Toda referência verbal precisa ser substituída por latitude','O nome de pessoa só seria proibido se houvesse número','A unidade não pode ser recenseada por falta de placa'],1,
 'O material veda identificar pessoas nos componentes do endereço para preservar o sigilo estatístico. Um marco físico estável pode orientar a localização sem expor a identidade da moradora.');
technical('coordenadas geográficas',48,'Um ponto foi registrado com latitude sul e longitude oeste. Qual interpretação dos dois valores corresponde às definições apresentadas na apostila?',
 ['Latitude mede afastamento do Equador; longitude, de Greenwich','Latitude mede afastamento de Greenwich; longitude, do Equador','Ambas medem distância ao centro do município','Latitude indica altitude; longitude, declividade','Ambas representam o CEP do endereço'],0,
 'Latitude é afastamento angular em relação ao Equador, e longitude em relação ao meridiano de Greenwich. Sul e oeste indicam os hemisférios correspondentes, não altitude ou endereço postal.');
technical('abordagem inicial',53,'Ao passar por um sítio, o recenseador vê uma pequena horta, mas não sabe se a produção é de lazer ou de subsistência. Qual procedimento deve definir a recenseabilidade?',
 ['Classificar pela aparência observada do lado de fora','Perguntar sobre a atividade e aplicar o questionário de abordagem inicial','Registrar automaticamente um estabelecimento por haver horta','Excluir automaticamente por ser uma horta pequena','Usar apenas o valor de mercado estimado da terra'],1,
 'A aparência não revela finalidade da produção. A apostila exige abordagem e classificação pelo questionário inicial; tamanho da horta ou suposição pessoal não substitui as respostas do informante.');
technical('produção de subsistência',53,'Uma família depende majoritariamente do alimento que produz e ocasionalmente troca parte da colheita por outros bens. Essa troca eventual descaracteriza a produção de subsistência?',
 ['Sim, qualquer troca transforma a finalidade em comércio integral','Não; a dependência alimentar predominante é compatível com troca eventual','Sim, salvo se houver emissão de nota fiscal','Não, mas a unidade deixa de ser recenseável','A resposta depende apenas da área em hectares'],1,
 'A apostila admite venda ou troca eventual de parte da produção para outras necessidades familiares. O ponto decisivo é a dependência total ou majoritária da atividade para atender necessidades vitais.');
technical('lazer versus produção',53,'Uma propriedade tem árvores frutíferas usadas apenas para passatempo dos moradores. Em outra, a colheita sustenta a alimentação da família. Qual diferença fundamenta a investigação censitária?',
 ['Somente a existência de árvores em área rural','A finalidade de subsistência na segunda situação, apurada na abordagem','O fato de a primeira ter menos árvores, mesmo sem informação','A presença de moradia em ambas','A distância de cada propriedade ao posto de coleta'],1,
 'O material distingue lazer ou deleite de produção para venda ou subsistência. A finalidade deve ser verificada pela abordagem, não inferida do número de árvores ou da localização.');
technical('conceito de estabelecimento',55,'Uma empresa cultiva hortaliças numa área urbana pequena para venda. Qual característica poderia, por si só, afastar a classificação como estabelecimento agropecuário?',
 ['Ser empresa em vez de pessoa física','Estar em área urbana','Ter área pequena','Nenhuma das três; importa a unidade produtiva e sua finalidade','Vender parte da produção'],3,
 'O conceito independe de tamanho, forma jurídica, localização urbana ou rural e valor da produção. A exploração de hortaliças para venda atende à finalidade produtiva descrita.');
technical('lavoura temporária',55,'O produtor colhe milho e precisa semear novamente para uma nova safra; em outra área, laranjeiras permanecem produzindo por vários anos. Como classificar as duas culturas?',
 ['Milho permanente e laranja temporária','Ambas permanentes por ocuparem solo agrícola','Milho temporária e laranja permanente','Ambas temporárias porque têm colheita anual','A classificação depende apenas da venda'],2,
 'Lavoura temporária exige novo plantio após o ciclo de colheita, como o milho. A laranjeira permanece no solo e produz ao longo de anos, caracterizando lavoura permanente.');
technical('aquicultura',56,'Um pesque-pague compra peixes já criados e apenas os mantém até a pesca, sem criação nem engorda. Outro cria e engorda seus peixes. Qual deles se enquadra na regra específica da apostila?',
 ['Ambos, por cobrarem ingresso','Somente o segundo, que cria e engorda peixes','Somente o primeiro, por comprar peixes de terceiros','Nenhum, porque pesque-pague nunca é investigado','Ambos apenas se estiverem em área urbana'],1,
 'O pesque-pague é estabelecimento agropecuário quando há criação e engorda de peixes. A mera compra de peixes já criados, sem essas atividades, não basta pela regra expressa.');
technical('produtor sem área',57,'Um apicultor instala colmeias temporariamente em terras de terceiros e produz mel sob sua própria condução. Por não possuir área delimitada, sua produção deve ser tratada como:',
 ['Atividade a ignorar por falta de título de propriedade','Caso possível de produtor sem área, sujeito a registro e questionário','Produção industrial obrigatoriamente','Parte automática da produção do proprietário da terra','Unidade não recenseável por ser temporária'],1,
 'A apostila cita expressamente o produtor de mel com colmeias em áreas alheias como exemplo de produtor sem área. A falta de domínio da terra não elimina a atividade produtiva.');
technical('arrendatário sem área na referência',58,'Durante o período de referência, Jorge explorou terra arrendada; na data de referência já não a ocupava. Se ele for localizado, como registrar os dados daquela produção?',
 ['Excluir a produção por ausência atual da área','Atribuir integralmente a produção ao proprietário que arrendou','Entrevistar Jorge e assinalar a condição de produtor sem área no quadro próprio','Somar a produção a qualquer estabelecimento vizinho','Aguardar que Jorge volte a ocupar a terra'],2,
 'O exemplo da apostila determina coletar de Jorge a produção do período e marcar o quadro de produtor sem área. A posse na data de referência não autoriza transferir sua produção ao proprietário.');
technical('atividade industrial',59,'Uma indústria mantém criação de animais e uma fábrica de alimentos no mesmo complexo. Na investigação agropecuária, qual parte entra no questionário desse censo?',
 ['Toda a produção e folha salarial da indústria','Somente a atividade diretamente agropecuária, florestal ou aquícola','Apenas a fabricação de alimentos','Nenhuma atividade de empresa industrial','Somente trabalhadores administrativos da fábrica'],1,
 'A apostila separa a exploração agropecuária da atividade industrial. Produção, vendas e pessoal industrial pertencem a outras pesquisas; o censo investiga a parte diretamente agropecuária.');
technical('boitel',59,'Um confinamento recebe apenas gado de terceiros e não possui animais próprios nem outra atividade agropecuária. Pela regra específica do material, como enquadrar essa unidade?',
 ['Estabelecimento agropecuário pelo simples serviço de confinamento','Não como estabelecimento nessa situação; os animais pertencem aos estabelecimentos dos donos','Estabelecimento com todo o gado atribuído ao confinador','Estabelecimento apenas se houver mais de cem animais','Unidade aquícola por utilizar água na alimentação'],1,
 'O boitel só é estabelecimento se tiver animais próprios ou desenvolver outra atividade agropecuária. O gado de terceiros deve ser contado nos estabelecimentos de seus respectivos proprietários.');
technical('propriedade e estabelecimento',60,'Em uma fazenda, dois produtores exploram parcelas distintas com administrações independentes. O proprietário afirma que a matrícula imobiliária é única. Qual raciocínio censitário é adequado?',
 ['Matrícula única obriga questionário único','Cada exploração independente pode constituir estabelecimento distinto','Nenhuma parcela pode ser investigada sem divisão cartorial','Só a parcela maior pode ser estabelecimento','As duas parcelas devem ser somadas ao setor vizinho'],1,
 'Propriedade rural e estabelecimento não são equivalentes. A unidade censitária segue a exploração produtiva; uma propriedade pode conter mais de um estabelecimento sob produtores diferentes.');
technical('sede e setor',61,'Uma exploração contínua atravessa dois setores, e a sede administrativa fica no setor B, embora a maior parte da terra esteja no setor A. Onde recensear o estabelecimento?',
 ['No setor A, por ter maior área','No setor B, onde se localiza a sede','Metade em cada setor','No setor do endereço residencial do recenseador','Em ambos, duplicando produção'],1,
 'Para estabelecimento em mais de um setor, a sede situada na área do estabelecimento determina o setor do recenseamento. A maior parte da terra só decide quando não existe sede.');
technical('áreas não contínuas',61,'Duas áreas separadas ficam no mesmo município e sob um produtor; compartilham máquinas e administração, mas usam equipes de trabalhadores independentes. Podem ser um estabelecimento único?',
 ['Sim, basta um produtor comum','Sim, porque máquinas e município coincidem','Não, pois falta a condição de utilizar os mesmos recursos humanos','Não, apenas porque não se tocam','Sim, desde que a produção total seja somada'],2,
 'As quatro condições para agregar áreas não contínuas são simultâneas: município, recursos técnicos, recursos humanos e administração. A ausência de equipe compartilhada impede tratá-las como uma unidade.');
technical('continuidade territorial',62,'Uma estrada atravessa uma área produtiva sob administração única. O recenseador propõe dividi-la em dois estabelecimentos apenas porque há asfalto entre as partes. A proposta procede?',
 ['Sim, toda estrada cria descontinuidade censitária','Não; via que corta as terras não caracteriza, por si, descontinuidade','Sim, mas somente se a estrada for estadual','Não, porque nenhum estabelecimento pode ter estrada','Depende exclusivamente do comprimento da estrada'],1,
 'A apostila afirma expressamente que rios, estradas e ferrovias cortando terras não caracterizam descontinuidade. A divisão exigiria outro fundamento ligado à unidade de exploração.');
technical('exploração comunitária',66,'Numa área comunitária, três famílias trabalham juntas na mesma produção e a dividem entre si; em outra, cada família decide separadamente o que produzir. Quantos questionários aplicar em cada caso?',
 ['Três no primeiro e um no segundo','Um no primeiro e um para cada família no segundo','Um em ambos, porque a terra é coletiva','Um por pessoa em ambos','Nenhum, porque são comunidades tradicionais'],1,
 'Na produção coletiva conjunta, a apostila prevê um questionário. Quando decisões e destino da produção são individuais, a coleta acompanha cada família, mesmo com uso comunitário da área.');

const logic=(topic,statement,options,answer,explanation)=>add('Raciocínio Lógico Quantitativo',topic,ALL,statement,options,answer,explanation,EDITAL,'Anexo IV — Raciocínio Lógico Quantitativo');
// 20 problemas: números e premissas próprios, resolução explícita e alternativas próximas.
logic('porcentagens sucessivas','Uma equipe elevou a produção de 80 para 100 registros em uma semana e, na seguinte, caiu para 80. Quais foram, respectivamente, a alta e a queda percentuais sobre as bases de cada semana?',
 ['20% e 20%','25% e 25%','25% e 20%','20% e 25%','20 pontos percentuais e 25 pontos percentuais'],2,
 'A primeira variação é 20/80 = 25%; a segunda é 20/100 = 20%. As bases mudam entre as semanas, por isso percentuais iguais não descrevem ida e volta.');
logic('regra de três composta','Quatro agentes concluem 96 cadastros em três dias, no mesmo ritmo individual. Com seis agentes durante cinco dias, quantos cadastros seriam concluídos se esse ritmo permanecer?',
 ['180','200','220','240','300'],3,
 'São 96/(4×3) = 8 cadastros por agente-dia. Seis agentes por cinco dias fornecem 30 agentes-dia; 30×8 = 240 cadastros. O mesmo ritmo por pessoa é a hipótese que permite a proporção.');
logic('inclusão-exclusão','Em 72 estudantes, 41 acertaram Português, 38 acertaram Lógica e 19 acertaram ambas. Quantos acertaram exatamente uma das duas disciplinas?',
 ['36','41','42','60','79'],1,
 'Exatamente uma é (41−19)+(38−19)=22+19=41. O total 60 representa quem acertou ao menos uma, pois subtrai a interseção apenas uma vez.');
logic('probabilidade sem reposição','Uma caixa tem três cartões A e dois cartões B. Retiram-se dois sem reposição. Qual a probabilidade de ambos serem A?',
 ['3/10','9/25','3/5','2/5','6/25'],0,
 'A primeira chance de A é 3/5 e, após retirá-lo, a segunda é 2/4. O produto 3/5×2/4 = 3/10; 9/25 trataria as retiradas como independentes.');
logic('média ponderada','Uma prova tem 20 itens de peso 1 e 10 itens de peso 2. Uma candidata acertou 15 dos primeiros e 6 dos segundos. Qual fração dos pontos possíveis ela obteve?',
 ['21/30','27/30','21/40','27/40','33/40'],3,
 'Os acertos rendem 15×1+6×2=27 pontos. A prova vale 20×1+10×2=40; logo a fração é 27/40. Contar apenas itens ignora o peso.');
logic('mediana','Os tempos, em minutos, de seis atendimentos foram 9, 11, 12, 17, 18 e 40. Qual é a mediana e qual informação torna a média potencialmente menos representativa?',
 ['12; o tempo 40','14,5; o tempo 40','17; a quantidade par de valores','17,83; o tempo 9','14,5; a ausência de valores repetidos'],1,
 'Com seis valores ordenados, a mediana é a média dos dois centrais: (12+17)/2=14,5. O 40 é extremo e puxa a média aritmética para cima.');
logic('razão','Dois postos produziram registros na razão 3:5, totalizando 144. Quantos registros fez o posto de maior produção?',
 ['54','72','81','90','120'],3,
 'As oito partes da razão somam 144, então cada parte vale 18. O posto maior tem cinco partes: 5×18 = 90; 54 corresponde ao posto menor.');
logic('equação do primeiro grau','Após concluir 18 visitas, uma equipe ainda precisa fazer o dobro desse número menos 6 para encerrar a meta. Qual é a meta total de visitas?',
 ['30','36','42','48','54'],3,
 'Restam 2×18−6=30 visitas. Somando as 18 já realizadas, a meta total é 48. O valor 30 é somente o saldo pendente e não inclui o trabalho concluído.');
logic('sequência de diferenças','Uma série de atendimentos semanais foi 4, 7, 13, 22, 34. Se os acréscimos continuam crescendo de três em três, qual será o próximo termo?',
 ['43','46','49','52','55'],2,
 'As diferenças são 3, 6, 9 e 12. A próxima diferença é 15, logo 34+15=49. Somar novamente 12 confundiria o padrão de diferenças crescentes.');
logic('negação de quantificador','Qual é a negação exata de “Algum formulário está incompleto”, sem afirmar mais do que o necessário?',
 ['Algum formulário está completo','Todos os formulários estão completos','A maioria está completa','Exatamente um está completo','Nenhum formulário foi recebido'],1,
 '“Algum incompleto” significa existência de ao menos um caso. Negá-la exige que nenhum esteja incompleto, equivalente a todos estarem completos no conjunto considerado.');
logic('condicional e contrapositiva','Admita como verdadeira a regra “Se o prazo foi prorrogado, então houve aviso oficial”. Qual situação, se observada, refutaria diretamente essa regra?',
 ['Prazo prorrogado e aviso oficial presente','Prazo não prorrogado e aviso presente','Prazo não prorrogado e aviso ausente','Prazo prorrogado e aviso ausente','Aviso presente, sem informação sobre o prazo'],3,
 'Uma condicional P→Q só é falsa quando P ocorre e Q não ocorre. Aviso sem prorrogação não a refuta, pois a regra não afirma que todo aviso implique prorrogação.');
logic('conjunção e disjunção','Uma inscrição é aceita quando há documento e pagamento, ou quando há isenção deferida. Sem isenção, com documento e sem pagamento, a condição de aceitação é verdadeira?',
 ['Sim, porque documento isolado basta','Sim, porque a isenção é opcional','Não, porque falta pagamento e não há isenção deferida','Não, porque documento e pagamento nunca podem ocorrer juntos','Depende somente do número da inscrição'],2,
 'A expressão é (documento ∧ pagamento) ∨ isenção. Sem pagamento, a primeira parcela é falsa; sem isenção, a segunda também.');
logic('escala cartográfica','Em um mapa de escala 1:50.000, dois pontos estão separados por 3 cm em linha reta. Qual é a distância correspondente no terreno?',
 ['150 m','500 m','1,5 km','15 km','150 km'],2,
 'Um centímetro no mapa corresponde a 50.000 cm, ou 500 m, no terreno. Três centímetros equivalem a 1.500 m = 1,5 km. É indispensável converter centímetros para quilômetros.');
logic('velocidade média','Um veículo percorre 60 km a 30 km/h e depois 60 km a 60 km/h, sem paradas. Qual a velocidade média em todo o percurso?',
 ['40 km/h','45 km/h','50 km/h','60 km/h','90 km/h'],0,
 'O primeiro trecho leva 2 h e o segundo, 1 h. São 120 km em 3 h, portanto 40 km/h. A média simples 45 km/h ignora os tempos diferentes.');
logic('juros simples','Um capital de R$ 2.400 rende 1,5% ao mês, a juros simples, por quatro meses. Sem encargos, qual é o valor acumulado de juros?',
 ['R$ 36','R$ 72','R$ 120','R$ 144','R$ 154'],3,
 'A taxa mensal gera 2.400×0,015 = R$ 36 sobre o capital inicial. Em quatro meses de juros simples, o total é 4×36 = R$ 144.');
logic('análise combinatória','Cinco relatórios diferentes serão ordenados em uma fila. Dois relatórios específicos devem ficar lado a lado, em qualquer ordem. Quantas ordenações atendem à condição?',
 ['24','36','48','60','120'],2,
 'Trate o par como um bloco: há 4! = 24 posições relativas entre o bloco e os outros três relatórios. Dentro do bloco, há 2 ordens; 24×2=48.');
logic('frações de um total','Uma unidade concluiu 2/3 das visitas pela manhã e 1/4 do total à tarde. Se ainda faltam 10 visitas, quantas estavam planejadas ao todo?',
 ['60','80','100','120','240'],3,
 'As partes feitas somam 2/3+1/4=11/12; resta 1/12 do total. Se 1/12 corresponde a 10 visitas, o total é 120. As frações da manhã e da tarde usam a mesma meta como base.');
logic('razões sucessivas','A razão entre registros válidos e inválidos é 9:1. Após conferir 20 registros, essa razão se mantém. Quantos registros válidos há nesse conjunto?',
 ['2','9','16','18','19'],3,
 'A razão contém dez partes; 20 registros representam duas unidades por parte. Os válidos ocupam nove partes, totalizando 18, e os inválidos, 2.');
logic('probabilidade de complemento','Uma urna contém quatro cartões vermelhos e seis azuis. Em duas retiradas com reposição, qual a probabilidade de aparecer ao menos um vermelho?',
 ['4/10','16/100','36/100','64/100','84/100'],3,
 'É mais simples subtrair o evento de duas retiradas azuis: 1−(6/10)² = 1−36/100 = 64/100. A reposição preserva 6/10 na segunda retirada.');
logic('sistema de equações','Dois postos registraram juntos 78 atendimentos; o primeiro fez 12 a mais que o segundo. Quantos fez o primeiro posto?',
 ['33','39','42','45','66'],3,
 'Se o segundo fez x, o primeiro fez x+12. Então 2x+12=78, logo x=33 e o primeiro fez 45. O valor 33 corresponde ao segundo posto.');

const informatics=(topic,statement,options,answer,explanation,url=MS)=>add('Noções de Informática',topic,['aci'],statement,options,answer,explanation,url,topic);
// 18 itens de Informática: operações verificáveis e segurança aplicada.
informatics('referências mistas','Uma fórmula em C3 é =$A3+B$2. Após copiá-la uma coluna à direita e duas linhas abaixo, qual fórmula aparece em D5?',
 ['=$A5+C$2','=A5+C4','=$B5+C$2','=$A3+C$4','=$A5+B$2'],0,
 'Em $A3, a coluna A fica fixa e a linha avança duas posições, tornando-se $A5. Em B$2, a linha 2 fica fixa e a coluna avança para C.');
informatics('CONT.SE','A coluna B contém 3, 5, 5, 8 e 10. A fórmula =CONT.SE(B1:B5;">=5") retorna qual valor?',
 ['2','3','4','5','31'],2,
 'O critério >=5 inclui os dois valores 5, o 8 e o 10: quatro células. O valor 31 é a soma dos números e não a contagem de células.',MSCOUNT);
informatics('CONT.SE com texto','Em A1:A5 há “Norte”, “Sul”, “Norte”, “Leste” e “Norte”. Qual fórmula conta apenas as três ocorrências exatas de “Norte”?',
 ['=SOMA(A1:A5;"Norte")','=CONT.SE(A1:A5;"Norte")','=MÉDIA(A1:A5)','=CONT.SE(A1:A5;"Sul")','=CONT.VALORES(A1:A5;"Norte")'],1,
 'CONT.SE compara cada célula com o critério textual indicado e retorna três. CONT.VALORES conta células não vazias, sem aplicar esse critério, enquanto SOMA e MÉDIA não fazem a contagem pedida.',MSCOUNT);
informatics('MÉDIA e células vazias','Uma coluna tem os valores 10, célula vazia, 20 e 30. Ao calcular =MÉDIA(A1:A4), que resultado se espera na planilha?',
 ['15','20','22,5','30','60'],1,
 'MÉDIA considera as três células numéricas e ignora a vazia: (10+20+30)/3=20. Dividir por quatro produziria 15, mas trataria a célula vazia como zero.',MS);
informatics('filtro de dados','Uma tabela com 300 linhas foi filtrada para exibir apenas um município. O total de registros visíveis cai para 40. Qual operação recupera a visualização dos 300 sem restaurar backup?',
 ['Remover o filtro aplicado','Desfazer a exclusão definitiva das outras 260 linhas','Alterar os 40 valores para outro município','Ordenar somente a coluna de nomes','Copiar o cabeçalho para outra planilha'],0,
 'Filtrar altera a exibição, não apaga as outras 260 linhas. Limpar o filtro volta a mostrá-las; ordenar é uma operação diferente e não remove o critério de ocultação.');
informatics('classificação de tabela','Uma tabela associa cada servidor ao respectivo número de visitas. Para ordenar por visitas sem trocar as associações, o que deve ser mantido junto durante a classificação?',
 ['Somente as células da coluna numérica','Cada linha completa como um registro','Somente o cabeçalho','A posição original de cada número isoladamente','A cor da coluna de nomes'],1,
 'A linha contém o par servidor–produção. Classificar a tabela inteira move cada linha como unidade; ordenar só os números quebraria a correspondência.');
informatics('CSV e planilha','Um relatório com duas abas, fórmulas e formatação deve ser entregue de modo editável e preservando esses recursos. Por que exportá-lo apenas como CSV é inadequado?',
 ['CSV obriga que os números sejam inteiros','CSV não preserva necessariamente múltiplas abas, fórmulas e formatação da pasta','CSV impede qualquer leitura em planilhas','CSV só pode conter imagens','CSV gera automaticamente um PDF protegido'],1,
 'CSV representa dados tabulares em texto, geralmente uma tabela por arquivo. Recursos de pasta de trabalho, como várias abas e formatação, exigem formato apropriado de planilha.');
informatics('referências absolutas','A célula F1 contém uma taxa que deve ser usada ao copiar uma fórmula por várias linhas e colunas. Qual referência a mantém fixa nas duas direções?',
 ['F1','$F1','F$1','$F$1','F:F'],3,
 'O símbolo $ antes da coluna F e da linha 1 fixa ambas as coordenadas. $F1 fixa só a coluna; F$1 fixa só a linha, e F1 não fixa nenhuma.',MS);
informatics('backup e sincronização','Um arquivo sincronizado é apagado por engano num notebook, e a exclusão aparece no celular. Qual recurso permitiria recuperação mesmo depois dessa propagação?',
 ['Somente a sincronização ativa','Uma versão anterior ou backup independente recuperável','Aumento da velocidade da internet','Renomeação da pasta vazia','A exclusão do aplicativo no celular'],1,
 'Sincronização replica mudanças, inclusive exclusões. Histórico de versões ou backup separado preserva um estado anterior que pode ser restaurado sem depender da cópia atual.', 'https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf');
informatics('phishing','Uma mensagem traz o nome correto do órgão e um link para “confirmar senha”, mas o domínio do endereço difere do oficial por uma letra. Qual indício tem maior peso na decisão de não usar o link?',
 ['O fato de a mensagem ter sido enviada pela manhã','A divergência no domínio e o pedido de credencial','O uso de português formal','A presença de assinatura do remetente','A existência de um prazo no edital'],1,
 'Nome e aparência podem ser copiados. Domínio semelhante, mas diferente, combinado com solicitação de senha é sinal de fraude; a confirmação deve ser feita por canal oficial independente.',CERT);
informatics('autenticação adicional','Uma conta usa senha e aplicativo autenticador. O usuário perdeu o telefone, mas guardou códigos de recuperação em local seguro. Qual uso desses códigos é compatível com a segurança?',
 ['Publicá-los para que a equipe ajude no acesso','Usá-los no processo oficial de recuperação e substituí-los se expostos','Enviá-los ao primeiro e-mail que ofereça suporte','Dispensar a senha para sempre','Compartilhá-los com colegas de turno'],1,
 'Códigos de recuperação são credenciais de reserva para acesso legítimo quando o segundo fator falha. Devem permanecer secretos e ser renovados se houver suspeita de exposição.','https://cartilha.cert.br/fasciculos/autenticacao/fasciculo-autenticacao.pdf');
informatics('menor privilégio','Um revisor precisa consultar documentos durante uma semana, sem alterá-los. Qual permissão atende à tarefa com menor exposição?',
 ['Leitura temporária na pasta necessária','Administração permanente de toda a rede','Edição permanente da pasta inteira','Uso da conta pessoal do gestor','Exclusão temporária dos documentos'],0,
 'Acesso de leitura no escopo e período necessários permite conferir os arquivos. Permissões de edição, exclusão ou administração excedem a função e ampliam o impacto de erro ou abuso.',CERT);
informatics('DNS','Um navegador abre um serviço pelo endereço IP, mas não pelo nome de domínio correspondente. Qual componente é candidato mais direto à investigação inicial?',
 ['Resolução de nomes DNS','Memória RAM da planilha','Teclado numérico','Brilho do monitor','Formato do arquivo CSV'],0,
 'O acesso por IP indica que há um caminho de rede funcional; falha só no nome aponta para resolução DNS ou configuração associada, não comprova defeito físico do computador.');
informatics('HTTPS','Um site apresenta conexão HTTPS válida. Qual conclusão é prudente antes de inserir credenciais?',
 ['HTTPS prova que o site pertence ao órgão esperado','HTTPS protege o transporte, mas o domínio e a legitimidade do site ainda devem ser verificados','HTTPS torna impossível qualquer fraude','HTTPS dispensa autenticação adicional','HTTPS garante que o conteúdo esteja atualizado'],1,
 'HTTPS cifra a conexão com o domínio acessado; um fraudador também pode obter certificado para domínio parecido. É necessário conferir o endereço e a procedência do serviço.',CERT);
informatics('navegação privada','Após usar janela anônima em computador compartilhado, um estudante acredita que ninguém no serviço remoto registrará seu acesso. Qual correção é adequada?',
 ['A janela anônima elimina todos os registros de rede','Ela reduz dados locais persistidos no navegador, mas não torna o acesso invisível ao serviço ou à rede','Ela dispensa sair da conta','Ela apaga arquivos baixados automaticamente','Ela impede captura de senhas por páginas falsas'],1,
 'O modo privado limita principalmente histórico e cookies armazenados após a sessão local. Sites e infraestrutura de rede ainda podem observar a conexão; não é ferramenta de anonimato integral.',CERT);
informatics('cópia oculta','Um aviso será enviado a 40 destinatários externos que não devem receber a lista de endereços uns dos outros. Qual campo deve conter esses endereços?',
 ['Para','Cc','Cco','Assunto','Responder a'],2,
 'Cco oculta os destinatários entre si na mensagem entregue. Para e Cc exibem a lista de endereços e expõem dados de contato sem necessidade operacional.');
informatics('controle de versões','Duas pessoas editaram cópias locais distintas de um documento e agora há divergências. Qual prática reduz o risco de sobrescrever silenciosamente o trabalho de uma delas?',
 ['Escolher a cópia mais recente apenas pelo nome','Comparar versões e registrar a versão consolidada em local compartilhado com histórico','Apagar ambas e recomeçar sem análise','Renomear uma cópia com extensão .csv','Enviar as duas cópias sem indicar qual vale'],1,
 'Comparar alterações permite preservar contribuições de ambas. Histórico de versões e fonte única consolidada tornam rastreável a edição; o nome do arquivo não prova completude.');
informatics('senhas','Um usuário reutiliza a mesma senha no e-mail e no sistema de trabalho. Após vazamento do e-mail, qual medida reduz melhor o risco de acesso cruzado?',
 ['Trocar apenas o nome de usuário','Usar senhas distintas e fortes, além de autenticação adicional quando disponível','Manter a senha e apagar mensagens antigas','Compartilhar a senha nova com a equipe','Desativar alertas de acesso'],1,
 'A reutilização permite testar a credencial vazada em outro serviço. Senhas únicas interrompem essa cadeia; autenticação adicional oferece proteção complementar, sem dispensar a troca.', 'https://cartilha.cert.br/fasciculos/autenticacao/fasciculo-autenticacao.pdf');

const administration=(topic,statement,options,answer,explanation)=>add('Noções de Administração',topic,['aca'],statement,options,answer,explanation,ENAP,'Administração geral — funções e organização');
// 17 cenários de administração, com distinção operacional entre conceitos próximos.
administration('planejamento e controle','Uma coordenação estabeleceu meta de 300 visitas, registrou 240 no prazo e, depois de identificar falha de transporte, remanejou veículos. Qual ação constitui o controle corretivo?',
 ['Fixar a meta de 300','Registrar as 240 visitas','Identificar a falha de transporte','Remanejar os veículos após o diagnóstico','Dividir 240 por 300'],3,
 'O remanejamento modifica a execução diante do desvio identificado. Fixar meta é planejar; medir 240 e calcular 80% são etapas de monitoramento; reconhecer a causa antecede a correção.');
administration('níveis de planejamento','A direção define um objetivo para quatro anos; a superintendência distribui recursos do semestre; um posto escala visitas de amanhã. Qual sequência de níveis corresponde às três decisões?',
 ['Operacional, tático, estratégico','Estratégico, tático, operacional','Tático, estratégico, operacional','Estratégico, operacional, tático','Tático, operacional, estratégico'],1,
 'A direção institucional fixa orientação ampla e duradoura; a superintendência a desdobra no médio prazo; o posto programa ações imediatas. Por isso, a ordem é estratégico–tático–operacional.');
administration('eficácia e eficiência','Dois postos obtiveram 200 entrevistas válidas. O primeiro gastou 50 horas e o segundo, 65, sem diferenças de qualidade. Qual leitura é sustentada pelos dados?',
 ['O primeiro foi mais eficaz e o segundo mais eficiente','Ambos foram eficazes quanto ao resultado, mas o primeiro usou melhor as horas','O segundo foi mais eficiente porque trabalhou mais','Ambos tiveram a mesma eficiência por entregar 200','Não se pode comparar uso de recursos com horas informadas'],1,
 'Ambos atingiram o mesmo resultado válido, logo têm igual eficácia nessa meta. O primeiro consumiu menos horas para produzi-lo, evidenciando maior eficiência nesse recurso específico.');
administration('efetividade','Uma ação cumpriu a meta de atendimentos, mas o grupo que deveria ser beneficiado continuou sem acesso ao serviço. Qual dimensão exige exame adicional?',
 ['Efetividade do impacto sobre o público-alvo','Somente eficiência no uso de combustível','Unidade de comando','Amplitude de controle','Formalização do organograma'],0,
 'A meta interna de atendimentos mede entrega, mas não demonstra mudança na situação do público. Efetividade avalia o efeito pretendido; o cenário sugere que ele não foi alcançado.');
administration('departamentalização','O órgão reúne equipes que executam cadastro, validação e divulgação em unidades distintas, independentemente da região atendida. Qual critério estrutura essas unidades?',
 ['Territorial','Por clientela','Funcional ou por atividade','Por produto vendido','Por duração do projeto'],2,
 'A separação acompanha atividades especializadas do fluxo de trabalho, não o território nem tipos de público. Cadastro, validação e divulgação são funções distintas.');
administration('centralização','Uma sede exige aprovar pessoalmente cada mudança de rota, inclusive ajustes pequenos e urgentes. Qual consequência organizacional é mais plausível desse alto grau de centralização?',
 ['Maior autonomia local para decisões imediatas','Possível lentidão nas adaptações locais, com decisões concentradas na sede','Desaparecimento da responsabilidade da sede','Redução obrigatória de todos os custos','Eliminação dos padrões comuns entre unidades'],1,
 'Concentrar decisões pode preservar uniformidade, mas cria fila de autorização para ajustes locais. A consequência provável é demora quando o centro precisa analisar muitos casos pequenos.');
administration('delegação','Uma supervisora atribui conferência de registros a um assistente e lhe permite solicitar ajustes, mantendo para si a avaliação final. O que foi transferido e o que permaneceu?',
 ['Responsabilidade final transferida; autoridade integral mantida','Autoridade delimitada para executar; responsabilidade final acompanhada pela supervisora','Missão institucional transferida; nenhuma tarefa concreta','Somente a assinatura, sem possibilidade de ação','Toda a hierarquia formal extinta'],1,
 'O assistente recebeu poder compatível com a tarefa de conferência. A supervisora não deixa de acompanhar o resultado; delegação não equivale a abdicar da responsabilidade gerencial.');
administration('unidade de comando','Um agente recebe duas instruções incompatíveis sobre o mesmo formulário de superiores diferentes. Qual problema precisa ser resolvido primeiro para evitar retrabalho?',
 ['A taxa de câmbio da unidade','A definição de uma autoridade responsável e da instrução válida','O número de edifícios da região','A falta de mais formulários em branco','A ausência de comunicação informal entre colegas'],1,
 'Ordens conflitantes mostram falha de unidade de comando ou coordenação entre autoridades. Definir qual orientação vale permite executar sem escolher arbitrariamente entre superiores.');
administration('decisão programada','Um posto recebe repetidamente arquivos com um campo obrigatório vazio; existe regra escrita que determina devolver o arquivo ao emissor para correção. Que tipo de decisão é essa aplicação?',
 ['Não programada, porque envolve arquivo digital','Programada, por seguir procedimento para caso recorrente','Estratégica, por alterar a missão da organização','Intuitiva, por dispensar critério','Emergencial, por não ter regra anterior'],1,
 'A situação se repete e tem resposta predefinida. A aplicação da regra é decisão programada; seria não programada se exigisse solução nova diante de caso sem procedimento.');
administration('controle preventivo','Antes de uma nova etapa, a coordenação testa acesso ao sistema e oferece exercício aos agentes. O objetivo é evitar erros antes da execução. Como classificar o controle?',
 ['Posterior, pois os resultados já foram consolidados','Concomitante, pois a coleta ocorre durante o teste','Preventivo, pois prepara condições antes da operação','Corretivo, pois reabre entrevistas finalizadas','Financeiro, pois compara apenas custos'],2,
 'Os testes e exercícios antecedem a etapa que será executada; buscam reduzir falhas futuras. Controle concomitante acompanha o trabalho em curso e posterior avalia resultados já produzidos.');
administration('controle concomitante','Durante a transmissão, um painel mostra aumento da rejeição de registros, e a equipe ajusta o procedimento no mesmo turno. Em que momento do processo atua esse controle?',
 ['Antes de começar qualquer transmissão','Durante a execução, permitindo ajuste imediato','Somente após encerrar toda a coleta','Apenas na formulação da missão','Depois de arquivar os resultados anuais'],1,
 'O sinal do painel aparece enquanto a operação ainda acontece e orienta correção no turno. Essa simultaneidade caracteriza controle concomitante, diferente de verificação prévia ou final.');
administration('processos','Um formulário passa por coleta, validação e transmissão. A validação devolve metade dos formulários por uma falha repetida de preenchimento. Qual medida ataca a causa com menor retrabalho futuro?',
 ['Aumentar a meta de transmissão sem mudar a coleta','Identificar o campo problemático e corrigir a instrução na etapa de coleta','Eliminar a validação para acelerar o fluxo','Enviar formulários incompletos assim mesmo','Contar a devolução como nova coleta concluída'],1,
 'O erro nasce antes da validação. Corrigir a orientação no ponto de entrada reduz retornos em cascata; aumentar produção final ou retirar controle apenas mascara a falha.');
administration('indicadores','O índice de produtividade foi calculado como entrevistas concluídas por hora, mas ignora as entrevistas posteriormente invalidadas. Qual ajuste melhora a interpretação do indicador?',
 ['Substituir horas por número de gestores','Usar entrevistas válidas por hora e acompanhar taxa de invalidação','Contar cada entrevista invalidada duas vezes','Medir apenas a velocidade do aplicativo','Eliminar qualquer medida de produção'],1,
 'Entrevistas concluídas mas rejeitadas geram retrabalho e não equivalem à entrega útil. Relacionar válidas às horas e acompanhar invalidações preserva quantidade e qualidade.');
administration('comunicação e feedback','Uma circular foi entregue a todos, mas os postos interpretam “até sexta” com horários diferentes. O que comprova melhor que a orientação corrigida foi compreendida?',
 ['Reenviar o mesmo texto sem esclarecer o horário','Pedir que os postos confirmem o prazo completo em suas próprias palavras','Presumir silêncio como acordo','Retirar a data de todas as cópias','Medir o número de e-mails enviados'],1,
 'Entrega não garante compreensão. Solicitar retorno do prazo entendido identifica diferenças e permite registrar um horário inequívoco; contar envios mede alcance, não entendimento.');
administration('estrutura informal','Agentes de postos diferentes criam espontaneamente um grupo para trocar soluções de problemas comuns, sem mudança no organograma. Que estrutura aparece nesse exemplo?',
 ['A linha formal de autoridade','Uma rede informal de relacionamento','Uma nova unidade jurídica','Um orçamento descentralizado','Um processo de controle externo'],1,
 'A rede surge de interações não previstas no organograma e pode apoiar circulação de conhecimento. Isso não cria, por si, nova autoridade formal nem altera a estrutura jurídica.');
administration('análise SWOT','Uma unidade tem equipe experiente, mas depende de um único servidor para autorizar despesas; externamente, há edital que amplia recursos e risco de enchentes. Qual par é interno?',
 ['Equipe experiente e dependência de um único autorizador','Edital de recursos e risco de enchentes','Equipe experiente e edital de recursos','Dependência do autorizador e enchentes','Edital de recursos e equipe experiente'],0,
 'Força e fraqueza internas são a experiência da equipe e a concentração da autorização. Edital e enchentes pertencem ao ambiente externo, como oportunidade e ameaça.');
administration('amplitude de controle','Um supervisor acompanha 18 agentes distribuídos por localidades distantes, enquanto outro acompanha 6 agentes no mesmo prédio. O que é correto concluir sobre a amplitude de controle?',
 ['É igual porque ambos têm o mesmo cargo','É numericamente maior para o primeiro, com maior desafio de coordenação pela dispersão','É maior para o segundo por estar próximo da equipe','Não pode ser medida pelo número de subordinados diretos','É sempre melhor quanto maior for, sem considerar a tarefa'],1,
 'Amplitude de controle refere-se aos subordinados diretos: 18 contra 6. A dispersão territorial ainda torna o acompanhamento do primeiro mais exigente; o número isolado não determina o desenho ideal.');

const portuguese=(topic,statement,options,answer,explanation)=>add('Língua Portuguesa',topic,ALL,statement,options,answer,explanation,EDITAL,'Anexo IV — Língua Portuguesa');
// 12 itens de interpretação e norma-padrão com contextos e contrastes concretos.
portuguese('inferência textual','Leia: “Embora a revisão tenha terminado na sexta-feira, a publicação ocorreu apenas na segunda, após autorização da direção.” Qual afirmação é compatível com o texto, sem acrescentar causa não informada?',
 ['A revisão atrasou até segunda-feira','A autorização precedeu a publicação','A direção recusou a primeira versão','A publicação ocorreu antes da autorização','A equipe trabalhou durante todo o fim de semana'],1,
 'O texto situa a publicação depois da autorização. Não informa recusa, trabalho no fim de semana nem motivo do intervalo além da sequência apresentada.');
portuguese('referência pronominal','Na frase “A coordenadora avisou à analista que sua planilha seria revisada”, a posse indicada por “sua” pode gerar ambiguidade. Qual reescrita explicita que a planilha pertence à analista?',
 ['A coordenadora avisou à analista que a planilha da analista seria revisada','A coordenadora avisou à analista que sua planilha seria revisada por ela','A coordenadora avisou à analista sobre a revisão de sua planilha','Avisou-se à analista que a planilha seria revisada','A coordenadora informou que a sua planilha seria revisada'],0,
 'A repetição “da analista” elimina a disputa entre as duas possuidoras possíveis. As formas com “sua” mantêm a ambiguidade; retirar a posse não resolve a referência pretendida.');
portuguese('oração restritiva','Compare “Os agentes que concluíram o curso receberão acesso” e “Os agentes, que concluíram o curso, receberão acesso”. Qual mudança de sentido decorre das vírgulas?',
 ['A primeira afirma que todos concluíram; a segunda restringe alguns','A primeira restringe o grupo; a segunda apresenta a conclusão do curso como informação sobre todos os agentes mencionados','Ambas restringem apenas os que concluíram','As vírgulas transformam o futuro em passado','A segunda nega o acesso aos concluintes'],1,
 'Sem vírgulas, a relativa identifica quais agentes receberão acesso. Entre vírgulas, ela é explicativa e trata a conclusão do curso como informação sobre o conjunto referido.');
portuguese('crase em locução','Uma instrução diz: “À medida que os registros forem validados, a equipe os transmitirá.” Qual alternativa mantém a locução com o mesmo valor proporcional e grafia adequada?',
 ['A medida que os registros forem validados','À medida que os registros forem validados','À medida em que os registros forem validados','Na medida que os registros forem validados','A medida em que os registros forem validados'],1,
 'A locução proporcional é “à medida que”, com crase. Acrescentar “em” mistura construções; escrever apenas “a” perde a grafia convencional dessa locução.');
portuguese('concordância com fazer','Um comunicado informa a duração da operação iniciada dois anos antes. Qual redação segue a norma-padrão quando “fazer” indica tempo decorrido?',
 ['Fazem dois anos que a operação começou','Faz dois anos que a operação começou','Fizeram dois anos que a operação começou','Fazem dois anos desde que a operação começou','Faziam dois anos que a operação começou'],1,
 'No sentido de tempo transcorrido, “fazer” é impessoal e fica no singular: “faz dois anos”. O plural de “anos” não torna essa expressão sujeito do verbo.');
portuguese('regência de informar','Um posto precisa comunicar os resultados à chefia. Qual frase usa o verbo “informar” com construção direta e indireta coerente, sem trocar resultado e destinatário?',
 ['O posto informou os resultados à chefia','O posto informou à chefia os resultados a eles','O posto informou dos resultados à chefia','O posto informou a chefia à resultados','O posto informou os resultados da chefia'],0,
 'Pode-se informar algo a alguém: “os resultados” são objeto direto e “à chefia” é destinatário. As demais opções alteram a relação, duplicam complemento ou usam preposição inadequada.');
portuguese('colocação pronominal','Em um aviso formal, quer-se expressar que o sistema não deve ser desligado durante a transmissão. Qual redação usa “se” sem duplicá-lo e respeita a atração da palavra negativa?',
 ['O sistema não deve-se desligar durante a transmissão','O sistema não se deve desligar durante a transmissão','O sistema se não deve desligar durante a transmissão','O sistema não deve desligar-se-se durante a transmissão','O sistema deve não se desligar durante a transmissão'],1,
 '“Não” atrai o pronome átono, favorecendo “não se deve desligar”. A alternativa correta mantém o pronome uma vez e em posição compatível com a negação.');
portuguese('coesão causal e adversativa','Leia: “O sistema permaneceu disponível; contudo, as equipes adiaram a transmissão porque faltava conferir os dados.” Que relações os conectivos estabelecem, respectivamente?',
 ['Causa e conclusão','Contraste e causa','Conclusão e contraste','Explicação e comparação','Finalidade e condição'],1,
 '“Contudo” contrapõe a disponibilidade ao adiamento; “porque” apresenta a causa do adiamento. Inverter essas relações muda o encadeamento lógico da frase.');
portuguese('parônimos','Uma mensagem diz que a equipe encontrou número incorreto no relatório e precisa corrigi-lo antes de confirmar a versão final. Qual par de verbos traduz, nessa ordem, corrigir e confirmar?',
 ['Ratificar e retificar','Retificar e ratificar','Retificar e retificar','Ratificar e ratificar','Retificar e notificar'],1,
 'Retificar é corrigir dado incorreto; ratificar é confirmar o que está certo ou decidido. A ordem do enunciado exige primeiro correção, depois confirmação.');
portuguese('voz passiva analítica','Transforme “A coordenação verificará os cadastros” em voz passiva analítica, preservando o futuro do presente e o sentido da ação. Qual forma resulta?',
 ['Os cadastros foram verificados pela coordenação','Os cadastros serão verificados pela coordenação','Os cadastros seriam verificados pela coordenação','A coordenação será verificada pelos cadastros','Verificar-se-ão a coordenação os cadastros'],1,
 'O objeto “os cadastros” torna-se sujeito paciente plural. O futuro “verificará” corresponde a “serão verificados”; “foram” e “seriam” mudam o tempo ou modo.');
portuguese('concordância nominal','Uma comunicação acompanha três cópias de um documento e usa o adjetivo “anexo” depois do verbo: “Seguem ___ as cópias”. Qual preenchimento e justificativa são corretos?',
 ['anexo, porque adjetivos não variam','anexos, porque o verbo está no plural','anexas, por concordar com “cópias”','em anexas, por ser locução invariável','anexada, por concordar com “documento”'],2,
 'Como adjetivo, “anexas” concorda com o substantivo feminino plural “cópias”. A locução “em anexo” seria invariável, mas não é a forma apresentada na lacuna.');
portuguese('pontuação de adjunto deslocado','Em “Após a conferência dos mapas, a equipe iniciou as visitas”, qual função exerce a vírgula sem separar indevidamente sujeito e verbo?',
 ['Isola um adjunto adverbial antecipado','Separa “a equipe” de “iniciou”','Marca a omissão do verbo principal','Introduz uma citação direta','Separa dois objetos diretos coordenados'],0,
 '“Após a conferência dos mapas” indica tempo e está antes da oração principal. A vírgula marca esse deslocamento; sujeito e verbo permanecem juntos em “a equipe iniciou”.');

const manager=(topic,statement,options,answer,explanation)=>add('Noções de Administração/Situações Gerenciais',topic,MAN,statement,options,answer,explanation,ENAP,'Administração geral — situações gerenciais');
manager('priorização de tarefas','Dois problemas competem pela mesma equipe: uma falha impede envio dos dados até hoje; uma revisão rotineira vence na próxima semana. Qual alocação melhor considera urgência e impacto?',
 ['Revisão primeiro por ser tarefa conhecida','Correção da falha bloqueante primeiro, com prazo reservado para revisão','Metade da equipe em cada tarefa, sem medir efeito','Adiar ambas para evitar escolha','Atender a tarefa de menor duração mesmo que o envio pare'],1,
 'A falha bloqueia entrega imediata, enquanto a revisão tem prazo posterior. Priorizá-la não elimina a revisão: é preciso reservar execução futura e acompanhar o prazo.');
manager('feedback construtivo','Um agente repetiu erro em três registros. Qual abordagem de feedback oferece informação acionável sem confundir comportamento com identidade pessoal?',
 ['“Você é desatento”; não apresentar exemplos','Mostrar os três registros, explicar o padrão e combinar nova verificação','Comunicar apenas a nota final sem explicar o erro','Tratar o caso como falha de caráter diante de todos','Repetir a norma inteira sem indicar onde ela foi descumprida'],1,
 'Os registros concretos mostram o comportamento a mudar e permitem verificar a correção depois. Rótulos pessoais e notas sem evidências não indicam qual etapa precisa de ajuste.');
manager('indicadores e contexto','Uma equipe em setor distante fez menos entrevistas por dia que outra em área compacta, mas teve menor taxa de erro. Qual comparação gerencial é mais defensável?',
 ['Ordenar exclusivamente por entrevistas brutas','Comparar produção, qualidade e condições de acesso antes de concluir desempenho','Desconsiderar produtividade porque há diferenças de distância','Declarar superior a equipe com menos entrevistas','Somar erros às entrevistas para criar indicador único'],1,
 'A distância afeta tempo disponível para entrevistas e a taxa de erro mede qualidade. Comparação justa combina dimensões e contexto; nenhum número isolado decide o desempenho integral.');
manager('gestão de riscos','Uma ponte pode ficar interditada durante chuvas previstas; a visita é importante, mas existe rota alternativa mais longa. Qual plano lida melhor com a incerteza antes do deslocamento?',
 ['Ignorar previsão e seguir pela ponte em qualquer condição','Verificar condição de acesso e preparar rota alternativa com impacto no prazo','Cancelar todas as visitas sem verificar risco','Transferir a decisão ao primeiro morador encontrado','Usar a rota longa sempre, sem considerar a situação real'],1,
 'Planejar contingência exige observar a probabilidade e o efeito da interdição, além de prever resposta viável. A rota alternativa pode preservar a visita se a ponte estiver fechada.');
manager('comunicação de mudança','Uma instrução foi revisada, mas parte da equipe trabalha com cópia antiga. Qual conjunto de ações reduz simultaneamente erro operacional e dúvida sobre a versão vigente?',
 ['Mandar mensagem informal sem identificar a revisão','Publicar versão identificada, comunicar a mudança e confirmar recebimento e entendimento','Permitir que cada equipe escolha uma versão','Apagar registros anteriores sem explicar o motivo','Cobrar resultado apenas depois que surgirem erros'],1,
 'Versão identificada e comunicação explícita estabelecem referência comum; o retorno das equipes verifica compreensão. Deixar cópias conflitantes sem orientação mantém a causa do erro.');

const basic=(topic,statement,options,answer,explanation,url)=>add('Noções Básicas de Informática',topic,['aor'],statement,options,answer,explanation,url,topic);
basic('arquivos e cópias','Um agente precisa enviar uma versão de um arquivo a outro posto e manter intacto o original em sua pasta. Qual operação atende exatamente a essa necessidade?',
 ['Mover o arquivo para a pasta do outro posto','Copiar o arquivo para o destino e preservar a origem','Renomear o arquivo original sem duplicá-lo','Excluir a origem após transmitir','Criar um atalho sem disponibilizar o conteúdo'],1,
 'Copiar cria outra ocorrência no destino e mantém a origem. Mover retira o arquivo da pasta inicial; atalho não é uma cópia independente do conteúdo.', 'https://learn.microsoft.com/pt-br/windows-server/administration/windows-commands/copy');
basic('backup','Uma equipe possui três versões sincronizadas do mesmo arquivo, mas todas reproduzem a exclusão acidental de ontem. Qual característica faltou para que houvesse recuperação confiável?',
 ['Mais dispositivos sincronizados em tempo real','Uma cópia ou versão anterior protegida da exclusão propagada','Um nome de arquivo mais curto','Uma pasta com cor diferente','Uma velocidade maior de sincronização'],1,
 'Três réplicas do estado atual não bastam se todas propagam o erro. Backup ou histórico de versões preserva um ponto anterior recuperável, separado da simples sincronização.','https://cartilha.cert.br/fasciculos/backup/fasciculo-backup.pdf');

// Revisão cega de alternativas: opções do mesmo domínio e sem pista pelo comprimento.
const revisedOptions={
  15:['A forma jurídica empresarial da unidade','Sua localização em área urbana','A extensão pequena da área cultivada','Nenhuma das três características isoladamente','A comercialização de parte das hortaliças'],
  24:['Sim, porque o produtor é o mesmo','Sim, porque dividem máquinas e gestão','Não; falta compartilhar recursos humanos','Não; a separação física sempre impede','Sim, porque existe uma administração única'],
  49:['=SOMA(A1:A5;"Norte")','=CONT.SE(A1:A5;"Norte")','=CONT.VALORES(A1:A5)','=CONT.SE(A1:A5;"Norte?")','=CONT.SE(A1:A5;"Sul")'],
  51:['Limpar o filtro que restringe a tabela','Desfazer exclusões feitas nas outras linhas','Classificar todos os registros por município','Trocar o critério para outro município','Mostrar manualmente linhas ocultas no arquivo'],
  52:['Ordenar apenas a coluna de visitas','Ordenar a tabela com cada linha íntegra','Fixar a coluna dos nomes na tela','Filtrar os nomes antes da ordenação','Classificar nomes e visitas separadamente'],
  53:['CSV preserva abas, mas não preserva fórmulas','CSV não mantém todos esses recursos da pasta','CSV preserva fórmulas, mas não preserva abas','CSV preserva abas e fórmulas, mas não estilos','CSV mantém o formato integral se houver cabeçalho'],
  55:['Manter mais uma réplica do estado atual','Guardar versão anterior recuperável','Renomear o arquivo após sincronizar','Reiniciar a sincronização dos aparelhos','Compartilhar a pasta com outro usuário'],
  56:['A ausência de certificado HTTPS no link','A diferença de domínio somada ao pedido de senha','O nome exibido do remetente ser abreviado','O uso de mensagem enviada fora do expediente','A falta de assinatura visual do órgão'],
  57:['Enviar os códigos ao suporte por e-mail','Usá-los na recuperação oficial e renová-los se expostos','Compartilhá-los só com o gestor imediato','Digitá-los em qualquer página com logotipo correto','Desativar o segundo fator após a primeira recuperação'],
  58:['Leitura limitada à pasta e ao período','Leitura permanente de toda a unidade','Edição temporária da pasta necessária','Administração apenas dos documentos conferidos','Acesso pela conta já autorizada do gestor'],
  59:['Falha de resolução de nomes DNS','Falha de autenticação no serviço remoto','Erro no formato do endereço IP','Problema de certificado do navegador','Indisponibilidade total da rede local'],
  60:['HTTPS valida o conteúdo publicado pela página','HTTPS cifra o transporte; a identidade do domínio exige conferência','HTTPS garante que o endereço pertence ao órgão esperado','HTTPS impede que domínios parecidos recebam certificado','HTTPS dispensa verificação de origem se houver cadeado'],
  61:['Ela remove do servidor o histórico de acessos da conta','Ela limita o histórico local, sem ocultar o acesso ao serviço remoto','Ela apaga os registros de navegação do provedor','Ela bloqueia cookies e downloads em toda situação','Ela encerra sessões abertas em outras janelas'],
  63:['Escolher a cópia com maior tamanho em bytes','Comparar mudanças e registrar uma versão consolidada com histórico','Escolher a cópia com data mais recente sem abrir','Mesclar os arquivos apenas pelo nome','Enviar ambas sem identificar versão de referência'],
  64:['Alterar o e-mail cadastrado, mantendo a senha','Adotar senhas únicas e segundo fator quando possível','Trocar só a senha do serviço que vazou','Usar a mesma senha, mas com nome de usuário diferente','Compartilhar a nova senha para checagem conjunta'],
  67:['O primeiro foi mais eficaz, mas o segundo mais eficiente','Ambos atingiram o resultado; o primeiro gastou menos horas','O segundo foi mais eficaz por usar mais tempo','Ambos tiveram igual eficiência pelo resultado idêntico','Não há dado suficiente para comparar o uso de horas'],
  68:['O efeito da ação sobre o público que deveria atender','A quantidade de horas por atendimento realizado','A quantidade de pessoas na cadeia de comando','O cumprimento formal da escala de trabalho','A distribuição de funções entre os postos'],
  70:['Maior autonomia para resolver imprevistos locais','Decisões locais mais lentas por dependerem da sede','Perda completa da padronização entre postos','Extinção da responsabilidade pela decisão central','Eliminação dos custos de comunicação entre unidades'],
  71:['Responsabilidade final ao assistente; autorização com a chefia','Autoridade delimitada ao assistente; supervisão final preservada','Autoridade integral ao assistente; controles dispensados','Tarefa transferida, sem meios para solicitar ajustes','Supervisão final delegada, mas execução com a chefia'],
  72:['Seguir a ordem recebida por último, sem conferência','Definir qual autoridade e orientação devem prevalecer','Executar parte de cada ordem para agradar a ambos','Suspender toda atividade até o fim da operação','Escolher a instrução que demande menos tempo'],
  73:['Não programada, pois o emissor varia a cada arquivo','Programada, porque regra anterior cobre caso recorrente','Estratégica, pois o arquivo integra objetivo institucional','Não programada, pois o arquivo pode ter conteúdo novo','Tática, porque envolve devolução entre duas equipes'],
  77:['Dividir horas pelo número total de gestores','Contar válidas por hora e acompanhar invalidações','Somar concluídas e inválidas como entregas','Medir somente o tempo de digitação','Trocar quantidade por custo total sem medir qualidade'],
  78:['Contar os e-mails que chegaram às caixas postais','Solicitar retorno do prazo com dia e horário entendidos','Reenviar o texto com a mesma expressão ambígua','Registrar a circular sem consultar os destinatários','Perguntar apenas se todos viram o e-mail'],
  81:['Maior para o segundo, por estar mais próximo do grupo','Maior para o primeiro, dada a relação de 18 para 6','Igual, porque ambos têm função de supervisão','Menor para o primeiro, pois os setores são distantes','Indefinida, já que falta saber a produção por agente'],
  84:['A primeira explica todos; a segunda seleciona alguns','A primeira seleciona alguns; a segunda explica o conjunto','Ambas selecionam apenas os agentes concluintes','Ambas apresentam o curso como fato de todos','A primeira seleciona todos; a segunda seleciona nenhum'],
  98:['Manter a antiga disponível sem indicar substituição','Publicar versão marcada e confirmar o entendimento','Explicar oralmente sem disponibilizar a nova versão','Enviar o arquivo novo sem identificar as mudanças','Cobrar resultados antes de confirmar a atualização'],
  100:['Mais uma réplica sincronizada no mesmo instante','Uma versão anterior isolada da exclusão atual','Uma cópia renomeada depois da exclusão','Uma pasta adicional na sincronização ativa','Um atalho para a versão corrente do arquivo']
};
for(const [number,options] of Object.entries(revisedOptions)){
  const item=q[Number(number)-1];
  if(!item||options.length!==5)throw new Error(`Revisão inválida: ${number}`);
  item.options=options;
  item.whyWrong=options.map((option,i)=>i===item.answer?`Correta. ${item.explanation}`:`A alternativa “${option}” não resolve o caso. ${item.explanation}`);
}

if(q.length!==100)throw new Error(`Esperadas 100, obtidas ${q.length}`);
for(const [index,item] of q.entries()){
  const target=index%5,shift=(target-item.answer+5)%5;
  if(shift){const rotate=list=>list.map((_,i)=>list[(i-shift+5)%5]);item.options=rotate(item.options);item.whyWrong=rotate(item.whyWrong);item.answer=target;}
}
const distribution=Object.fromEntries([...new Set(q.map(item=>item.subject))].map(subject=>[subject,q.filter(item=>item.subject===subject).length]));
fs.writeFileSync('content/ibge-2026/batches/batch-009.json',JSON.stringify({batch:'batch-009',status:'review',generatedBy:'curadoria nesta conversa',distribution,questions:q},null,2)+'\n');
console.log(JSON.stringify({count:q.length,distribution,answers:[0,1,2,3,4].map(i=>q.filter(x=>x.answer===i).length)},null,2));
