const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const USER_MODEL = require("../../Model/User/User.Model");

class USER_SERVICE {
  async checkUserExists(email, phone) {
    // Tìm kiếm người dùng dựa trên email hoặc số điện thoại
    const searchConditions = [];

    if (email) {
      searchConditions.push({ EMAIL: email });
    }
    if (phone) {
      searchConditions.push({ PHONE_NUMBER: phone });
    }

    if (searchConditions.length === 0) {
      return null;
    }

    return await USER_MODEL.findOne({
      $or: searchConditions,
    }).lean();
  }

  async checkEmailExists(email) {
    return await USER_MODEL.findOne({ EMAIL: email }).lean();
  }

  async registerUser(body) {
    const hash = await this.hashPassword(body.PASSWORD);

    const newUser = new USER_MODEL({
      FULLNAME: body.FULLNAME,
      EMAIL: body.EMAIL,
      PHONE_NUMBER: body.PHONE_NUMBER,
      PASSWORD: hash,
      ROLE: {
        ADMIN: false,
        BRANCH_MANAGER: false,
        STAFF: false,
      },
      GENDER: body.GENDER,
      IS_BLOCKED: null,
      IS_ACTIVATED: false,
    });

    const result = await newUser.save();
    return result.toObject();
  }

  async hashPassword(password) {
    const saltRounds = 10;
    return await bcrypt.hash(password, saltRounds);
  }

  async checkPassword(password, passwordDB) {
    try {
      return await bcrypt.compare(password, passwordDB);
    } catch (err) {
      throw new Error("Password comparison failed");
    }
  }

  login = async (payload) => {
    const secret = process.env.ACCESS_TOKEN_SECRET;
    const expiresIn = "30d";

    const accessToken = jwt.sign(payload, secret, { expiresIn });
    return accessToken;
  };

  async getUserInfo(user_id) {
    const user = await USER_MODEL.findById(user_id);

    if (!user) {
      throw new Error("User not found");
    }
    return user;
  }

  async updateUserOTP(email, otp, otpType, expTime) {
    try {
      const user = await USER_MODEL.findOneAndUpdate(
        { EMAIL: email },
        {
          $push: {
            OTP: {
              TYPE: otpType,
              CODE: otp,
              TIME: Date.now(),
              EXP_TIME: expTime,
              CHECK_USING: false,
            },
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating user OTP:", error);
    }
  }

  async updateOTPstatus(email, otp) {
    try {
      const user = await USER_MODEL.findOneAndUpdate(
        { EMAIL: email, "OTP.CODE": otp },
        { $set: { "OTP.$.CHECK_USING": true } },
        { new: true }
      );
      return user;
    } catch (error) {
      console.error("Error updating user OTP:", error);
    }
  }

  async verifyOTPAndActivateUser(email, otp) {
    const updatedUser = await USER_MODEL.findOneAndUpdate(
      { EMAIL: email, "OTP.CODE": otp },
      { $set: { IS_ACTIVATED: true, "OTP.$.CHECK_USING": true } },
      { new: true }
    );

    return updatedUser;
  }

  async resetPassword(email, newPassword, otp) {
    const hash = await this.hashPassword(newPassword);
    const result = await USER_MODEL.updateOne(
      { EMAIL: email, "OTP.CODE": otp },
      { $set: { PASSWORD: hash, "OTP.$.CHECK_USING": true } }
    );

    if (result.nModified === 0) {
      throw new Error("Failed to update password. User may not exist.");
    }

    return { success: true, message: "Password updated successfully." };
  }

  // Lấy danh sách người dùng và tìm kiếm
  async getUsers(tabStatus, page, limit, search = "") {
    let query = {};

    switch (tabStatus) {
      case "1":
        // Người dùng chưa kích hoạt hoặc không bị chặn
        query = {
          $or: [{ IS_ACTIVATED: false }, { "IS_BLOCKED.CHECK": { $ne: true } }],
        };
        break;

      case "2":
        // Người dùng đã kích hoạt và không bị chặn
        query = { IS_ACTIVATED: true, "IS_BLOCKED.CHECK": { $ne: true } };
        break;

      case "3":
        // Người dùng bị chặn
        query = { "IS_BLOCKED.CHECK": true };
        break;

      case "4":
        // Tất cả người dùng
        query = {};
        break;
      default:
        throw new Error("Invalid tab status");
    }

    if (search) {
      query.$or = [
        { FULLNAME: { $regex: new RegExp(search, "i") } },
        { EMAIL: { $regex: new RegExp(search, "i") } },
        { PHONE_NUMBER: { $regex: new RegExp(search, "i") } },
      ];
    }

    try {
      const totalCount = await USER_MODEL.countDocuments(query);
      const totalPages = Math.ceil(totalCount / limit);
      const offset = (page - 1) * limit;

      const users = await USER_MODEL.find(query)
        .skip(offset)
        .limit(limit)
        .lean(); // Sử dụng lean() để nhận về plain JavaScript objects

      if (users.length === 0) {
        return {
          users: [],
          totalPages: 0,
          totalCount: 0,
        };
      }

      return {
        users,
        totalPages,
        totalCount,
      };
    } catch (error) {
      console.error("Error querying users:", error);
      throw new Error("Lỗi khi truy vấn người dùng");
    }
  }

  async blockUser(userId, isBlocked, blocked_byuserid) {
    const condition = { _id: userId };
    const data = {
      IS_BLOCKED: {
        CHECK: isBlocked,
        TIME: Date.now(),
        BLOCK_BY_USER_ID: blocked_byuserid,
      },
    };
    const options = { new: true };

    const foundUser = await USER_MODEL.findOneAndUpdate(
      condition,
      data,
      options
    );

    return foundUser;
  }
}

module.exports = new USER_SERVICE();
