# Exemplos de Uso - Meta Template Selector

## Exemplo 1: Template único
```json
{
  "templates": [
    {
      "template": "welcome_message",
      "hours": 24
    }
  ]
}
```

## Exemplo 2: Múltiplos templates para diferentes horários
```json
{
  "templates": [
    {
      "template": "appointment_reminder",
      "hours": 2
    },
    {
      "template": "follow_up_message",
      "hours": 24
    },
    {
      "template": "final_reminder",
      "hours": 72
    }
  ]
}
```

## Exemplo 3: Templates para campanha de marketing
```json
{
  "templates": [
    {
      "template": "welcome_offer",
      "hours": 1
    },
    {
      "template": "discount_reminder",
      "hours": 24
    },
    {
      "template": "last_chance_offer",
      "hours": 168
    }
  ]
}
```

## Como usar

1. Configure as credenciais da Meta API
2. Clique em "Adicionar Template" para cada template que deseja configurar
3. Para cada entrada:
   - Selecione um template da lista carregada dinamicamente
   - Defina a quantidade de horas específica (1-168)
4. Adicione quantos templates precisar
5. Execute o node para obter o output com todos os templates configurados

## Output esperado

O node sempre retorna um objeto JSON com uma propriedade `templates` contendo um array de objetos, onde cada objeto tem:
- `template`: String com o nome do template selecionado
- `hours`: Número com a quantidade de horas definida para este template

## Casos de uso típicos

- **Campanhas de follow-up**: Configure diferentes templates para diferentes momentos (imediato, 24h, 1 semana)
- **Lembretes escalonados**: Templates para lembrete inicial, segundo lembrete, lembrete final
- **Jornadas de onboarding**: Sequência de mensagens em horários específicos
- **Campanhas de reativação**: Diferentes abordagens em intervalos crescentes 