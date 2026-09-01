# Projeto TODO

- [x] Implementar tela de login com usuário, senha e sessão protegida
- [x] Aplicar identidade visual da Óticas Único com logo e paleta da marca
- [x] Criar lista fixa de lojas com os nomes exatos solicitados
- [x] Implementar lançamento de OS com loja selecionada e registro automático de data e hora
- [x] Exibir lançamentos do dia atual agrupados por loja
- [x] Criar relatório com filtro por data inicial e data final
- [x] Exibir totais por loja no relatório filtrado
- [x] Permitir impressão e geração de PDF pelo navegador
- [x] Garantir responsividade para computador, celular e tablet
- [x] Criar testes Vitest para lançamentos, filtros e regras de lojas
- [x] Validar visual, responsividade, autenticação e fluxo de impressão no navegador
- [x] Criar checkpoint final do sistema

## Histórico de alterações

- Requisitos refinados pelo usuário em 18/08/2026: sistema web de OS para a Óticas Único, com acabamento elegante, login, lojas fixas, lançamentos automáticos de data/hora, agrupamento diário, relatórios por período, totais e impressão/PDF.

## Ajustes finais identificados na validação

- [x] Implementar tela de acesso com campos de usuário e senha, validação de preenchimento e sessão protegida pela autenticação da organização
- [x] Separar a consulta de lançamentos de hoje do estado do relatório
- [x] Adicionar testes Vitest para criação, filtros e totais
- [x] Validar no navegador o fluxo autenticado e a impressão/PDF
- [x] Criar o checkpoint final após concluir os ajustes

## Nova solicitação de autenticação

- [x] Criar autenticação própria por usuário e senha para o usuário Roni
- [x] Cadastrar Roni com senha inicial provisória 123456 sem expor a senha no código-fonte
- [x] Criar sessão protegida baseada em cookie seguro para a autenticação própria
- [x] Permitir alteração da senha atual pelo próprio usuário
- [x] Remover a dependência do formulário de login em OAuth para o fluxo principal
- [x] Criar testes de hash, login, sessão e alteração de senha
- [x] Validar o novo fluxo no navegador e salvar checkpoint atualizado

## Ajustes de lançamento solicitados

- [x] Corrigir o fundo do seletor de lojas para garantir leitura das opções
- [x] Adicionar campo livre de observação abaixo do número da OS
- [x] Persistir a observação junto ao lançamento
- [x] Exibir observação nas listagens e no relatório filtrado
- [x] Atualizar testes e validar responsividade
- [x] Salvar checkpoint atualizado

## Novos ajustes de controle e relatório

- [x] Permitir editar loja, número da OS e observação de um lançamento
- [x] Permitir excluir lançamento com confirmação explícita
- [x] Restringir edição e exclusão ao usuário autenticado
- [x] Adicionar filtro por loja no relatório
- [x] Atualizar totais, tabela e exportação conforme a loja filtrada
- [x] Criar testes para edição, exclusão e filtro por loja
- [x] Validar responsividade e salvar checkpoint atualizado

## Correção do botão Alterar

- [x] Corrigir o botão Alterar para abrir o formulário de edição
- [x] Validar salvamento da edição no painel e no relatório
- [x] Atualizar testes e salvar checkpoint da correção

## Novo usuário administrador

- [x] Cadastrar o usuário Fred com a senha inicial informada armazenada como hash
- [x] Conceder perfil administrador com acesso completo aos lançamentos, edição, exclusão e relatórios
- [x] Validar login, perfil e acesso administrativo
- [x] Salvar checkpoint atualizado

## Botão de saída

- [x] Adicionar botão Sair visível no cabeçalho
- [x] Encerrar a sessão própria e limpar o cookie ao sair
- [x] Confirmar retorno à tela de login e permitir novo acesso
- [x] Atualizar testes e salvar checkpoint

## Refinamento do cabeçalho e saudação

