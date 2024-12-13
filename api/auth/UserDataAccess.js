import User from './UserModel.js';

class UserDataAccess {
    async create(userData) {
        return await User.create(userData);
    }

    async findByUsername(username) {
        return await User.findOne({ username });
    }
}

export default new UserDataAccess();