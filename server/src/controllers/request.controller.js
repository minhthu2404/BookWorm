const RequestService = require("../services/request.service");
const MongoDB = require("../utils/mongodb.util");

class requestController {

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

    async checkout(req, res, next) {
        try {
            const { userId } = req.body;
            if (!userId) {
                return res.status(400).send({ message: "Thiếu thông tin người dùng." });
            }
            const requestService = new RequestService(MongoDB.client);
            const result = await requestService.createRequest(userId);
            if (result.success) {
                return res.send({ message: result.message });
            } else {
                return res.status(400).send({ message: result.message });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send("Lỗi khi tạo yêu cầu mượn.");
        }
    }
    async checkoutSingle(req, res, next) {
        try {
            const { userId, bookId, quantity } = req.body;
            if (!userId || !bookId) {
                return res.status(400).send({ message: "Thiếu thông tin." });
            }
            const requestService = new RequestService(MongoDB.client);
            // Xử lý định dạng mã sách
            let parsedBookId = bookId;
            if (typeof bookId === 'string' && !isNaN(bookId) && bookId.trim() !== '') {
                parsedBookId = Number(bookId);
            }

            const result = await requestService.createSingleRequest(userId, parsedBookId, quantity || 1);
            if (result.success) {
                return res.send({ message: result.message });
            } else {
                return res.status(400).send({ message: result.message });
            }
        } catch (error) {
            console.log(error);
            return res.status(500).send("Lỗi khi tạo yêu cầu mượn.");
        }
    }

    async approve(req, res) {
        try {
            const requestService = new RequestService(MongoDB.client);
            const result = await requestService.approveRequest(req.params.id);
            if (result.success) {
                return res.send({ message: result.message });
            } else {
                return res.status(400).send({ message: result.message });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Lỗi khi phê duyệt yêu cầu." });
        }
    }

    async reject(req, res) {
        try {
            const requestService = new RequestService(MongoDB.client);
            const result = await requestService.rejectRequest(req.params.id);
            if (result.success) {
                return res.send({ message: result.message });
            } else {
                return res.status(400).send({ message: result.message });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).send({ message: "Lỗi khi từ chối yêu cầu." });
        }
    }
    async findRequestByUser(req, res) {
        try {
            const requestService = new RequestService(MongoDB.client);
            const documents = await requestService.findRequestByUser(req.params.userId);
            return res.send(documents);
        } catch (error) {
            console.error("Error finding user requests:", error);
            return res.status(500).send("Đã xảy ra lỗi khi lấy danh sách yêu cầu của người dùng.");
        }
    }

}

module.exports = new requestController();
