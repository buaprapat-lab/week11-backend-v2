import { Router } from "express";
import { User } from "../../modules/users/user.model.js";

export const router = Router();

const userResponse = (doc) => {
  const user = doc.toObject();
  delete user.password;
  return user;
};

// GET
router.get("/", async (req, res) => {
  try {
    const users = await User.find();
    return res.status(200).json({ success: true, data: users });
  } catch (error) {
    return res.status(400).json({ success: false, error: error });
  }
});

// POST
router.post("/", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");
    err.name = "ValidationError";
    err.status = 400;
    return res.status(400).json({ success: false, error: err });
  }

  try {
    const doc = await User.create({ username, email, password, role });
    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    return res.status(400).json({ success: false, error: err });
  }
});

/* Simple incremental string id based on current mock data
  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username: username, email: email };

  users.push(newUser);

  return res.status(201).json(newUser); */

// PUT
router.put("/:id", (req, res) => {
  const user = users.find((u) => u.id === req.params.id);

  if (!user) {
    return res.status(404).json({ error: "User not found!" });
  }

  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res
      .status(400)
      .json({ error: "username, email and password are required!" });
  }

  user.username = username;
  user.email = email;
  user.password = password;

  res.status(200).json(user);
});

// DELETE
router.delete("/:id", (req, res) => {
  // 1. หาตำแหน่ง index ของ user ตัวที่จะลบใน Array
  const userIndex = users.findIndex((u) => u.id === req.params.id);
  // 2. ถ้าหาไม่เจอ (ได้ค่า -1) ให้บอกว่าไม่พบผู้ใช้ และต้อง return ออกไปด้วยเพื่อไม่ให้โค้ดข้างล่างรันต่อ
  if (userIndex === -1) {
    return res.status(404).json({ error: "User not found!" });
  }
  // 3. ลบข้อมูลจากตำแหน่งที่เจอ 1 ตัว
  users.splice(userIndex, 1);

  // 4. ส่งคำตอบกลับสำเร็จ
  return res.status(200).json({ message: "Delete completed" });
});
