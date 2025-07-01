import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class MongoDBFilter implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MongoDB Filter',
		name: 'mongoDBFilter',
		group: ['transform'],
		version: 1,
		description: 'Cria filtros MongoDB de forma didática e intuitiva',
		defaults: {
			name: 'MongoDB Filter',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Campo',
				name: 'field',
				type: 'string',
				default: '',
				placeholder: 'ex: nome, idade, email',
				description: 'Nome do campo no documento MongoDB que será filtrado',
				required: true,
			},
			{
				displayName: 'Operador',
				name: 'operator',
				type: 'options',
				options: [
					{
						name: 'Igual (=)',
						value: 'eq',
						description: 'Campo deve ser igual ao valor',
					},
					{
						name: 'Diferente (!=)',
						value: 'ne',
						description: 'Campo deve ser diferente do valor',
					},
					{
						name: 'Maior que (>)',
						value: 'gt',
						description: 'Campo deve ser maior que o valor',
					},
					{
						name: 'Maior ou igual (>=)',
						value: 'gte',
						description: 'Campo deve ser maior ou igual ao valor',
					},
					{
						name: 'Menor que (<)',
						value: 'lt',
						description: 'Campo deve ser menor que o valor',
					},
					{
						name: 'Menor ou igual (<=)',
						value: 'lte',
						description: 'Campo deve ser menor ou igual ao valor',
					},
					{
						name: 'Contém (LIKE)',
						value: 'regex',
						description: 'Campo deve conter o valor (busca por texto)',
					},
					{
						name: 'Está em (IN)',
						value: 'in',
						description: 'Campo deve estar na lista de valores',
					},
					{
						name: 'Não está em (NOT IN)',
						value: 'nin',
						description: 'Campo não deve estar na lista de valores',
					},
					{
						name: 'Existe',
						value: 'exists',
						description: 'Campo deve existir no documento',
					},
					{
						name: 'Não existe',
						value: 'notExists',
						description: 'Campo não deve existir no documento',
					},
				],
				default: 'eq',
				description: 'Operador de comparação para o filtro',
				required: true,
			},
			{
				displayName: 'Valor',
				name: 'value',
				type: 'string',
				default: '',
				placeholder: 'ex: João, 25, true',
				description: 'Valor para comparação com o campo',
				required: true,
				displayOptions: {
					hide: {
						operator: ['exists', 'notExists'],
					},
				},
			},
			{
				displayName: 'Valor (Lista)',
				name: 'valueList',
				type: 'string',
				default: '',
				placeholder: 'ex: João,Maria,Pedro ou 1,2,3,4',
				description: 'Lista de valores separados por vírgula (para operadores IN/NOT IN)',
				required: true,
				displayOptions: {
					show: {
						operator: ['in', 'nin'],
					},
				},
			},
			{
				displayName: 'Opções Avançadas',
				name: 'advancedOptions',
				type: 'collection',
				placeholder: 'Adicionar opção',
				default: {},
				options: [
					{
						displayName: 'Case Sensitive',
						name: 'caseSensitive',
						type: 'boolean',
						default: true,
						description: 'Se a busca deve ser sensível a maiúsculas/minúsculas (apenas para operador regex)',
					},
					{
						displayName: 'Tipo de Dados',
						name: 'dataType',
						type: 'options',
						options: [
							{
								name: 'Texto (String)',
								value: 'string',
							},
							{
								name: 'Número (Number)',
								value: 'number',
							},
							{
								name: 'Booleano (Boolean)',
								value: 'boolean',
							},
							{
								name: 'Data (Date)',
								value: 'date',
							},
							{
								name: 'Auto-detect',
								value: 'auto',
							},
						],
						default: 'auto',
						description: 'Tipo de dados do valor (para conversão automática)',
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		let item: INodeExecutionData;
		let field: string;
		let operator: string;
		let value: string;
		let valueList: string;
		let advancedOptions: any;

		// Helper function to convert values
		const convertValue = (value: string, dataType: string): any => {
			switch (dataType) {
				case 'number':
					const num = Number(value);
					if (isNaN(num)) {
						throw new Error(`Valor "${value}" não pode ser convertido para número`);
					}
					return num;

				case 'boolean':
					if (value.toLowerCase() === 'true' || value === '1') {
						return true;
					} else if (value.toLowerCase() === 'false' || value === '0') {
						return false;
					} else {
						throw new Error(`Valor "${value}" não pode ser convertido para booleano`);
					}

				case 'date':
					const date = new Date(value);
					if (isNaN(date.getTime())) {
						throw new Error(`Valor "${value}" não pode ser convertido para data`);
					}
					return date;

				case 'auto':
				case 'string':
				default:
					// Try to auto-detect type
					if (value === 'true' || value === 'false') {
						return value === 'true';
					}
					if (!isNaN(Number(value)) && value.trim() !== '') {
						return Number(value);
					}
					return value;
			}
		};

		// Helper function to create MongoDB filter
		const createMongoFilter = (
			field: string,
			operator: string,
			value: string,
			valueList: string,
			advancedOptions: any
		): any => {
			const dataType = advancedOptions.dataType || 'auto';
			let processedValue: any;

			// Process value based on operator and data type
			switch (operator) {
				case 'eq':
				case 'ne':
				case 'gt':
				case 'gte':
				case 'lt':
				case 'lte':
					processedValue = convertValue(value, dataType);
					return { [field]: { [`$${operator}`]: processedValue } };

				case 'regex':
					const caseSensitive = advancedOptions.caseSensitive !== false;
					const flags = caseSensitive ? '' : 'i';
					return { [field]: { $regex: value, $options: flags } };

				case 'in':
				case 'nin':
					const values = valueList.split(',').map(v => v.trim()).filter(v => v !== '');
					const processedValues = values.map(v => convertValue(v, dataType));
					return { [field]: { [`$${operator}`]: processedValues } };

				case 'exists':
					return { [field]: { $exists: true } };

				case 'notExists':
					return { [field]: { $exists: false } };

				default:
					throw new Error(`Operador não suportado: ${operator}`);
			}
		};

		// Helper function to get filter description
		const getFilterDescription = (field: string, operator: string, value: string, valueList: string): string => {
			const operatorNames: { [key: string]: string } = {
				eq: 'igual a',
				ne: 'diferente de',
				gt: 'maior que',
				gte: 'maior ou igual a',
				lt: 'menor que',
				lte: 'menor ou igual a',
				regex: 'contém',
				in: 'está em',
				nin: 'não está em',
				exists: 'existe',
				notExists: 'não existe',
			};

			const operatorName = operatorNames[operator] || operator;

			switch (operator) {
				case 'in':
				case 'nin':
					return `Campo "${field}" ${operatorName} [${valueList}]`;
				case 'exists':
				case 'notExists':
					return `Campo "${field}" ${operatorName}`;
				default:
					return `Campo "${field}" ${operatorName} "${value}"`;
			}
		};

		// Iterates over all input items and create MongoDB filter
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				field = this.getNodeParameter('field', itemIndex, '') as string;
				operator = this.getNodeParameter('operator', itemIndex, 'eq') as string;
				value = this.getNodeParameter('value', itemIndex, '') as string;
				valueList = this.getNodeParameter('valueList', itemIndex, '') as string;
				advancedOptions = this.getNodeParameter('advancedOptions', itemIndex, {}) as any;

				item = items[itemIndex];

				// Create MongoDB filter object
				const mongoFilter = createMongoFilter(field, operator, value, valueList, advancedOptions);

				// Add the filter to the item
				item.json.mongoFilter = mongoFilter;
				item.json.filterDescription = getFilterDescription(field, operator, value, valueList);

			} catch (error) {
				if (this.continueOnFail()) {
					items.push({ json: this.getInputData(itemIndex)[0].json, error, pairedItem: itemIndex });
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

		return [items];
	}
} 