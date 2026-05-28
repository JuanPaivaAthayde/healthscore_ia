# KuriInsightsIngestionAgent

## Missão

Coletar e normalizar dados de resultado, meta e pacing a partir do Kuri Insights e/ou dados reportados pelo cliente, produzindo insumos para `D1 - Resultado / Impacto Racional`.

## Estado Atual

Ainda não implementado como ingestion agent neste projeto.

O `ScoringEngine` já aceita o input de resultado por meio de:

- `ResultImpactInput` em `src/healthscore/types.ts`;
- `resultImpactInputSchema` em `src/healthscore/schemas.ts`;
- `scoreResultImpact` em `src/healthscore/scoring.ts`.

Próximo passo recomendado: criar um mock adapter que normalize meta, realizado e pacing para `ResultImpactInput`.

## Quando Roda

Antes do `ScoringEngine`, junto dos demais ingestion agents.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "kuri_insights_client_id": "ki_001",
  "target_metric": "revenue",
  "target_value": 100000
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "kuri_insights",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "target_metric": "revenue",
    "target_value": 100000,
    "actual_value": 85000,
    "pacing_rate": 0.85,
    "client_reported": true
  },
  "evidence": {
    "external_id": "ki_001",
    "url": "",
    "notes": "Pacing calculado contra meta do período."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## System Prompt

Você é o KuriInsightsIngestionAgent do Healthscore IA. Sua função é normalizar dados de resultado e pacing contra meta. Você não calcula o score final e não deve inferir resultado quando cliente ou fonte não reportarem dado.

## Developer Prompt

- Use somente dados fornecidos.
- Não invente meta, faturamento, leads, vendas ou resultado.
- Se meta ou resultado estiver ausente, marque `missing_data: true`.
- Se houver meta mas não houver resultado reportado, marque flag `client_did_not_report_result`.
- `pacing_rate` deve ser `actual_value / target_value` quando ambos existirem.
- Se a fonte já trouxer `pacing_rate` calculado, ele pode ser enviado diretamente mesmo sem `target_value` e `actual_value`.
- PIC entra em fase futura; não bloqueie a V1 inicial por ausência de PIC.

## Exemplo de Entrada

```json
{
  "account_id": "acc_healthy",
  "period": "2026-05",
  "target_metric": "revenue",
  "target_value": 100000,
  "actual_value": 112000
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_healthy",
  "period": "2026-05",
  "source": "kuri_insights",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "target_metric": "revenue",
    "target_value": 100000,
    "actual_value": 112000,
    "pacing_rate": 1.12,
    "client_reported": true
  },
  "evidence": {
    "external_id": "kuri_insights:acc_healthy:2026-05",
    "url": "",
    "notes": "Resultado acima da meta no período."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": ["target_achieved"]
}
```

## Critérios de Validação

- Deve retornar meta, valor realizado e pacing quando disponíveis.
- Deve marcar dado ausente quando meta ou resultado faltarem.
- Não deve aplicar pontuação de D1 diretamente.
- Deve manter PIC como dependência futura.
- Deve ter teste isolado para pacing 100%+, 80-99%, 60-79%, abaixo de 60% e dado ausente.
- Deve gerar output compatível com `resultImpactInputSchema`.
