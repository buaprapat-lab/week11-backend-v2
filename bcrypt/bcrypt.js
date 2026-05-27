import bcrypt from "bcrypt";

/* ตั้ง async function สำหรับ hash password
bcrypthash ทำงานแบบ asynchronous เพราะมันใช้เวลาในการประมวลผล 
ดังนั้นเราต้องใช้ async/await หรือ .then() เพื่อจัดการกับผลลัพธ์ที่ได้จากการ hash password 
แตกต่างกับ hashSync ที่ทำงานแบบ synchronous ซึ่งจะบล็อกการทำงานของโปรแกรมจนกว่าจะเสร็จสิ้นการ hash password
ซึ่งถ้า server มีการ hash password จำนวนมากพร้อมกัน อาจทำให้เกิดปัญหาด้านประสิทธิภาพและความล่าช้าในการตอบสนองของ server ได้

ที่เป็น Await เพราะ bcrypt.hash เป็นฟังก์ชันที่ทำงานแบบ asynchronous 
ซึ่งจะใช้เวลานานในการประมวลผล โดยเฉพาะเมื่อมีการใช้ salt rounds ที่สูงขึ้น 
การใช้ await ช่วยให้เราสามารถรอผลลัพธ์จากการ hash password ได้อย่างถูกต้อง และทำให้โค้ดดูเรียบร้อยและง่ายต่อการอ่านมากขึ้น

*/

export async function hashPassword(string) {
  const hashedPassword = await bcrypt.hash(string, 12);

  return hashedPassword;
}

/* " " ในนี้คือรหัสที่เราจะเอาไปแปลงค่า
แก้ console.log ไม่ให้ return เป็น promise ยังไงดี เพราะมันเป็น async function
เราสามารถใช้ .then() เพื่อจัดการกับผลลัพธ์ที่ได้จากการเรียกใช้ฟังก์ชัน hashPassword ได้

hashPassword("mysecretpassword")
   .then(hashed => {
      console.log(hashed);
   });
   */

/* แต่ก็มีอีกทางคือใช้ async/await ในการจัดการกับผลลัพธ์จากฟังก์ชัน hashPassword ได้ 
const hashed = await hashPassword("mysecretpassword");
console.log(hashed); */

/* สั่งรันยังไงใน terminal ก็ใช้คำสั่ง node bcrypt.js ได้เลย 
เพราะเราใช้ top-level await ได้ใน Node.js เวอร์ชัน 14 ขึ้นไป 
ขั้นตอนนี้จจะได้ hased password มา ต่อมาคือการใช้ hashed password ในการตรวจสอบรหัสผ่าน
password ที่ compare ได้มากจาก terminal หลัง cd bcrypt -> node bcrypt.js
หรือได้มาจาก DB 

//test compare password

console.log(
  await bcrypt.compare(
    "mysecretpassword",
    "$2b$12$Cj8mLh7n1sXo9u5Zl3e7uJj5z6Q9v8w1x2y3z4a5b6c7d8e9f0g",
  ),
); // true

*/

