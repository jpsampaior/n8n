# Exemplos de Uso - Meta Template Selector

## Exemplo 1: Seleção básica
```json
{
  "template": "welcome_message",
  "hours": 24
}
```

## Exemplo 2: Template de lembrete
```json
{
  "template": "appointment_reminder",
  "hours": 2
}
```

## Exemplo 3: Template de follow-up
```json
{
  "template": "follow_up_message",
  "hours": 72
}
```

## Como usar

1. Configure as credenciais da Meta API
2. Selecione um template da lista carregada dinamicamente
3. Defina a quantidade de horas (1-168)
4. Execute o node para obter o output com ambos os valores

## Output esperado

O node sempre retorna um objeto JSON com duas propriedades:
- `template`: String com o nome do template selecionado
- `hours`: Número com a quantidade de horas definida 