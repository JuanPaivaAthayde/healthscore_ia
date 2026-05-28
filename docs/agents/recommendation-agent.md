# RecommendationAgent

## Missão

Transformar score, status e diagnóstico em sugestão operacional aderente ao playbook da RFC.

## Estado Atual

Ainda não implementado em código.

Como o playbook é determinístico por faixa, a primeira versão deve ser uma função pura baseada em `status`, sem OpenAI. A LLM pode entrar depois para personalizar próximos passos sem alterar a ação obrigatória.

## Quando Roda

Depois do `RiskDiagnosisAgent`.

## Input Esperado

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "final_score": 68,
  "status": "Atencao",
  "diagnosis": {},
  "dimensions": []
}
```

## Output JSON Obrigatório

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "suggested_action": {
    "summary": "Realizar diagnóstico focado e plano de ação em até 5 dias úteis com AM.",
    "owner": "Coordenador de PEG",
    "deadline": "5 dias úteis",
    "required_record": "Plano de ação com prazo no V4Corp.",
    "next_steps": []
  },
  "playbook_status": "Atencao",
  "constraints": [
    "Sugestão apenas informativa; não executar ação automaticamente."
  ]
}
```

## System Prompt

Você é o RecommendationAgent do Healthscore IA. Sua função é sugerir a próxima ação operacional com base no status da conta e no diagnóstico. Você deve seguir o playbook da RFC. Você não executa ações, não cria tarefas e não altera sistemas externos.

## Developer Prompt

- Para `Saudavel`, sugerir oportunidade de expansão e acionar AM.
- Para `Atencao`, sugerir diagnóstico focado e plano em até 5 dias úteis com AM.
- Para `Risco`, sugerir reunião com cliente em até 48h e escala para Gerente de PEG.
- Para `Critico`, sugerir Save Plan, direção envolvida, reunião emergencial e revisão de contrato/escopo.
- Sempre indicar registro exigido.
- Pode sugerir próximos passos específicos ao driver de risco, mas sem sair do playbook.

## Exemplo de Entrada

```json
{
  "account_id": "acc_critical",
  "period": "2026-05",
  "final_score": 32,
  "status": "Critico",
  "diagnosis": {
    "main_risk_driver": "D6 - Saúde Financeira",
    "diagnosis": "Conta crítica por inadimplência recorrente e queda de resultado."
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_critical",
  "period": "2026-05",
  "suggested_action": {
    "summary": "Ativar Save Plan com envolvimento da direção, reunião emergencial com cliente e revisão de contrato e escopo.",
    "owner": "Coordenador de PEG",
    "deadline": "Imediato",
    "required_record": "Save Plan com responsável, prazo e critério de saída da faixa no V4Corp.",
    "next_steps": [
      "Validar situação financeira com responsável interno.",
      "Agendar reunião emergencial com cliente.",
      "Definir critério objetivo para saída de Crítico."
    ]
  },
  "playbook_status": "Critico",
  "constraints": [
    "Sugestão apenas informativa; não executar ação automaticamente."
  ]
}
```

## Critérios de Validação

- Deve seguir exatamente a faixa do status recebido.
- Não deve criar ação fora do playbook.
- Não deve executar nada em sistemas externos.
- Deve ser claro o suficiente para virar registro operacional.
- Deve ter teste isolado para `Saudavel`, `Atencao`, `Risco` e `Critico`.
- Deve validar que a ação obrigatória da RFC nunca é removida por sugestão personalizada.
