

function updateDriver(updatedOrder, db) {
    let ref = db.ref("drivers");

    const data = {
        order_id: updatedOrder.id,
    };
    try {
        ref.set(data)
    } catch (error) {
        console.log(error);
    }

}

function updateSupplier(updatedOrder, db, status) {
    const id = updatedOrder.supplierId._id.toString();

    let ref = db.ref(id);

    const supplier = {
        update_type: "Client",
        order_id: updatedOrder.id,
        status: status
    };

    try {
        ref.set(supplier)

    } catch (error) {

    }
}

function updateUser(updatedOrder, db, status) {
    const id = updatedOrder.userId._id.toString();

    let ref = db.ref(id);

    const user = {
        order_id: updatedOrder.id,
        status: status
    }

    try {
        ref.set(user)

    } catch (error) {

    }
};

module.exports = { updateDriver, updateSupplier, updateUser }