# Agents do Healthscore IA

Esta pasta documenta a arquitetura operacional dos agents do Healthscore IA.

O objetivo destes documentos é deixar prompts, contratos JSON, responsabilidades e critérios de validação prontos antes das chaves e APIs reais. Nenhum agent deve executar ações operacionais na V1; todos devem apenas coletar, normalizar, explicar ou sugerir.

Leia primeiro: [Agent Execution Manual](./agent-execution-manual.md).

## Estado Atual da Implementação

Já existe uma primeira base funcional sem LLM local e sem APIs externas:

- schemas TypeScript/Zod em `src/healthscore/schemas.ts`;
- tipos de domínio em `src/healthscore/types.ts`;
- `ScoringEngine` determinístico em `src/healthscore/scoring.ts`;
- fixtures locais em `src/fixtures/healthscore-fixtures.ts`;
- testes unitários em `src/__tests__/scoring.test.ts`;
- runner local em `src/scripts/run-healthscore-fixtures.ts`.

Decisão arquitetural importante:

- todos os agents, exceto transcrição, rodam localmente no código deste projeto;
- o agent de transcrição roda externamente no n8n;
- o código local terá apenas `TranscriptAgentAdapter` para consumir o output do n8n.

Comandos de validação:

```bash
npm run typecheck
npm test
npm run healthscore:mock
```

## Estratégia de Qualidade

Para saber se o output está correto, a validação deve acontecer em camadas:

1. Teste unitário por função/componente, começando pelo `ScoringEngine`.
2. Teste de contrato com Zod para garantir formato de input/output.
3. Teste isolado por agent, quando os mocks e LLMs forem criados.
4. Teste de integração no `HealthscoreOrchestrator`.
5. Golden fixtures com contas fictícias e status esperado.

Essa separação é obrigatória para descobrir se uma falha futura veio do agent, do schema, do scoring ou do orchestrator.

## Ordem de Execução

1. `HealthscoreOrchestrator`
2. `EkyteIngestionAgent`
3. `FinancialIngestionAgent`
4. `KuriInsightsIngestionAgent`
5. `V4CorpIngestionAgent`
6. `NpsIngestionAgent`
7. `TranscriptAgentAdapter`, consumindo output externo do n8n
8. `ScoringEngine`
9. `RiskDiagnosisAgent`
10. `RecommendationAgent`
11. `AuditExplanationAgent`

## Componentes Fora da V1 Inicial

- `FuturePicValidationAgent`: documentado como arquitetura futura. O PIC não bloqueia a V1 inicial.
- Supabase: persistência final futura, depois das integrações.
- Dashboard Next.js: output principal futuro, depois da base de dados e integração.

## Componentes Externos

- `n8n Transcript Agent`: workflow externo já existente. Não será reimplementado localmente.

O projeto local deve tratar esse workflow como fonte externa, da mesma forma que trata Ekyte, V4Corp, NPS ou financeiro.

## Regra Central

Agents podem interpretar, normalizar, explicar e sugerir. O cálculo do score, pesos, faixas e travas deve ficar no `ScoringEngine`, de forma determinística e testável.

## Padrão dos Arquivos

Cada spec de agent deve conter:

- missão;
- quando roda;
- input esperado;
- output JSON obrigatório;
- system prompt;
- developer prompt;
- regras de segurança e não invenção;
- exemplo de entrada;
- exemplo de saída;
- critérios de validação.

## OpenAI API

Quando implementados, os agents devem usar Structured Outputs com JSON Schema. O modelo deve ser configurável por ambiente, por exemplo `OPENAI_MODEL`, sem fixar modelo no prompt.

Exceção: o agent de transcrição usa a stack já existente do n8n. O projeto local não controla diretamente o prompt runtime dele; controla apenas o contrato de entrada/saída do adapter.

## Critério para Prompts de Produção

Os prompts atuais são V1 documental. Antes de produção, cada prompt deve ganhar:

- schema JSON estrito;
- exemplos positivos e negativos;
- casos de dado ausente;
- política de conflito entre sinais;
- rubrica de confiança;
- evals com outputs esperados;
- versionamento do prompt.

O `ScoringEngine` não deve migrar para prompt/LLM. Ele permanece determinístico.
