class LedgerService {
    constructor(client) {
        this.Ledger = client.db().collection("ledger");
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
                    from: "ledger-detail",
                    let: { reqId: "$_id" },
                    pipeline: [
                        { $match: { $expr: { $eq: ["$MaPhieuMuon", "$$reqId"] } } },
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

        const results = await this.Ledger.aggregate(pipeline).toArray();
        console.log("Raw results from DB:", JSON.stringify(results, null, 2));

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
}

module.exports = LedgerService;