# ScoringEngine

## Missão

Calcular dimensões, score bruto, trava financeira, score final e status com base nas regras da RFC.

## Natureza

O `ScoringEngine` não é um agent LLM. Ele deve ser determinístico, testável e versionado em código.

## Estado Atual

Implementado em `src/healthscore/scoring.ts`.

Coberto por testes em `src/__tests__/scoring.test.ts`.

Fixtures locais em `src/fixtures/healthscore-fixtures.ts`.

Runner manual:

```bash
npm run healthscore:mock
```

## Quando Roda

Depois que todos os ingestion agents e o `TranscriptAgentAdapter` entregarem seus sinais normalizados.

## Input Esperado

Formato conceitual externo:

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "signals": [],
  "transcript_signal": {},
  "rules_version": "healthscore-v1"
}
```

Formato interno atual:

```json
{
  "account": {
    "accountId": "acc_001",
    "accountName": "Cliente Exemplo",
    "period": "2026-05",
    "segment": "ecommerce"
  },
  "period": "2026-05",
  "result": {},
  "relationship": {},
  "trafficOperation": {},
  "delivery": {},
  "nps": {},
  "financial": {}
}
```

## Output JSON Obrigatório

Formato conceitual externo:

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "raw_score": 78.4,
  "final_score": 78,
  "status": "Atencao",
  "financial_cap_applied": false,
  "financial_cap_value": null,
  "dimensions": []
}
```

Formato interno atual:

```json
{
  "accountId": "acc_001",
  "accountName": "Cliente Exemplo",
  "period": "2026-05",
  "rawScore": 78.4,
  "finalScore": 78,
  "status": "Atencao",
  "financialCap": {
    "applied": false,
    "value": null,
    "reason": null
  },
  "dimensions": [],
  "flags": [],
  "missingData": [],
  "generatedAt": "2026-05-27T15:00:00.000Z"
}
```

## Exemplo de Entrada

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "signals": [
    {
      "source": "ekyte",
      "data": {
        "tasks_total": 10,
        "tasks_on_time": 8,
        "tasks_late": 2,
        "on_time_rate": 0.8
      }
    },
    {
      "source": "financial",
      "data": {
        "overdue_days": 0,
        "is_recurring_overdue": false,
        "financial_cap": null
      }
    }
  ],
  "transcript_signal": {
    "stakeholder_mood": "negative",
    "confidence": 0.82
  },
  "rules_version": "healthscore-v1"
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "raw_score": 68.4,
  "final_score": 68,
  "status": "Atencao",
  "financial_cap_applied": false,
  "financial_cap_value": null,
  "dimensions": [
    {
      "dimension": "D4",
      "name": "Entregas no Prazo",
      "score": 50,
      "weight": 0.15,
      "weighted_score": 7.5,
      "reason": "80% das tasks foram entregues no prazo.",
      "flags": [],
      "evidence_refs": ["ekyte:acc_attention:2026-05"]
    }
  ]
}
```

## Regras de Dimensão

### D1 - Resultado / Impacto Racional

- 100% ou mais da meta: 100 pontos.
- 80% a 99%: 75 pontos.
- 60% a 79%: 50 pontos.
- abaixo de 60%: 25 pontos.
- dado ausente: 10 pontos.
- PIC ausente: futuro, não bloqueia V1 inicial.

### D2 - Relacionamento & Engajamento

- humor positivo + coordenador feliz + check-in realizado: 100 pontos.
- humor neutro + check-in realizado: 65 pontos.
- humor negativo + check-in realizado: 35 pontos.
- check-in sem avaliação do coordenador: 50 pontos.
- nenhum check-in: 20 pontos.
- cliente ausente em 2+ reuniões: teto da dimensão 40.

### D3 - Operação de Tráfego

- funil estruturado: +40 pontos.
- tracking ativo: +40 pontos.
- verba dentro do mínimo: +20 pontos.
- verba abaixo do mínimo: -20 pontos.
- tracking não implementado: -20 pontos.
- funil não estruturado: dimensão 0.

### D4 - Entregas no Prazo

- 100% no prazo: 100 pontos.
- 85% a 99%: 80 pontos.
- 70% a 84%: 50 pontos.
- abaixo de 70%: 20 pontos.
- sem tasks registradas: 0 pontos.

### D5 - Satisfação / NPS

- NPS 9 ou 10 + comentário positivo: 100 pontos.
- NPS 7 ou 8: 65 pontos.
- NPS 0 a 6: 20 pontos.
- NPS 0 a 6 + comentário negativo confirmado: 10 pontos.
- não respondeu: 45 pontos.

### D6 - Saúde Financeira

- em dia: 100 pontos.
- 1 a 2 dias de atraso: 80 pontos.
- 3 a 7 dias: 50 pontos.
- 8 a 15 dias: 25 pontos.
- acima de 15 dias ou recorrente: 0 pontos + trava aplicada.

## Pesos

```json
{
  "D1": 0.25,
  "D2": 0.2,
  "D3": 0.2,
  "D4": 0.15,
  "D5": 0.12,
  "D6": 0.08
}
```

## Status

- 80 a 100: `Saudavel`
- 60 a 79: `Atencao`
- 40 a 59: `Risco`
- 0 a 39: `Critico`

## Critérios de Validação

- Deve produzir o mesmo resultado para o mesmo input.
- Não deve chamar OpenAI API.
- Deve expor `raw_score` e `final_score`.
- Deve indicar se a trava financeira foi aplicada.
- Deve retornar uma lista de `DimensionScore`.
- Deve passar em `npm run typecheck`.
- Deve passar em `npm test`.
- Deve manter fixtures saudavel, atenção e crítica com status esperado.
