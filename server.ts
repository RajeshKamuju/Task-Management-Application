import express, { Request, Response, NextFunction } from "express";
import path from "path";
import fs from "fs";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const JWT_SECRET = process.env.GEMINI_API_KEY || "task_manager_fallback_signing_secret_key_2026";

app.use(express.json());

// Path to JSON persistent store
const DB_PATH = path.join(process.cwd(), "data", "db.json");

// Ensure data folder and file exists
function initializeDatabase() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_PATH)) {
    const initialData = {
      users: [
        {
          id: 1,
          name: "Alice Smith",
          email: "alice@example.com",
          // password is BCrypt for 'password123'
          password: "$2a$10$v0a9sF8P0y.N6i2fG76G1OmgByB0fRTeuC1T2G.uPe2I56p69TfFe"
        },
        {
          id: 2,
          name: "Bob Johnson",
          email: "bob@example.com",
          password: "$2a$10$v0a9sF8P0y.N6i2fG76G1OmgByB0fRTeuC1T2G.uPe2I56p69TfFe"
        }
      ],
      tasks: [
        {
          id: 1,
          title: "Setup Spring Boot Architecture",
          description: "Initialize Maven imports, wire Spring Security configurations, and declare JPA domain mapping entities.",
          status: "COMPLETED",
          dueDate: "2026-06-15",
          createdAt: "2026-06-11T08:30:00.000Z",
          userId: 1
        },
        {
          id: 2,
          title: "Build Secure JWT Validation Filter",
          description: "Write Token Provider and create OncePerRequest filter to intercept and authenticate requests.",
          status: "IN_PROGRESS",
          dueDate: "2026-06-18",
          createdAt: "2026-06-11T09:00:00.000Z",
          userId: 1
        },
        {
          id: 3,
          title: "Draft Frontend Interface Wireframes",
          description: "Design modern Bootstrap and Tailwind UI dashboards and login screens.",
          status: "PENDING",
          dueDate: "2026-06-25",
          createdAt: "2026-06-11T09:15:00.000Z",
          userId: 1
        },
        {
          id: 4,
          title: "Establish Cloud Service Pipelines",
          description: "Deploy microservices containers to Cloud Run, bind ingress routes, and setup MySQL databases.",
          status: "PENDING",
          dueDate: "2026-07-01",
          createdAt: "2026-06-11T10:00:00.000Z",
          userId: 2
        }
      ]
    };
    fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), "utf8");
  }
}

initializeDatabase();

// Database read/write helpers
function readDb() {
  try {
    const data = fs.readFileSync(DB_PATH, "utf8");
    return JSON.parse(data);
  } catch (error) {
    return { users: [], tasks: [] };
  }
}

function writeDb(data: any) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), "utf8");
}

// Custom request interface to store user payload
interface AuthRequest extends Request {
  userEmail?: string;
  userId?: number;
}

// SECURITY: JWT AUTHENTICATION MIDDLEWARE (equivalent to Spring Security OncePerRequestFilter)
function authenticateJWT(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1]; // "Bearer TOKEN"
    jwt.verify(token, JWT_SECRET, (err: any, decoded: any) => {
      if (err) {
        return res.status(403).json({ message: "Access Denied: Invalid or expired security token", status: 403 });
      }
      req.userEmail = decoded.email;
      req.userId = decoded.userId;
      next();
    });
  } else {
    res.status(401).json({ message: "Access Denied: Authorization token required", status: 401 });
  }
}

// API ROUTES (Match the exact requested endpoints)

// 1. User Registration: POST /api/auth/register
app.post("/api/auth/register", (req: Request, res: Response) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: "Validation Failed: name, email, and password are required" });
  }

  const db = readDb();
  const existingUser = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ message: "Email is already registered!" });
  }

  // Encrypt using BCrypt (Spring Security equivalent)
  const hashedPassword = bcrypt.hashSync(password, 10);
  const newUser = {
    id: db.users.length > 0 ? Math.max(...db.users.map((u: any) => u.id)) + 1 : 1,
    name,
    email: email.toLowerCase(),
    password: hashedPassword
  };

  db.users.push(newUser);
  writeDb(db);

  // Generate Token
  const token = jwt.sign({ email: newUser.email, userId: newUser.id }, JWT_SECRET, { expiresIn: "24h" });

  res.status(201).json({
    token,
    tokenType: "Bearer",
    userId: newUser.id,
    userName: newUser.name,
    userEmail: newUser.email
  });
});

