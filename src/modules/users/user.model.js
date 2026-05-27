import mongoose from "mongoose";
import bcrypt from "bcrypt"; // นำเข้า bcrypt มาใช้ในโมเดล

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 8, select: false },
  },
  { timestamps: true },
);

// เพิ่ม middleware ก่อนบันทึกข้อมูลลงฐานข้อมูล เพื่อแฮชรหัสผ่านก่อนเก็บ
userSchema.pre("save", async function () {
  const user = this; // ข้อมูลผู้ใช้ที่กำลังจะถูกบันทึก

  // ถ้ารหัสผ่านไม่ได้ถูกแก้ไข (เช่น กรณีอัพเดตข้อมูลอื่นๆ โดยไม่เปลี่ยนรหัสผ่าน) ก็ข้ามการแฮช
  if (!this.isModified("password")) {
    return;
  }

  this.password = await bcrypt.hash(this.password, 10);
  // แฮชรหัสผ่านด้วย bcrypt และเก็บกลับลงในฟิลด์ password
});
/*
  try {
    // เปลี่ยนรหัสผ่านดิบให้เป็นรหัสผ่านที่ถูกแฮชด้วย bcrypt ก่อนเก็บลง DB
    const saltRounds = 10; // จำนวนรอบในการสร้าง salt (ยิ่งมากยิ่งปลอดภัยแต่ใช้เวลานานขึ้น)
    const hashedPassword = await bcrypt.hash(user.password, saltRounds);
    user.password = hashedPassword; // แทนที่รหัสผ่านดิบด้วยรหัสผ่านที่ถูกแฮช
  } catch (err) {
    throw err; // ถ้ามีข้อผิดพลาดในการแฮชรหัสผ่าน ให้ส่ง error ไปยัง controllerf func ที่จะส่งต่อให้ centralized middleware อีกทีไป
  }
});
*/

export const User = mongoose.model("User", userSchema);
