# MongoDB Filter Node

Este módulo n8n permite criar filtros MongoDB de forma didática e intuitiva, facilitando a construção de queries complexas sem necessidade de conhecer a sintaxe específica do MongoDB.

## 🎯 Características

- **Interface Intuitiva**: Campos claros e descritivos
- **Operadores Completos**: Suporte a todos os operadores principais do MongoDB
- **Conversão Automática**: Detecta automaticamente o tipo de dados
- **Validação**: Verifica se os valores são válidos antes de criar o filtro
- **Descrição Clara**: Gera descrições legíveis dos filtros criados

## 📋 Campos de Entrada

### 1. Campo (Obrigatório)
- **Tipo**: Texto
- **Descrição**: Nome do campo no documento MongoDB que será filtrado
- **Exemplos**: `nome`, `idade`, `email`, `data_criacao`

### 2. Operador (Obrigatório)
- **Tipo**: Select
- **Opções disponíveis**:

| Operador | Símbolo | Descrição | Exemplo |
|----------|---------|-----------|---------|
| Igual | = | Campo deve ser igual ao valor | `nome = "João"` |
| Diferente | != | Campo deve ser diferente do valor | `idade != 25` |
| Maior que | > | Campo deve ser maior que o valor | `idade > 18` |
| Maior ou igual | >= | Campo deve ser maior ou igual ao valor | `idade >= 21` |
| Menor que | < | Campo deve ser menor que o valor | `idade < 65` |
| Menor ou igual | <= | Campo deve ser menor ou igual ao valor | `idade <= 30` |
| Contém | LIKE | Campo deve conter o valor (busca por texto) | `nome` contém "Jo" |
| Está em | IN | Campo deve estar na lista de valores | `categoria` está em ["A", "B", "C"] |
| Não está em | NOT IN | Campo não deve estar na lista de valores | `status` não está em ["inativo", "suspenso"] |
| Existe | EXISTS | Campo deve existir no documento | Campo `telefone` existe |
| Não existe | NOT EXISTS | Campo não deve existir no documento | Campo `endereco` não existe |

### 3. Valor (Obrigatório para maioria dos operadores)
- **Tipo**: Texto
- **Descrição**: Valor para comparação com o campo
- **Exemplos**: `"João"`, `25`, `true`, `"2024-01-01"`

### 4. Valor (Lista) - Para operadores IN/NOT IN
- **Tipo**: Texto
- **Descrição**: Lista de valores separados por vírgula
- **Exemplos**: `João,Maria,Pedro` ou `1,2,3,4`

## ⚙️ Opções Avançadas

### Case Sensitive
- **Disponível**: Apenas para operador "Contém"
- **Padrão**: `true`
- **Descrição**: Se a busca deve ser sensível a maiúsculas/minúsculas

### Tipo de Dados
- **Opções**:
  - **Auto-detect** (padrão): Detecta automaticamente o tipo
  - **Texto (String)**: Força conversão para texto
  - **Número (Number)**: Força conversão para número
  - **Booleano (Boolean)**: Força conversão para booleano
  - **Data (Date)**: Força conversão para data

## 📤 Saída

O módulo retorna um objeto JSON com:

```json
{
  "mongoFilter": {
    "nome": { "$eq": "João" }
  },
  "filterDescription": "Campo \"nome\" igual a \"João\""
}
```

### Campos de Saída:
- **`mongoFilter`**: Objeto de filtro MongoDB pronto para uso
- **`filterDescription`**: Descrição legível do filtro criado

## 🔧 Exemplos de Uso

### Exemplo 1: Filtro Simples
```
Campo: nome
Operador: Igual (=)
Valor: João
```
**Resultado**: `{ "nome": { "$eq": "João" } }`

### Exemplo 2: Filtro Numérico
```
Campo: idade
Operador: Maior que (>)
Valor: 18
Tipo de Dados: Número
```
**Resultado**: `{ "idade": { "$gt": 18 } }`

### Exemplo 3: Busca por Texto
```
Campo: email
Operador: Contém (LIKE)
Valor: gmail
Case Sensitive: false
```
**Resultado**: `{ "email": { "$regex": "gmail", "$options": "i" } }`

### Exemplo 4: Lista de Valores
```
Campo: categoria
Operador: Está em (IN)
Valor (Lista): A,B,C
```
**Resultado**: `{ "categoria": { "$in": ["A", "B", "C"] } }`

### Exemplo 5: Verificar Existência
```
Campo: telefone
Operador: Existe
```
**Resultado**: `{ "telefone": { "$exists": true } }`

## 🚀 Como Usar no n8n

1. **Adicione o nó**: Procure por "MongoDB Filter" na lista de nós
2. **Configure os campos**: Preencha campo, operador e valor
3. **Conecte com MongoDB**: Use o filtro gerado em um nó MongoDB
4. **Teste**: Execute o workflow para verificar o resultado

## 💡 Dicas

- Use **Auto-detect** para tipos de dados quando não tiver certeza
- Para datas, use o formato ISO: `2024-01-01`
- Para booleanos, use `true`/`false` ou `1`/`0`
- Para listas, separe os valores por vírgula sem espaços extras
- O módulo valida automaticamente se os valores são válidos

## 🔗 Integração com MongoDB

O filtro gerado pode ser usado diretamente em:
- Nós MongoDB do n8n
- Queries MongoDB nativas
- Agregações MongoDB
- Operações de busca, atualização e exclusão 