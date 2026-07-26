const { ObjectId } = require("mongodb");

class RequestService {
    constructor(client) {
        this.client = client;
        this.Request = client.db().collection("request");
        this.RequestDetail = client.db().collection("request-detail");
        this.Cart = client.db().collection("cart");
        this.CartDetail = client.db().collection("cart-detail");
        this.Ledger = client.db().collection("ledger");
        this.LedgerDetail = client.db().collection("ledger-detail");
        this.Books = client.db().collection("books");
    }

    async findAll() {
        const pipeline = [
            {
                $lookup: {
                    from: "users",
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
                    from: "request-detail",
                    let: { reqId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$MaYC", "$$reqId"] } } },
                        {
                            $lookup: {
                                from: "books",
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

        // Get max _id from YEUCAU
        // Get max _id from YEUCAU (chỉ lấy _id là số)
        const lastRequest = await this.Request.find({ _id: { $type: "number" } }).sort({ _id: -1 }).limit(1).toArray();
        let nextRequestId = lastRequest.length > 0 ? lastRequest[0]._id + 1 : 1;

        const newRequest = {
            _id: nextRequestId,
            MaND: userObjId,
            NgayTao: NgayTao,
            TrangThai: "ChoDuyet"
        };
        await this.Request.insertOne(newRequest);

        // Get max _id from CHITIET_YEUCAU (chỉ lấy _id là số)
        const lastDetail = await this.RequestDetail.find({ _id: { $type: "number" } }).sort({ _id: -1 }).limit(1).toArray();
        let nextDetailId = lastDetail.length > 0 ? lastDetail[0]._id + 1 : 1;
        for (let item of cartItems) {
            const detailDoc = {
                _id: nextDetailId++,
                MaYC: nextRequestId,
                MaSach: item.MaSach,
                SoLuong: item.SoLuong
            };
            await this.RequestDetail.insertOne(detailDoc);
        }

        // Xóa giỏ hàng sau khi mượn
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

        // Get max _id from YEUCAU
        const lastRequest = await this.Request.find({ _id: { $type: "number" } }).sort({ _id: -1 }).limit(1).toArray();
        let nextRequestId = lastRequest.length > 0 ? lastRequest[0]._id + 1 : 1;

        const newRequest = {
            _id: nextRequestId,
            MaND: userObjId,
            NgayTao: NgayTao,
            TrangThai: "ChoDuyet"
        };
        await this.Request.insertOne(newRequest);

        // Get max _id from CHITIET_YEUCAU
        const lastDetail = await this.RequestDetail.find({ _id: { $type: "number" } }).sort({ _id: -1 }).limit(1).toArray();
        let nextDetailId = lastDetail.length > 0 ? lastDetail[0]._id + 1 : 1;

        const detailDoc = {
            _id: nextDetailId,
            MaYC: nextRequestId,
            MaSach: bookId,
            SoLuong: quantity
        };
        await this.RequestDetail.insertOne(detailDoc);

        return { success: true, message: "Gửi yêu cầu mượn thành công" };
    }

    async approveRequest(requestId){
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
        if(!request) return { success: false, message: "Yêu cầu không tồn tại."};
        if(request.TrangThai !== "ChoDuyet") return { success: false, message: "Yêu cầu đã được xử lý."};

        const details = await this.RequestDetail.find({ 
            $or: [
                { MaYC: reqId },
                { MaYC: String(requestId) }
            ]
        }).toArray();
        if(!details || details.length === 0) return { success: false, message: "Yêu cầu không có chi tiết sách."};

        // Check book stock
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
            if(Number(book.SoQuyen) < Number(detail.SoLuong)){
                return {success: false, message: `Sách "${book.TenSach}" không đủ số lượng trong kho`};
            }
        }

        //Tạo đơn mượn mới sau khi phê duyệt
        const lastLedger = await this.Ledger.find({ _id: { $type: "number" }}).sort({ _id: -1 }).limit(1).toArray();
        let nextLedgerId = lastLedger.length > 0 ? lastLedger[0]._id + 1 : 1;

        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth()+1).padStart(2, '0');
        const y = now.getFullYear();
        const NgayMuon = `${d}/${m}/${y}`;

        const newLedger = {
            _id: nextLedgerId,
            MaND: request.MaND,
            NgayMuon: NgayMuon,
            NgayTra: NgayTra,
            TrangThai: "DangMuon"
        };
        await this.Ledger.insertOne(newLedger);

        //Tạo chi tiết đơn mượn mới
        const lastLedgerDetail = await this.LedgerDetail.find({ _id: { $type: "number" }}).sort({ _id: -1 }).limit(1).toArray();
        let nextLedgerDetailId = lastLedgerDetail.length > 0 ? lastLedgerDetail[0]._id + 1 : 1;

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
                _id: nextLedgerDetailId++,
                MaPhieuMuon: nextLedgerId,
                MaSach: bookId,
                SoLuong: detail.SoLuong
            });
        }

        //Cập nhật lại trạng thái yêu cầu
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

    async rejectRequest(requestId){
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
        if(!request) return { success: false, message: "Yêu cầu không tồn tại"};
        if(request.TrangThai !== "ChoDuyet") return { success: false, message: "Yêu cầu đã được xử lý"};

        await this.Request.updateOne(
            { 
                $or: [
                    { _id: reqId },
                    { _id: String(requestId) }
                ]
            },
            { $set: { TrangThai: "DaTuChoi" } }
        );

        return { success: true, message: "Đã từ chối yêu cầu"};
    }
}

module.exports = RequestService;
