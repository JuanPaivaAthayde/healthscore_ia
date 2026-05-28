# FinancialIngestionAgent

## Missão

Coletar e normalizar dados financeiros da conta, especialmente inadimplência em dias e recorrência, produzindo insumos para `D6 - Saúde Financeira` e para a trava financeira.

## Estado Atual

Ainda não implementado como ingestion agent neste projeto.

O `ScoringEngine` já aceita o input financeiro por meio de:

- `FinancialInput` em `src/healthscore/types.ts`;
- `financialInputSchema` em `src/healthscore/schemas.ts`;
- `scoreFinancialHealth` e `getFinancialCap` em `src/healthscore/scoring.ts`.

Próximo passo recomendado: criar um mock adapter que normalize linhas fictícias da planilha financeira para `FinancialInput`.

## Quando Roda

Antes do `ScoringEngine`, junto dos demais ingestion agents.

## Fonte

Planilha financeira da Gabi ou fonte equivalente definida futuramente.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "financial_source_id": "row_123"
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "financial",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "overdue_days": 0,
    "is_overdue": false,
    "is_recurring_overdue": false,
    "financial_cap": null
  },
  "evidence": {
    "external_id": "row_123",
    "url": "",
    "notes": "Cliente em dia."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## System Prompt

Você é o FinancialIngestionAgent do Healthscore IA. Sua função é normalizar dados financeiros e identificar atraso, recorrência e teto financeiro aplicável. Você não calcula o score final e não deve inferir situação financeira sem dados.

## Developer Prompt

- Use somente dados financeiros recebidos.
- Não invente pagamentos, datas ou recorrência.
- Se o dado financeiro não existir, retorne `missing_data: true`.
- A trava financeira deve seguir a RFC:
  - até 7 dias: sem trava;
  - 8 a 20 dias: teto 79;
  - 21 a 45 dias: teto 59;
  - acima de 45 dias ou recorrente: teto 39.
- Retorne flags explícitas para atraso e recorrência.

## Exemplo de Entrada

```json
{
  "account_id": "acc_critical",
  "period": "2026-05",
  "financial_row": {
    "account_name": "Inside Sales Pro",
    "overdue_days": 51,
    "recurring_overdue_months": 2
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_critical",
  "period": "2026-05",
  "source": "financial",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "overdue_days": 51,
    "is_overdue": true,
    "is_recurring_overdue": true,
    "financial_cap": 39
  },
  "evidence": {
    "external_id": "financial:acc_critical:2026-05",
    "url": "",
    "notes": "Atraso acima de 45 dias e recorrência em 2 meses."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": ["overdue_above_45_days", "recurring_overdue", "financial_cap_39"]
}
```

## Critérios de Validação

- Deve retornar `overdue_days`, `is_overdue`, `is_recurring_overdue` e `financial_cap`.
- Deve aplicar apenas a trava financeira, não o Healthscore completo.
- Deve marcar dados financeiros ausentes.
- Deve preservar evidência da fonte.
- Deve ter teste isolado para travas 79, 59 e 39.
- Deve gerar output compatível com `financialInputSchema`.
