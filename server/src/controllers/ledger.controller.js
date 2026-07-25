const LedgerService = require("../services/ledger.service");
const MongoDB = require("../utils/mongodb.util");

class LedgerController {
    async findAll(req, res) {
        try {
            const ledgerService = new LedgerService(MongoDB.client);
            const documents = await ledgerService.findAll();
            return res.send(documents);
        } catch (error) {
            console.error("Error finding requests:", error);
            return res.status(500).send("Đã xảy ra lỗi khi lấy danh sách đơn mượn.");
        }
    }
}

module.exports = new LedgerController();