# Instruções permanentes

- Nunca criar dados fictícios, seeds de veículos, clientes, administradores ou métricas simuladas. Testes unitários devem usar apenas entradas técnicas isoladas, nunca registros persistidos de demonstração.
- Catálogo e métricas vêm exclusivamente do Supabase. Falha de conexão não equivale a estoque vazio.
- Nunca inserir secrets em código, logs ou commits. Nunca usar service role no frontend; a aplicação utiliza somente chave pública e sessão do usuário.
- Preservar RLS, autorização explícita em admin_profiles e validação no servidor. Login não concede autorização administrativa.
- Não alterar infraestrutura de forma destrutiva sem autorização. Migrations são a fonte de verdade.
- Preservar responsividade, acessibilidade, estados vazios e mensagens de erro compreensíveis.
- Usar TypeScript estrito e componentes pequenos. Manter versões fixas e lockfile.
- Antes de concluir, executar typecheck, lint, testes e build. Nunca declarar uma verificação não executada como aprovada.
- Trabalhar em branch própria e abrir PR; não fazer merge ou deploy automaticamente.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
