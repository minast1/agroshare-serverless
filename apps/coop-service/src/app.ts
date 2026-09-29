import { Hono } from 'hono'
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { userController } from './modules/users/users.controller';
//import { userController } from './modules/users/users.controller';

const app = new Hono();

// Global Middlewares
app.use("*", logger());
app.use("*", cors())

// Global Error Handlers
app.onError((err, c) => {
    console.error(`${err.message}`);
    return c.json({
        success: false,
        message: "Internal server error"
    }, 500)
});

//Main Routes Link 
app.get("/", (c) => c.json({ message: "Welcome to Hono.js" }, 200));
app.get("/health", (c) => c.json({ message: "OK" }, 200))
app.route('/users', userController);

export default app;