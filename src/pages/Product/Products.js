import React, { Component } from "react";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";
import BSON from "bson";

import Products from "../../components/Products/Products";

class ProductsPage extends Component {
  state = { isLoading: true, products: [] };
  componentDidMount() {
    this.fetchData();
  }

  productDeleteHandler = (productId) => {
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    mongodb
      .db("shop")
      .collection("products")
      .deleteOne({ _id: new BSON.ObjectID(productId) })
      .then((result) => {
        console.log("result :", result);
        this.fetchData();
      })
      .catch((err) => {
        console.log("err :", err);
        this.setState({ isLoading: false });
        this.props.onError("delete products failed.");
      });
  };

  fetchData = () => {
    const mongodb = Stitch.defaultAppClient.getServiceClient(
      RemoteMongoClient.factory,
      "mongodb-atlas"
    );
    mongodb
      .db("shop")
      .collection("products")
      .find()
      .asArray()
      .then((products) => {
        const transformProducts = products.map((product) => {
          product._id = product._id.toString();
          product.price = product.price.toString();
          return product;
        });
        this.setState({ isLoading: false, products: products });
      })
      .catch((err) => {
        console.log("err :", err);
        this.setState({ isLoading: false });
        this.props.onError("Fetching the products failed.");
      });
  };

  render() {
    let content = <p>Loading products...</p>;

    if (!this.state.isLoading && this.state.products.length > 0) {
      content = (
        <Products
          products={this.state.products}
          onDeleteProduct={this.productDeleteHandler}
        />
      );
    }
    if (!this.state.isLoading && this.state.products.length === 0) {
      content = <p>Found no products. Try again later.</p>;
    }
    return <main>{content}</main>;
  }
}

export default ProductsPage;
