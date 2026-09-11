# Revenda de veículos

Aplicação web para catálogo público de veículos usados e seminovos e administração do estoque. Todos os veículos, fotos e indicadores vêm do Supabase. O banco começa vazio; não existem seeds ou dados de demonstração.

## Stack e arquitetura

Next.js 16 (App Router), React 19, TypeScript estrito, Tailwind CSS 4, Supabase PostgreSQL/Auth/Storage. Dependências fixadas no `package.json` e `package-lock.json`.

O catálogo usa Server Components e cliente anônimo, inclusive quando o visitante está autenticado como administrador. Filtros GET são aplicados no PostgreSQL, com paginação de 12 veículos. A função `catalog_facets` busca opções reais em todo o estoque disponível. Detalhes ficam em `/veiculos/[id]`.

O painel usa Server Actions com validação Zod, verificação de usuário no Auth e autorização em `admin_profiles` em cada mutação. A camada de banco aplica RLS independentemente da interface. Não existe cadastro público de administradores, nem uso de service role pela aplicação.

## Requisitos e instalação

- Node.js 24 LTS (mínimo declarado: 22).
- npm e um projeto Supabase.
- Docker somente se optar por executar a infraestrutura Supabase local.

```sh
npm ci
cp .env.example .env.local
npm run dev
```

No PowerShell: `Copy-Item .env.example .env.local`. Não sobrescreva uma `.env.local` já configurada.

Abra `http://localhost:3000`. Preencha a configuração do Supabase antes de consultar o estoque. Sem configuração ou em caso de falha, o site mostra indisponibilidade, nunca um estoque vazio simulado.

## Variáveis de ambiente

| Variável                               | Uso                                                                   |
| -------------------------------------- | --------------------------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`             | URL real do projeto                                                   |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Chave pública moderna, recomendada                                    |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`        | Compatibilidade com chave pública legada; fallback                    |
| `NEXT_PUBLIC_WHATSAPP_NUMBER`          | Telefone comercial real com país e DDD; formatação comum é sanitizada |
| `NEXT_PUBLIC_BUSINESS_NAME`            | Nome comercial real; ausente, exibe “Catálogo de veículos”            |
| `NEXT_PUBLIC_SITE_URL`                 | URL absoluta de publicação, para metadata; definir no deploy          |

Variáveis `NEXT_PUBLIC_*` são públicas e incorporadas ao bundle no build. Nunca use `service_role` ou `sb_secret_*` nesses campos. A implementação recusa chaves privadas em sua configuração. `.env*` é ignorado, com exceção de `.env.example`, que contém apenas placeholders. Alterações nas variáveis públicas exigem novo build.

Sem um WhatsApp válido, o detalhe informa que o atendimento está indisponível. Não há telefone fictício nem link para destinatário improvisado.

## Supabase e migrations

Projeto criado para esta aplicação: **revenda-veiculos**, referência `yjxxszbkcrozwlklbfiz`, região São Paulo (`sa-east-1`). Não aponte comandos de infraestrutura para projetos de outras aplicações.

Fonte de verdade: `supabase/migrations/`. A migration inicial cria:

- `vehicles`: UUID, identificação, ano, quilometragem inteira, preço `numeric(12,2)`, descrição, opcionais, status, timestamps;
- `admin_profiles`: autorização explícita vinculada a `auth.users`, sem autoinscrição;
- `vehicle_images`: foto vinculada ao veículo, caminho único e data que define a ordem;
- constraints, índices, triggers, função de filtros, grants e RLS;
- bucket `vehicle-images` e políticas administrativas de Storage.

As imagens ficam em tabela separada para controlar integridade, remoção e uploads concorrentes. A exclusão do veículo é restringida enquanto houver fotos, evitando apagar metadados e deixar arquivos esquecidos no Storage. O preço nunca é texto formatado.

Para uma instalação nova, após autenticar o CLI:

```sh
npx supabase login
npx supabase link --project-ref SEU_PROJECT_REF
npx supabase migration list
npx supabase db push
```

Verifique `--help` na versão fixada antes de operar. No projeto já provisionado, confira o histórico antes de aplicar novamente. **Não execute a migration inicial duas vezes e não use reset em produção.** A aplicação não executa DDL automaticamente.

