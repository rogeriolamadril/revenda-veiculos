# Validação da segunda etapa

Continuação da implementação existente na branch `codex/initial-platform`, destinada ao PR #1 para `main`. Registro concluído em 11 de setembro de 2026. O histórico da primeira etapa permanece em `VALIDATION.md` e descreve o estado naquela data.

## Escopo preservado

Nenhuma alteração em migrations, schema, RLS, Auth, Storage, tipos gerados ou CRUD administrativo. Nenhum dado ou usuário foi criado por esta etapa. Nenhuma dependência foi adicionada. Não houve merge ou deploy.

## Verificações locais

- Typecheck e lint aprovados após as alterações finais.
- Build de produção aprovado, incluindo verificação TypeScript e geração das rotas. Um erro de tipagem no teste de analytics foi corrigido antes da execução final.
- 20 testes unitários aprovados: os 11 existentes e nove novos casos de financiamento, eventos e renderização pública. As entradas técnicas ficam exclusivamente nos testes, sem registros persistidos ou mocks na aplicação.
- O comando `npm test` encontrou uma limitação do ambiente Windows: `tsx` falha ao consultar o usuário do sistema (`uv_os_get_passwd`, `ENOMEM`), antes de executar os testes. Os mesmos 20 testes foram executados com `node:test` e transpilações de TypeScript por um runner local em `work/`, excluído do envio. Isso não equivale a uma execução local bem-sucedida de `npm test`; o script normal permanece no CI.

## Navegador e dados reais

Durante a revisão, o catálogo passou a conter um veículo real já cadastrado no Supabase. A página foi consultada sem mutações no banco:

- Catálogo com foto real, nome, ano, quilometragem, câmbio, preço e link do veículo.
- Filtro `maxMileage=0` retornou zero resultados; mensagem de busca vazia e limpeza dos filtros verificadas. O zero persistiu na URL e os filtros avançados permaneceram abertos.
- Abertura do veículo real: galeria antes do nome/preço no celular, especificações e formulário de financiamento. Final da placa ausente da interface pública.
- Em 360 × 800 px, catálogo e detalhe sem overflow horizontal: `scrollWidth=345`, `innerWidth=360` (a diferença corresponde à barra de rolagem). Fotos grandes, um card por linha e controles legíveis observados.
- Formulário com preço real: entrada superior ao preço produziu erro; entrada com vírgula foi aceita; troca de prazo por setas do teclado funcionou, com foco visível. Nenhuma mensagem foi enviada.
- Sem WhatsApp comercial configurado, não havia links `wa.me` na página e o botão de financiamento ficou desativado. A composição/validação do URL é coberta por teste unitário isolado.

## Limites e aceite restante

Na retomada, o navegador integrado deixou de estar disponível. A revisão visual desta etapa foi concluída apenas em 360 px; 390 px, 430 px, tablet e desktop ainda precisam de aceite visual, embora existam breakpoints específicos no CSS. Também falta verificar o menu por teclado e o comportamento do contato flutuante com um telefone comercial real configurado. Não se declara esses cenários aprovados por inspeção de código.

O registro real tinha uma foto; navegação entre múltiplas fotos não foi exercitada nesta etapa. O estado sem fotos foi coberto por renderização unitária.

Não foi repetido o aceite autenticado de CRUD/uploads, pois esta etapa não altera esse fluxo e não dispõe de sessão administrativa para testá-lo. A presença de um veículo real não prova a execução desse aceite pelo agente.

A configuração hospedada de cadastro público do Auth, apontada como pendente na primeira etapa, não foi alterada nem revalidada nesta etapa. Conferi-la antes do uso operacional. Definir telefone comercial real, identidade e domínio quando disponíveis.

## Publicação e segurança

O diretório `.git` local está protegido contra escrita no ambiente atual. A publicação usa a integração GitHub para criar commits sequenciais sobre o histórico existente e atualizar a mesma branch sem force. Os arquivos locais são preservados; a sincronização dos metadados Git locais permanece pendente enquanto a restrição existir.

A seleção de envio exclui `.env`, `.env.local`, `node_modules`, `.next`, arquivos temporários e resultados de testes. `.env.example` permanece somente como modelo sem credenciais.
