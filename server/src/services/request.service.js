const { ObjectId } = require("mongodb");

class RequestService {
    constructor(client) {
        this.client = client;
        this.Request = client.db().collection("YEUCAU");
        this.RequestDetail = client.db().collection("CHITIET_YEUCAU");
        this.Cart = client.db().collection("GIOHANG");
        this.CartDetail = client.db().collection("CHITIET_GIOHANG");
        this.Ledger = client.db().collection("DONMUON");
        this.LedgerDetail = client.db().collection("CHITIET_DONMUON");
        this.Books = client.db().collection("SACH");
    }

    async findAll() {
        const pipeline = [
            {
                $lookup: {
                    from: "NGUOIDUNG",
                    localField: "MaND",
                    foreignField: "_id",
                    as: "user_info"
                }
            },
            {
                $unwind: {
                    path: "$user_info",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $lookup: {
                    from: "CHITIET_YEUCAU",
                    let: { reqId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$MaYC", "$$reqId"] } } },
                        {
                            $lookup: {
                                from: "SACH",
                                localField: "MaSach",
                                foreignField: "_id",
                                as: "Sach"
                            }
                        },
                        {
                            $unwind: {
                                path: "$Sach",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: "details"
                }
            }
        ];

        const results = await this.Request.aggregate(pipeline).toArray();

        return results.map(req => {
            const sum = req.details && req.details.length > 0
                ? req.details.reduce((acc, cur) => acc + (Number(cur.SoLuong) || 0), 0)
                : 0;
            return {
                _id: req._id,
                MaND: req.MaND,
                NgayTao: req.NgayTao,
                TrangThai: req.TrangThai,
                HoTen: req.user_info ? req.user_info.HoTen : 'Không rõ',
                Email: req.user_info ? req.user_info.Email : 'Không rõ',
                SoDienThoai: req.user_info ? req.user_info.SoDienThoai : 'Không rõ',
                TongSoQuyen: sum,
                details: req.details
            };
        });
    }

    async createRequest(userId) {
        let userObjId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
        if (!userObjId) return { success: false, message: "Người dùng không hợp lệ" };

        const cart = await this.Cart.findOne({ MaND: userObjId });
        if (!cart) return { success: false, message: "Giỏ hàng trống" };

        const cartItems = await this.CartDetail.find({ MaGH: cart._id }).toArray();
        if (cartItems.length === 0) return { success: false, message: "Giỏ hàng trống" };

        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const NgayTao = `${d}/${m}/${y}`;

        const newRequest = {
            MaND: userObjId,
            NgayTao: NgayTao,
            TrangThai: "ChoDuyet"
        };
        const requestResult = await this.Request.insertOne(newRequest);
        const nextRequestId = requestResult.insertedId;

        for (let item of cartItems) {
            const detailDoc = {
                MaYC: nextRequestId,
                MaSach: item.MaSach,
                SoLuong: item.SoLuong
            };
            await this.RequestDetail.insertOne(detailDoc);
        }

        // Xóa giỏ hàng
        await this.CartDetail.deleteMany({ MaGH: cart._id });

        return { success: true, message: "Gửi yêu cầu mượn thành công" };
    }

    async createSingleRequest(userId, bookId, quantity = 1) {
        let userObjId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
        if (!userObjId) return { success: false, message: "Người dùng không hợp lệ" };

        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const NgayTao = `${d}/${m}/${y}`;

        let bookObjId = ObjectId.isValid(bookId) ? new ObjectId(bookId) : bookId;
        const newRequest = {
            MaND: userObjId,
            NgayTao: NgayTao,
            TrangThai: "ChoDuyet"
        };
        const requestResult = await this.Request.insertOne(newRequest);
        const nextRequestId = requestResult.insertedId;

        const detailDoc = {
            MaYC: nextRequestId,
            MaSach: bookObjId,
            SoLuong: quantity
        };
        await this.RequestDetail.insertOne(detailDoc);

        return { success: true, message: "Gửi yêu cầu mượn thành công" };
    }

    async approveRequest(requestId) {
        let reqId = requestId;
        if (ObjectId.isValid(requestId) && typeof requestId === 'string' && requestId.length === 24) {
            reqId = new ObjectId(requestId);
        } else if (!isNaN(requestId) && requestId !== undefined) {
            reqId = Number(requestId);
        }

        const request = await this.Request.findOne({
            $or: [
                { _id: reqId },
                { _id: String(requestId) }
            ]
        });
        if (!request) return { success: false, message: "Yêu cầu không tồn tại." };
        if (request.TrangThai !== "ChoDuyet") return { success: false, message: "Yêu cầu đã được xử lý." };

        const details = await this.RequestDetail.find({
            $or: [
                { MaYC: reqId },
                { MaYC: String(requestId) }
            ]
        }).toArray();
        if (!details || details.length === 0) return { success: false, message: "Yêu cầu không có chi tiết sách." };

        // Kiểm tra tồn kho
        for (let detail of details) {
            let bookId = detail.MaSach;
            let qBookId = bookId;
            if (ObjectId.isValid(bookId) && typeof bookId === 'string' && bookId.length === 24) {
                qBookId = new ObjectId(bookId);
            } else if (!isNaN(bookId) && bookId !== undefined) {
                qBookId = Number(bookId);
            }

            const book = await this.Books.findOne({ _id: qBookId });
            if (!book) return { success: false, message: `Sách không tồn tại` };
            if (Number(book.SoQuyen) < Number(detail.SoLuong)) {
                return { success: false, message: `Sách "${book.TenSach}" không đủ số lượng trong kho` };
            }
        }

        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const NgayMuon = `${d}/${m}/${y}`;

        const returnDate = new Date(now);
        returnDate.setDate(returnDate.getDate() + 14);
        const rd = String(returnDate.getDate()).padStart(2, '0');
        const rm = String(returnDate.getMonth() + 1).padStart(2, '0');
        const ry = returnDate.getFullYear();
        const NgayTra = `${rd}/${rm}/${ry}`;

        const newLedger = {
            MaND: request.MaND,
            NgayMuon: NgayMuon,
            NgayTra: NgayTra,
            TrangThai: "DangMuon"
        };
        const ledgerResult = await this.Ledger.insertOne(newLedger);
        const nextLedgerId = ledgerResult.insertedId;

        // Tạo chi tiết mới
        for (let detail of details) {
            let bookId = detail.MaSach;
            let qBookId = bookId;
            if (ObjectId.isValid(bookId) && typeof bookId === 'string' && bookId.length === 24) {
                qBookId = new ObjectId(bookId);
            } else if (!isNaN(bookId) && bookId !== undefined) {
                qBookId = Number(bookId);
            }

            await this.Books.updateOne(
                { _id: qBookId },
                { $inc: { SoQuyen: -Number(detail.SoLuong) } }
            );

            await this.LedgerDetail.insertOne({
                MaDM: nextLedgerId,
                MaSach: bookId,
                SoLuong: detail.SoLuong
            });
        }

        // Cập nhật trạng thái
        await this.Request.updateOne(
            {
                $or: [
                    { _id: reqId },
                    { _id: String(requestId) }
                ]
            },
            { $set: { TrangThai: "DaXacNhan" } }
        );

        return { success: true, message: "Phê duyệt thành công" };
    }

    async rejectRequest(requestId) {
        let reqId = requestId;
        if (ObjectId.isValid(requestId) && typeof requestId === 'string' && requestId.length === 24) {
            reqId = new ObjectId(requestId);
        } else if (!isNaN(requestId) && requestId !== undefined) {
            reqId = Number(requestId);
        }

        const request = await this.Request.findOne({
            $or: [
                { _id: reqId },
                { _id: String(requestId) }
            ]
        });
        if (!request) return { success: false, message: "Yêu cầu không tồn tại" };
        if (request.TrangThai !== "ChoDuyet") return { success: false, message: "Yêu cầu đã được xử lý" };

        await this.Request.updateOne(
            {
                $or: [
                    { _id: reqId },
                    { _id: String(requestId) }
                ]
            },
            { $set: { TrangThai: "DaTuChoi" } }
        );

        return { success: true, message: "Đã từ chối yêu cầu" };
    }
    
    async findRequestByUser(userId) {
        let userObjId = ObjectId.isValid(userId) ? new ObjectId(userId) : null;
        if (!userObjId) return [];

        const pipeline = [
            {
                $match: {
                    MaND: userObjId
                }
            },
            {
                $lookup: {
                    from: "CHITIET_YEUCAU",
                    let: { reqId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$MaYC", "$$reqId"] } } },
                        {
                            $lookup: {
                                from: "SACH",
                                localField: "MaSach",
                                foreignField: "_id",
                                as: "Sach"
                            }
                        },
                        {
                            $unwind: {
                                path: "$Sach",
                                preserveNullAndEmptyArrays: true
                            }
                        }
                    ],
                    as: "details"
                }
            }
        ];

        const results = await this.Request.aggregate(pipeline).toArray();

        return results.map(req => {
            const sum = req.details && req.details.length > 0
                ? req.details.reduce((acc, cur) => acc + (Number(cur.SoLuong) || 0), 0)
                : 0;
            return {
                _id: req._id,
                MaND: req.MaND,
                NgayTao: req.NgayTao,
                TrangThai: req.TrangThai,
                TongSoQuyen: sum,
                details: req.details
            };
        });
    }

}

module.exports = RequestService;
