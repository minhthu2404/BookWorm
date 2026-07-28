const UserService = require("../services/user.service");
const MongoDB = require("../utils/mongodb.util");

class UserController {
    async create(req, res) {
        try {
            const userService = new UserService(MongoDB.client);
            const document = await userService.create(req.body);
            return res.send(document);
        } catch (error) {
            return res.status(500).send("Đã xảy ra lỗi khi tạo người dùng.");
        }
    }
    async update(req, res) {
        try {
            const userService = new UserService(MongoDB.client);
            const document = await userService.update(req.params.id, req.body);
            return res.send(document);
        } catch (error) {
            return res.status(500).send("Đã xảy ra lỗi khi cập nhật người dùng.");
        }
    };
    async findById(req, res) {
        try {
            const userService = new UserService(MongoDB.client);
            const document = await userService.findById(req.params.id);
            return res.send(document);
        } catch (error) {
            return res.status(500).send("Đã xảy ra lỗi khi tìm người dùng.");
        }
    };
    async findAll(req, res) {
        try {
            const userService = new UserService(MongoDB.client);
            const documents = await userService.find({});
            return res.send(documents);
        } catch (error) {
            return res.status(500).send("Đã xảy ra lỗi khi lấy danh sách người dùng.");
        }
    }
    async delete(req, res, next){
        try {
            const userService = new UserService(MongoDB.client);
            const document = await userService.delete(req.params.id);
            if(!document){
                return res.status(404).json({ message: "Không tìm thấy người dùng để xóa" });
            }
            return res.send({ message: "Người dùng đã được xóa thành công" });
        }catch(error){
            return res.status(500).json({ message: "Lỗi khi xóa người dùng" });
        }
    }

    async countAll(req, res, next){
        try {
            const userService = new UserService(MongoDB.client);
            const total = await userService.countAll();
            return res.send({ total });
        }catch(error){
            return res.status(500).json({ message: "Lỗi khi đếm tổng số người dùng." });
        }
    }
}

module.exports = new UserController();