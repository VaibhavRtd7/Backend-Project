// require('dotenv').config({path: './env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";

dotenv.config({
    path: './env'
})

connectDB()











// import express from "express";
// const app = express();


// ;( async () => {

//     try {
//         await mongoose.connect(`${process.env.MONGO_URL}/${DB_NAME}`);
//     }
//     catch (error) {
//         console.error("Error : ", error);
//         throw error;
//     }

//     app.on("error", (error) => {
//         console.log("Err : ", error);
//     })

//     app.listen(process.env.PORT, () => {
//         console.log(`Server is running on port ${process.env.PORT}`);
//     })
// })()