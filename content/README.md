# Bancos editoriais do TurboQuest

Cada concurso publicado é um pacote editorial versionado. Usuários não enviam editais nem questões para publicação.

## Fluxo de publicação

1. Colocar o edital, retificações, manuais e fontes oficiais em `sources/` do pacote.
2. Atualizar o manifesto e a taxonomia do concurso.
3. Gerar questões em lotes por cargo, disciplina e tópico.
4. Auditar fatos, gabaritos, alternativas, duplicidades e dificuldade.
5. Rodar `node scripts/validate-question-bank.mjs content/ibge-2026/questions.json`.
6. Publicar somente questões com `status: "approved"`.

## Estrutura de uma questão

Cada questão deve informar cargo(s), disciplina, tópico, dificuldade, enunciado, cinco alternativas, gabarito, explicação, justificativa dos distratores e fonte. Questões sem fonte, com ambiguidade ou sem auditoria ficam fora da publicação.

O banco pode crescer indefinidamente; a plataforma pagina e filtra o conteúdo já aprovado, sem pedir geração fraca em tempo real ao estudante.
