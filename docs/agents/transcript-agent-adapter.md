# TranscriptAgentAdapter

## Missão

Acoplar o agent de transcrição de reunião que roda no n8n ao fluxo local do Healthscore IA, sem recriar sua lógica interna.

## Estado Atual

Ainda não implementado em código neste projeto.

O `ScoringEngine` já aceita parte desse resultado por meio de `RelationshipInput.stakeholderMood`.

Próximo passo recomendado: criar um adapter local que receba o output do workflow n8n e normalize para `RelationshipInput`.

## Status

O agent de transcrição já está pronto e funcionando fora deste projeto. Ele roda em n8n, monitora Google Drive, analisa transcrições com IA e publica a análise no Google Chat.

Este projeto não deve reimplementar esse agent. Deve apenas consumir seu output.

## Arquitetura Externa

Fluxo do n8n:

1. `Google Drive Trigger`
2. `Filter Transcript Files`
3. `Download Transcript`
4. `Extract Transcript Text`
5. `Build Analysis Input`
6. `Analyze Transcript`
7. `Parse Analysis`
8. `Build Chat Message`
9. `Send to Google Chat Space`

Arquivo base do workflow:

- `google-meet-transcript-analysis.json`

## Quando Roda

Antes do `ScoringEngine`, junto dos ingestion agents. Seu output alimenta `D2 - Relacionamento & Engajamento`.

Importante: quem roda a análise de transcrição é o n8n. O adapter local roda apenas quando o Healthscore precisar consumir o resultado já produzido.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "meeting_id": "meet_001",
  "n8n_analysis": {
    "meeting_title": "Reunião Mensal",
    "owner": "Coordenador PEG",
    "participants": ["Cliente", "V4"],
    "indicator": "🟡",
    "indicator_reason": "Houve progresso, mas existem dependências em aberto.",
    "client_sentiment": "preocupado",
    "client_tone": "colaborativo",
    "executive_summary": "Resumo em dois parágrafos.",
    "next_steps": {
      "v4_alignments": [],
      "client_alignments": [],
      "v4_tasks": [],
      "client_tasks": []
    }
  }
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "source": "meeting_transcript",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "stakeholder_mood": "neutral",
    "meeting_indicator": "🟡",
    "client_sentiment": "preocupado",
    "client_tone": "colaborativo",
    "indicator_reason": "Houve progresso, mas existem dependências em aberto.",
    "signals": [
      "cliente preocupado dificilmente deve gerar verde"
    ],
    "summary": "Resumo em dois parágrafos.",
    "next_steps": {
      "v4_alignments": [],
      "client_alignments": [],
      "v4_tasks": [],
      "client_tasks": []
    }
  },
  "evidence": {
    "external_id": "meet_001",
    "url": "",
    "notes": "Output recebido do agent de transcrição."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": []
}
```

## System Prompt

Você é o TranscriptAgentAdapter do Healthscore IA. Sua função é receber o output do agent de transcrição existente e convertê-lo para o contrato normalizado do Healthscore. Você não reanalisa a transcrição quando o agent externo já entregou resultado.

## Developer Prompt

- Não recrie o prompt do agent de transcrição.
- Não chame IA para reanalisar a transcrição.
- Não mude o indicador, sentimento ou tom sem evidência explícita.
- Se o output externo vier incompleto, marque `missing_data: true`.
- Valores válidos para `stakeholder_mood`: `positive`, `neutral`, `negative`, `unknown`.
- Preserve indicador, justificativa, sentimento, tom, resumo e próximos passos fornecidos pelo n8n.
- Mapeie indicador/sentimento/tom para `stakeholder_mood` apenas para alimentar D2.

## Mapeamento para Healthscore

Mapeamento inicial sugerido:

- indicador `🟢` + sentimento satisfeito/positivo -> `stakeholder_mood: positive`;
- indicador `🟡` ou sentimento preocupado/neutro -> `stakeholder_mood: neutral`;
- indicador `🔴` ou sentimento insatisfeito/estressado/frustrado -> `stakeholder_mood: negative`;
- transcrição vazia, incompleta ou "Não houve reunião" -> `stakeholder_mood: unknown`, flag `no_meeting_or_insufficient_transcript`.

Regra de coerência:

- cliente preocupado não deve virar `positive`;
- cliente insatisfeito, frustrado ou estressado deve virar `negative`;
- cliente colaborativo pode continuar `neutral` se houver risco relevante.

## Exemplo de Entrada

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "n8n_analysis": {
    "meeting_title": "Check-in Mensal",
    "owner": "Coordenador B",
    "participants": ["Cliente", "V4"],
    "indicator": "🟡",
    "indicator_reason": "Há progresso, mas o cliente demonstrou preocupação com prazo de impacto.",
    "client_sentiment": "preocupado",
    "client_tone": "colaborativo",
    "executive_summary": "Cliente alinhado, porém com ressalvas sobre previsibilidade.",
    "next_steps": {
      "v4_alignments": ["Revisar prazo de impacto"],
      "client_alignments": ["Enviar dados pendentes"],
      "v4_tasks": ["Atualizar plano de ação"],
      "client_tasks": ["Enviar histórico de vendas"]
    }
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_attention",
  "period": "2026-05",
  "source": "meeting_transcript",
  "collected_at": "2026-05-27T12:00:00-03:00",
  "data": {
    "stakeholder_mood": "neutral",
    "meeting_indicator": "🟡",
    "client_sentiment": "preocupado",
    "client_tone": "colaborativo",
    "indicator_reason": "Há progresso, mas o cliente demonstrou preocupação com prazo de impacto.",
    "signals": [
      "cliente preocupado",
      "dependência de dados do cliente"
    ],
    "summary": "Cliente alinhado, porém com ressalvas sobre previsibilidade.",
    "next_steps": {
      "v4_alignments": ["Revisar prazo de impacto"],
      "client_alignments": ["Enviar dados pendentes"],
      "v4_tasks": ["Atualizar plano de ação"],
      "client_tasks": ["Enviar histórico de vendas"]
    }
  },
  "evidence": {
    "external_id": "meeting_transcript:acc_attention:2026-05",
    "url": "",
    "notes": "Normalizado a partir do agent externo de transcrição."
  },
  "missing_data": false,
  "missing_reason": null,
  "flags": ["yellow_meeting_indicator", "client_concern"]
}
```

## Critérios de Validação

- Deve tratar o agent externo como fonte de verdade.
- Deve adaptar formato, não reinterpretar conteúdo.
- Deve indicar dados ausentes quando o output externo estiver incompleto.
- Deve alimentar D2 sem calcular score diretamente.
- Deve ter teste isolado com mood positivo, neutro, negativo e unknown.
- Deve validar mapeamento de `🟢`, `🟡`, `🔴` e "Não houve reunião".
- Deve validar que o adapter não reexecuta análise de IA.
