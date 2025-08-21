import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import helmet from "helmet";
import cors from "cors";
import { 
  rateLimiters, 
  corsOptions, 
  helmetConfig, 
  sanitizeInput, 
  securityHeaders 
} from "./security.js";
import { loadEnvConfig, getEnvConfig, isProduction } from "./env-config.js";

// Check if we should run the compliance portal instead
if (process.env.RUN_COMPLIANCE_PORTAL === "true") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const portalPath = path.join(__dirname, "../hand-assessment-compliance-portal");
  
  console.log("Switching to Hand Assessment Compliance Portal...");
  process.chdir(portalPath);
  
  const child = spawn("tsx", ["server/index.ts"], {
    stdio: "inherit",
    shell: true,
    env: { ...process.env, NODE_ENV: "development" }
  });
  
  child.on("error", (error) => {
    console.error("Error starting compliance portal:", error.message);
    process.exit(1);
  });
  
  child.on("close", (code) => {
    process.exit(code || 0);
  });
} else {
  // Load and validate environment configuration
  const config = loadEnvConfig();
  
  // Run the main application
  const app = express();

  // Security middleware - apply first
  app.use(helmet(helmetConfig));
  app.use(cors(corsOptions));
  app.use(securityHeaders);
  
  // Session management
  app.use(session({
    secret: config.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: isProduction(),
      httpOnly: true,
      maxAge: 30 * 60 * 1000, // 30 minutes
      sameSite: 'lax'
    },
    name: 'wakeexer.sid' // Custom session name for security
  }));
  
  // Rate limiting - apply to all routes
  app.use(rateLimiters.general);
  
  // Input sanitization
  app.use(sanitizeInput);
  
  // Body parsing with limits
  app.use(express.json({ limit: '10mb' })); // Increase limit for motion data
  app.use(express.urlencoded({ extended: false, limit: '10mb' }));

  // Serve attached assets statically with proper MIME types
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  app.use('/attached_assets', express.static(path.join(__dirname, '../attached_assets'), {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.mov')) {
        res.setHeader('Content-Type', 'video/quicktime');
      } else if (filePath.endsWith('.mp4')) {
        res.setHeader('Content-Type', 'video/mp4');
      } else if (filePath.endsWith('.webm')) {
        res.setHeader('Content-Type', 'video/webm');
      }
    }
  }));

  app.use((req, res, next) => {
    const start = Date.now();
    const path = req.path;
    let capturedJsonResponse: Record<string, any> | undefined = undefined;

    const originalResJson = res.json;
    res.json = function (bodyJson, ...args) {
      capturedJsonResponse = bodyJson;
      return originalResJson.apply(res, [bodyJson, ...args]);
    };

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (path.startsWith("/api")) {
        let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
        if (capturedJsonResponse) {
          logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
        }

        if (logLine.length > 80) {
          logLine = logLine.slice(0, 79) + "…";
        }

        log(logLine);
      }
    });

    next();
  });

  (async () => {
    const server = await registerRoutes(app);

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      await setupVite(app, server);
    } else {
      serveStatic(app);
    }

    // Use PORT from configuration
    const port = config.PORT;
    if (process.env.NODE_ENV === 'development') {
      // Development: bind to localhost only
      server.listen(port, 'localhost', () => {
        log(`serving on http://localhost:${port}`);
      });
    } else {
      // Production: bind to all interfaces
      server.listen({
        port,
        host: "0.0.0.0",
        reusePort: true,
      }, () => {
        log(`serving on port ${port}`);
      });
    }
  })();
}
