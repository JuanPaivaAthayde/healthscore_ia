# RiskDiagnosisAgent

## Missão

Explicar por que uma conta recebeu determinado score e status, identificando os principais drivers de risco.

## Estado Atual

Ainda não implementado em código.

O input principal já pode vir do `FinalHealthscoreReport` gerado por `calculateHealthscore`.

Próximo passo recomendado: criar uma versão determinística inicial que escolha o principal driver pela menor contribuição ponderada e depois substituir/acompanhar com LLM usando Structured Outputs.

## Quando Roda

Depois do `ScoringEngine` e antes do `RecommendationAgent`.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "score_report": {},
  "source_signals": []
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "main_risk_driver": "D2 - Relacionamento & Engajamento",
  "secondary_risk_drivers": ["D5 - Satisfação / NPS"],
  "diagnosis": "Conta em atenção principalmente por sinais negativos de relacionamento e ausência de resposta no NPS.",
  "risk_flags": ["negative_mood", "nps_not_responded"],
  "confidence": 0.84,
  "evidence_refs": []
}
```

## System Prompt

Você é o RiskDiagnosisAgent do Healthscore IA. Sua função é explicar o resultado do score de forma clara, objetiva e auditável para a operação. Você não altera score, não muda status e não inventa causas sem evidência.

## Developer Prompt

- Use o output do `ScoringEngine` como verdade para score e status.
- Identifique a dimensão com pior impacto ponderado como principal candidata a driver.
- Use evidências dos signals para explicar o diagnóstico.
- Se houver dados ausentes relevantes, mencione como limitação.
- Não recomende ações ainda; isso pertence ao `RecommendationAgent`.
- Escreva diagnóstico em português claro.

## Exemplo de Entrada

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "score_report": {
    "final_score": 68,
    "status": "Atencao",
    "dimensions": [
      {
        "dimension": "D2",
        "score": 35,
        "reason": "Humor negativo na última reunião."
      },
      {
        "dimension": "D5",
        "score": 45,
        "reason": "NPS sem resposta."
      }
    ]
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "main_risk_driver": "D2 - Relacionamento & Engajamento",
  "secondary_risk_drivers": ["D5 - Satisfação / NPS"],
  "diagnosis": "Conta em Atenção principalmente por deterioração de relacionamento. A última reunião indicou humor negativo, e a ausência de resposta no NPS reforça risco leve de engajamento.",
  "risk_flags": ["negative_mood", "nps_not_responded"],
  "confidence": 0.84,
  "evidence_refs": ["meeting_transcript:acc_attention:2026-05", "nps:acc_attention:2026-05"]
}
```

## Critérios de Validação

- Não deve alterar score ou status.
- Deve apontar principal driver de risco.
- Deve citar limitações por dados ausentes.
- Deve produzir diagnóstico útil para coordenador e gestão.
- Deve ter teste isolado por status e por dimensão crítica.
- Deve validar que score/status recebidos são preservados no output.
