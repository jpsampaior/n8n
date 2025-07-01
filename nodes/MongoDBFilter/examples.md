# Exemplos Práticos - MongoDB Filter

Este arquivo contém exemplos práticos de como usar o módulo MongoDB Filter em diferentes cenários.

## 📊 Exemplo 1: Sistema de Usuários

### Cenário
Filtrar usuários de um sistema com diferentes critérios.

### Filtros Possíveis

#### 1. Usuários Ativos com Idade Maior que 18
```
Campo: status
Operador: Igual (=)
Valor: ativo
```
```
Campo: idade
Operador: Maior que (>)
Valor: 18
Tipo de Dados: Número
```

#### 2. Usuários com Email Gmail
```
Campo: email
Operador: Contém (LIKE)
Valor: gmail
Case Sensitive: false
```

#### 3. Usuários de Categorias Específicas
```
Campo: categoria
Operador: Está em (IN)
Valor (Lista): premium,vip,admin
```

## 🛒 Exemplo 2: E-commerce

### Cenário
Filtrar produtos de uma loja online.

### Filtros Possíveis

#### 1. Produtos em Estoque com Preço Menor que 100
```
Campo: estoque
Operador: Maior que (>)
Valor: 0
Tipo de Dados: Número
```
```
Campo: preco
Operador: Menor que (<)
Valor: 100
Tipo de Dados: Número
```

#### 2. Produtos com Nome Contendo "Smartphone"
```
Campo: nome
Operador: Contém (LIKE)
Valor: Smartphone
Case Sensitive: false
```

#### 3. Produtos Criados nos Últimos 30 Dias
```
Campo: data_criacao
Operador: Maior ou igual (>=)
Valor: 2024-01-01
Tipo de Dados: Data
```

## 📈 Exemplo 3: Analytics

### Cenário
Analisar dados de vendas e métricas.

### Filtros Possíveis

#### 1. Vendas Acima de 1000
```
Campo: valor_venda
Operador: Maior que (>)
Valor: 1000
Tipo de Dados: Número
```

#### 2. Transações com Status de Sucesso
```
Campo: status
Operador: Igual (=)
Valor: sucesso
```

#### 3. Clientes com Telefone Cadastrado
```
Campo: telefone
Operador: Existe
```

## 🔍 Exemplo 4: Sistema de Logs

### Cenário
Filtrar logs de sistema por diferentes critérios.

### Filtros Possíveis

#### 1. Logs de Erro
```
Campo: nivel
Operador: Igual (=)
Valor: error
```

#### 2. Logs de Hoje
```
Campo: timestamp
Operador: Maior ou igual (>=)
Valor: 2024-01-15T00:00:00Z
Tipo de Dados: Data
```

#### 3. Logs de Módulos Específicos
```
Campo: modulo
Operador: Está em (IN)
Valor (Lista): auth,database,api
```

## 🏥 Exemplo 5: Sistema de Saúde

### Cenário
Filtrar pacientes e consultas médicas.

### Filtros Possíveis

#### 1. Pacientes Maiores de 65 Anos
```
Campo: idade
Operador: Maior ou igual (>=)
Valor: 65
Tipo de Dados: Número
```

#### 2. Consultas com Especialista
```
Campo: especialidade
Operador: Está em (IN)
Valor (Lista): cardiologia,neurologia,ortopedia
```

#### 3. Pacientes sem Histórico Médico
```
Campo: historico_medico
Operador: Não existe
```

## 🔧 Workflow Completo

### Estrutura Sugerida
```
1. Trigger (Webhook/Manual)
   ↓
2. MongoDB Filter (Filtro Principal)
   ↓
3. MongoDB (Consulta com Filtro)
   ↓
4. Processamento dos Dados
   ↓
5. Resposta/Notificação
```

### Exemplo de Workflow: Sistema de Usuários

#### Passo 1: Configurar MongoDB Filter
```
Campo: status
Operador: Igual (=)
Valor: ativo
```

#### Passo 2: Conectar com MongoDB
- Use o campo `mongoFilter` gerado no filtro
- Configure a query: `{{ $json.mongoFilter }}`

#### Passo 3: Processar Resultados
- Os dados filtrados estarão disponíveis para processamento
- Use o campo `filterDescription` para logs

## 💡 Dicas de Implementação

### 1. Múltiplos Filtros
Para combinar múltiplos filtros, use o nó "Merge" do n8n:

```javascript
// Exemplo de combinação manual
{
  "$and": [
    { "status": { "$eq": "ativo" } },
    { "idade": { "$gte": 18 } },
    { "email": { "$regex": "gmail", "$options": "i" } }
  ]
}
```

### 2. Filtros Dinâmicos
Use expressões n8n para filtros dinâmicos:

```
Campo: {{ $json.campo_dinamico }}
Operador: {{ $json.operador_dinamico }}
Valor: {{ $json.valor_dinamico }}
```

### 3. Validação de Dados
O módulo já faz validação automática, mas você pode adicionar validações extras:

```javascript
// Exemplo de validação adicional
if ($json.mongoFilter && Object.keys($json.mongoFilter).length > 0) {
  // Filtro válido, continuar
} else {
  // Filtro inválido, tratar erro
}
```

## 🚨 Casos de Erro Comuns

### 1. Tipo de Dados Incorreto
```
Erro: Valor "abc" não pode ser convertido para número
Solução: Use Tipo de Dados = "Texto" ou corrija o valor
```

### 2. Campo Vazio
```
Erro: Campo é obrigatório
Solução: Preencha o nome do campo corretamente
```

### 3. Lista Vazia
```
Erro: Lista de valores vazia
Solução: Adicione valores separados por vírgula
```

## 📋 Checklist de Implementação

- [ ] Definir campos necessários para filtro
- [ ] Escolher operadores apropriados
- [ ] Configurar tipos de dados corretos
- [ ] Testar filtros com dados reais
- [ ] Implementar validações adicionais
- [ ] Documentar casos de uso específicos
- [ ] Configurar logs e monitoramento 