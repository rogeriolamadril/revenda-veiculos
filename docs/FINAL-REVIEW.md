# Revisão antes do merge — 11/09/2026

Base: `a7b4fe1`, branch `codex/initial-platform`, PR #1. Design e arquitetura preservados. Sem deploy, merge, nova infraestrutura, mudança de plano ou operação paga.

## Correções

- Galeria: seleção acompanha a URL da foto, em vez de manter um índice que pode sair da lista após remoção/reordenação. A troca de veículo reinicia a seleção. A navegação circular funciona na primeira/última foto, com entrada pelo teclado quando há múltiplas imagens. Miniaturas que falham exibem estado textual.
- Contato flutuante: paginação, ação do estado vazio e “Escolher um veículo” também ocultam o botão quando visíveis. Formulário, demais CTAs e rodapé já participavam dessa regra.
- Diálogos de confirmação: IDs únicos e descrição associada para leitores de tela.
- Preços longos: quebra de linha nos cards, detalhe e financiamento para evitar transbordamento do texto.

## Validação executada

- Typecheck, lint e build de produção: aprovados.
- 26 testes unitários: aprovados. Seis novos casos cobrem identificação/preço no CTA de interesse, seleção da galeria após alterações, navegação circular, zero/uma foto e estrutura acessível de uma/múltiplas fotos. Caminhos de imagens e dados técnicos existem apenas em testes isolados, sem arquivos/fotos/veículos enviados ao Supabase.
- O `npm test` local continua bloqueado antes dos testes pelo erro `uv_os_get_passwd` do `tsx` no Windows restrito. Os 26 testes foram executados com `node:test` e transpilações TypeScript pelo runner local ignorado em `work/`. O CI mantém o comando normal; seu resultado é registrado no PR.
- HTTP local: `/admin` e `/admin/veiculos/novo` entregam redirecionamento de streaming para `/login`, sem formulário administrativo; `/login` contém o formulário de senha. Endereço de veículo inválido mostra a página de indisponibilidade. A resposta inicial 200 dessas rotas em streaming não foi confundida com autorização de acesso.

## Responsividade e acesso ao ambiente

Nenhuma instância de navegador está disponível nesta sessão. Portanto, não foi possível executar nova revisão visual real em 360, 390, 430, 768 ou 1440 px. O resultado visual anterior de 360 × 800 permanece histórico e não valida automaticamente as correções atuais. CSS revisado, mas sem declarar aprovação visual por inspeção de código.

Faltam exercícios visuais do menu, textos longos, múltiplas fotos e contato flutuante. A implementação contém breakpoints para celular/tablet/desktop, mas o aceite exige navegador disponível. Não foram adicionadas imagens de demonstração para contornar essa limitação.

## WhatsApp e financiamento

`NEXT_PUBLIC_WHATSAPP_NUMBER` está vazio. Informar o telefone comercial real com país e DDD em `.env.local`, na raiz do projeto, sem aspas/links improvisados; depois reiniciar o servidor ou refazer o build. Não enviar esse arquivo ao Git. Em uma futura hospedagem, informar a mesma variável no ambiente do serviço, somente após autorização de deploy.

Sem telefone válido, não há destinatário alternativo: contatos e botão flutuante ficam ausentes, a interface informa indisponibilidade e o botão de financiamento permanece desativado. Encoding, identificação, preço, entrada opcional e prazo são cobertos por testes isolados. Nenhuma mensagem foi enviada. Preservados os prazos de 24/36/48/60 meses, sem taxa, parcelas, aprovação, CPF, documentos ou persistência.

## Supabase e administração reais

Consultas somente leitura ao projeto `yjxxszbkcrozwlklbfiz` confirmaram:

- Um usuário real no Auth e uma autorização correspondente em `admin_profiles`; zero autorizações órfãs. **Não é necessário criar outro administrador.** Não foram lidos e-mails, senhas ou tokens.
- Um veículo e uma foto registrados. Storage contém um objeto com MIME WebP no bucket público `vehicle-images`, limitado a 5 MB e `image/webp`. Não existe implementação de documentos financeiros.
- RLS ativa em `vehicles`, `vehicle_images`, `admin_profiles` e `storage.objects`.
- `anon` não pode ler administradores nem criar veículos. `authenticated` não pode inserir/alterar autorizações administrativas. Políticas de escrita de veículos/fotos/Storage exigem `private.is_admin()`, que consulta autorização explícita e não usa metadados editáveis pelo usuário.
- Consulta como `anon`: um veículo visível, zero veículos com status não público. Consulta como `authenticated` sem identidade: autorização falsa, zero perfis administrativos e zero objetos do Storage visíveis.

Login, páginas administrativas e Server Actions foram revisados: exigem usuário validado e autorização explícita; salvamento valida campos/status e conflito de edição; uploads validam autorização, conteúdo/limites e fazem reencodificação; remoção de veículos exige limpeza prévia de fotos. Nenhuma mutação real foi executada durante o aceite. Falta exercício autenticado com o administrador existente; nunca compartilhar senha ou token em documentação/PR.

## Auth e aviso do Advisor

O conector disponível não expõe leitura/alteração da configuração de signup. O teste HTTP das configurações públicas foi impedido pela restrição de rede do processo local (`EACCES`); o CLI não tem token e o navegador está indisponível. Portanto, o estado atual de signup **não foi reconfirmado**. O último resultado anterior era habilitado; não afirmar que foi desativado nesta revisão.

Passo manual: abrir o projeto → **Authentication → Sign In / Providers** → desativar **Allow new users to sign up** e salvar; manter **Allow anonymous sign-ins** desativado. Isso permite login dos usuários já existentes. [Configuração oficial](https://supabase.com/docs/guides/auth/general-configuration). Autenticação isolada continua sem conceder administração, independentemente dessa configuração.

O Security Advisor retornou um aviso: proteção contra senhas vazadas desativada. A [documentação oficial](https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection) limita esse recurso ao plano Pro ou superior. Nenhum upgrade/ativação foi realizado, respeitando a regra de custo zero. Nenhum outro aviso de segurança foi retornado nesta consulta.

## Publicação

O `.git` local permanece protegido contra escrita. As alterações desta revisão são publicadas pela integração GitHub sobre o commit remoto existente, sem force, na mesma branch do PR #1. Os arquivos locais são preservados; o status local continua incluindo alterações já publicadas enquanto os metadados não puderem ser sincronizados.

Antes do envio, revisar diff, seleção e `.gitignore`, excluindo ambientes, dependências, build, temporários e credenciais. Nenhuma alteração foi feita em migrations, RLS, contas, plano ou infraestrutura.
