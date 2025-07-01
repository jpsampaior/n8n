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
		description: 'Cria filtros MongoDB de forma didática e intuitiva com suporte a múltiplos campos',
		defaults: {
			name: 'MongoDB Filter',
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		usableAsTool: true,
		properties: [
			{
				displayName: 'Filtros',
				name: 'filters',
				type: 'fixedCollection',
				placeholder: 'Adicionar Filtro',
				default: {
					filter: [
						{
							field: '',
							operator: 'eq',
							value: '',
						},
					],
				},
				typeOptions: {
					multipleValues: true,
					sortable: true,
				},
				options: [
					{
						displayName: 'Filtro',
						name: 'filter',
						values: [
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
							{
								displayName: 'Case Sensitive',
								name: 'caseSensitive',
								type: 'boolean',
								default: true,
								description: 'Se a busca deve ser sensível a maiúsculas/minúsculas (apenas para operador regex)',
								displayOptions: {
									show: {
										operator: ['regex'],
									},
								},
							},
						],
					},
				],
			},
			{
				displayName: 'Operador Lógico',
				name: 'logicalOperator',
				type: 'options',
				options: [
					{
						name: 'AND (Todos os filtros devem ser verdadeiros)',
						value: 'and',
						description: 'Todos os filtros devem ser atendidos',
					},
					{
						name: 'OR (Pelo menos um filtro deve ser verdadeiro)',
						value: 'or',
						description: 'Pelo menos um dos filtros deve ser atendido',
					},
				],
				default: 'and',
				description: 'Como combinar múltiplos filtros',
				displayOptions: {
					show: {
						'@version': [1],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

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

		// Helper function to create MongoDB filter for a single field
		const createSingleFilter = (filterConfig: any): any => {
			const { field, operator, value, valueList, dataType = 'auto', caseSensitive = true } = filterConfig;
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
					const flags = caseSensitive ? '' : 'i';
					return { [field]: { $regex: value, $options: flags } };

				case 'in':
				case 'nin':
					const values = valueList.split(',').map((v: string) => v.trim()).filter((v: string) => v !== '');
					const processedValues = values.map((v: string) => convertValue(v, dataType));
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
					return `"${field}" ${operatorName} [${valueList}]`;
				case 'exists':
				case 'notExists':
					return `"${field}" ${operatorName}`;
				default:
					return `"${field}" ${operatorName} "${value}"`;
			}
		};

		// Iterates over all input items and create MongoDB filter
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const filters = this.getNodeParameter('filters', itemIndex, { filter: [] }) as any;
				const logicalOperator = this.getNodeParameter('logicalOperator', itemIndex, 'and') as string;

				const item = items[itemIndex];

				// Get all filter configurations
				const filterConfigs = filters.filter || [];
				
				if (filterConfigs.length === 0) {
					throw new Error('Pelo menos um filtro deve ser configurado');
				}

				// Create individual filters
				const mongoFilters: any[] = [];
				const descriptions: string[] = [];

				for (const filterConfig of filterConfigs) {
					if (!filterConfig.field) {
						throw new Error('Campo é obrigatório para todos os filtros');
					}

					const singleFilter = createSingleFilter(filterConfig);
					mongoFilters.push(singleFilter);

					const description = getFilterDescription(
						filterConfig.field,
						filterConfig.operator,
						filterConfig.value || '',
						filterConfig.valueList || ''
					);
					descriptions.push(description);
				}

				// Combine filters based on logical operator
				let finalFilter: any;
				if (mongoFilters.length === 1) {
					finalFilter = mongoFilters[0];
				} else {
					if (logicalOperator === 'or') {
						finalFilter = { $or: mongoFilters };
					} else {
						finalFilter = { $and: mongoFilters };
					}
				}

				// Create description
				const operatorText = logicalOperator === 'or' ? ' OU ' : ' E ';
				const fullDescription = descriptions.join(operatorText);

				// Add the filter to the item
				item.json.mongoFilter = finalFilter;
				item.json.filterDescription = fullDescription;
				item.json.filterCount = mongoFilters.length;
				item.json.logicalOperator = logicalOperator;

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