# Registro de validação da primeira implementação

Verificações realizadas em 9 de setembro de 2026.

## Aplicação

- Instalação das dependências: concluída, versões fixadas e lockfile.
- TypeScript: aprovado, sem erros.
- ESLint: aprovado, sem avisos.
- Testes: 11 aprovados; validação de números/campos/status/opcionais, filtros, URL WhatsApp, formato e conteúdo das imagens, reencodificação e remoção de metadados.
- Build Next.js de produção: aprovado, inclusive com `.env.local` conectada ao projeto real.
- Auditoria de dependências de produção: nenhuma vulnerabilidade reportada.
- Navegador: catálogo conectado vazio, filtros com faixa de preço invertida, login, redirecionamento de acesso direto a `/admin/veiculos/novo` para `/login`; revisão visual de desktop e celular, sem transbordamento horizontal nas páginas públicas verificadas.

## Serviço real

Projeto `revenda-veiculos`, referência `yjxxszbkcrozwlklbfiz`, região `sa-east-1`.

- Migrations `initial_platform` e `consolidate_read_policies` aplicadas via integração Supabase.
- Tabelas `vehicles`, `vehicle_images` e `admin_profiles` verificadas com RLS ativa.
- Bucket `vehicle-images`: público, limite 5 MB, MIME WebP, políticas administrativas de leitura/listagem, upload, alteração e exclusão verificadas.
- Consulta anônima via Data API do catálogo e RPC de filtros: aprovada, zero registros.
- Leitura anônima de `admin_profiles`: negada.
- Role anônima: sem privilégio de INSERT em veículos ou administradores.
- Role autenticada sem autorização: `is_admin()` falso; sem privilégios de INSERT, UPDATE ou DELETE em `admin_profiles`.
- Security Advisor: sem avisos de segurança na verificação final.
- Performance Advisor: sem warnings após consolidar as políticas de leitura. Um aviso informativo de índice ainda não utilizado permanece, esperado no banco vazio; o índice atende à chave estrangeira e à ordenação das fotos ([referência do Supabase](https://supabase.com/docs/guides/database/database-linter?lint=0005_unused_index)).
- Nenhum veículo, usuário ou administrador foi criado. Nenhuma imagem foi enviada ao Storage.

## Limites da validação

Não houve teste ponta a ponta com administrador autorizado, CRUD de veículo real ou upload remoto, pois ainda não existe um usuário administrativo real e não foram fornecidos dados reais de veículo. Os componentes correspondentes foram implementados, compilados e revisados; isso não equivale a um teste funcional autenticado completo.

O teste do processador de imagens usa somente pixels gerados em memória. Não cria fotografia de veículo, arquivo de demonstração nem registro no Supabase.

O cadastro público hospedado permanece habilitado (`disable_signup=false`, verificado no endpoint público de Auth). A aplicação não oferece cadastro e RLS impede que um usuário comum obtenha autorização administrativa. Ainda assim, desative **Allow new users to sign up** no Dashboard antes do uso operacional. O conector não oferece alteração dessa configuração; o CLI e o Dashboard exigiram autenticação adicional indisponível nesta sessão. A configuração local já desativa cadastro e login anônimo.

## Aceite com dados reais

Após autorizar o primeiro administrador e configurar o WhatsApp, validar: login; criação de veículo real; campos e opcionais; fotos reais e capa; edição; filtros; mensagem WhatsApp; reserva/venda removendo o veículo do catálogo; remoção de fotos e exclusão confirmada. Não usar dados fictícios.

Não houve deploy nem merge automático.
