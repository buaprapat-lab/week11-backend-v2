import { Router } from "express";
import { User } from "../../modules/users/user.model.js";
import { supabase } from "../../config/supabase.js";
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
} from "../../modules/users/users.controller.js";

export const router = Router();

//MongoDB routes (/api/v2/users)

// GET
router.get("/", getUsers);

// POST
router.post("/", createUser);

/* Simple incremental string id based on current mock data
  const nextId = String(
    (users.reduce((max, u) => Math.max(max, Number(u.id)), 0) || 0) + 1,
  );

  const newUser = { id: nextId, username: username, email: email };

  users.push(newUser);

  return res.status(201).json(newUser); */

// PUT
router.put("/:id", updateUser);

// DELETE
router.delete("/:id", deleteUser);

// Supabase / PostgreSQL routes (/api/v2/users/pg)
// Password is excluded from SELECT by RLS policy in Supabase

const PG_SELECT = "id, username, email, role, created_at, updated_at";

// GET
router.get("/pg", async (req, res) => {
  try {
    const { data, error } = await supabase.from("users").select(PG_SELECT);

    if (error) throw error;

    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// POST
router.post("/pg", async (req, res) => {
  const { username, email, password, role } = req.body || {};

  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      error: "username, email, and password are required",
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .insert({ username, email, password, role: role || "user" })
      .select(PG_SELECT)
      .single();

    if (error) throw error;

    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// PUT
router.put("/pg/:id", async (req, res) => {
  const { username, email, password, role } = req.body || {};
  const updates = {};

  if (username !== undefined) updates.username = username;
  if (email !== undefined) updates.email = email;
  if (password !== undefined) updates.password = password;
  if (role !== undefined) updates.role = role;

  if (Object.keys(updates).length === 0) {
    return res.status(400).json({
      success: false,
      error: "At least one field is required to update",
    });
  }

  try {
    const { data, error } = await supabase
      .from("users")
      .update(updates)
      .eq("id", req.params.id)
      .select(PG_SELECT);

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});

// DELETE
router.delete("/pg/:id", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .delete()
      .eq("id", req.params.id)
      .select("id, username, email, role");

    if (error) throw error;

    if (!data || data.length === 0) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    return res.status(200).json({ success: true, data: data[0] });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
});
