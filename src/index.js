import connectDB from "./db/index.js";
import app from './app.js'

const PORT =  process.env.PORT || 8000

connectDB().
then( () => {

    app.on("error", (error) => {
        console.log("Error :- ", error);
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