`supabase/config.toml` configura o ambiente local, com seed, cadastro público e login anônimo desativados. Não execute `config push` indiscriminadamente: o arquivo gerado pelo CLI contém opções locais. Compare com `config diff` e aplique somente os ajustes intencionais ao serviço hospedado.

## Primeiro administrador real

1. No painel do projeto Supabase, em **Authentication → Users**, adicione a pessoa real responsável pela administração. Ela deve definir uma senha segura; não coloque a senha no repositório ou em mensagens públicas.
2. Copie o UUID real desse usuário e execute no SQL Editor, como proprietário do banco:

```sql
insert into public.admin_profiles (user_id)
values ('SUBSTITUA_PELO_UUID_REAL_DO_USUARIO'::uuid)
on conflict (user_id) do nothing;
```

3. Entre em `/login` com esse usuário. Estar em `auth.users` por si só não concede acesso administrativo.
4. No painel **Authentication → Sign In / Providers**, desative **Allow new users to sign up** e mantenha login anônimo desativado. A configuração local já faz isso; a configuração hospedada precisa ser aplicada pelo Dashboard ou CLI autenticado.

Para revogar acesso, remova a autorização pelo SQL Editor e revogue as sessões no Auth. A aplicação consulta a autorização no banco em cada operação; não confia em `user_metadata`. Não existe interface pública de provisionamento de usuários.

## Fotos e segurança do Storage

O usuário seleciona JPEG, PNG ou WebP de até 5 MB e 20 megapixels. O servidor autentica, verifica autorização, decodifica com Sharp, recusa formatos arbitrários/animações, remove metadados e reencoda em WebP com dimensão máxima de 1920 px. O bucket aceita somente WebP, até 5 MB. Caminhos: `UUID_DO_VEICULO/UUID_DA_FOTO.webp`, sem nome original do arquivo. Máximo de 24 fotos por veículo, também limitado por trigger.

A primeira foto é a capa. Remoções exigem confirmação. O arquivo é removido do Storage antes dos metadados; caso a segunda operação falhe, a interface pede repetir a remoção. Se um upload falhar ao registrar os metadados, a aplicação tenta remover o arquivo. Existe limpeza explícita de arquivos sem vínculo com mais de uma hora, para recuperar interrupções de conexão sem atingir uploads recentes.

**O bucket é público:** fotos já publicadas continuam acessíveis pelo URL mesmo quando o veículo é reservado/vendido. O catálogo e os metadados desses veículos ficam protegidos por RLS. Nunca envie documentos, rostos de clientes ou informações privadas ao bucket. Para uma futura exigência de revogação de URLs, será necessário bucket privado e entrega autorizada de imagens. URLs antigas podem permanecer no cache por até uma hora após remoção.

As políticas de escrita do Storage exigem um administrador autorizado. O frontend usa apenas Server Actions; nenhuma credencial administrativa é enviada ao navegador. Não use SQL para apagar linhas de `storage.objects`: remova os arquivos pela API do Storage.

## Rotas e organização

```text
src/app/                       páginas, layouts, loading e tratamento de erros
src/app/veiculos/[id]/          detalhes públicos
src/app/login/                 autenticação administrativa
src/app/admin/                 dashboard e gestão do estoque
src/app/admin/veiculos/        cadastro, edição e operações de fotos
src/components/                componentes de UI e formulários
src/lib/                       validação, tipos, Supabase e utilidades
src/proxy.ts                   renovação de sessão; respostas privadas sem cache
supabase/migrations/           infraestrutura versionada
tests/                        testes de lógica crítica e inspeção de arquivos
scripts/verify-supabase.mjs     verificação remota somente leitura
```

`database.generated.ts` foi gerado do schema real. `database.types.ts` deriva os tipos e restringe `status` à união correspondente à constraint SQL (não inferida pelo gerador). Regenere os tipos sempre que alterar a estrutura.

## Validação

A segunda etapa reorganiza a área pública com busca rápida por marca/modelo/preço, filtros avançados por ano/câmbio/quilometragem máxima, fotos maiores e preço destacado. As opções continuam vindo do estoque real. O detalhe apresenta galeria, identificação/preço, especificações, descrição/opcionais e financiamento. `plate_final` permanece no banco e no admin, mas não aparece na interface pública. Os estilos públicos estão isolados em `src/app/public.css`.

