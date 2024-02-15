// require('dotenv').config({path: './env'})

import dotenv from "dotenv"
import connectDB from "./db/index.js";
const PORT =  process.env.PORT || 8000;

dotenv.config({
    path: './env'
})

connectDB().
then( () => {

    app.on("error", (error) => {
        console.log("Error  : ", error);
    })

    app.listen(PORT, () => {
        console.log(`Server is listen on the port ${PORT}`)
    })
})
.catch( (err) => {
    console.log("mongodb connection failed", err)
})


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