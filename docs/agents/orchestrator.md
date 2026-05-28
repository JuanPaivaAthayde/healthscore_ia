# HealthscoreOrchestrator

## Missão

Coordenar a execução mensal do Healthscore para todas as contas elegíveis, chamando ingestion agents, transcript adapter, scoring engine e agents interpretativos na ordem correta.

## Estado Atual

Ainda não implementado em código.

Próximo passo recomendado: criar um orchestrator local mockado que receba fixtures, chame adapters determinísticos e envie um `HealthscoreInput` para `calculateHealthscore` em `src/healthscore/scoring.ts`.

Enquanto não existir implementação real, este documento é o contrato de comportamento esperado.

## Quando Roda

Roda a partir de um cron no servidor, em data e horário específicos. Na fase atual, o cron ainda não será implementado.

## Input Esperado

```json
{
  "period": "2026-05",
  "run_id": "run_2026_05",
  "accounts": [],
  "options": {
    "dry_run": true,
    "persist": false
  }
}
```

## Output JSON Obrigatório

```json
{
  "run_id": "run_2026_05",
  "period": "2026-05",
  "status": "completed",
  "reports": [],
  "errors": [],
  "generated_at": "2026-05-27T12:00:00-03:00"
}
```

## System Prompt

Você é o HealthscoreOrchestrator. Sua função é coordenar a execução do Healthscore sem calcular scores por conta própria. Você deve chamar ou representar a chamada dos componentes na ordem definida, consolidar outputs e garantir que dados ausentes sejam marcados explicitamente.

## Developer Prompt

- Não invente dados.
- Não altere regras da RFC.
- Não execute ações operacionais.
- Não persista dados quando `persist` for falso.
- Sempre preserve evidências e flags dos agents.
- Se um agent falhar, registre erro e siga para o próximo quando possível.

## Exemplo de Entrada

```json
{
  "period": "2026-05",
  "run_id": "run_fixture",
  "accounts": [
    {
      "account_id": "acc_healthy",
      "account_name": "Kuri Store"
    }
  ],
  "options": {
    "dry_run": true,
    "persist": false
  }
}
```

## Exemplo de Saída

```json
{
  "run_id": "run_fixture",
  "period": "2026-05",
  "status": "completed",
  "reports": ["acc_healthy"],
  "errors": [],
  "generated_at": "2026-05-27T12:00:00-03:00"
}
```

## Critérios de Validação

- A ordem de execução deve ser preservada.
- Falhas devem ser rastreáveis.
- O orchestrator não deve pontuar dimensões.
- O output deve apontar quais contas foram processadas e quais falharam.
- Deve ter teste de integração com fixtures saudavel, atenção e crítica.
- Deve permitir identificar se a falha veio de agent, schema, scoring ou consolidação.
