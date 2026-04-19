import { Router } from "express";
import {
  createTodo,
  deleteTodo,
  getTodoById,
  getTodos,
  markDone,
} from "../controllers/todo.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getTodos));
router.get("/:id", asyncHandler(getTodoById));
router.post("/", asyncHandler(createTodo));
router.patch("/:id/done", asyncHandler(markDone));
router.delete("/:id", asyncHandler(deleteTodo));

export default router;
