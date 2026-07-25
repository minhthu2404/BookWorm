import createApiClient from './api.service';

class LedgerService {
    constructor(baseUrl = '/api/ledgers'){
        this.api = createApiClient(baseUrl);
    }

    async getAll(){
        return (await this.api.get('/')).data;
    }
}

export default new LedgerService();