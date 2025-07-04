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
				displayName: 'Template',
				name: 'template',
				type: 'options',
				options: [],
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
				displayName: 'Patient ID',
				name: 'patientId',
				type: 'string',
				default: '',
				description: 'ID do paciente',
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
		],
	};


	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		
		const output = items.map((item, index) => {
			const templateId = this.getNodeParameter('template', index) as string;
			const phone = this.getNodeParameter('phone', index) as string;
			const patientId = this.getNodeParameter('patientId', index) as string;
			const parametersCollection = this.getNodeParameter('parameters', index, []) as { parameter: { value: string }[] };

			const parameters = (parametersCollection.parameter || []).map((param) => ({
				type: 'TEXT',
				value: param.value,
			}));

			return {
				templateId,
				phone,
				patientId,
				parameters,
			};
		});

		return [output.map((o) => ({ json: o }))];
	}

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
				
				return response.data.map((tpl: any) => {
					const templateName = tpl.name;
					
					const bodyComponent = tpl.components?.find((comp: any) => comp.type === 'BODY');
					const bodyText = bodyComponent?.text ?? 'Sem conteúdo disponível';
					
					const paramMatches = bodyText.match(/\{\{\d+\}\}/g) ?? [];
					const paramCount = paramMatches.length;
					
					let preview = bodyText;
					for (let i = 1; i <= paramCount; i++) {
						preview = preview.replace(new RegExp(`\\{\\{${i}\\}\\}`, 'g'), `[Parâmetro ${i}]`);
					}
					
					if (preview.length > 100) {
						preview = preview.substring(0, 97) + '...';
					}
					
					return {
						name: `${templateName} (${paramCount} parâmetros)`,
						value: templateName,
						description: preview,
					};
				}) as INodePropertyOptions[];
			},
		},
	};
} 