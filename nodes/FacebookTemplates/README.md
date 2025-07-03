# Facebook Templates Node

Este node permite buscar templates de mensagem do Facebook WhatsApp Business API.

## Configuração

### Credenciais

1. **Access Token**: Token de acesso do Facebook para autenticação
2. **API Version**: Versão da API do Facebook (padrão: v18.0)

### Parâmetros do Node

- **WABA ID** (obrigatório): ID do WhatsApp Business Account
- **Status**: Filtrar templates por status (APPROVED, PENDING, REJECTED, DISABLED)
- **Categoria**: Filtrar templates por categoria (MARKETING, UTILITY, AUTHENTICATION)
- **Limite**: Número máximo de templates a retornar (1-1000)
- **Campos Adicionais**:
  - **Incluir Componentes**: Incluir informações detalhadas dos componentes do template
  - **Incluir Estatísticas**: Incluir estatísticas de uso do template

## Exemplo de Uso

### URL da API
```
https://graph.facebook.com/{{api-version}}/{{waba-id}}/message_templates
```

### Exemplo de Resposta
```json
{
  "id": "123456789",
  "name": "Template de Boas-vindas",
  "status": "APPROVED",
  "category": "UTILITY",
  "language": "pt_BR",
  "created_time": "2024-01-01T00:00:00+0000",
  "updated_time": "2024-01-01T00:00:00+0000",
  "components": [
    {
      "type": "HEADER",
      "text": "Bem-vindo!"
    },
    {
      "type": "BODY",
      "text": "Obrigado por entrar em contato conosco."
    }
  ],
  "wabaId": "123456789012345",
  "apiVersion": "v18.0"
}
```

## Como Obter as Credenciais

1. Acesse o [Facebook Developers](https://developers.facebook.com/)
2. Crie um app ou use um existente
3. Configure o WhatsApp Business API
4. Obtenha o Access Token com as permissões necessárias
5. Use o WABA ID da sua conta WhatsApp Business

## Permissões Necessárias

- `whatsapp_business_management`
- `whatsapp_business_messaging`

## Limitações

- Rate limit da API do Facebook
- Máximo de 1000 templates por requisição
- Templates devem estar aprovados para uso em produção 