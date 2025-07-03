import {
	ICredentialType,
	INodeProperties,
	ICredentialTestRequest,
} from 'n8n-workflow';

export class MetaApi implements ICredentialType {
	name = 'metaApi';
	displayName = 'Meta API';
	documentationUrl = 'https://developers.facebook.com/docs/whatsapp/business-management-api';
	properties: INodeProperties[] = [
		{
			displayName: 'Weba ID',
			name: 'webaId',
			type: 'string',
			default: '',
			required: true,
			description: 'ID do WhatsApp Business Account',
		},
		{
			displayName: 'Access Token',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true,
			},
			default: '',
			required: true,
			description: 'Token de acesso da API do Meta',
		},
		{
			displayName: 'API Version',
			name: 'apiVersion',
			type: 'string',
			default: 'v19.0',
			required: true,
			description: 'Versão da API do Meta (ex: v19.0, v20.0)',
		},
	];

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://graph.facebook.com',
			url: '/{{ $credentials.apiVersion }}/{{ $credentials.webaId }}?access_token={{ $credentials.accessToken }}',
			method: 'GET',
		},
	};
} 