// 2. User Login: POST /api/auth/login
app.post("/api/auth/login", (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Validation Failed: email and password are required" });
  }

  const db = readDb();
  const user = db.users.find((u: any) => u.email.toLowerCase() === email.toLowerCase());

  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: "Bad credentials: Invalid email or password" });
  }

  // Create JWT Token
  const token = jwt.sign({ email: user.email, userId: user.id }, JWT_SECRET, { expiresIn: "24h" });

  res.json({
    token,
    tokenType: "Bearer",
    userId: user.id,
    userName: user.name,
    userEmail: user.email
  });
});

// 3. GET all tasks belonging to the logged-in user: GET /api/tasks
app.get("/api/tasks", authenticateJWT, (req: AuthRequest, res: Response) => {
  const db = readDb();
  const userTasks = db.tasks.filter((t: any) => t.userId === req.userId);
  res.json(userTasks);
});

// 4. GET a specific task details: GET /api/tasks/:id
app.get("/api/tasks/:id", authenticateJWT, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const db = readDb();
  const task = db.tasks.find((t: any) => t.id === id);

  if (!task) {
    return res.status(404).json({ message: `Task not found with id : '${id}'` });
  }

  // Authorize User (strictly only access own tasks)
  if (task.userId !== req.userId) {
    return res.status(430).json({ message: "You are not authorized to view this task" });
  }

  res.json(task);
});

// 5. Create a new task: POST /api/tasks
app.post("/api/tasks", authenticateJWT, (req: AuthRequest, res: Response) => {
  const { title, description, status, dueDate } = req.body;

  if (!title) {
    return res.status(400).json({ message: "Validation Failed: Title is required" });
  }

  const db = readDb();
  const newTask = {
    id: db.tasks.length > 0 ? Math.max(...db.tasks.map((t: any) => t.id)) + 1 : 1,
    title,
    description: description || "",
    status: status || "PENDING",
    dueDate: dueDate || null,
    createdAt: new Date().toISOString(),
    userId: req.userId
  };

  db.tasks.push(newTask);
  writeDb(db);

  res.status(201).json(newTask);
});

// 6. Update task information: PUT /api/tasks/:id
app.put("/api/tasks/:id", authenticateJWT, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);
  const { title, description, status, dueDate } = req.body;

  const db = readDb();
  const taskIndex = db.tasks.findIndex((t: any) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: `Task not found with id : '${id}'` });
  }

  const task = db.tasks[taskIndex];

  // Authorize user
  if (task.userId !== req.userId) {
    return res.status(403).json({ message: "You are not authorized to update this task" });
  }

  // Apply updates
  db.tasks[taskIndex] = {
    ...task,
    title: title !== undefined ? title : task.title,
    description: description !== undefined ? description : task.description,
    status: status !== undefined ? status : task.status,
    dueDate: dueDate !== undefined ? dueDate : task.dueDate
  };

  writeDb(db);
  res.json(db.tasks[taskIndex]);
});

// 7. Delete tasks: DELETE /api/tasks/:id
app.delete("/api/tasks/:id", authenticateJWT, (req: AuthRequest, res: Response) => {
  const id = parseInt(req.params.id);

  const db = readDb();
  const taskIndex = db.tasks.findIndex((t: any) => t.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ message: `Task not found with id : '${id}'` });
  }

  const task = db.tasks[taskIndex];

  // Authorize user
  if (task.userId !== req.userId) {
    return res.status(403).json({ message: "You are not authorized to delete this task" });
  }

  db.tasks.splice(taskIndex, 1);
  writeDb(db);

  res.json({ message: "Task deleted successfully" });
});

// Integration with Vite development server or production build static content
async function startServer() {
  // Vite Dev Server middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Serve production static assets
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req: Request, res: Response) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Full-Stack Task Manager running on http://localhost:${PORT}`);
  });
}

startServer();
