import createApiClient from './api.service';

class RequestService {
    constructor(baseUrl = '/api/requests') {
        this.api = createApiClient(baseUrl);
    }

    async getAll(){
        return (await this.api.get('/')).data;
    }
}

export default new RequestService();