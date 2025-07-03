# Exemplos - MongoDB Filter Array

## Exemplo 1: Filtro Simples com Contagem

### Configuração
- **Campo**: `total_LIGAÇÃO REALIZADA COUNT`
- **Operador**: `Maior ou igual (gte)`
- **Valor**: `1`
- **Tipo**: `Número (Number)`

### Entrada
```json
{
  "id": 123,
  "nome": "João Silva"
}
```

### Saída
```json
{
  "id": 123,
  "nome": "João Silva",
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

## Exemplo 2: Múltiplos Filtros

### Configuração
1. **Campo**: `idade` | **Operador**: `gte` | **Valor**: `18` | **Tipo**: `Number`
2. **Campo**: `cidade` | **Operador**: `eq` | **Valor**: `São Paulo` | **Tipo**: `String`
3. **Campo**: `ativo` | **Operador**: `eq` | **Valor**: `true` | **Tipo**: `Boolean`

### Entrada
```json
{
  "usuario": "admin"
}
```

### Saída
```json
{
  "usuario": "admin",
  "filterArray": [
    {
      "field": "idade",
      "operator": "gte",
      "value": "18"
    },
    {
      "field": "cidade", 
      "operator": "eq",
      "value": "São Paulo"
    },
    {
      "field": "ativo",
      "operator": "eq", 
      "value": "true"
    }
  ],
  "filterDescription": "\"idade\" maior ou igual a \"18\" E \"cidade\" igual a \"São Paulo\" E \"ativo\" igual a \"true\"",
  "filterCount": 3
}
```

## Exemplo 3: Filtro com Lista (IN)

### Configuração
- **Campo**: `categoria`
- **Operador**: `Está em (in)`
- **Valor (Lista)**: `A,B,C`
- **Tipo**: `Auto-detect`

### Saída
```json
{
  "filterArray": [
    {
      "field": "categoria",
      "operator": "in",
      "value": ["A", "B", "C"]
    }
  ],
  "filterDescription": "\"categoria\" está em [A,B,C]",
  "filterCount": 1
}
```

## Exemplo 4: Filtro de Texto com Regex

### Configuração
- **Campo**: `email`
- **Operador**: `Contém (regex)`
- **Valor**: `@company.com`
- **Case Sensitive**: `false`
- **Busca Literal**: `true`

### Saída
```json
{
  "filterArray": [
    {
      "field": "email",
      "operator": "regex",
      "value": "@company\\.com",
      "options": "i"
    }
  ],
  "filterDescription": "\"email\" contém \"@company.com\"",
  "filterCount": 1
}
```

## Exemplo 5: Filtro de Existência

### Configuração
- **Campo**: `campo_opcional`
- **Operador**: `Existe`

### Saída
```json
{
  "filterArray": [
    {
      "field": "campo_opcional",
      "operator": "exists",
      "value": "true"
    }
  ],
  "filterDescription": "\"campo_opcional\" existe",
  "filterCount": 1
}
```

## Exemplo 6: Filtros Complexos Mistos

### Configuração
1. **Campo**: `score` | **Operador**: `gt` | **Valor**: `85` | **Tipo**: `Number`
2. **Campo**: `tags` | **Operador**: `nin` | **Valor (Lista)**: `spam,blocked` | **Tipo**: `String`
3. **Campo**: `last_login` | **Operador**: `exists`
4. **Campo**: `email` | **Operador**: `notContains` | **Valor**: `temp` | **Case Sensitive**: `false`

### Saída
```json
{
  "filterArray": [
    {
      "field": "score",
      "operator": "gt",
      "value": "85"
    },
    {
      "field": "tags",
      "operator": "nin", 
      "value": ["spam", "blocked"]
    },
    {
      "field": "last_login",
      "operator": "exists",
      "value": "true"
    },
    {
      "field": "email",
      "operator": "notContains",
      "value": "temp",
      "options": "i"
    }
  ],
  "filterDescription": "\"score\" maior que \"85\" E \"tags\" não está em [spam,blocked] E \"last_login\" existe E \"email\" não contém texto \"temp\"",
  "filterCount": 4
}
```

## Uso em Workflows

### Cenário 1: Preparação para Query Customizada
O array pode ser usado para construir queries para diferentes bancos:

```javascript
// Para MongoDB
const mongoQuery = {};
filterArray.forEach(filter => {
  if (filter.operator === 'eq') {
    mongoQuery[filter.field] = filter.value;
  } else {
    mongoQuery[filter.field] = { [`$${filter.operator}`]: filter.value };
  }
});
```

### Cenário 2: Validação de Dados
```javascript
// Verificar se dados atendem aos critérios
function validateData(data, filterArray) {
  return filterArray.every(filter => {
    const fieldValue = data[filter.field];
    switch(filter.operator) {
      case 'eq': return fieldValue.toString() === filter.value;
      case 'gte': return Number(fieldValue) >= Number(filter.value);
      case 'in': return filter.value.includes(fieldValue.toString());
      // ... outros operadores
    }
  });
}
```

### Cenário 3: Conversão para SQL
```javascript
// Converter para WHERE clause SQL
const sqlConditions = filterArray.map(filter => {
  const field = filter.field;
  const value = `'${filter.value}'`; // Todos os valores são strings agora
  
  switch(filter.operator) {
    case 'eq': return `${field} = ${value}`;
    case 'gte': return `${field} >= ${value}`;
    case 'in': return `${field} IN (${filter.value.map(v => `'${v}'`).join(',')})`;
    // ... outros operadores
  }
}).join(' AND ');

const sqlQuery = `SELECT * FROM users WHERE ${sqlConditions}`;
``` 