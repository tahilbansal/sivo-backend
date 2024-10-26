const Orders = require("../models/Orders");
const Payout = require("../models/Payout");
const Supplier =require("../models/Supplier")
const User =require("../models/User");
const payoutRequestEmail = require("../utils/payout_request_email");
const admin = require("firebase-admin");
const Item = require("../models/Item");


module.exports ={
    addSupplier: async (req, res) => {
        const owner = req.user.id;
        const { title, time, imageUrl, code, logoUrl, coords } = req.body;
    
        // Check if required fields are not empty
        if (!title || !time || !imageUrl ||  !code || !logoUrl || !coords || !coords.latitude || !coords.longitude || !coords.address || !coords.title) {
            return res.status(400).json({ status: false, message: 'Missing required fields' });
        }
    
        // Check if the supplier code already exists
        const existingSupplier = await Supplier.findOne({ owner: owner });
        if (existingSupplier) {
            return res.status(400).json({ status: false, message: 'Supplier with this code already exists', data: existingSupplier });
        }
    
        const newSupplier = new Supplier(req.body);
    
        try {
            await newSupplier.save();
            await User.findByIdAndUpdate(
                owner,
                { userType: "Vendor" },
                { new: true, runValidators: true });
            

            res.status(201).json({ status: true, message: 'Supplier successfully created' });
        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },


    getSupplierByOwner: async (req, res) => {
        const id = req.user.id;

        try {
            const supplier = await Supplier.findOne({owner: id}) // populate the supplier field if needed


            if (!supplier) {
                return res.status(404).json({ status: false, message: 'supplier item not found' });
            }

            res.status(200).json(supplier);
        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },
    

     getRandomSuppliers: async (req, res) => {
        try {
            let randomSuppliers = [];
    
            // Check if code is provided in the params
            if (req.params.code) {
                randomSuppliers = await Supplier.aggregate([
                    { $match: { code: req.params.code, serviceAvailability: true } },
                    { $sample: { size: 5 } },
                    { $project: {  __v: 0 } }
                ]);
            }
            
            // If no code provided in params or no suppliers match the provided code
            if (!randomSuppliers.length) {
                randomSuppliers = await Supplier.aggregate([
                    { $sample: { size: 5 } },
                    { $project: {  __v: 0 } }
                ]);
            }
    
            // Respond with the results
            if (randomSuppliers.length) {
                res.status(200).json(randomSuppliers);
            } else {
                res.status(404).json({status: false, message: 'No suppliers found' });
            }
        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },

    

    getAllRandomSuppliers: async (req, res) => {
        try {
            let randomSuppliers = [];
    
            // Check if code is provided in the params
            if (req.params.code) {
                randomSuppliers = await Supplier.aggregate([
                    { $match: { code: req.params.code, serviceAvailability: true } },
                    { $project: {  __v: 0 } }
                ]);
            }
            
            // If no code provided in params or no suppliers match the provided code
            if (!randomSuppliers.length) {
                randomSuppliers = await Supplier.aggregate([
                    { $project: {  __v: 0 } }
                ]);
            }
    
            // Respond with the results
            if (randomSuppliers.length) {
                res.status(200).json(randomSuppliers);
            } else {
                res.status(404).json({status: false, message: 'No suppliers found' });
            }
        } catch (error) {
            res.status(500).json({status: false, message: error.message });
        }
    },

    getSuppliersByCategoryAndCode: async (req, res) => {
        const { category, code } = req.params;  // Assuming category, code, and value are sent as parameters
        try {
            const suppliers = await Supplier.aggregate([
                { $match: { category: category } },
            ]);

            if(suppliers.length === 0){
                return res.status(200).json([])
            }

            res.status(200).json(suppliers);
        } catch (error) {
            res.status(500).json({ error: error.message, status: false });
        }
    },

     serviceAvailability: async (req, res) => {
        const supplierId = req.params.id; 
    
        try {
            // Find the supplier by its ID
            const supplier = await Supplier.findById(supplierId);
    
            if (!supplier) {
                return res.status(404).json({ message: 'Supplier not found' });
            }
    
            // Toggle the isAvailable field
            supplier.isAvailable = !supplier.isAvailable;
    
            // Save the changes
            await supplier.save();
    
            res.status(200).json({ message: 'Availability toggled successfully', isAvailable: supplier.isAvailable });
        } catch (error) {
            res.status(500).json({status: false, message: error.message});
        }
    },

    deleteSupplier: async (req, res) => {
        const id  = req.params;
    
        if (!id) {
            return res.status(400).json({ status: false, message: 'Supplier ID is required for deletion.' });
        }
    
        try {
            await Supplier.findByIdAndRemove(id);
    
            res.status(200).json({ status: true, message: 'Supplier successfully deleted' });
        } catch (error) {
            console.error("Error deleting Supplier:", error);
            res.status(500).json({ status: false, message: 'An error occurred while deleting the supplier.' });
        }
    },
    
    getSupplier: async (req, res) => {
        const id = req.params.id;

        try {
            const supplier = await Supplier.findById(id) // populate the supplier field if needed

            if (!supplier) {
                return res.status(404).json({ status: false, message: 'supplier item not found' });
            }

            

            res.status(200).json(supplier);
        } catch (error) {
            res.status(500).json(error);
        }
    },

    getStats: async (req, res) => {
        const id = req.params.id;
        try {
            const data = await Supplier.findById(id, {coords: 0});
            
            const ordersTotal = await Orders.countDocuments({ supplierId: id, orderStatus: "Delivered" });
            const deliveryRevenue = await Orders.countDocuments({ supplierId: id, orderStatus: "Delivered" });
            const cancelledOrders = await Orders.countDocuments({ supplierId: id, orderStatus: "Cancelled" });
            
           

            const latestPayout = await Payout.find({supplier: id}).sort({ createdAt: -1 });
            const processingOrders = await Orders.countDocuments({
                supplierId: id,
                orderStatus: {
                  $in: ["Placed", "Preparing", "Manual", "Ready", "Out_for_Delivery"],
                },
              });


            const revenueTotal = parseFloat(data.earnings.toFixed(2))
            const supplierToken = await User.findById(data.owner, { fcm: 1 });
           


            res.status(200).json(
                {
                    data,
                    latestPayout,
                    ordersTotal,
                    cancelledOrders,
                    revenueTotal,
                    processingOrders,
                    supplierToken
                });


        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    createPayout: async (req, res) => {
       
        try {
            const supplier = await Supplier.findById(req.body.supplier);
            const user = await User.findById(supplier.owner, { email: 1, username: 1 });

            if (!user) {
                return res.status(404).json({ status: false, message: "User not found" });
            }

            const cashout = new Payout({
                amount: req.body.amount,
                supplier: req.body.supplier,
                accountNumber: req.body.accountNumber,
                accountName: req.body.accountName,
                accountBank: req.body.accountBank,
                paymentMethod: req.body.paymentMethod,
            });
            await cashout.save();
           
            payoutRequestEmail(user.email, user.username,req.body.amount)
            res.status(201).json({ status: true, message: "Cashout request sent successfully" });
        } catch (error) {
            res.status(500).json({ status: false, message: error.message });
        }
    },

    getRestarantFinance: async (req, res) => {
        const id = req.params.id;

        try {
            const supplier = await Supplier.findById(id) // populate the supplier field if needed

            if (!supplier) {
                return res.status(404).json({ status: false, message: 'supplier item not found' });
            }

            res.status(200).json(supplier);
        } catch (error) {
            res.status(500).json(error);
        } 
    },

    sendMessages: async (req, res) => {
        const body = req.body;
        const userId = body.data.to_uid;
        console.log(userId);
        const user = await User.findById(userId, { fcm: 1 })
        console.log(user);
        if (user.fcm || user.fcm !== null || user.fcm !== '') {
            console.log(user.fcm);
            const message = {
                notification: {
                    title: body.notification.title,
                    body: body.notification.body
                },
                data: body.data,
                token: user.fcm
            }
        
            try {
                await admin.messaging().send(message);
                console.log('Push notification sent successfully');
            } catch (error) {
                console.log('Error:', "Error sending push notification:");
            }
          //  sendPushNotification(user.fcm, "🎊 From supplier 🎉", data, `Thank you for ordering from us! Your enquires would be met.`)
        }
        
        try {
            
            res.status(200).json({"msg":"success"});
            console.log("success");
        } catch (error) {
            res.status(500).json(error);
        }
    },
    
}