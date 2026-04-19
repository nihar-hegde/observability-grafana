import "dotenv/config";

const BASE_URL = process.env.SIMULATE_URL ?? "https://server.nihar.xyz";
const NUM_USERS = 10;
const INTERVAL_MS = 800;

const todoIds: number[] = [];

const randomUserId = () => Math.ceil(Math.random() * NUM_USERS);
const randomItem = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const randomTitle = () => {
  const titles = [
    "Fix the bug", "Write tests", "Review PR", "Update docs",
    "Deploy feature", "Refactor module", "Add logging", "Schedule meeting",
    "Send report", "Clean up code",
  ];
  return randomItem(titles) + " " + Math.floor(Math.random() * 100);
};

type Action = "CREATE" | "GET_ALL" | "GET_ONE" | "MARK_DONE" | "DELETE";

const pickAction = (): Action => {
  const weights: [Action, number][] = [
    ["CREATE",    35],
    ["GET_ALL",   30],
    ["GET_ONE",   15],
    ["MARK_DONE", 12],
    ["DELETE",     8],
  ];
  const total = weights.reduce((s, [, w]) => s + w, 0);
  let roll = Math.random() * total;
  for (const [action, weight] of weights) {
    roll -= weight;
    if (roll <= 0) return action;
  }
  return "GET_ALL";
};

async function runAction(userId: number) {
  const action = pickAction();
  const tag = `[user${userId}]`;

  try {
    if (action === "CREATE") {
      const body = { title: randomTitle(), userId };
      const res = await fetch(`${BASE_URL}/todos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json() as any;
      if (res.ok && data.id) {
        todoIds.push(data.id);
        console.log(`${tag} CREATE  → #${data.id} "${data.title}"`);
      } else {
        console.log(`${tag} CREATE  → ${res.status} ${JSON.stringify(data)}`);
      }

    } else if (action === "GET_ALL") {
      const url = Math.random() > 0.5
        ? `${BASE_URL}/todos?userId=${userId}`
        : `${BASE_URL}/todos`;
      const res = await fetch(url);
      const data = await res.json() as any[];
      console.log(`${tag} GET_ALL → ${res.status} (${Array.isArray(data) ? data.length : "?"} items)`);

    } else if (action === "GET_ONE") {
      if (todoIds.length === 0) return;
      const id = randomItem(todoIds);
      const res = await fetch(`${BASE_URL}/todos/${id}`);
      const data = await res.json() as any;
      console.log(`${tag} GET_ONE → ${res.status} #${id} ${res.ok ? `"${data.title}"` : JSON.stringify(data)}`);

    } else if (action === "MARK_DONE") {
      if (todoIds.length === 0) return;
      const id = randomItem(todoIds);
      const res = await fetch(`${BASE_URL}/todos/${id}/done`, { method: "PATCH" });
      const data = await res.json() as any;
      console.log(`${tag} MARK_DONE → ${res.status} #${id} completed=${data.completed}`);

    } else if (action === "DELETE") {
      if (todoIds.length === 0) return;
      const idx = Math.floor(Math.random() * todoIds.length);
      const id = todoIds[idx];
      const res = await fetch(`${BASE_URL}/todos/${id}`, { method: "DELETE" });
      if (res.ok) {
        todoIds.splice(idx, 1);
        console.log(`${tag} DELETE  → ${res.status} #${id}`);
      } else {
        const data = await res.json();
        console.log(`${tag} DELETE  → ${res.status} #${id} ${JSON.stringify(data)}`);
      }
    }
  } catch (err: any) {
    console.log(`${tag} ${action} → ERROR ${err.message}`);
  }
}

console.log(`Simulating ${NUM_USERS} users against ${BASE_URL}`);
console.log(`Interval: ${INTERVAL_MS}ms  |  Ctrl+C to stop\n`);

setInterval(() => {
  const userId = randomUserId();
  runAction(userId);
}, INTERVAL_MS);
