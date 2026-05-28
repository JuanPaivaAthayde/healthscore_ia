# FuturePicValidationAgent

## Missão

Validar existência e qualidade mínima do PIC e do handover comercial antes de uma conta entrar na régua normal de Healthscore.

## Estado Atual

Não implementado e fora da V1 inicial.

O código atual não bloqueia contas por ausência de PIC. Essa decisão deve permanecer até a fase futura descrita aqui.

## Status

Futuro. Este agent não bloqueia a V1 inicial.

Na V1 inicial:

- contas sem PIC continuam sendo processadas;
- ausência de PIC pode ser registrada como `future_requirement`;
- `Healthscore Incompleto` fica documentado, mas não ativo.

## Quando Rodará

Antes dos ingestion agents, como primeiro gate de elegibilidade da conta.

## Input Esperado Futuro

```json
{
  "account_id": "acc_001",
  "account_name": "Cliente Exemplo",
  "period": "2026-05",
  "pic": {
    "exists": true,
    "objective": "Aumentar receita mensal",
    "target_metrics": ["revenue"],
    "impact_deadline": "2026-08-31",
    "responsibles": ["Coordenador PEG", "Cliente"]
  }
}
```

## Output JSON Futuro

```json
{
  "account_id": "acc_001",
  "period": "2026-05",
  "eligible_for_healthscore": true,
  "status_if_blocked": null,
  "missing_requirements": [],
  "flags": [],
  "notes": "PIC completo."
}
```

## System Prompt Futuro

Você é o FuturePicValidationAgent do Healthscore IA. Sua função é validar se a conta possui PIC e handover mínimo para entrar na régua normal do Healthscore. Você deve ser rigoroso, mas não deve inventar informações ausentes.

## Developer Prompt Futuro

- Validar objetivo pactuado.
- Validar métricas-alvo.
- Validar prazo de impacto.
- Validar responsáveis.
- Se faltar item obrigatório, retornar `eligible_for_healthscore: false`.
- Quando bloqueado, retornar `status_if_blocked: Healthscore Incompleto`.

## Exemplo de Entrada

```json
{
  "account_id": "acc_no_pic",
  "account_name": "Conta Sem PIC",
  "period": "2026-05",
  "pic": {
    "exists": false
  }
}
```

## Exemplo de Saída

```json
{
  "account_id": "acc_no_pic",
  "period": "2026-05",
  "eligible_for_healthscore": false,
  "status_if_blocked": "Healthscore Incompleto",
  "missing_requirements": ["objective", "target_metrics", "impact_deadline", "responsibles"],
  "flags": ["missing_pic"],
  "notes": "Conta sem PIC definido."
}
```

## Critérios de Validação

- Não deve bloquear a V1 inicial.
- Deve estar pronto para virar gate futuro.
- Deve deixar claro quais requisitos estão ausentes.
- Deve preservar a regra da RFC sobre `Healthscore Incompleto`.
- Quando implementado, deve ter teste garantindo que contas sem PIC recebem `Healthscore Incompleto`.
- Até lá, testes atuais não devem depender de PIC.
