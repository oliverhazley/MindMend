import promisePool from '../utils/database.js';
import bcrypt from 'bcryptjs';

const getAllUsers = async () => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM users');
    return rows;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

const getUserById = async (userId) => {
  try {
    const [rows] = await promisePool.query('SELECT * FROM users WHERE id = ?', [
      userId,
    ]);
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    throw error;
  }
};

const getUserByEmail = async (email) => {
  try {
    const [rows] = await promisePool.query(
      'SELECT * FROM users WHERE email = ?',
      [email],
    );
    return rows[0];
  } catch (error) {
    console.error('Error fetching user by email:', error);
    throw error;
  }
};

const updateUser = async (userId, user) => {
  try {
    const {name, email} = user;
    await promisePool.query(
      'UPDATE users SET name = ?, email = ? WHERE id = ?',
      [name, email, userId],
    );
  } catch (error) {
    console.error('Error updating user:', error);
    throw error;
  }
};

const deleteUser = async (userId) => {
  try {
    const [rows] = await promisePool.query('DELETE FROM users WHERE id = ?', [
      userId,
    ]);
    return rows.affectedRows > 0;
  } catch (error) {
    console.error('Error deleting user:', error);
    throw error;
  }
};

const createUser = async (user) => {
  try {
    // Hash the password before storing it in the database
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(user.password, salt);

    const {name, email} = user;
    const [result] = await promisePool.query(
      'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword],
    );
    return {
      userId: result.insertId,
      name: user.name,
      email: user.email,
    };
  } catch (error) {
    console.error('Error creating user:', error);
    throw error;
  }
};

export {
  getAllUsers,
  getUserById,
  getUserByEmail,
  updateUser,
  deleteUser,
  createUser,
};
