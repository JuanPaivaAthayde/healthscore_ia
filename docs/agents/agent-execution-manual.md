# Agent Execution Manual

Manual global de execução dos agents e do orchestrator do Healthscore IA.

Este documento guia humanos, IAs e futuros implementadores sobre como executar, validar e depurar o sistema.

## Regra de Arquitetura

Todos os agents rodam localmente no código deste projeto, exceto o agent de transcrição.

- Agents locais: ingestion, scoring, diagnóstico, recomendação, auditoria e orquestração.
- Agent externo: transcrição e análise de reuniões via n8n.
- Adapter local: `TranscriptAgentAdapter`, responsável por consumir o output do n8n.

## Responsabilidades por Camada

### Agents Locais

Podem:

- coletar dados;
- normalizar inputs;
- classificar sinais;
- sugerir ações;
- consolidar auditoria;
- produzir JSON validável.

Não podem:

- executar ações operacionais automaticamente;
- alterar V4Corp, Ekyte, Google Chat ou Supabase sem etapa futura explícita;
- inventar dados ausentes;
- calcular o score final fora do `ScoringEngine`.

### Agent n8n de Transcrição

Responsável por:

- monitorar Google Drive;
- identificar transcrições;
- extrair texto;
- analisar com IA;
- publicar no Google Chat;
- entregar indicador, sentimento, tom, resumo e próximos passos.

O projeto local não controla a execução desse agent. Ele apenas consome seu resultado.

### ScoringEngine

Responsável por:

- calcular D1 a D6;
- aplicar pesos;
- aplicar trava financeira;
- definir score final;
- definir status.

O `ScoringEngine` não chama LLM.

## Ordem de Execução

1. `HealthscoreOrchestrator`
2. `EkyteIngestionAgent`
3. `FinancialIngestionAgent`
4. `KuriInsightsIngestionAgent`
5. `V4CorpIngestionAgent`
6. `NpsIngestionAgent`
7. `TranscriptAgentAdapter`, lendo output do n8n
8. `ScoringEngine`
9. `RiskDiagnosisAgent`
10. `RecommendationAgent`
11. `AuditExplanationAgent`

## Política de Output Correto

Um output é considerado correto quando:

- passa no schema Zod ou JSON Schema correspondente;
- não contém dados inventados;
- preserva fonte, período e conta;
- declara dados ausentes explicitamente;
- inclui flags relevantes;
- pode ser reproduzido com o mesmo input;
- não viola a responsabilidade do componente.

## Estratégia de Teste

O sistema deve ser testado em camadas:

1. Teste unitário de funções determinísticas.
2. Teste isolado de cada agent.
3. Teste de contrato com schema.
4. Teste de integração do orchestrator.
5. Golden fixtures com output esperado.

Se um teste de integração falhar, investigar nesta ordem:

1. input da fixture;
2. output do agent isolado;
3. validação de schema;
4. transformação do orchestrator;
5. scoring;
6. diagnóstico/recomendação/auditoria.

## Política de Dados Ausentes

Nunca inferir dado ausente.

Quando faltar dado:

- marcar `missing_data: true` quando o payload for de agent;
- adicionar flag `missing_*`;
- registrar `missing_reason`;
- manter evidência da tentativa de coleta quando existir;
- deixar o `ScoringEngine` aplicar a penalização prevista na RFC.

## Política de Conflito Entre Fontes

Quando duas fontes conflitarem:

- não escolher silenciosamente;
- registrar flag `source_conflict`;
- preservar os dois sinais;
- permitir que o diagnóstico explique a divergência;
- preferir regra determinística somente quando existir regra explícita.

Exemplos:

- V4Corp diz check-in realizado, mas transcript ausente: preservar check-in e marcar transcrição ausente.
- n8n indica `🔴`, mas V4Corp marca coordenador Feliz: preservar ambos e marcar conflito relacional.
- Financeiro indica atraso recorrente: trava financeira prevalece sobre score composto.

## Política de Confiança

Agents LLM devem retornar confiança quando fizerem interpretação.

Faixas recomendadas:

- `0.80` a `1.00`: alta confiança;
- `0.60` a `0.79`: confiança média;
- abaixo de `0.60`: baixa confiança.

Baixa confiança deve gerar flag e aparecer na auditoria.

O `ScoringEngine` não usa confiança para mudar regra determinística, salvo regra futura explícita.

## Política de Erro

Erro em um ingestion agent não deve derrubar toda a execução quando a conta ainda puder ser avaliada parcialmente.

O orchestrator deve:

- registrar qual agent falhou;
- preservar stack/message internamente;
- emitir flag de falha;
- seguir com dado ausente quando seguro;
- bloquear somente se não houver dados mínimos para identificar conta/período.

## Versionamento

Todo agent futuro deve ter:

- `agent_name`;
- `agent_version`;
- `prompt_version`;
- `schema_version`;
- `rules_version`, quando aplicável.

O `ScoringEngine` deve expor `rules_version`, começando por `healthscore-v1`.

## Critérios Para Produção

Antes de usar com dados reais:

- schemas de todos os agents definidos;
- fixtures com pelo menos 10 contas;
- golden outputs revisados;
- testes unitários do scoring cobrindo todos os thresholds;
- testes isolados dos adapters;
- teste de integração do orchestrator;
- logs estruturados;
- política de retry definida;
- secrets fora do código;
- prompt/eval dos agents LLM versionados.

