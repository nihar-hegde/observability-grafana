import { prisma } from "../db/prisma.js";

export const createTodo = (data: { title: string; userId: number }) =>
  prisma.todo.create({ data });

export const getTodos = (userId?: number) =>
  prisma.todo.findMany({
    where: userId ? { userId } : undefined,
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

export const getTodoById = (id: number) =>
  prisma.todo.findUniqueOrThrow({
    where: { id },
    include: {
      user: { select: { id: true, email: true, name: true } },
    },
  });

export const markDone = (id: number) =>
  prisma.todo.update({ where: { id }, data: { completed: true } });

export const deleteTodo = (id: number) => prisma.todo.delete({ where: { id } });
