# Meta Template JSON Builder

Este node prepara JSONs de templates do Meta/WhatsApp para envio, conforme especificação do usuário. Ele permite:

- Selecionar um template disponível na API do Meta (Weba Id, AccessToken, Version).
- Exibir campos dinâmicos para os parâmetros do template selecionado.
- Adicionar um campo de telefone.
- Gerar um array de objetos JSON conforme o modelo solicitado, um para cada usuário da entrada.

**Este node não envia mensagens, apenas prepara os dados.** 