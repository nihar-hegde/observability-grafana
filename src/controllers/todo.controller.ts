import { type Request, type Response } from "express";
import { z } from "zod";
import * as todoService from "../services/todo.service.js";
import { AppError } from "../middlewares/error.middleware.js";

const createTodoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  userId: z.number().int().positive("userId must be a positive integer"),
});

export const createTodo = async (req: Request, res: Response) => {
  const parsed = createTodoSchema.safeParse(req.body);
  if (!parsed.success) {
    throw new AppError(400, JSON.stringify(parsed.error.flatten()));
  }
  const todo = await todoService.createTodo(parsed.data);
  res.status(201).json(todo);
};

export const getTodos = async (req: Request, res: Response) => {
  const userId = req.query.userId ? Number(req.query.userId) : undefined;
  if (userId !== undefined && isNaN(userId)) {
    throw new AppError(400, "userId must be a number");
  }
  const todos = await todoService.getTodos(userId);
  res.json(todos);
};

export const getTodoById = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new AppError(400, "id must be a number");
  const todo = await todoService.getTodoById(id);
  res.json(todo);
};

export const markDone = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new AppError(400, "id must be a number");
  const todo = await todoService.markDone(id);
  res.json(todo);
};

export const deleteTodo = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) throw new AppError(400, "id must be a number");
  await todoService.deleteTodo(id);
  res.status(204).send();
};
