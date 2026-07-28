const { ObjectId } = require("mongodb");

class UserService {
    constructor(client) {
        this.User = client.db().collection("users");
    }

    // Định nghĩa các phương thức xử lý dữ liệu
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
        const result = await this.User.findOneAndDelete({ _id: queryId });
        return result;
    }

    async countAll(){
        return await this.User.countDocuments({});
    }
}

module.exports = UserService;