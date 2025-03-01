module.exports = {

    healthCheck: (req, res) => {
        res.status(200).json({ status: true, message: "Service is running" });
    }
}