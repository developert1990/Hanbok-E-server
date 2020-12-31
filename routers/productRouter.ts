import { CustomRequestExtendsUser } from './../types.d';
import { productsInfoType } from './../models/productModel';
import { isAuth, isAdmin } from './../utils';
import expressAsyncHandler from 'express-async-handler';
import express, { Request, Response } from 'express';
import { Product, Review } from '../models/productModel';
import { data } from '../data';

const productRouter = express.Router();


// 모든 products 나 search하는 products를 가져옴
productRouter.get('/list/:name/:category/:priceLessThan/:sortBy', expressAsyncHandler(async (req: Request, res: Response) => {
    console.log("리스트 뽑으러 옴");
    console.log('req.params.name', req.params.name)
    console.log('req.params.category', req.params.category)
    console.log('req.params.priceLessThan', req.params.priceLessThan)
    console.log('req.params.sortBy', req.params.sortBy)

    const name = req.params.name;
    const category = req.params.category;
    const priceLessThan = parseInt(req.params.priceLessThan);
    const sortBy = req.params.sortBy;
    const sortOrder =
        sortBy === 'lowest' ? { price: 1 } :
            sortBy === 'highest' ? { price: -1 } :
                sortBy === 'reviewRate' ? { rating: -1 } :
                    { _id: -1 };

    // 제일 처음 로딩될때, 모든 product 다 받음
    if (name === 'all' && category === 'all' && priceLessThan === 0) {
        const products = await Product.find({}).sort(sortOrder) // {} 이라는 빈객체를 find에 넣으면 모든 것을 찾아준다.즉 find all임
        res.send(products);
        return;
        // search, category 변화안주고 price만 변동해서 product 받음
    } else if (name === 'all' && category === 'all' && priceLessThan !== 0) {
        const pricedRangeProducts = await Product.find({ price: { '$gte': 0, '$lte': priceLessThan } }).sort(sortOrder);
        res.send(pricedRangeProducts);
        return;
        // search, price 변화안주고 category만 변동해서 product 받음
    } else if (name === 'all' && category !== 'all' && priceLessThan === 0) {
        const categorizedProducts = await Product.find({ category: { '$regex': category, '$options': 'i' } }).sort(sortOrder);
        res.send(categorizedProducts);
        return;
        // search 변화 안주고 category, price 둘다 변동해서 product 받음
    } else if (name === 'all' && category !== 'all' && priceLessThan !== 0) {
        const categorizedPriceRangedProducts = await Product.find({ category: { '$regex': category, '$options': 'i' }, price: { '$gte': 0, '$lte': priceLessThan } }).sort(sortOrder);
        res.send(categorizedPriceRangedProducts);
        return;

        // search, category 둘다 변동해서 받음
    } else if (name !== 'all' && category !== 'all' && priceLessThan === 0) {
        const cateAndNamedProducts = await Product.find({ category: { '$regex': category, '$options': 'i' }, name: { '$regex': name, '$options': 'i' } }).sort(sortOrder)
        res.send(cateAndNamedProducts);
        return;
        // search, category, price 다 변동해서 product 받음
    } else if (name !== 'all' && category !== 'all' && priceLessThan !== 0) {
        const cateAndNamedProducts = await Product.find({ category: { '$regex': category, '$options': 'i' }, name: { '$regex': name, '$options': 'i' }, price: { '$gte': 0, '$lte': priceLessThan } }).sort(sortOrder)
        res.send(cateAndNamedProducts);
        return;
        // search, price만 변동
    } else if (name !== 'all' && category === 'all' && priceLessThan !== 0) {
        const cateAndNamedProducts = await Product.find({ name: { '$regex': name, '$options': 'i' }, price: { '$gte': 0, '$lte': priceLessThan } }).sort(sortOrder)
        res.send(cateAndNamedProducts);
        return;
        // search 변화해서 product받음
    } else {
        const searchedProducts = await Product.find({ name: { '$regex': name, '$options': 'i' } }).sort(sortOrder)
        res.send(searchedProducts);
    }



}));













// 저장
productRouter.get('/seed', expressAsyncHandler(async (req: Request, res: Response) => {
    await Product.remove({}); //이걸 이렇게 앞에다 주면 Product Collection(table)에 잇는 데이터가 모두 삭제된다. 그 다음 아래가 실행됨
    const createdProducts = await Product.insertMany(data.products);
    res.send({ createdProducts });
}));


