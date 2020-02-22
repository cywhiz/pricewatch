import React from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import UserAgent from 'user-agents';
import BootstrapTable from 'react-bootstrap-table-next';
import 'react-bootstrap-table-next/dist/react-bootstrap-table2.min.css';
import jsonData from './data.json';

class Item extends React.Component {
  constructor() {
    super();
    this.state = { items: [] };
  }

  componentDidMount() {
    var itemList = [];

    function toPrice(num) {
      return +(Math.round(num + 'e+2') + 'e-2');
    }

    for (var i in jsonData) {
      let url = 'https://amazon.co.jp/gp/offer-listing/' + i;
      let proxy = 'https://proxycy.herokuapp.com/' + url;
      let ua = new UserAgent().toString();

      let itemNo = i;
      let qty = jsonData[i];
      axios
        .get(proxy, {
          headers: { 'User-Agent': ua }
        })
        .then(res => {
          const $ = cheerio.load(res.data);
          const offer = $('.olpOffer').first();
          var item = {};

          let image = $('#olpProductImage a img')
            .first()
            .attr('src');
          // .trim();
          let brand = $('#olpProductByline')
            .first()
            .text()
            .trim();
          let price = offer
            .find('.olpOfferPrice')
            .text()
            .trim();
          let shipping = offer
            .find('.olpShippingPrice')
            .text()
            .trim();

          if (price != '') {
            if (shipping != '') {
              shipping = shipping.replace(',', '').match(/\d+/)[0];
            }

            price = price.replace(',', '').match(/\d+/)[0];
            price = +price + +shipping;
            item.unitPrice = toPrice((+price / +qty) * 0.071);
            item.price = price;
            item.itemNo = itemNo;
            item.image = image;
            item.brand = brand;
            item.url = url;
            item.qty = qty;

            itemList.push(item);
          }

          this.setState({ items: itemList });
        })
        .catch(error => {
          console.log(error);
        });
    }
  }

  render() {
    function imageFormatter(cell, formatExtraData) {
      return (
        <a href={formatExtraData.url} target="blank">
          <img src={cell} />
        </a>
      );
    }

    const columns = [
      {
        dataField: 'image',
        text: 'Image',
        formatter: imageFormatter,
        sort: true
      },
      { dataField: 'brand', text: 'Brand', sort: true },
      { dataField: 'qty', text: 'Quantity', sort: true },
      { dataField: 'price', text: 'Price (JPY)', sort: true },
      { dataField: 'unitPrice', text: 'Unit Price (HKD)', sort: true }
    ];

    const defaultSorted = [{ dataField: 'unitPrice', order: 'asc' }];

    return (
      <BootstrapTable
        bootstrap4
        keyField="image"
        data={this.state.items}
        columns={columns}
        defaultSorted={defaultSorted}
        wrapperClasses="table-responsive table-hover"
      />
    );
  }
}

export default Item;
