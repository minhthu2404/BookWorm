const { ObjectId } = require("mongodb");

class UserService {
    constructor(client) {
        this.client = client;
        this.User = client.db().collection("NGUOIDUNG");
        this.Cart = client.db().collection("GIOHANG");
        this.CartDetail = client.db().collection("CHITIET_GIOHANG");
        this.Request = client.db().collection("YEUCAU");
        this.RequestDetail = client.db().collection("CHITIET_YEUCAU");
        this.Ledger = client.db().collection("DONMUON");
        this.LedgerDetail = client.db().collection("CHITIET_DONMUON");
    }

    // Xử lý dữ liệu
    async create(payload) {
        const user = {
            HoTen: payload.name,
            Email: payload.email,
            Password: payload.password,
            SoDienThoai: "",
            LoaiTaiKhoan: "KhachHang"
        };

        if (payload.address) {
            user.DiaChi = payload.address;
        }
        const result = await this.User.insertOne(user);
        return result;
    }

    async find(filter) {
        const cursor = await this.User.find(filter);
        return await cursor.toArray();
    }

    async findById(id) {
        return await this.User.findOne({
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        });
    }

    async findByEmail(email) {
        return await this.User.findOne({ Email: email });
    }

    async update(id, payload) {
        const filter = {
            _id: ObjectId.isValid(id) ? new ObjectId(id) : null,
        };
        const updateDoc = {
            $set: payload
        };
        const result = await this.User.findOneAndUpdate(
            filter,
            updateDoc,
            { returnDocument: "after" }
        );
        return result.value || result;
    }

    async delete(id){
        let queryId = id;
        if (ObjectId.isValid(id) && typeof id === 'string' && id.length === 24){
            queryId = new ObjectId(id);
        }else if(!isNaN(id)){
            queryId = Number(id);
        }

        // Xóa giỏ hàng và chi tiết giỏ hàng
        const cart = await this.Cart.findOne({ MaND: queryId });
        if (cart) {
            await this.CartDetail.deleteMany({ MaGH: cart._id });
            await this.Cart.deleteOne({ _id: cart._id });
        }

        // Xóa yêu cầu và chi tiết yêu cầu
        const requests = await this.Request.find({ MaND: queryId }).toArray();
        const requestIds = requests.map(r => r._id);
        if (requestIds.length > 0) {
            await this.RequestDetail.deleteMany({ MaYC: { $in: requestIds } });
            await this.Request.deleteMany({ MaND: queryId });
        }

        // Xóa đơn mượn và chi tiết đơn mượn
        const ledgers = await this.Ledger.find({ MaND: queryId }).toArray();
        const ledgerIds = ledgers.map(l => l._id);
        if (ledgerIds.length > 0) {
            await this.LedgerDetail.deleteMany({ MaDM: { $in: ledgerIds } });
            await this.Ledger.deleteMany({ MaND: queryId });
        }

        const result = await this.User.findOneAndDelete({ _id: queryId });
        return result;
    }

    async countAll(){
        return await this.User.countDocuments({});
    }
}

module.exports = UserService;