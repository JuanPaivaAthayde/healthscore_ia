# Fixtures

Fixtures iniciais para testar mentalmente o fluxo antes das integrações reais.

## Estado Atual

As fixtures executáveis já existem em `src/fixtures/healthscore-fixtures.ts`.

Elas são usadas por:

- `npm test`
- `npm run healthscore:mock`

Este documento descreve a intenção das fixtures. A fonte de verdade executável fica no arquivo TypeScript.

## Conta Saudável

```json
{
  "account": {
    "account_id": "acc_healthy",
    "account_name": "Kuri Store",
    "period": "2026-05",
    "coordinator_id": "coord_001",
    "coordinator_name": "Coordenador A",
    "am_id": "am_001",
    "am_name": "AM A",
    "segment": "ecommerce",
    "metadata": {
      "ekyte_workspace_id": "1001"
    }
  },
  "expected_status": "Saudavel",
  "notes": "Resultado acima da meta, relacionamento positivo, operação ativa, entregas no prazo, NPS promotor e financeiro em dia."
}
```

## Conta em Atenção/Risco

```json
{
  "account": {
    "account_id": "acc_attention",
    "account_name": "B2B Growth",
    "period": "2026-05",
    "coordinator_id": "coord_002",
    "coordinator_name": "Coordenador B",
    "am_id": "am_002",
    "am_name": "AM B",
    "segment": "b2b",
    "metadata": {
      "ekyte_workspace_id": "1002"
    }
  },
  "expected_status": "Atencao",
  "notes": "Resultado parcial, humor neutro ou negativo, NPS sem resposta e algumas tasks atrasadas."
}
```

## Conta Crítica

```json
{
  "account": {
    "account_id": "acc_critical",
    "account_name": "Inside Sales Pro",
    "period": "2026-05",
    "coordinator_id": "coord_003",
    "coordinator_name": "Coordenador C",
    "am_id": "am_003",
    "am_name": "AM C",
    "segment": "inside_sales",
    "metadata": {
      "ekyte_workspace_id": "1003"
    }
  },
  "expected_status": "Critico",
  "notes": "Resultado abaixo de 60%, relacionamento negativo, funil não estruturado, entregas abaixo de 70%, NPS detrator e inadimplência acima de 45 dias."
}
```

## Uso Esperado

Estas fixtures não substituem testes automatizados. Elas servem para validar se os prompts, schemas e fluxo estão coerentes antes de conectar APIs reais.
