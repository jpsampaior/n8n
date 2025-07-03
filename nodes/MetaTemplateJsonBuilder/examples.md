# Exemplo de uso do Meta Template JSON Builder

## Entrada (tabela de usuários)

| nome  | telefone       |
|-------|---------------|
| João  | +5585999999999|
| Pedro | +5585999999999|

## Parâmetros escolhidos
- templateId: test_template
- parâmetro 1: nome

## Saída esperada

[
  {
    "templateId": "test_template",
    "phone": "+5585999999999",
    "parameters": [
      {
        "type": "TEXT",
        "value": "João"
      }
    ]
  },
  {
    "templateId": "test_template",
    "phone": "+5585999999999",
    "parameters": [
      {
        "type": "TEXT",
        "value": "Pedro"
      }
    ]
  }
] 