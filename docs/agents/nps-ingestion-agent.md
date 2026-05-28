# NpsIngestionAgent

## Missão

Coletar e normalizar respostas de NPS mensal, analisando comentário quando existir e produzindo insumos para `D5 - Satisfação / NPS`.

## Estado Atual

Ainda não implementado como ingestion agent neste projeto.

O `ScoringEngine` já aceita o input de NPS por meio de:

- `NpsInput` em `src/healthscore/types.ts`;
- `npsInputSchema` em `src/healthscore/schemas.ts`;
- `scoreNps` em `src/healthscore/scoring.ts`.

Próximo passo recomendado: criar um mock adapter determinístico para nota/resposta e, depois, substituir apenas a análise de sentimento por LLM com Structured Outputs.

## Quando Roda

Antes do `ScoringEngine`, junto dos demais ingestion agents.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "nps_response": {
    "score": 9,
    "comment": "Estamos satisfeitos com a evolução."
  }
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "nps",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "responded": true,
    "nps_score": 9,
    "nps_bucket": "promoter",
    "comment": "Estamos satisfeitos com a evolução.",
    "comment_sentiment": "positive",
    "sentiment_confidence": 0.86
  },
  "evidence": {
    "external_id": "nps:acc_001:2026-05",
    "url": "",
    "notes": "Resposta NPS mensal."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## System Prompt

Você é o NpsIngestionAgent do Healthscore IA. Sua função é normalizar NPS e classificar sentimento do comentário quando houver texto. Você não deve suavizar respostas negativas nem inventar comentário ausente.

## Developer Prompt

- Se não houver resposta, retorne `responded: false`, `nps_score: null` e flag `nps_not_responded`.
- Classifique `nps_bucket` como `promoter`, `neutral`, `detractor` ou `not_responded`.
- Analise sentimento apenas quando houver comentário.
- Sentimentos válidos: `positive`, `neutral`, `negative`, `unknown`.
- Não aplique a pontuação de D5; isso pertence ao `ScoringEngine`.
- Se houver NPS promotor com comentário negativo, preserve os dois sinais. O `ScoringEngine` tratará como conflito de sentimento.

## Exemplo de Entrada

```json
{
  "account_id": "acc_critical",
  "period": "2026-05",
  "nps_response": {
    "score": 4,
    "comment": "Estamos frustrados com atrasos e falta de previsibilidade."
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_critical",
  "period": "2026-05",
  "source": "nps",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "responded": true,
    "nps_score": 4,
    "nps_bucket": "detractor",
    "comment": "Estamos frustrados com atrasos e falta de previsibilidade.",
    "comment_sentiment": "negative",
    "sentiment_confidence": 0.91
  },
  "evidence": {
    "external_id": "nps:acc_critical:2026-05",
    "url": "",
    "notes": "Comentário negativo confirmado."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": ["nps_detractor", "negative_comment"]
}
```

## Critérios de Validação

- Deve diferenciar ausência de resposta de NPS baixo.
- Deve classificar bucket de NPS corretamente.
- Deve analisar sentimento apenas quando houver comentário.
- Não deve calcular D5 diretamente.
- Deve ter teste isolado para promotor, neutro, detrator, detrator com comentário negativo e sem resposta.
- Deve gerar output compatível com `npsInputSchema`.
