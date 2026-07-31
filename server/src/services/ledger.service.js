const { ObjectId } = require("mongodb");

class LedgerService {
    constructor(client) {
        this.client = client;
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
                    from: "CHITIET_DONMUON",
                    let: { reqId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$MaDM", "$$reqId"] } } },
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

        const results = await this.Ledger.aggregate(pipeline).toArray();

        return results.map(req => {
            return {
                _id: req._id,
                MaND: req.MaND,
                NgayMuon: req.NgayMuon,
                NgayTra: req.NgayTra,
                TrangThai: req.TrangThai,
                HoTen: req.user_info ? req.user_info.HoTen : 'Không rõ',
                Email: req.user_info ? req.user_info.Email : 'Không rõ',
                SoDienThoai: req.user_info ? req.user_info.SoDienThoai : 'Không rõ',
                details: req.details
            };
        });
    }


    async findByUserId(userId) {
        let queryId = userId;
        if (ObjectId.isValid(userId) && typeof userId === 'string' && userId.length === 24) {
            queryId = new ObjectId(userId);
        } else if (!isNaN(userId)) {
            queryId = Number(userId);
        }

        // Lấy phiếu mượn user
        // Tìm MaND hoặc _id
        const phieuMuons = await this.Ledger.find({
            $or: [
                { MaND: queryId },
                { MaND: String(userId) },
                { MaND: userId }
            ]
        }).toArray();

        // Lặp để tránh lỗi $lookup
        for (let phieu of phieuMuons) {
            // ID phiếu mượn
            const phieuId = phieu.MaDM || phieu._id;

            // Chi tiết phiếu
            let chiTiet = await this.LedgerDetail.find({
                $or: [
                    { MaDM: phieuId },
                    { MaDM: String(phieuId) },
                    { phieuMuonId: phieuId },
                    { phieuMuonId: String(phieuId) }
                ]
            }).toArray();

            // Lấy thông tin sách
            for (let ct of chiTiet) {
                const sachId = ct.MaSach || ct.SachId || ct.maSach;
                let qSachId = sachId;

                if (ObjectId.isValid(sachId) && typeof sachId === 'string' && sachId.length === 24) {
                    qSachId = new ObjectId(sachId);
                } else if (!isNaN(sachId) && sachId !== undefined) {
                    qSachId = Number(sachId);
                }

                if (sachId !== undefined) {
                    const sach = await this.Books.findOne({
                        $or: [
                            { _id: qSachId },
                            { _id: String(sachId) },
                            { MaSach: sachId },
                            { MaSach: qSachId }
                        ]
                    });

                    if (sach) {
                        ct.TenSach = sach.TenSach || sach.tenSach;
                        ct.BiaSach = sach.BiaSach || sach.biaSach || sach.HinhAnh;
                    }
                }
            }
            phieu.books = chiTiet;
        }

        return phieuMuons;
    }

    async getBorrowTrend() {
        const pipeline = [
            {
                $lookup: {
                    from: "CHITIET_DONMUON",
                    localField: "_id",
                    foreignField: "MaDM",
                    as: "details"
                }
            },
            { $unwind: "$details" },
            {
                $addFields: {
                    parsedDate: {
                        $dateFromString: {
                            dateString: "$NgayMuon",
                            format: "%d/%m/%Y",
                            onError: null,
                            onNull: null
                        }
                    }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$parsedDate" }
                    },
                    totalBorrows: { $sum: { $toInt: "$details.SoLuong" } }
                }
            },
            {
                $sort: { "_id.month": 1 }
            }
        ];
        return await this.Ledger.aggregate(pipeline).toArray();
    }
}

module.exports = LedgerService;
