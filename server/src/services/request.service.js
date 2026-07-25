class RequestService {
    constructor(client) {
        this.Request = client.db().collection("request");
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
        console.log("Raw results from DB:", JSON.stringify(results, null, 2));

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
}

module.exports = RequestService;