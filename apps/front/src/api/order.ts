import client from "./client";

export const createOrder = (activityId: number) =>
    client.post("/api/orders", { activityId }).then((r) => r.data);

export const refundOrder = (orderId: number) => {
    console.log("请求退款", orderId);
    return client.post(`/api/orders/${orderId}/refund`).then((r) => r.data);
};

export const getMyOrders = () =>
    client.get("/api/orders/my").then((r) => r.data);
