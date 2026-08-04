const { ObjectId, ReturnDocument } = require("mongodb");

class BookService {
    constructor(client) {
        this.client = client;
        this.Book = client.db().collection("SACH");
    }

    async find(filter) {
        const cursor = await this.Book.find(filter);
        return await cursor.toArray();
    }

    async getCategories() {
        return await this.Book.distinct("TheLoai");
    }

    async getNewBooks(limit = 5) {
        const books = await this.Book.find({}).toArray();
        books.sort((a, b) => {
            const parseDate = (dateStr) => {
                if (!dateStr) return 0;
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                    return new Date(parts[2], parts[1] - 1, parts[0]).getTime();
                }
                const d = new Date(dateStr);
                return isNaN(d.getTime()) ? 0 : d.getTime();
            };
            return parseDate(b.NgayThemSach) - parseDate(a.NgayThemSach);
        });
        return books.slice(0, limit);
    }

    async findById(id) {
        let queryId = id;
        if (ObjectId.isValid(id) && typeof id === 'string' && id.length === 24) {
            queryId = new ObjectId(id);
        } else if (!isNaN(id)) {
            queryId = Number(id);
        }

        return await this.Book.findOne({ _id: queryId });
    }

    async create(payload) {
        const now = new Date();
        const d = String(now.getDate()).padStart(2, '0');
        const m = String(now.getMonth() + 1).padStart(2, '0');
        const y = now.getFullYear();
        const NgayThemSach = `${d}/${m}/${y}`;

        const newBook = {
            TenSach: payload.TenSach,
            TenTG: payload.TenTG,
            TheLoai: payload.TheLoai,
            DonGia: Number(payload.DonGia) || 0,
            SoQuyen: Number(payload.SoQuyen) || 0,
            NamSanXuat: Number(payload.NamSanXuat) || y,
            NXB: payload.NXB,
            MoTa: payload.MoTa || "",
            BiaSach: payload.BiaSach || "",
            NgayThemSach: NgayThemSach
        };

        const result = await this.Book.insertOne(newBook);
        return { success: true, message: "Thêm sách mới thành công", insertedId: result.insertedId };
    }

    async update(id, payload) {
        let queryId = id;
        if (ObjectId.isValid(id) && typeof id === 'string' && id.length === 24) {
            queryId = new ObjectId(id);
        } else if (!isNaN(id)) {
            queryId = Number(id);
        }

        const updateData = {};
        if (payload.TenSach !== undefined) updateData.TenSach = payload.TenSach;
        if (payload.TenTG !== undefined) updateData.TenTG = payload.TenTG;
        if (payload.TheLoai !== undefined) updateData.TheLoai = payload.TheLoai;
        if (payload.DonGia !== undefined) updateData.DonGia = Number(payload.DonGia);
        if (payload.SoQuyen !== undefined) updateData.SoQuyen = Number(payload.SoQuyen);
        if (payload.NamSanXuat !== undefined) updateData.NamSanXuat = Number(payload.NamSanXuat);
        if (payload.NXB !== undefined) updateData.NXB = payload.NXB;
        if (payload.MoTa !== undefined) updateData.MoTa = payload.MoTa;
        if (payload.BiaSach !== undefined && payload.BiaSach !== "") updateData.BiaSach = payload.BiaSach;

        const result = await this.Book.findOneAndUpdate(
            { _id: queryId },
            { $set: updateData },
            { returnDocument: "after" }
        );
        return result;
    }

    async delete(id) {
        let queryId = id;
        if (ObjectId.isValid(id) && typeof id === 'string' && id.length === 24) {
            queryId = new ObjectId(id);
        } else if (!isNaN(id)) {
            queryId = Number(id);
        }

        const result = await this.Book.findOneAndDelete({ _id: queryId });
        return result;
    }

    async countAll() {
        const result = await this.Book.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: "$SoQuyen" } // Cộng dồn số lượng từng cuốn
                }
            }
        ]).toArray();
        return result.length > 0 ? result[0].total : 0;

    }
}

module.exports = BookService;