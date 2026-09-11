# Continuidade e revisão remota — 11/09/2026

## Referência e ponto da interrupção

Fonte de verdade: GitHub, branch `codex/initial-platform`, [PR #1](https://github.com/rogeriolamadril/revenda-veiculos/pull/1), destinado a `main`. A retomada encontrou HEAD `8829d82bda28850520f890476e3b2b4f5b1d1c8b`, PR aberto e sem merge.

Histórico já publicado, preservado:

- `4741838`: catálogo e administração Supabase.
- `fe4481f`: redesign do catálogo.
- `13c0f77`: experiência preparatória de financiamento.
- `a7b4fe1`: testes e documentação da segunda etapa.
- `8829d82`: galeria e controles acessíveis de contato.

A execução interrompida estava na revisão remota: havia lido código e consultado Supabase, sem publicar um novo commit. Os testes adicionais e o registro da configuração remota ainda não haviam sido publicados. As correções de galeria, contato flutuante, diálogos e quebra de preço já estavam em `8829d82`; não foram refeitas.

Esta revisão acrescenta testes de limites e documentação. Preserva código da aplicação, design, dependências, migrations e infraestrutura. Não depende da pasta ou do Git local.

## WhatsApp e futura hospedagem

A configuração continua exclusivamente em `NEXT_PUBLIC_WHATSAPP_NUMBER`. Não existe fallback com telefone no código.

Na futura hospedagem Vercel, após autorização específica para essa etapa, definir a variável em **Project Settings → Environment Variables**, com o telefone comercial real: somente dígitos, país **55**, DDD e número. Aplicar aos ambientes autorizados **antes do build**. Não é necessário criar ou versionar `.env.local`. O número foi fornecido pelo proprietário; este documento não o replica.

O prefixo `NEXT_PUBLIC_` torna esse contato comercial público e o Next.js incorpora seu valor no build. Trocar a variável exige novo build. Isso não autoriza expor senhas, tokens, chaves privadas ou credenciais do Supabase. [Comportamento oficial das variáveis públicas](https://nextjs.org/docs/app/guides/self-hosting#environment-variables).

Revisados os CTAs de interesse e financiamento e o contato flutuante. A mensagem inclui identificação, ano e preço do veículo; no financiamento inclui prazo e, somente quando informada, entrada. O texto é codificado com `encodeURIComponent`. Sem telefone válido, os links não são produzidos e a interface informa indisponibilidade. Nenhuma mensagem foi enviada nem ambiente de hospedagem foi criado/configurado.

## Catálogo, fotos, financiamento e administração

- Catálogo e detalhes públicos consultam somente `disponivel`, com cliente anônimo mesmo se houver sessão administrativa. Reservados/vendidos não aparecem como disponíveis. Falha de consulta é erro, não estoque vazio.
- A consulta real desta revisão encontrou um veículo disponível e uma foto cadastrada. Não foi apagado estoque para testar vazio. O estado vazio foi revisado pelo código e por testes isolados.
- Zero, uma e múltiplas fotos têm cobertura de renderização/lógica, incluindo navegação circular e seleção após remoção/reordenação. Upload exige autenticação/autorização, valida conteúdo, limita 5 MB/20 MP, reencoda WebP, preserva proporção até 1920 px e limita 24 fotos.
- Os novos testes de imagens geram buffers de pixels somente em memória; não criam fotos de demonstração no projeto nem enviam arquivos ao Supabase.
- Financiamento mantém entrada opcional e 24/36/48/60 meses. Sem taxa, parcela calculada, promessa de aprovação, CPF, documentos ou persistência.
- Login não autoriza administração. As páginas e Server Actions verificam usuário no Auth e vínculo explícito em `admin_profiles`. Criação, edição, status, exclusão e operações de fotos foram revisados tecnicamente, inclusive validação e erros. O teste de normalização do formulário não substitui os controles de autorização do servidor e RLS.
- Não foram executadas mutações de CRUD com dados reais para teste. O aceite autenticado em navegador permanece pendente.

## Supabase, Auth e Storage

Projeto existente `revenda-veiculos`, referência `yjxxszbkcrozwlklbfiz`, região São Paulo. Somente consultas necessárias de leitura, sem recriar projeto, aplicar migrations ou alterar dados.

A consulta confirmou um administrador real vinculado ao Auth. Nenhum email, UID, senha ou dado pessoal desse administrador é publicado neste registro. Não criar outro administrador.

RLS está ativa em `vehicles`, `vehicle_images`, `admin_profiles` e `storage.objects`. Visitante não pode ler perfis administrativos nem criar veículos; usuário comum não pode se conceder autorização. Escritas administrativas exigem `private.is_admin()`. Políticas públicas de veículos/fotos restringem os metadados ao estoque disponível.

O bucket `vehicle-images` é público, aceita WebP até 5 MB e mantém escrita restrita a administradores e caminhos de veículo válidos. Há um objeto WebP. **URLs de fotos públicas continuam acessíveis quando o veículo é reservado/vendido**; RLS não torna esses arquivos privados. Não armazenar documentos de financiamento nesse bucket.

Signup hospedado não pôde ser reconfirmado: a integração não expõe a configuração; o navegador disponível nesta retomada redirecionou o painel para login, sem sessão autenticada. Não foi alterado nem declarado desativado. Passo manual restrito ao projeto: **Authentication → Sign In / Providers → Allow new users to sign up → OFF**. Manter login anônimo desativado. [Configuração oficial do Auth](https://supabase.com/docs/guides/auth/general-configuration).

A desativação de signup é defesa adicional: uma conta autenticada comum continua sem privilégio administrativo. Nenhuma proteção foi enfraquecida e não foi ativado recurso pago de proteção contra senhas vazadas.

## Validação e limites

O commit anterior tem [CI aprovada com 26 testes](https://github.com/rogeriolamadril/revenda-veiculos/actions/runs/34611857167). Esta revisão acrescenta seis casos:

1. Aceitação dos três estados administrativos do estoque.
2. Normalização do formulário completo e descarte de campos não pertencentes ao veículo.
3. Redimensionamento WebP preservando proporção.
4. Rejeição por limite de pixels mesmo com arquivo comprimido pequeno.
5. Estado vazio com ação acessível para limpar filtros.
6. Contato de financiamento configurado, encoding e prazo inicial, sem inventar entrada.

O workflow existente executa `npm ci`, typecheck, lint, testes e build para a branch/PR. O resultado desta publicação e o SHA exato devem ser consultados nos checks do PR; este texto não antecipa aprovação.

Não houve nova inspeção visual da aplicação em 360, 390, 430 px, tablet ou desktop. O navegador está disponível, mas não há preview remoto acessível da aplicação, e esta etapa não faz deploy nem depende da cópia local. A inspeção histórica em 360 × 800 está em `FINAL-REVIEW.md`; não equivale a validação visual desta revisão.

Pendências de aceite: revisão visual nos tamanhos pedidos (incluindo menu, galeria com múltiplas fotos, modal, admin e contato flutuante), sessão real para aceite autenticado de CRUD/fotos, confirmação/desativação do signup hospedado e configuração do telefone no futuro ambiente de hospedagem. Não é necessário sincronizar a pasta local para avaliar este PR.

## Publicação e custo

Somente testes e documentação são selecionados para este commit. `.gitignore` continua excluindo ambientes, dependências, build e temporários. Não são publicados `.env`, `.env.local`, credenciais, secrets, `node_modules` ou `.next`.

Publicação na mesma branch pela integração GitHub, preservando histórico e sem force push. O repositório é público e usa o runner padrão `ubuntu-latest`, coberto pelo [uso gratuito de GitHub Actions em repositórios públicos](https://docs.github.com/en/billing/concepts/product-billing/github-actions). Sem runner ampliado, recurso pago, assinatura, upgrade ou nova infraestrutura.

Nenhuma ação geradora de cobrança foi executada. **Sem merge e sem deploy.**
