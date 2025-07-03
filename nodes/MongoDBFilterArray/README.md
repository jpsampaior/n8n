# MongoDB Filter Array

Este node cria um array de objetos de filtro MongoDB no formato `{field, operator, value}` para uso em outras operações MongoDB.

## Características

- **Interface didática**: Configure filtros de forma visual e intuitiva
- **Múltiplos operadores**: Suporte a operadores de comparação, texto, listas e existência
- **Conversão automática de tipos**: Conversão inteligente de valores para string, number, boolean ou date
- **Saída em array**: Gera um array de objetos filtro prontos para uso

## Formato de Saída

O node produz um array com objetos no seguinte formato:

```javascript
[
  {field: "total_LIGAÇÃO REALIZADA COUNT", operator: "gte", value: "1"},
  {field: "nome", operator: "eq", value: "João"},
  {field: "ativo", operator: "eq", value: "true"}
]
```

**Nota**: Todos os valores são retornados como string, independentemente do tipo configurado.

## Operadores Suportados

### Comparação
- **eq** (igual): `{field: "idade", operator: "eq", value: "25"}`
- **ne** (diferente): `{field: "status", operator: "ne", value: "inativo"}`
- **gt** (maior que): `{field: "score", operator: "gt", value: "100"}`
- **gte** (maior ou igual): `{field: "total_COUNT", operator: "gte", value: "1"}`
- **lt** (menor que): `{field: "tentativas", operator: "lt", value: "3"}`
- **lte** (menor ou igual): `{field: "prioridade", operator: "lte", value: "5"}`

### Texto
- **contains**: `{field: "nome", operator: "contains", value: "João"}`
- **notContains**: `{field: "email", operator: "notContains", value: "spam"}`
- **regex**: `{field: "telefone", operator: "regex", value: "^\\+55"}`
- **notRegex**: `{field: "codigo", operator: "notRegex", value: "[a-z]+"}`

### Listas
- **in**: `{field: "categoria", operator: "in", value: ["A", "B", "C"]}`
- **nin**: `{field: "tag", operator: "nin", value: ["bloqueado", "spam"]}`

### Existência
- **exists**: `{field: "campo_opcional", operator: "exists", value: "true"}`
- **notExists**: `{field: "campo_descontinuado", operator: "notExists", value: "false"}`

## Exemplo de Uso

### Configuração do Node

1. **Campo**: `total_LIGAÇÃO REALIZADA COUNT`
2. **Operador**: `Maior ou igual (gte)`
3. **Valor**: `1`
4. **Tipo de Dados**: `Número (Number)`

### Resultado

```javascript
{
  "filterArray": [
    {
      "field": "total_LIGAÇÃO REALIZADA COUNT",
      "operator": "gte", 
      "value": "1"
    }
  ],
  "filterDescription": "\"total_LIGAÇÃO REALIZADA COUNT\" maior ou igual a \"1\"",
  "filterCount": 1
}
```

## Configurações Avançadas

### Tipo de Dados
- **Auto-detect**: Detecta automaticamente o tipo (padrão)
- **String**: Força o valor como texto
- **Number**: Converte para número
- **Boolean**: Converte para booleano (true/false, 1/0)
- **Date**: Converte para objeto Date

### Operadores de Texto
- **Case Sensitive**: Define se a busca diferencia maiúsculas/minúsculas
- **Busca Literal**: Para regex, escapa caracteres especiais automaticamente

## Casos de Uso

### 1. Filtro Simples
```javascript
// Entrada: campo="status", operador="eq", valor="ativo"
// Saída: [{field: "status", operator: "eq", value: "ativo"}]
```

### 2. Filtros Múltiplos
```javascript
// Múltiplos filtros resultam em array com vários objetos
[
  {field: "idade", operator: "gte", value: "18"},
  {field: "cidade", operator: "eq", value: "São Paulo"},
  {field: "ativo", operator: "eq", value: "true"}
]
```

### 3. Lista de Valores
```javascript
// Para operador "in" com valores "A,B,C"
{field: "categoria", operator: "in", value: ["A", "B", "C"]}
```

## Diferenças do MongoDB Filter Original

| MongoDB Filter | MongoDB Filter Array |
|---|---|
| Gera query MongoDB completa | Gera array de objetos filtro |
| `{$and: [{campo: {$eq: valor}}]}` | `[{field: "campo", operator: "eq", value: "valor"}]` |
| Pronto para usar direto no MongoDB | Formato para processamento personalizado |
| Operador lógico AND/OR | Sem operador lógico (array simples) |
| Valores com tipos específicos | Todos os valores como string |

Este formato é ideal quando você precisa processar os filtros de forma personalizada ou convertê-los para outros formatos de query. 