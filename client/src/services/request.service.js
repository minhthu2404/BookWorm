import createApiClient from "./api.service";

class RequestService {
    constructor(baseUrl = "/api/requests") {
        this.api = createApiClient(baseUrl);
    }
    async getAll() {
        return (await this.api.get('/')).data;
    }
    async checkout(userId) {
        return (await this.api.post("/", { userId })).data;
    }
    async checkoutSingle(data) {
        return (await this.api.post("/single", data)).data;
    }
    async approve(id){
        return (await this.api.put(`/${id}/approve`)).data;
    }
    async reject(id){
        return (await this.api.put(`/${id}/reject`)).data;
    }
}

export default new RequestService();
