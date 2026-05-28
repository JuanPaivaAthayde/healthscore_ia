# V4CorpIngestionAgent

## Missão

Coletar e normalizar dados operacionais do V4Corp, especialmente funil estruturado, tracking, verba mínima, avaliação manual do coordenador e check-in mensal.

## Estado Atual

Ainda não implementado como ingestion agent neste projeto.

O `ScoringEngine` já aceita parte dos dados vindos do V4Corp por meio de:

- `TrafficOperationInput` para D3;
- `RelationshipInput` para avaliação manual, check-in e ausências;
- schemas correspondentes em `src/healthscore/schemas.ts`.

Próximo passo recomendado: criar um mock adapter que separe campos V4Corp em `trafficOperation` e `relationship`.

## Quando Roda

Antes do `ScoringEngine`, junto dos demais ingestion agents.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "v4corp_client_id": "v4_001"
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "v4corp",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "has_structured_funnel": true,
    "kuri_tracking_active": true,
    "media_budget_meets_minimum": true,
    "coordinator_mood_rating": "Feliz",
    "monthly_checkin_done": true,
    "client_absences_consecutive": 0
  },
  "evidence": {
    "external_id": "v4_001",
    "url": "",
    "notes": "Campos operacionais do V4Corp."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## System Prompt

Você é o V4CorpIngestionAgent do Healthscore IA. Sua função é normalizar campos operacionais vindos do V4Corp para as dimensões de relacionamento e operação de tráfego. Você não deve alterar dados no V4Corp e não deve executar ações operacionais.

## Developer Prompt

- Use somente dados recebidos do V4Corp.
- Não invente avaliação do coordenador.
- Se um campo obrigatório estiver ausente, marque em `missing_data_fields`.
- Verba abaixo do mínimo deve gerar flag `media_budget_below_minimum`.
- Funil não estruturado deve gerar flag `unstructured_funnel`.
- Tracking inativo deve gerar flag `tracking_inactive`.

## Exemplo de Entrada

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "v4corp_fields": {
    "has_structured_funnel": true,
    "kuri_tracking_active": false,
    "media_budget_meets_minimum": false,
    "coordinator_mood_rating": "Neutro",
    "monthly_checkin_done": true,
    "client_absences_consecutive": 1
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "source": "v4corp",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "has_structured_funnel": true,
    "kuri_tracking_active": false,
    "media_budget_meets_minimum": false,
    "coordinator_mood_rating": "Neutro",
    "monthly_checkin_done": true,
    "client_absences_consecutive": 1
  },
  "evidence": {
    "external_id": "v4corp:acc_attention:2026-05",
    "url": "",
    "notes": "Tracking inativo e verba abaixo do mínimo."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": ["tracking_inactive", "media_budget_below_minimum"]
}
```

## Critérios de Validação

- Deve retornar campos necessários para D2 e D3.
- Deve preservar dados manuais sem reinterpretação.
- Não deve escrever no V4Corp.
- Deve destacar campos ausentes ou alertas operacionais.
- Deve ter teste isolado para funil não estruturado, tracking inativo e verba abaixo do mínimo.
- Deve gerar outputs compatíveis com `trafficOperationInputSchema` e `relationshipInputSchema`.
