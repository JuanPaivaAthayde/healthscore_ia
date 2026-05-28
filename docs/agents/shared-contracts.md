# Shared Contracts

Contratos JSON globais usados entre orchestrator, ingestion agents, scoring engine e agents interpretativos.

## Contratos Implementados em Código

Os contratos de domínio já existem em:

- `src/healthscore/types.ts`
- `src/healthscore/schemas.ts`

A documentação abaixo usa `snake_case` porque representa o payload externo esperado para APIs/LLMs. O código TypeScript atual usa `camelCase` internamente. A fronteira futura entre API/LLM e domínio deve converter explicitamente entre esses formatos.

## AccountInput

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "coordinator_id": "coord_001",
  "coordinator_name": "Coordenador PEG",
  "am_id": "am_001",
  "am_name": "Account Manager",
  "segment": "ecommerce",
  "metadata": {
    "v4corp_client_id": "v4_001",
    "ekyte_workspace_id": "12345",
    "kuri_insights_client_id": "ki_001"
  }
}
```

## NormalizedSourceSignal

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "ekyte",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {},
  "evidence": {
    "external_id": "task_123",
    "url": "",
    "notes": "Dados normalizados a partir da fonte original."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## DimensionScore

```json
{
  "dimension": "D4",
  "name": "Entregas no Prazo",
  "score": 80,
  "weight": 0.15,
  "weighted_score": 12,
  "reason": "85% das tasks foram entregues no prazo no período.",
  "flags": [],
  "missing_data": [],
  "evidence_refs": ["ekyte:acc_001:2026-05"]
}
```

## FinalHealthscoreReport

Forma externa esperada:

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "raw_score": 78.4,
  "final_score": 78,
  "status": "Atencao",
  "financial_cap_applied": false,
  "financial_cap_value": null,
  "dimensions": [],
  "main_risk_driver": "D2 - Relacionamento & Engajamento",
  "secondary_risk_drivers": ["D5 - Satisfação / NPS"],
  "diagnosis": "Conta em atenção por sinais relacionais e baixa resposta de satisfação.",
  "suggested_action": {
    "summary": "Realizar diagnóstico focado e plano de ação em até 5 dias úteis.",
    "owner": "Coordenador de PEG",
    "deadline": "5 dias úteis",
    "required_record": "Plano de ação com prazo no V4Corp.",
    "next_steps": []
  },
  "flags": [],
  "missing_data": [],
  "sources": ["ekyte", "financial", "kuri_insights", "v4corp", "nps", "meeting_transcript"],
  "generated_at": "2026-05-27T12:00:00-03:00"
}
```

Forma interna atual no TypeScript:

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

Cada item de `dimensions` também possui `missingData`, para que ausência de dados seja propagada por contrato em vez de inferida por convenção de nome de flag.

## HealthscoreInput Interno

Este é o formato usado hoje pelo `ScoringEngine` local:

```json
{
  "account": {
    "accountId": "acc_001",
    "accountName": "Cliente Exemplo",
    "period": "2026-05",
    "segment": "ecommerce",
    "metadata": {
      "ekyte_workspace_id": "12345"
    }
  },
  "period": "2026-05",
  "result": {
    "targetMetric": "revenue",
    "targetValue": 100000,
    "actualValue": 85000,
    "pacingRate": 0.85,
    "clientReported": true
  },
  "relationship": {
    "stakeholderMood": "neutral",
    "coordinatorMoodRating": "Neutro",
    "monthlyCheckinDone": true,
    "clientAbsencesConsecutive": 0
  },
  "trafficOperation": {
    "hasStructuredFunnel": true,
    "kuriTrackingActive": true,
    "mediaBudgetMeetsMinimum": true
  },
  "delivery": {
    "tasksTotal": 10,
    "tasksOnTime": 9,
    "tasksLate": 1
  },
  "nps": {
    "responded": false,
    "npsScore": null,
    "commentSentiment": null
  },
  "financial": {
    "overdueDays": 0,
    "isRecurringOverdue": false
  }
}
```

Regras de fronteira:

- `account.period` deve ser igual ao `period` top-level.
- `pacingRate` pode ser informado diretamente quando a fonte já trouxer o pacing calculado.
- Quando `pacingRate` vier direto, `targetValue` e `actualValue` podem estar ausentes.
- Zod é a fonte de verdade dos contratos internos; os tipos TypeScript são derivados dos schemas.

## Enums

Status:

- `Saudavel`
- `Atencao`
- `Risco`
- `Critico`
- `Incompleto`

Sources:

- `ekyte`
- `financial`
- `kuri_insights`
- `v4corp`
- `nps`
- `meeting_transcript`
- `pic_future`

Missing data policy:

- Não inferir dado ausente.
- Marcar `missing_data: true`.
- Preencher `missing_reason`.
- Adicionar flag explícita em `flags`.