// 찾기
productRouter.get('/:id', expressAsyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        res.send(product);
    } else {
        res.status(400).send({ message: 'Product Not Found' });
    }
}))




// product 새로 추가
productRouter.post('/', isAuth, isAdmin, expressAsyncHandler(async (req, res) => {
    console.log("admin확인 되서 들어옴")
    const product = new Product({
        name: req.body.createProduct.name,
        image: req.body.createProduct.image,
        price: req.body.createProduct.price,
        category: req.body.createProduct.category,
        brand: req.body.createProduct.brand,
        countInStock: req.body.createProduct.countInStock,
        rating: 0,
        numReviews: 0,
        description: req.body.createProduct.description,
    });
    const createdProduct = await product.save();
    res.send({ message: 'Product Created', product: createdProduct });
}));



// product update 하는 API
productRouter.put('/:id', isAuth, isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    const typedProduct = product as productsInfoType;
    console.log('업데이트 하는 api로 들어옴', req.body.product)
    if (product) {
        typedProduct.name = req.body.product.name;
        typedProduct.price = req.body.product.price;
        typedProduct.image = req.body.product.image;
        typedProduct.category = req.body.product.category;
        typedProduct.brand = req.body.product.brand;
        typedProduct.countInStock = req.body.product.countInStock;
        typedProduct.description = req.body.product.description;

        const updatedProduct = await typedProduct.save();
        res.send({ message: 'Product Updated', product: updatedProduct })
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}))


// product delete 하는 API

productRouter.delete('/:id', isAuth, isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {
    const product = await Product.findById(req.params.id);
    if (product) {
        const deletedProduct = await product.remove();
        res.send({ message: 'Product Deleted', product: deletedProduct });
    } else {
        res.status(404).send({ message: 'Product Not Found' });
    }
}));


// 제품의 카테고리들을 뽑는것
productRouter.get('/category/array', expressAsyncHandler(async (req: Request, res: Response) => {
    console.log("카테고리 뽑으러 들어옴")
    const categories = await Product.find().distinct('category');
    res.send(categories);
}))


// add product Review and return reviews
productRouter.post('/:productId/reviews', isAuth, expressAsyncHandler(async (req: CustomRequestExtendsUser, res: Response) => {
    const productId = req.params.productId;
    const product = await Product.findById(productId);
    const typedProduct = product as productsInfoType;
    if (product) {

        // 같은 유저가 리뷰를 할 경우에 걸러주기위한 if loop
        // if (typedProduct.reviews.find(review => review.name === req.name)) {
        //     res.status(400).send({ message: 'You already submitted review on this item' });
        // } else {
        // review 스키마에 data 입력한다.
        const review = {
            name: req.name as string,
            rating: Number(req.body.rating),
            comment: req.body.comment
        };
        // product 스키마에 review를 넣는다.
        typedProduct.reviews.push(review);
        // review 가 추가 되었을때 review의 숫자를 새로 갱신한다.
        typedProduct.numReviews = typedProduct.reviews.length;
        // 평균 rating을 구한다.
        typedProduct.rating = typedProduct.reviews.reduce((a, c) => c.rating + a, 0) / typedProduct.reviews.length;
        const updatedProduct = await typedProduct.save();
        res.status(201).send({ message: 'Review Created', reviews: updatedProduct.reviews });

        // }

    } else {
        res.status(404).send({ message: 'Product not found' });
    }
}))


// delete product review
productRouter.delete(`/:reviewId/:isAdmin/:productId/reviews`, isAuth, isAdmin, expressAsyncHandler(async (req: Request, res: Response) => {

    const reviewId = req.params.reviewId;
    const productId = req.params.productId;
    // console.log('req.params.reviewId', req.params.reviewId)
    // console.log('req.params.productId', req.params.productId)

    const deletedProduct = await Product.updateOne({ _id: productId }, { $pull: { reviews: { _id: reviewId } } });// _id가 productId 인걸 찾아서 , reviews에 _id가 reviewId인것을 pull 해라.

    const product = await Product.findById(productId);
    const typedProduct = product as productsInfoType;
    typedProduct.numReviews = typedProduct.reviews.length;

    typedProduct.rating = typedProduct.reviews.length === 0 ? 0 : typedProduct.reviews.reduce((a, c) => c.rating + a, 0) / typedProduct.reviews.length;

    await typedProduct.save();

    console.log('deletedProduct: ', deletedProduct)
    res.send({ message: 'Review deleted' });
}));



export default productRouter;