# Healthscore V1 — Kuri & Co.

# Premissas de Design

Régua única para toda a carteira  
Frequência de atualização: mensal  
Dono operacional: Coordenador de PEG  
Plataforma de visualização: V4Corp  
Prazo de implementação: 60 dias  
Bloqueio de PIC: conta sem PIC definido recebe flag Healthscore Incompleto e não entra na régua normal.   
Pré-requisito obrigatório: checklist mínimo de handover comercial para a operação (objetivo pactuado, métricas-alvo, prazo de impacto, responsáveis).

# Tabela de Pesos — V1

O Healthscore é composto por 6 dimensões com peso total de 100%. A fórmula final é: Score \= (D1 x 0,25) \+ (D2 x 0,20) \+ (D3 x 0,20) \+ (D4 x 0,15) \+ (D5 x 0,12) \+ (D6 x 0,08)  
D1 — Resultado / Impacto Racional | Peso: 25% | Fonte: Kuri Insights \+ cliente | Frequência: Mensal  
Pacing de resultado contra meta do PIC. Se cliente não reporta dado, penaliza como dado ausente com impacto negativo no projeto.  
D2 — Relacionamento & Engajamento | Peso: 20% | Fonte: Transcrição (agente) \+ campo manual V4Corp | Frequência: Mensal  
Humor do stakeholder na última reunião (extraído pelo agente via transcrição) \+ avaliação do coordenador (Feliz / Neutro / Infeliz) \+ presença no check-in mensal.  
D3 — Operação de Tráfego | Peso: 20% | Fonte: V4Corp \+ Kuri Insights | Frequência: Mensal  
Funil estruturado (e-commerce ou inside sales) sim/não \+ Kuri Insights tracking ativo sim/não \+ verba dentro do mínimo setado sim/não. Verba abaixo do mínimo penaliza o score pois o time deveria ter identificado.  
D4 — Entregas no Prazo | Peso: 15% | Fonte: Ekyte via MCP | Frequência: Mensal  
% de tasks entregues no prazo no período. Tasks atrasadas contam para o squad inteiro independente do responsável interno.  
D5 — Satisfação (NPS) | Peso: 12% | Fonte: Formulário mensal | Frequência: Mensal  
NPS mensal com análise de sentimento do comentário via LLM quando houver texto. NPS sem resposta não zera, mas gera penalização de \-5 pts.  
D6 — Saúde Financeira | Peso: 8% | Fonte: Planilha Gabi | Frequência: Mensal  
Inadimplência em dias. Funciona também como dimensao de trava (ver seção abaixo).

# Regras de Trava — Saúde Financeira

Independente do score composto, a inadimplência limita o TETO do score final:  
Em dia ou até 7 dias de atraso: sem trava (score livre)  
8 a 20 dias de atraso: score máximo \= 79  
21 a 45 dias de atraso: score máximo \= 59  
Acima de 45 dias ou inadimplência recorrente (2+ meses): score máximo \= 39 e entra automaticamente como Crítico  
Verba de mídia abaixo do mínimo: flag de alerta obrigatório no V4Corp (não trava o score mas gera notificação ao coordenador)

# Critérios de Scoring por Dimensão

