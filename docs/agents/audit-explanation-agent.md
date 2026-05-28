# AuditExplanationAgent

## Missão

Consolidar o relatório final de uma conta de forma rastreável, explicável e pronta para persistência futura no Supabase e exibição no dashboard.

## Estado Atual

Ainda não implementado em código.

O input base já existe parcialmente no `FinalHealthscoreReport` interno. Quando diagnóstico e recomendação forem implementados, este agent deve apenas consolidar, sem recalcular ou reclassificar.

## Quando Roda

Depois do `RecommendationAgent`, como última etapa do fluxo.

## Input Esperado

```json
{
  "account": {},
  "source_signals": [],
  "score_report": {},
  "diagnosis": {},
  "recommendation": {}
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "executive_summary": "Conta em Atenção com principal risco em relacionamento.",
  "audit_summary": {
    "sources_used": [],
    "missing_data": [],
    "flags": [],
    "evidence_refs": []
  },
  "final_report": {}
}
```

## System Prompt

Você é o AuditExplanationAgent do Healthscore IA. Sua função é consolidar o resultado final com evidências, fontes, flags, dados ausentes e explicação executiva. Você não altera score, status, diagnóstico nem recomendação.

## Developer Prompt

- Preserve o score e status do `ScoringEngine`.
- Preserve o diagnóstico do `RiskDiagnosisAgent`.
- Preserve a ação sugerida pelo `RecommendationAgent`.
- Liste fontes usadas e dados ausentes.
- Explique em português claro.
- O output deve ser fácil de persistir e fácil de exibir no dashboard.
- Não oculte limitações.

## Exemplo de Entrada

```json
{
  "account": {
    "account_id": "acc_attention",
    "account_name": "B2B Growth",
    "period": "2026-05"
  },
  "score_report": {
    "final_score": 68,
    "status": "Atencao"
  },
  "diagnosis": {
    "main_risk_driver": "D2 - Relacionamento & Engajamento",
    "diagnosis": "Conta em Atenção por sinais negativos de relacionamento."
  },
  "recommendation": {
    "suggested_action": {
      "summary": "Realizar diagnóstico focado e plano de ação em até 5 dias úteis."
    }
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_attention",
  "account_name": "B2B Growth",
  "period": "2026-05",
  "executive_summary": "B2B Growth está em Atenção com score 68. O principal ponto de atenção é Relacionamento & Engajamento.",
  "audit_summary": {
    "sources_used": ["ekyte", "financial", "v4corp", "nps", "meeting_transcript"],
    "missing_data": [],
    "flags": ["negative_mood", "nps_not_responded"],
    "evidence_refs": ["meeting_transcript:acc_attention:2026-05"]
  },
  "final_report": {
    "final_score": 68,
    "status": "Atencao",
    "main_risk_driver": "D2 - Relacionamento & Engajamento",
    "suggested_action": "Realizar diagnóstico focado e plano de ação em até 5 dias úteis."
  }
}
```

## Critérios de Validação

- Deve consolidar sem alterar decisões anteriores.
- Deve listar fontes e dados ausentes.
- Deve gerar resumo executivo curto.
- Deve preparar payload útil para dashboard e banco futuro.
- Deve ter teste isolado garantindo que score, status, diagnóstico e recomendação são preservados.
- Deve validar presença de flags, evidências e `missingData`.
