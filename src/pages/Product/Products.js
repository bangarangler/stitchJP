import React, { Component } from "react";
import axios from "axios";
import { Stitch, RemoteMongoClient } from "mongodb-stitch-browser-sdk";

import Products from "../../components/Products/Products";

class ProductsPage extends Component {
  state = { isLoading: true, products: [] };
  componentDidMount() {
    this.fetchData();
  }

  productDeleteHandler = (productId) => {
    axios
      .delete("http://localhost:3100/products/" + productId)
      .then((result) => {
        console.log(result);
        this.fetchData();
      })
      .catch((err) => {
        this.props.onError(
          "Deleting the product failed. Please try again later"
        );
        console.log(err);
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
