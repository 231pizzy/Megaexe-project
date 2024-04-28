import express, { Application} from 'express';
import cookieParser from 'cookie-parser';
import cors from "cors";
import { connection } from './utils/dbConnection';
import config from './utils/config';
import userRouter from './routes/userRoutes'
import postRouter from './routes/postRoutes'
import interactionRouter from './routes/interactionRoutes'

// Connect to MongoDB database
connection()

// Create Express app
const app: Application = express();
const port = config.PORT

app.use(express.json());
app.use(express.urlencoded({ extended: false }))
app.use(cookieParser())
app.use(cors({ origin: "*" }));

// Define routes
app.use("/users", userRouter);
app.use("/post", postRouter);
app.use("/interaction", interactionRouter);

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
