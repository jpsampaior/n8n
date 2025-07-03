import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType, NodeOperationError } from 'n8n-workflow';

export class MongoDBFilterArray implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'MongoDB Filter Array',
		name: 'mongoDBFilterArray',
		group: ['transform'],
		version: 1,
		description: 'Cria um array de filtros MongoDB com objetos no formato {field, operator, value}',
		defaults: {
			name: 'MongoDB Filter Array',
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
										name: 'Igual (eq)',
										value: 'eq',
										description: 'Campo deve ser igual ao valor',
									},
									{
										name: 'Diferente (ne)',
										value: 'ne',
										description: 'Campo deve ser diferente do valor',
									},
									{
										name: 'Maior que (gt)',
										value: 'gt',
										description: 'Campo deve ser maior que o valor',
									},
									{
										name: 'Maior ou igual (gte)',
										value: 'gte',
										description: 'Campo deve ser maior ou igual ao valor',
									},
									{
										name: 'Menor que (lt)',
										value: 'lt',
										description: 'Campo deve ser menor que o valor',
									},
									{
										name: 'Menor ou igual (lte)',
										value: 'lte',
										description: 'Campo deve ser menor ou igual ao valor',
									},
									{
										name: 'Contém (regex)',
										value: 'regex',
										description: 'Campo deve conter o valor (busca por texto)',
									},
									{
										name: 'Contém Texto (contains)',
										value: 'contains',
										description: 'Campo deve conter o texto (busca simples, sem regex)',
									},
									{
										name: 'Não contém (notRegex)',
										value: 'notRegex',
										description: 'Campo não deve conter o valor (busca por texto)',
									},
									{
										name: 'Não Contém Texto (notContains)',
										value: 'notContains',
										description: 'Campo não deve conter o texto (busca simples, sem regex)',
									},
									{
										name: 'Está em (in)',
										value: 'in',
										description: 'Campo deve estar na lista de valores',
									},
									{
										name: 'Não está em (nin)',
										value: 'nin',
										description: 'Campo não deve estar na lista de valores',
									},
									{
										name: 'Existe (exists)',
										value: 'exists',
										description: 'Campo deve existir no documento',
									},
									{
										name: 'Não existe (notExists)',
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
								description: 'Se a busca deve ser sensível a maiúsculas/minúsculas (apenas para operadores de texto)',
								displayOptions: {
									show: {
										operator: ['regex', 'notRegex', 'contains', 'notContains'],
									},
								},
							},
							{
								displayName: 'Busca Literal',
								name: 'literalSearch',
								type: 'boolean',
								default: true,
								description: 'Se verdadeiro, caracteres especiais (+ * ? [ ] etc.) serão tratados como texto literal. Se falso, permitirá usar padrões regex avançados.',
								displayOptions: {
									show: {
										operator: ['regex', 'notRegex'],
									},
								},
							},
						],
					},
				],
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();

		// Helper function to convert values
		const convertValue = (value: string, dataType: string): string => {
			// Always return as string regardless of dataType
			return value;
		};

		// Helper function to escape special regex characters
		const escapeRegex = (string: string): string => {
			return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
		};

		// Helper function to create filter object for array output
		const createFilterObject = (filterConfig: any): any => {
			const { field, operator, value, valueList, dataType = 'auto', caseSensitive = true, literalSearch = true } = filterConfig;
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
					return { field, operator, value: processedValue };

				case 'regex':
					const regexValue = literalSearch ? escapeRegex(value) : value;
					const regexOptions = {
						field,
						operator,
						value: regexValue,
						options: caseSensitive ? '' : 'i'
					};
					return regexOptions;

				case 'contains':
					// Simple string contains using escaped value for safety
					const containsOptions = {
						field,
						operator,
						value: escapeRegex(value),
						options: caseSensitive ? '' : 'i'
					};	
					return containsOptions;

				case 'notRegex':
					const notRegexValue = literalSearch ? escapeRegex(value) : value;
					const notRegexOptions = {
						field,
						operator,
						value: notRegexValue,
						options: caseSensitive ? '' : 'i'
					};
					return notRegexOptions;

				case 'notContains':
					// Simple string not contains using escaped value for safety
					const notContainsOptions = {
						field,
						operator,
						value: escapeRegex(value),
						options: caseSensitive ? '' : 'i'
					};
					return notContainsOptions;

				case 'in':
				case 'nin':
					const values = valueList.split(',').map((v: string) => v.trim()).filter((v: string) => v !== '');
					const processedValues = values.map((v: string) => convertValue(v, dataType));
					return { field, operator, value: processedValues };

				case 'exists':
					return { field, operator, value: true };

				case 'notExists':
					return { field, operator, value: false };

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
				contains: 'contém texto',
				notRegex: 'não contém',
				notContains: 'não contém texto',
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

		// Iterates over all input items and create filter array
		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const filters = this.getNodeParameter('filters', itemIndex, { filter: [] }) as any;

				const item = items[itemIndex];

				// Get all filter configurations
				const filterConfigs = filters.filter || [];
				
				if (filterConfigs.length === 0) {
					throw new Error('Pelo menos um filtro deve ser configurado');
				}

				// Create array of filter objects
				const filterArray: any[] = [];
				const descriptions: string[] = [];

				for (const filterConfig of filterConfigs) {
					if (!filterConfig.field) {
						throw new Error('Campo é obrigatório para todos os filtros');
					}

					const filterObject = createFilterObject(filterConfig);
					filterArray.push(filterObject);

					const description = getFilterDescription(
						filterConfig.field,
						filterConfig.operator,
						filterConfig.value || '',
						filterConfig.valueList || ''
					);
					descriptions.push(description);
				}

				// Add the filter array to the item
				item.json.filterArray = filterArray;
				item.json.filterDescription = descriptions.join(' E ');
				item.json.filterCount = filterArray.length;

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