/* ใส่ await ตรงนี้เพราะ bcrypt.compare เป็นฟังก์ชันที่ทำงานแบบ asynchronous
ทำไม log แล้วค่าที่ได้เป่็น false ทั้งที่ password ถูกต้อง?
เพราะค่าที่เราเอามาเปรียบเทียบมันไม่ตรงกัน 
ค่าที่เราเอามาเปรียบเทียบคือ "mysecretpassword" ซึ่งเป็นรหัสผ่านที่เราต้องการตรวจสอบ 
ส่วนค่าอีกตัวคือ "$2b$12$Cj8mLh7n1sXo9u5Zl3e7uJj5z6Q9v8w1x2y3z4a5b6c7d8e9f0g" ซึ่งเป็นรหัสผ่านที่ถูก hash แล้ว 
ดังนั้นเมื่อเรานำสองค่านี้มาเปรียบเทียบกัน มันจะไม่ตรงกันและส่งผลให้ bcrypt.compare คืนค่า false ออกมา
ถ้าเราต้องการตรวจสอบรหัสผ่านที่ถูกต้อง เราต้องใช้รหัสผ่านที่ถูก hash แล้วมาเปรียบเทียบกับรหัสผ่านที่ผู้ใช้ป้อนเข้ามา 
เช่น bcrypt.compare("mysecretpassword", hashedPassword) ซึ่ง hashedPassword คือค่าที่ได้จากการ hash รหัสผ่านของผู้ใช้ในฐานข้อมูล
จากการ log นั่นคือ $2b$12$fDyc4ST6XoBMLEYHIobjQ.Y00MTM6p/UtYzuRIhv2vtWfe58a74Wm ซึ่งเป็นรหัสผ่านที่ถูก hash แล้วของ "mysecretpassword"
 */

/* ขั้นตอนคือ hashed แล้วเก็บเข้า DB แล้วเมื่อมีการ login เข้ามา 
เราก็เอารหัสผ่านที่ผู้ใช้ป้อนมาเปรียบเทียบกับรหัสผ่านที่ถูก hash แล้วใน DB โดยใช้ bcrypt.compare ซึ่งจะคืนค่า true หรือ false
ที่จริงแล้ว mysecretpassword มาจาก res.body.password ที่ผู้ใช้ป้อนเข้ามาในฟอร์ม login และค่าที่ถูก hash แล้วมาจากฐานข้อมูลที่เราเก็บไว้ตอนสมัครสมาชิก
*/

/* ขั้นตอนต่อไปคือการนำฟังก์ชัน hashPassword ไปใช้ในโมเดลของผู้ใช้ (user model) เพื่อให้รหัสผ่านถูก hash ก่อนที่จะถูกบันทึกลงในฐานข้อมูล
โดยเขียนโค้ดใน user.model.js เพื่อใช้ฟังก์ชัน hashPassword ในการ hash รหัสผ่านก่อนที่จะถูกบันทึกลงในฐานข้อมูล
เขียนว่าอะไรในนั้นอ่ะ? ก็จะเป็นการใช้ pre-save hook ของ Mongoose เพื่อให้รหัสผ่านถูก hash ก่อนที่จะถูกบันทึกลงในฐานข้อมูล
เช่น
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await hashPassword(this.password);
  next();
});  

แต่ใน user.model.js เราไม่ได้เขียนโค้ดนี้ไว้ เพราะเราอาจจะใช้วิธีการ hash รหัสผ่านใน controller แทน ซึ่งก็เป็นวิธีที่ถูกต้องเช่นกัน
แล้วเขียนที่ไหนใน controller อ่ะ? ก็จะเป็นการใช้ฟังก์ชัน hashPassword ในฟังก์ชัน createUser เพื่อให้รหัสผ่านถูก hash ก่อนที่จะถูกบันทึกลงในฐานข้อมูล
เช่น
export const createUser = async (req, res, next) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    const err = new Error("username, email, and password are required");
    err.name = "ValidationError";
    err.status = 400;
    next(err);
  }

  try {
    const hashedPassword = await hashPassword(password);
    const doc = await User.create({ username, email, password: hashedPassword, role });
    return res.status(201).json({ success: true, data: userResponse(doc) });
  } catch (err) {
    next(err);
  }
};  

แนะนให้เขียนที่โค้ดที่ controller เพราะมันจะทำให้เราสามารถควบคุมการ hash รหัสผ่านได้อย่างชัดเจน และสามารถจัดการกับข้อผิดพลาดที่อาจเกิดขึ้นได้ง่ายขึ้น
เริ่มเขียนที่บรรทัดที่ 17 ในฟังก์ชัน createUser โดยเพิ่มโค้ดสำหรับ hash รหัสผ่านก่อนที่จะถูกบันทึกลงในฐานข้อมูล


 */
