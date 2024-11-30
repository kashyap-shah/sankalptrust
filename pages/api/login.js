import jwt from "jsonwebtoken";
import pool from "util/db";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).send("Method Not Allowed");

  const { phone_number, password } = req.body;

  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE phone_number = ? AND role = 'user'", [phone_number]);
    if (rows.length === 0) return res.status(400).send("User not found");

    const user = rows[0];
    if (user.password !== password) return res.status(400).send("Invalid password");

    const token = jwt.sign({ id: user.id, role: user.role }, "secretkey");
    res.setHeader("auth-token", token).send({ token });

  } catch (error) {
    res.status(500).send("Server error");
  }
}