- [x] Alinhar Alterar senha e Sair lado a lado no cabeçalho
- [x] Corrigir textos e controles para permanecerem dentro do cabeçalho
- [x] Exibir “Bom dia, Roni” acima de “PAINEL DE OPERAÇÕES” para o perfil Roni
- [x] Validar layout responsivo e salvar checkpoint

## Módulo de Quebras

- [x] Criar tabela de quebras com OS, unidade, relato e data/hora automática
- [x] Adicionar aba Lançar Quebras
- [x] Permitir selecionar a unidade usando a lista fixa de lojas
- [x] Adicionar campo livre “Relatar o ocorrido”
- [x] Criar relatórios de quebras por período e unidade
- [x] Exibir listagem recente e totais de quebras
- [x] Adicionar edição, exclusão e exportação/ impressão para quebras
- [x] Criar testes de validação, filtros e proteção por sessão
- [x] Validar responsividade e salvar checkpoint atualizado

## Logotipo e exportação Markdown

- [x] Remover os cantos brancos do logotipo preservando os cantos arredondados
- [x] Atualizar o asset do logotipo usado na aplicação
- [x] Adicionar botão Gerar relatório MD ao relatório de montagens
- [x] Adicionar botão Gerar relatório MD ao relatório de Quebras
- [x] Gerar Markdown com período, filtros, totais e tabela para conferência
- [x] Testar o download dos arquivos Markdown e salvar checkpoint

## Ajuste de logo e filtros de data

- [x] Aumentar o logotipo no cabeçalho sem perder proporção
- [x] Deixar Data inicial e Data final com o mesmo tamanho nos relatórios
- [x] Validar o ajuste em desktop e celular e salvar checkpoint

## Validação adicional do ajuste de logo e filtros

- [x] Validar visualmente em desktop o logotipo ampliado e os filtros de Data inicial/Data final
- [x] Salvar checkpoint após a validação desktop

## Data retroativa e saudação ampliada

- [x] Adicionar seleção de data no calendário ao formulário de lançamento de OS
- [x] Persistir a data escolhida no lançamento, mantendo a hora automática
- [x] Permitir o mesmo comportamento na aba de Quebras
- [x] Aumentar o destaque visual de “Bom dia, Roni”
- [x] Atualizar testes de data e validar responsividade
- [x] Salvar checkpoint atualizado

## Validação adicional de data retroativa

- [x] Adicionar teste específico de data retroativa para Quebras
- [x] Validar visualmente desktop e celular após a mudança
- [x] Salvar checkpoint final desta atualização

## Novo ajuste de tamanho do logotipo

- [x] Aumentar novamente o logotipo na tela de acesso e no cabeçalho
- [x] Preservar proporção, transparência e adaptação em telas menores
- [x] Validar em desktop e celular e salvar checkpoint

## Soma final do relatório de montagens

- [x] Exibir soma geral de montagens ao final do relatório
- [x] Incluir a soma geral na impressão/PDF
- [x] Incluir a soma geral no arquivo Markdown exportado
- [x] Validar o total conforme período e loja selecionados
- [x] Atualizar testes e salvar checkpoint

## Validação final da soma de montagens

- [x] Ajustar contraste da soma geral na impressão/PDF
- [x] Adicionar teste da soma respeitando o filtro por loja
- [x] Validar visualmente a soma no modo de impressão
- [x] Salvar checkpoint final da soma

## Validação visual de impressão do relatório

- [x] Validar visualmente o relatório de montagens no modo de impressão/PDF com a soma final legível
- [x] Salvar checkpoint após a validação de impressão

## Reposicionamento do logotipo

- [x] Aproximar o logotipo do canto esquerdo no cabeçalho
- [x] Preservar espaçamento adequado em desktop e celular
- [x] Validar o posicionamento e salvar checkpoint

## Exportação do sistema e banco

- [ ] Gerar dump do banco de dados (SQL) com tabelas e dados
- [ ] Compactar os arquivos do projeto (código-fonte)
- [ ] Revisar e remover arquivos sensíveis ou credenciais
- [ ] Disponibilizar os arquivos para download
