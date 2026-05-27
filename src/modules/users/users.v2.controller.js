import { User } from "./user.model.js";
import { hashPassword } from "../../bcrypt/bcrypt.js";

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password; // คอยลบ password ทิ้งก่อนตอบกลับหน้าบ้าน
  return user;
};

//GET
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    next(err);
  }
};

//POST /users - สร้างผู้ใช้ใหม่แบบเข้ารหัสปลอดภัย

export const createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");
    err.name = "ValidationError";
    err.status = 400;
    // return res.status(400).json({ success: false, error: err });
    next(err);
  }

  try {
    // จุดเปลี่ยนสำคัญ: แย่งเอารหัสผ่านดิบมาเข้าเครื่องปั่นให้กลายเป็นอักษรปริศนา
    // const doc = await User.create({ username, email, password, role });

    const hashedPassword = await hashPassword(password);
    // เอา hashedPassword ยัดลงฐานข้อมูลแทนรหัสผ่านตัวเดิม
    const doc = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    //return res.status(400).json({ success: false, error: err });
    next(err);
  }
};

// PUT  /users/:id - อัปเดตผู้ใช้ ต้องดักแฮชรหัสผ่านกรณีมีการสั่งเปลี่ยนรหัส
export const updateUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (username) updates.username = username;
  if (email) updates.email = email;
  if (role) updates.role = role;
  // ถ้ามีการส่งรหัสผ่านมาให้เปลี่ยน ก็ต้องแฮชรหัสผ่านใหม่ก่อนที่จะอัปเดตลงฐานข้อมูล
  if (password) updates.password = await hashPassword(password);

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    const doc = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
    });
    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.status(200).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    // console.error(err);
    // return res.status(400).json({ success: false, error: err });
    err.status = 400;
    next(err);
  }
};

// DELETE
export const deleteUser = async (req, res, next) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: "User not found" });
    }
    return res.status(200).json({ success: true, data: doc });
  } catch (err) {
    //return res.status(400).json({ success: false, error: err })
    next(err);
  }
};
