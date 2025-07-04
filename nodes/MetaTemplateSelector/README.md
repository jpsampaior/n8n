# Meta Template Selector

Este node permite selecionar múltiplos templates do Meta/WhatsApp, cada um com sua própria quantidade de horas.

## Funcionalidades

- Seleção de múltiplos templates do Meta/WhatsApp através da API
- Definição de quantidade de horas individual para cada template (1-168 horas)
- Retorna uma lista com todos os templates e suas respectivas horas no output
- Interface intuitiva para adicionar/remover templates dinamicamente

## Output

O node retorna um JSON com o seguinte formato:
```json
{
  "templates": [
    {
      "template": "nome_do_template_1",
      "hours": 24
    },
    {
      "template": "nome_do_template_2", 
      "hours": 48
    }
  ]
}
```

## Como usar

1. Configure as credenciais da Meta API
2. Clique em "Adicionar Template" para adicionar um novo template
3. Para cada template:
   - Selecione o template da lista carregada dinamicamente
   - Defina a quantidade de horas específica
4. Repita o processo para adicionar quantos templates precisar
5. Execute o node para obter o output com todos os templates configurados 