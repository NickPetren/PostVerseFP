import express from 'express';
import cors from 'cors';
import authRouter from './auth/router.js';
import postRouter from './posts/router.js';
import searchRouter from './searchRouter.js';
import notificationRouter from './notifications/notificationRouter.js';

const app = express();

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.urlencoded({limit: '50mb', extended: true}));

app.use('/auth', authRouter);
app.use('/posts', postRouter);
app.use('/search', searchRouter);
app.use('/notifications', notificationRouter);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        error: err.message 
    });
});

export default app;