D1 — Resultado / Impacto Racional (25%)  
Meta atingida 100% ou mais: 100 pontos  
Pacing entre 80 e 99%: 75 pontos  
Pacing entre 60 e 79%: 50 pontos  
Pacing abaixo de 60%: 25 pontos  
Cliente não reportou dado (sem faturamento ou sem meta no PIC): 10 pontos  
Conta sem PIC definido: flag Healthscore Incompleto — dimensão bloqueada  
D2 — Relacionamento & Engajamento (20%)  
Humor positivo (agente) \+ coordenador marca Feliz \+ check-in realizado: 100 pontos  
Humor neutro \+ check-in realizado: 65 pontos  
Humor negativo \+ check-in realizado: 35 pontos  
Check-in realizado mas coordenador não preencheu avaliação: 50 pontos (penaliza coordenador)  
Nenhum check-in no mês: 20 pontos — risco automático  
Cliente ausente em 2+ reuniões consecutivas: score máximo da dimensão \= 40  
D3 — Operação de Tráfego (20%)  
Funil estruturado implementado: \+40 pontos  
Kuri Insights tracking ativo: \+40 pontos  
Verba dentro do mínimo setado: \+20 pontos  
Verba abaixo do mínimo: \-20 pontos  
Tracking não implementado: \-20 pontos  
Funil não estruturado: dimensão \= 0  
D4 — Entregas no Prazo (15%)  
100% das tasks no prazo: 100 pontos  
85 a 99%: 80 pontos  
70 a 84%: 50 pontos  
Abaixo de 70%: 20 pontos  
Sem tasks registradas no período: 0 pontos (sem registro \= sem controle)  
D5 — Satisfação NPS (12%)  
NPS 9 ou 10 (promotor) \+ comentário positivo: 100 pontos  
NPS 7 ou 8 (neutro): 65 pontos  
NPS 0 a 6 (detrator): 20 pontos  
NPS 0 a 6 \+ comentário negativo confirmado por LLM: 10 pontos  
Não respondeu: 45 pontos — sinal de risco leve  
D6 — Saúde Financeira (8%)  
Em dia: 100 pontos  
1 a 2 dias de atraso: 80 pontos  
3 a 7 dias: 50 pontos  
8 a 15 dias: 25 pontos  
Acima de 15 dias ou recorrente: 0 pontos \+ trava aplicada

# Faixas de Score e Playbook de Ação

Faixa 80 a 100 — Status: Saudável  
Ação obrigatória: Identificar oportunidade de expansão (upsell/cross-sell). Acionar AM para conversa de expansão.  
Registro exigido: próximo passo de expansão no V4Corp.  
Faixa 60 a 79 — Status: Atenção  
Ação obrigatória: Diagnóstico focado (qual dimensão puxou para baixo) \+ plano de ação em até 5 dias úteis com AM.  
Registro exigido: plano de ação com prazo no V4Corp.  
Faixa 40 a 59 — Status: Risco  
Ação obrigatória: Intervenção imediata. Reunião de alinhamento com cliente em até 48h. Escala obrigatória para Gerente de PEG.  
Registro exigido: data da reunião \+ síntese \+ ações acordadas no V4Corp.  
Faixa 0 a 39 — Status: Crítico  
Ação obrigatória: Save Plan ativado. Envolvimento da direção. Reunião de emergência com cliente. Revisão de contrato e escopo.  
Registro exigido: Save Plan com responsável, prazo e critério de saída da faixa no V4Corp.

# Regra de Saída de Faixa

O coordenador deve registrar no V4Corp:  
1\. Ação executada (o que foi feito)  
2\. Se não foi a ação sugerida: qual alternativa e por quê  
3\. Efetividade: o score do mês seguinte indica se a ação funcionou  
Objetivo: medir quem entrou em risco, quanto tempo ficou, qual ação foi tomada e se saíu da faixa.

# Cronograma de Implementação — 60 Dias

S1 a S2: Criar checklist mínimo de handover comercial para operação (PIC: objetivo, métricas, prazo, responsáveis). Sem isso o score não roda.  
S2 a S3: Configurar campos no V4Corp: tracking sim/não, funil sim/não, verba ok/abaixo do mínimo, avaliação de humor do coordenador.  
S3 a S4: Configurar agente de análise de transcrição com extração de humor do stakeholder.  
S4 a S5: Integrar Ekyte (tasks atrasadas por responsável) e Planilha Gabi (inadimplência com dias de atraso).  
S5 a S6: Ativar formulário NPS mensal para toda a carteira.  
S6 a S7: Montar fórmula do score no V4Corp com pesos e travas.  
S7 a S8: Rodar score manualmente em 5 a 10 contas para calibração. Ajustar thresholds se necessário.  
S8: Go-live V1. Briefar todos os coordenadores sobre o playbook de ação por faixa.

# Escopo da V2 (pós-60 dias)

Margem da conta (COGS/CSP) como dimensão de trava adicional  
Categorizacão de causa de atraso nas tasks do Ekyte (interno vs. cliente)  
Segmentação por tipo de conta nas metas de pacing (e-commerce vs. B2B vs. institucional)  
Previsibilidade de entrega por playbook semanal  
