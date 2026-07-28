const BookService = require("../services/book.service");
const MongoDB = require("../utils/mongodb.util");

class BookController {
    async findAll(req, res, next) {
        try {
            const bookService = new BookService(MongoDB.client);
            const document = await bookService.find();
            return res.send(document);
        } catch (error) {
            return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách sách." });
        }
    }

    async getRelatedBooks(req, res, next) {
        try {
            const bookService = new BookService(MongoDB.client);
            const condition = {};
            if (req.query.TheLoai) {
                condition.TheLoai = req.query.TheLoai;
            }
            const documents = await bookService.find(condition);
            return res.send(documents);
        } catch (error) {
            return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy sách liên quan." });
        }
    }

    async getCategories(req, res, next) {
        try {
            const bookService = new BookService(MongoDB.client);
            const categories = await bookService.getCategories();
            // Filter out any null or empty categories if they exist
            return res.send(categories.filter(c => c));
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi lấy danh mục sách" });
        }
    }

    async getNewBooks(req, res, next) {
        try {
            const bookService = new BookService(MongoDB.client);
            const documents = await bookService.getNewBooks(5);
            return res.send(documents);
        } catch (error) {
            return res.status(500).json({ message: "Đã xảy ra lỗi khi lấy danh sách sách mới." });
        }
    }

    async findOne(req, res, next) {
        try {
            const bookService = new BookService(MongoDB.client);
            const document = await bookService.findById(req.params.id);
            if (!document) {
                return res.status(404).json({ message: "Không tìm thấy sách" });
            }
            return res.send(document);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi truy xuất sách" });
        }
    }

    async create(req, res, next) {
        try {
            if (!req.body?.TenSach || !req.body?.TenTG) {
                return res.status(400).json({ message: "Tên sách và tác giả không được bỏ trống" });
            }
            const bookService = new BookService(MongoDB.client);
            const document = await bookService.create(req.body);
            return res.send(document);
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi tạo sách mới" });
        }
    }

    async update(req, res, next) {
        if (Object.keys(req.body).length === 0) {
            return res.status(400).json({ message: "Dữ liệu để cập nhật không được để trống" });
        }
        try {
            const bookService = new BookService(MongoDB.client);
            const document = await bookService.update(req.params.id, req.body);
            if (!document) {
                return res.status(404).json({ message: "Không tìm thấy sách để cập nhật" });
            }
            return res.send({ message: "Sách đã được cập nhật thành công", document });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi cập nhật sách" });
        }
    }

    async delete(req, res, next) {
        try {
            const bookService = new BookService(MongoDB.client);
            const document = await bookService.delete(req.params.id);
            if (!document) {
                return res.status(404).json({ message: "Không tìm thấy sách để xóa" });
            }
            return res.send({ message: "Sách đã được xóa thành công" });
        } catch (error) {
            return res.status(500).json({ message: "Lỗi khi xóa sách" });
        }
    }

    async countAll(req, res, next){
        try {
            const bookService = new BookService(MongoDB.client);
            const total = await bookService.countAll();
            return res.send({ total });
        }catch(error){
            return res.status(500).json({ message: "Lỗi khi đếm tổng số sách." });
        }
    }
}

module.exports = new BookController();