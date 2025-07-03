import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class FacebookTemplates implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Facebook Templates',
		name: 'facebookTemplates',
		group: ['transform'],
		version: 1,
		description: 'Busca templates de mensagem do Facebook WhatsApp Business API',
		defaults: {
			name: 'Facebook Templates',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				placeholder: 'EAA...',
				description: 'Token de acesso do Facebook Graph API',
				required: true,
			},
			{
				displayName: 'API Version',
				name: 'apiVersion',
				type: 'string',
				default: 'v18.0',
				placeholder: 'v18.0',
				description: 'Versão da API do Facebook Graph',
				required: true,
			},
			{
				displayName: 'WABA ID',
				name: 'wabaId',
				type: 'string',
				default: '',
				placeholder: '123456789012345',
				description: 'ID do WhatsApp Business Account (WABA)',
				required: true,
			},
			{
				displayName: 'Limite',
				name: 'limit',
				type: 'number',
				default: 100,
				description: 'Número máximo de templates a retornar',
				typeOptions: {
					minValue: 1,
					maxValue: 1000,
				},
			},
			{
				displayName: 'Campos Adicionais',
				name: 'additionalFields',
				type: 'collection',
				placeholder: 'Adicionar Campo',
				default: {},
				options: [
					{
						displayName: 'Incluir Componentes',
						name: 'includeComponents',
						type: 'boolean',
						default: true,
						description: 'Incluir informações detalhadas dos componentes do template',
					},
					{
						displayName: 'Incluir Conteúdo do Template',
						name: 'includeContent',
						type: 'boolean',
						default: true,
						description: 'Incluir o conteúdo completo do template',
					},
					{
						displayName: 'Incluir Parâmetros',
						name: 'includeParameters',
						type: 'boolean',
						default: true,
						description: 'Incluir informações sobre parâmetros do template',
					},
					{
						displayName: 'Incluir Estatísticas',
						name: 'includeStats',
						type: 'boolean',
						default: false,
						description: 'Incluir estatísticas de uso do template',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const accessToken = this.getNodeParameter('accessToken', itemIndex, '') as string;
				const apiVersion = this.getNodeParameter('apiVersion', itemIndex, 'v18.0') as string;
				const wabaId = this.getNodeParameter('wabaId', itemIndex, '') as string;
				const limit = this.getNodeParameter('limit', itemIndex, 100) as number;
				const additionalFields = this.getNodeParameter('additionalFields', itemIndex, {}) as {
					includeComponents?: boolean;
					includeContent?: boolean;
					includeParameters?: boolean;
					includeStats?: boolean;
				};

				// Construir URL base
				let url = `https://graph.facebook.com/${apiVersion}/${wabaId}/message_templates`;

				// Construir parâmetros da query
				const queryParams: Record<string, string> = {
					limit: limit.toString(),
					status: 'APPROVED', // Sempre buscar templates aprovados
				};

				// Adicionar campos adicionais
				const fields: string[] = [
					'id',
					'name',
					'status',
					'category',
					'language',
					'created_time',
					'updated_time',
				];

				if (additionalFields.includeComponents) {
					fields.push('components');
				}

				if (additionalFields.includeContent) {
					fields.push('content');
				}

				if (additionalFields.includeParameters) {
					fields.push('components{text,format,example}');
				}

				if (additionalFields.includeStats) {
					fields.push('statistics');
				}

				queryParams.fields = fields.join(',');

				// Função auxiliar para montar query string
				function buildQueryString(params: Record<string, string>): string {
					return Object.entries(params)
						.filter(([, value]) => value !== undefined && value !== null && value !== '')
						.map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
						.join('&');
				}

				const queryString = buildQueryString(queryParams);
				if (queryString) {
					url += `?${queryString}`;
				}

				// Fazer a requisição
				const response = await this.helpers.request({
					method: 'GET',
					url,
					headers: {
						'Authorization': `Bearer ${accessToken}`,
						'Content-Type': 'application/json',
					},
					json: true, // Garantir que a resposta seja parseada como JSON
				});

				// Função para processar parâmetros do template
				function processTemplateParameters(components: any[]): {
					parameterCount: number;
					parameterTypes: string[];
					parameters: any[];
				} {
					const parameters: any[] = [];
					const parameterTypes: string[] = [];

					if (components && Array.isArray(components)) {
						for (const component of components) {
							if (component.text && component.text.includes('{{')) {
								// Extrair parâmetros do texto
								const paramMatches = component.text.match(/\{\{(\d+)\}\}/g);
								if (paramMatches) {
									for (const match of paramMatches) {
										const paramIndex = match.replace(/\{\{|\}\}/g, '');
										const paramInfo = {
											index: parseInt(paramIndex),
											type: component.format || 'text',
											example: component.example || '',
											component: component.type || 'body',
										};
										parameters.push(paramInfo);
										
										if (!parameterTypes.includes(paramInfo.type)) {
											parameterTypes.push(paramInfo.type);
										}
									}
								}
							}
						}
					}

					return {
						parameterCount: parameters.length,
						parameterTypes: parameterTypes,
						parameters: parameters,
					};
				}

				// Processar resposta
				if (response.data && Array.isArray(response.data)) {
					for (const template of response.data) {
						const processedTemplate = {
							...template,
							wabaId,
							apiVersion,
						};

						// Processar parâmetros se solicitado
						if (additionalFields.includeParameters && template.components) {
							const paramInfo = processTemplateParameters(template.components);
							processedTemplate.parameterCount = paramInfo.parameterCount;
							processedTemplate.parameterTypes = paramInfo.parameterTypes;
							processedTemplate.parameters = paramInfo.parameters;
						}

						returnData.push({
							json: processedTemplate,
						});
					}
				} else {
					// Se não há dados ou formato inesperado, retornar a resposta completa
					returnData.push({
						json: {
							...response,
							wabaId,
							apiVersion,
						},
					});
				}

			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							error: error.message,
							wabaId: this.getNodeParameter('wabaId', itemIndex, ''),
						},
						error,
						pairedItem: itemIndex,
					});
				} else {
					if (error.context) {
						error.context.itemIndex = itemIndex;
						throw error;
					}
					throw new NodeOperationError(this.getNode(), error, {
						itemIndex,
					});
				}
			}
		}

		return [returnData];
	}
} 