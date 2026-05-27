import { User } from "./user.model.js";
import { hashPassword } from "../../bcrypt/bcrypt.js";
import bcrypt from "bcrypt";

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
    const doc = await User.create({ username, email, password, role });

    /*const hashedPassword = await hashPassword(password);
    // เอา hashedPassword ยัดลงฐานข้อมูลแทนรหัสผ่านตัวเดิม
    const doc = await User.create({
      username,
      email,
      password: hashedPassword,
      role,
    });*/

    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    //return res.status(400).json({ success: false, error: err });
    next(err);
  }
};

// POST /users/login - ตรวจสอบรหัสผ่านและเข้าสู่ระบบ
export const loginUser = async (req, res, next) => {
  const { email, password } = req.body || {};

  // 1. ตรวจสอบว่าหน้าบ้านส่งข้อมูลมาครบไหม
  if (!email || !password) {
    const err = new Error("email and password are required");
    err.name = "ValidationError";
    err.status = 400;
    // return res.status(400).json({ success: false, error: err });
    next(err);
  }

  try {
    // 2. ค้นหายูสเซอร์ในฐานข้อมูลด้วย Email
    const user = await User.findOne({ email }).select("+password");
    // ถ้าระบบหาอีเมลนี้ไม่เจอในฐานข้อมูล ก็ให้ตอบกลับว่าไม่พบผู้ใช้
    if (!user) {
      return res
        .status(404)
        .json({ success: false, error: "Invalid email or password" });
    }

    // 3. ใช้ bcrypt.compare เปรียบเทียบรหัสผ่านดิบ กับ รหัสที่ถูกแฮชใน DB
    // ( user.password คือค่ารหัสตัวยาวๆ ที่ดึงมาจาก MongoDB )
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, error: "Invalid credentials" });
    }

    // 4. ถ้ารหัสผ่านถูกต้อง ส่งข้อมูลยูสเซอร์กลับไป (ใช้ userResponse ดักลบ password ทิ้งเพื่อความปลอดภัย)
    return res.status(200).json({ success: true, data: userResponse(user) });
  } catch (err) {
    // return res.status(400).json({ success: false, error: err });
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
