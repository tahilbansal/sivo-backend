const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const compression = require('compression');
const { fireBaseConnection } = require('./utils/fbConnect');
const authRoute = require("./routes/auth");
const healthRoute = require("./routes/health");
const userRoute = require("./routes/user");
const supRoute = require("./routes/supplier");
const catRoute = require("./routes/category");
const supplierCatRoute = require("./routes/supplierCategory")
const itemRoute = require("./routes/item");
const wishlistRoute = require("./routes/wishlist");
const cartRoute = require("./routes/cart");
const addressRoute = require("./routes/address");
const driverRoute = require("./routes/driver");
const messagingRoute = require("./routes/messaging");
const orderRoute = require("./routes/order");
const ratingRoute = require("./routes/rating");
const uploadRoute =require("./routes/uploads");
const excelUploadRoute = require('./routes/excelUpload');

dotenv.config()
fireBaseConnection();

const app = express();

// Enable CORS
app.use(cors({
    //origin: 'http://localhost:62853',
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// MongoDB connection
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("connected to the db"))
    .catch((err) => { console.log(err) });

// Middleware
app.use(compression({level: 6, threshold: 0}))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Routes
app.use("/", authRoute);
app.use("/", healthRoute);
app.use("/api/users", userRoute);
app.use("/api/supplier/category", supplierCatRoute);
app.use("/api/supplier", supRoute);
app.use("/api/category", catRoute);
app.use("/api/items", itemRoute);
app.use("/api/wishlist", wishlistRoute);
app.use("/api/cart", cartRoute);
app.use("/api/address", addressRoute);
app.use("/api/driver", driverRoute);
app.use("/api/orders", orderRoute);
app.use("/api/rating", ratingRoute);
app.use("/api/messaging", messagingRoute);
app.use("/api/uploads", uploadRoute);
app.use('/api/excel', excelUploadRoute);


// const ip =  "192.168.1.7";
const port = process.env.PORT || 3000; 

app.listen(port, () => {
  console.log(`Product server listening on ${port}`);
});