### Financiamento e eventos preparados

`FinancingPanel` recebe somente identificação e preço do veículo. A entrada é opcional: vazio significa não informado, e zero significa entrada zero. Aceita centavos com ponto ou vírgula, rejeita negativos e valores acima do preço. Os prazos disponíveis são 24, 36, 48 e 60 meses. Não há taxa configurada, cálculo de parcela, análise de crédito, solicitação de CPF/documentos ou persistência. As preferências vivem apenas no estado do componente e são descartadas ao sair/recarregar.

Com `NEXT_PUBLIC_WHATSAPP_NUMBER` válido, o botão prepara uma mensagem com o veículo, preço, entrada se informada e prazo. O visitante revisa e envia no WhatsApp. Sem telefone válido, o site informa a indisponibilidade e desativa o contato; não improvisa um destinatário. O CTA móvel flutuante fica oculto perto dos filtros, botões dos cards, ações de contato, formulário e rodapé; também fica oculto com menu aberto ou foco no financiamento.

`src/lib/financing.ts` separa validação de preferências e geração da mensagem. Uma futura configuração financeira real deve entrar como dependência explícita, com condições aprovadas e testes próprios; não se deve introduzir uma taxa padrão presumida.

`src/lib/analytics.ts` define `vehicle_view`, `financing_started`, `whatsapp_clicked` e `lead_submitted`. O adaptador padrão não envia, registra, enfileira nem armazena eventos. Os eventos atuais carregam apenas identificador do veículo e origem do contato, nunca entrada, renda, telefone ou documentos. `lead_submitted` está reservado e não é emitido ao abrir WhatsApp. Um futuro adaptador exige decisão explícita sobre finalidade e tratamento dos dados.

Uma futura entidade `financing_requests` poderá relacionar veículo, cliente, contato, preferências e status. Dados como CPF, nascimento e renda só devem ser considerados quando existir necessidade definida, base de tratamento, retenção e controle de acesso. Esta etapa não cria essa tabela. Documentos futuros exigem bucket **privado** e RLS restrita; jamais usar `vehicle-images` para eles.

### Comandos

```sh
npm run typecheck
npm run lint
npm test
npm run build
node scripts/verify-supabase.mjs
```

O último comando depende da configuração real e verifica catálogo, filtros, restrição de leitura administrativa, Storage e opções públicas de Auth, sem criar registros. Os testes unitários usam apenas entradas técnicas isoladas, renderização de componentes e um buffer de pixels em memória; não alimentam banco ou catálogo. Resultados e limites da segunda etapa estão em `docs/VALIDATION-STAGE2.md`.

O workflow GitHub Actions repete TypeScript, lint, testes e build em PRs. CI não exige secrets do Supabase: a conexão é utilizada em tempo de execução, e a ausência de configuração não quebra a compilação.

O estado mais recente de administrador, Auth, RLS e os limites de aceite estão em `docs/FINAL-REVIEW.md`. Os registros anteriores descrevem o estado histórico, não substituem essa revisão.

Antes de publicar, realize o teste de aceite com o primeiro administrador e um veículo real: login, cadastrar, editar, enviar/remover fotos, reservar/vender, verificar que saiu do catálogo e excluir após confirmação. Nenhum usuário ou veículo fictício deve ser criado para esse teste.

## Build e deploy posterior

```sh
npm run build
npm start
```

Não foi feito deploy. A aplicação requer runtime Node.js, Server Actions, rede até o Supabase e suporte a Sharp. Não é uma exportação estática. Use HTTPS, configure as variáveis reais e as URLs de Auth antes da publicação. O host precisa aceitar requisições multipart de pelo menos 6 MB para o limite de fotos implementado; ajuste o limite de upload se o provedor tiver teto inferior.

Confirme a disponibilidade e o plano de backups/PITR do Supabase conforme a operação real. Configure monitoramento, limites de Auth e destinatário comercial antes da abertura ao público. A primeira versão deve ser revisada por Pull Request, sem merge ou publicação automáticos.
