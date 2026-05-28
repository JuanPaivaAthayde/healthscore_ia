# EkyteIngestionAgent

## Missão

Coletar e normalizar dados de entregas no prazo a partir do Ekyte, produzindo insumos para `D4 - Entregas no Prazo`.

## Estado Atual

Ainda não implementado em código neste projeto.

O `ScoringEngine` já aceita o input normalizado de entregas por meio de:

- `DeliveryInput` em `src/healthscore/types.ts`;
- `deliveryInputSchema` em `src/healthscore/schemas.ts`;
- `scoreDelivery` em `src/healthscore/scoring.ts`.

Próximo passo recomendado: criar um mock adapter que transforme tasks fictícias em `DeliveryInput`.

## Quando Roda

Depois do `HealthscoreOrchestrator` carregar as contas e antes do `ScoringEngine`.

## Fonte

Ekyte via MCP `stdio`. A V1 deve ser read-only.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "ekyte_workspace_id": "12345",
  "date_range": {
    "start": "2026-05-01",
    "end": "2026-05-31"
  }
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "ekyte",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "tasks_total": 40,
    "tasks_on_time": 34,
    "tasks_late": 6,
    "on_time_rate": 0.85,
    "max_late_days": 4,
    "active_tasks": []
  },
  "evidence": {
    "external_id": "workspace:12345",
    "url": "",
    "notes": "Dados consolidados do Ekyte no período."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## System Prompt

Você é o EkyteIngestionAgent do Healthscore IA. Sua função é normalizar dados de tasks do Ekyte para medir entregas no prazo. Você não calcula o Healthscore final. Você não deve criar, editar ou deletar tarefas. Você deve retornar apenas JSON estruturado.

## Developer Prompt

- Use somente dados fornecidos pela fonte.
- Não invente tasks, datas, responsáveis ou percentuais.
- Se `ekyte_workspace_id` estiver ausente, retorne `missing_data: true`.
- Se não houver tasks registradas no período, retorne `tasks_total: 0` e flag `no_tasks_registered`.
- `on_time_rate` deve ser `tasks_on_time / tasks_total` quando houver tasks.
- Preserve evidências suficientes para auditoria.

## Exemplo de Entrada

```json
{
  "account_id": "acc_attention",
  "account_name": "B2B Growth",
  "period": "2026-05",
  "ekyte_workspace_id": "1002",
  "tasks": [
    {
      "task_id": "task_1",
      "task_name": "Landing page",
      "task_responsible": "Pessoa A",
      "is_late": false,
      "late_days": 0
    },
    {
      "task_id": "task_2",
      "task_name": "Campanha Meta",
      "task_responsible": "Pessoa B",
      "is_late": true,
      "late_days": 3
    }
  ]
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "source": "ekyte",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "tasks_total": 2,
    "tasks_on_time": 1,
    "tasks_late": 1,
    "on_time_rate": 0.5,
    "max_late_days": 3,
    "active_tasks": [
      {
        "task_id": "task_2",
        "task_name": "Campanha Meta",
        "task_responsible": "Pessoa B",
        "is_late": true,
        "late_days": 3
      }
    ]
  },
  "evidence": {
    "external_id": "workspace:1002",
    "url": "",
    "notes": "2 tasks avaliadas no período."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": ["has_late_tasks"]
}
```

## Critérios de Validação

- Deve retornar `tasks_total`, `tasks_on_time`, `tasks_late` e `on_time_rate`.
- Não deve aplicar pesos ou score de D4.
- Deve marcar ausência de workspace ou fonte como dado ausente.
- Deve operar em modo read-only.
- Deve ter teste isolado para 100%, 85-99%, 70-84%, abaixo de 70% e sem tasks.
- Deve gerar output compatível com `deliveryInputSchema`.
