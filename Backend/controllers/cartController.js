import Cart from "../models/Cart.js";
import Product from "../models/Product.js";

export const getCart = async (req, res) => {
  let cart = await Cart.findOne({
    user: req.user._id,
  }).populate("items.product");

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  res.json(cart);
};

export const addToCart = async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findOne({
    _id: productId,
    isActive: true,
  });

  if (!product) {
    return res.status(404).json({
      message: "Product not found",
    });
  }

  if (product.stock < quantity) {
    return res.status(400).json({
      message: "Not enough stock",
    });
  }

  let cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    cart = await Cart.create({
      user: req.user._id,
      items: [],
    });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    existingItem.quantity += Number(quantity);
  } else {
    cart.items.push({
      product: productId,
      quantity: Number(quantity),
    });
  }

  await cart.save();

  await cart.populate("items.product");

  res.json(cart);
};

export const updateCartItem = async (req, res) => {
  const { quantity } = req.body;

  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
    });
  }

  const item = cart.items.find(
    (item) =>
      item.product.toString() === req.params.productId
  );

  if (!item) {
    return res.status(404).json({
      message: "Cart item not found",
    });
  }

  if (Number(quantity) <= 0) {
    cart.items = cart.items.filter(
      (cartItem) =>
        cartItem.product.toString() !==
        req.params.productId
    );
  } else {
    item.quantity = Number(quantity);
  }

  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};

export const removeFromCart = async (req, res) => {
  const cart = await Cart.findOne({
    user: req.user._id,
  });

  if (!cart) {
    return res.status(404).json({
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter(
    (item) =>
      item.product.toString() !== req.params.productId
  );

  await cart.save();
  await cart.populate("items.product");

  res.json(cart);
};