import { Router } from "express";
import { router as userRoutes } from "./users.routes.js";
//  ยังใช้ตัวนี้ได้ แต่เพิ่มตัวที่บอกว่า v1 v2

export const router = Router();

router.use("/users", userRoutes);

// router.use("/products", productsRoutes);
// router.use("/notes", notesRoutes);
