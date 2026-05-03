import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

export const getAllUsers = async (req: any, res: Response) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            bpds: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Gagal mengambil data users' });
  }
};

export const createUser = async (req: any, res: Response) => {
  const { username, password, role } = req.body;
  const currentUserId = req.user?.id;

  try {
    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username }
    });

    if (existingUser) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        role,
      },
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({ message: 'User berhasil dibuat', user });
  } catch (error) {
    res.status(500).json({ error: 'Gagal membuat user' });
  }
};

export const updateUser = async (req: any, res: Response) => {
  const { id } = req.params;
  const { username, password, role } = req.body;
  const currentUserId = req.user?.id;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Prevent self-role modification
    if (id === currentUserId) {
      return res.status(400).json({ error: 'Tidak dapat mengubah role sendiri' });
    }

    // Check if username is taken by another user
    if (username !== existingUser.username) {
      const usernameTaken = await prisma.user.findUnique({
        where: { username }
      });

      if (usernameTaken) {
        return res.status(400).json({ error: 'Username sudah digunakan' });
      }
    }

    const updateData: any = { username, role };
    
    // Only update password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        username: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      }
    });

    res.json({ message: 'User berhasil diperbarui', user });
  } catch (error) {
    res.status(500).json({ error: 'Gagal memperbarui user' });
  }
};

export const deleteUser = async (req: any, res: Response) => {
  const { id } = req.params;
  const currentUserId = req.user?.id;

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id }
    });

    if (!existingUser) {
      return res.status(404).json({ error: 'User tidak ditemukan' });
    }

    // Prevent self-deletion
    if (id === currentUserId) {
      return res.status(400).json({ error: 'Tidak dapat menghapus user sendiri' });
    }

    // Check if user has BPD records
    const bpdCount = await prisma.bpd.count({
      where: { updatedById: id }
    });

    if (bpdCount > 0) {
      return res.status(400).json({ 
        error: 'Tidak dapat menghapus user yang memiliki data BPD. Transfer data terlebih dahulu.' 
      });
    }

    await prisma.user.delete({
      where: { id }
    });

    res.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    res.status(500).json({ error: 'Gagal menghapus user' });
  }
};
