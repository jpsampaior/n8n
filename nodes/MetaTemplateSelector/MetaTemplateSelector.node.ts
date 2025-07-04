import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class MetaTemplateSelector implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Meta Template Selector',
		name: 'metaTemplateSelector',
		group: ['transform'],
		version: 1,
		description: 'Seleciona um template do Meta/WhatsApp e define quantidade de horas',
		defaults: {
			name: 'Meta Template Selector',
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
				displayName: 'Quantidade de Horas',
				name: 'hours',
				type: 'number',
				default: 1,
				description: 'Quantidade de horas',
				required: true,
				typeOptions: {
					minValue: 1,
					maxValue: 168, // 7 dias * 24 horas
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		
		const output = items.map((item, index) => {
			const template = this.getNodeParameter('template', index) as string;
			const hours = this.getNodeParameter('hours', index) as number;

			return {
				template,
				hours,
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