# Desenvolvimento do Cappe-in-Miami

Antes de editar, leia docs/AI_MASTER_DIRECTIVE.md, AI_PROJECT_CONTEXT.md, AI_ARCHITECTURE.md, AI_MASTER_BACKLOG.md, AI_CHANGELOG.md, AI_KNOWN_ISSUES.md e AI_NEXT_STEPS.md. Inspecione Git e alterações pendentes quando houver repositório. Código real prevalece sobre documentação desatualizada.

Preserve identidade, modos, mapas, assets e progresso. Não reescreva sistemas inteiros por preferência pessoal. Escolha mudanças justificadas, de alto impacto e baixo risco; documente alternativas quando houver decisão arquitetural. Nunca sobrescreva trabalho do usuário nem use seu save real em testes.

A ordem de scripts e os wrappers globais importam: ao mudar assinatura, examine todos os interceptadores. EXP.reload é recarga de arma; EXP.reloadSave/restoreBackup pertencem à persistência. Não apagar ou renomear as chaves de save sem migração compatível.

Execute node tests/regression.cjs após mudanças relevantes. Use testes em navegador para comportamento visual/áudio/partidas e service worker. Microbenchmark Node não comprova FPS. Nunca declare teste não realizado ou benchmark inventado.

Após alterações de runtime, atualize versão/manifesto de sw.js e os documentos AI pertinentes (contexto, arquitetura, backlog, changelog, decisões, performance, testes, problemas, próximas ações, catálogo). Registre testes e limitações. Não marque backlog como concluído sem cumprir o critério de aceitação.

Leia os problemas conhecidos antes de anunciar multiplayer, offline ou balanceamento como totalmente corrigidos. O prompt descreve evolução em várias sessões, não autoriza inventar 5.000 tarefas nem fazer alterações indiscriminadas.
