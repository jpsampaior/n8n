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
		properties: [
			{
				displayName: 'Weba Id',
				name: 'webaId',
				type: 'string',
				default: '',
				required: true,
			},
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				default: '',
				required: true,
				typeOptions: {
					password: true,
				},
			},
			{
				displayName: 'API Version',
				name: 'apiVersion',
				type: 'string',
				default: 'v19.0',
				required: true,
			},
			{
				displayName: 'Template',
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
		const templateId = this.getNodeParameter('template', 0) as string;
		const phone = this.getNodeParameter('phone', 0) as string;
		const parametersCollection = this.getNodeParameter('parameters', 0, []) as { parameter: { value: string }[] };

		const parameters = (parametersCollection.parameter || []).map((param) => ({
			type: 'TEXT',
			value: param.value,
		}));

		const output = items.map((item, index) => {
			// Se quiser pegar valores dinâmicos da entrada, pode ajustar aqui
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
				const webaId = this.getNodeParameter('webaId', 0) as string;
				const accessToken = this.getNodeParameter('accessToken', 0) as string;
				const apiVersion = this.getNodeParameter('apiVersion', 0) as string;
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