import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class MetaTemplateJsonBuilder implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Meta Template JSON Builder',
		name: 'metaTemplateJsonBuilder',
		group: ['transform'],
		version: 1,
		description: 'Prepara JSONs de templates do Meta/WhatsApp para envio',
		defaults: {
			name: 'Meta Template JSON Builder',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: 'metaApi',
				required: true,
			},
		],
		properties: [
			{
				displayName: 'TemplateEEEE',
				name: 'template',
				type: 'options',
				options: [], // Será carregado dinamicamente
				default: '',
				description: 'Escolha o template',
				required: true,
				typeOptions: { loadOptionsMethod: 'getTemplates' },
			},
			{
				displayName: 'Telefone',
				name: 'phone',
				type: 'string',
				default: '',
				description: 'Telefone do destinatário no formato internacional',
				required: true,
			},
			{
				displayName: 'Parâmetros',
				name: 'parameters',
				type: 'fixedCollection',
				placeholder: 'Adicionar Parâmetro',
				default: {},
				typeOptions: {
					multipleValues: true,
				},
				options: [
					{
						displayName: 'Parâmetro',
						name: 'parameter',
						values: [
							{
								displayName: 'Valor',
								name: 'value',
								type: 'string',
								default: '',
							},
						],
					},
				],
			},
			// Inputs dinâmicos para parâmetros do template e telefone serão adicionados depois
		],
	};

	// Métodos para carregar templates e parâmetros serão implementados depois

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		
		const output = items.map((item, index) => {
			const templateId = this.getNodeParameter('template', index) as string;
			const phone = this.getNodeParameter('phone', index) as string;
			const parametersCollection = this.getNodeParameter('parameters', index, []) as { parameter: { value: string }[] };

			const parameters = (parametersCollection.parameter || []).map((param) => ({
				type: 'TEXT',
				value: param.value,
			}));

			return {
				templateId,
				phone,
				parameters,
			};
		});

		return [output.map((o) => ({ json: o }))];
	}

	// Adiciona método para carregar templates dinamicamente
	methods = {
		loadOptions: {
			async getTemplates(this: ILoadOptionsFunctions): Promise<INodePropertyOptions[]> {
				const credentials = await this.getCredentials('metaApi');
				const webaId = credentials.webaId as string;
				const accessToken = credentials.accessToken as string;
				const apiVersion = credentials.apiVersion as string;
				const url = `https://graph.facebook.com/${apiVersion}/${webaId}/message_templates?access_token=${accessToken}`;
				const response = await this.helpers.httpRequest({
					method: 'GET',
					url,
				});
				if (!response.data || !Array.isArray(response.data)) {
					throw new NodeOperationError(this.getNode(), 'Não foi possível obter os templates');
				}
				return response.data.map((tpl: any) => ({
					name: tpl.name,
					value: tpl.name,
				})) as INodePropertyOptions[];
			},
		},
	};
} 