const RequestService = require("../services/request.service");
const MongoDB = require("../utils/mongodb.util");

class RequestController {
    async findAll(req, res) {
        try {
            const requestService = new RequestService(MongoDB.client);
            const documents = await requestService.findAll();
            return res.send(documents);
        } catch (error) {
            console.error("Error finding requests:", error);
            return res.status(500).send("Đã xảy ra lỗi khi lấy danh sách yêu cầu.");
        }
    }
}
module.exports = new RequestController();