import { OrderType } from './../types.d';
import { isAuth, isAdmin } from './../utils';
import expressAsyncHandler from 'express-async-handler';
import express, { Request, Response, NextFunction } from 'express';
import Order from '../models/orderModel';
import { CustomRequestExtendsUser } from '../types';

const orderRouter = express.Router();

// user가 order하는(placeorder버튼 누르고 들어옴) 기본 카트
orderRouter.post('/', isAuth, expressAsyncHandler(async (req: CustomRequestExtendsUser, res: Response, next: NextFunction) => {
    console.log("isAuth성공하고 post에 들어옴");
    console.log(req.body);
    if (req.body.orderItems.length === 0) {
        res.status(400).send({ message: 'Cart is empty' });
    } else {
        const order = new Order({
            orderItems: req.body.orderItems,
            shippingAddress: req.body.shippingAddress,
            paymentMethod: req.body.paymentMethod,
            itemsPrice: req.body.itemsPrice,
            shippingPrice: req.body.shippingPrice,
            taxPrice: req.body.taxPrice,
            totalPrice: req.body.totalPrice,
            user: req.user, // _id 값이 들어간다
            lat: req.body.lat,
            lng: req.body.lng,
        });
        const createdOrder = await order.save();
        res.status(201).send({ message: 'New Order Created', order: createdOrder });
    }
}));

// 주문한거 찾음 detail
orderRouter.get('/detail/:id', isAuth, expressAsyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        res.send(order);
    } else {
        res.status(404).send({ message: "Order Not Found" });
    }
}));


// pay 버튼 누르고 페이한거 없데이트 한다
orderRouter.put('/:id/pay', isAuth, expressAsyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    const typedOrder = order as OrderType;
    if (order) {
        typedOrder.isPaid = true;
        typedOrder.paidAt = Date.now();
        typedOrder.paymentResult = { id: req.body.id, status: req.body.status, update_time: req.body.update_time, email_address: req.body.payer.email_address };
        const updatedOrder = await order.save();
        res.send(updatedOrder);
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}));


// history 페이지에 data 전송
orderRouter.get('/myOrderList', isAuth, expressAsyncHandler(async (req: CustomRequestExtendsUser, res: Response) => {
    console.log('히스토리 페이지 진행하는 router로 들어옴')
    const orders = await Order.find({ user: req.user }); // req.user 에 _id 값이 들어감
    res.send(orders);
}));


// Admin 계정으로 user들이 order한 list를 뽑는다.
orderRouter.get('/admin/orderList', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const orders = await Order.find().populate('user', 'name'); // 모든정보를 찾는다. 그리고 user부분은 참조한것에서 name을 따온다 populate를 없이 쓰면 user부분에 참조한 _id만 들어오고 populate('참조한부분') 이렇게 쓰면 객체로 값을 추출한다.
    // console.log('오더한 리스트 쫙 뽑는 data:   ', orders)
    res.send(orders);
}));




// Amin 계정으로 user가 order한 것을 delete한다.
orderRouter.delete('/:id', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    if (order) {
        const deleteOrder = await order.remove();
        res.send({ message: 'Order Deleted', order: deleteOrder });
    } else {
        res.status(404).send({ message: 'Order Not Found' })
    }
}))





// Amin 계정으로 deliver 버튼 누르고 deliver 업데이트 한다
orderRouter.put('/admin/deliver/:id', isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const order = await Order.findById(req.params.id);
    const typedOrder = order as OrderType;
    console.log('페이버튼 누르고 진행하는 router로 들어옴')
    if (order) {
        typedOrder.isDelivered = true;
        typedOrder.deliveredAt = Date.now();
        const updatedOrder = await typedOrder.save();
        res.send({ message: 'Order Delivered', order: updatedOrder });
    } else {
        res.status(404).send({ message: 'Order Not Found' });
    }
}));



export default orderRouter;