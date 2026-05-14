var promiseDB = idb.open('MyStore', 4, upgradeDB => {
        upgradeDB.createObjectStore('Products', { keyPath: 'id' });
        upgradeDB.createObjectStore('Orders', { keyPath: 'id' });
        var store =  upgradeDB.transaction.objectStore('Products');
        store.createIndex('name', 'name', { unique: true });

});

document.getElementById('prdBtn').onclick = function () {

    var proItems =[
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 7
        },
        {
          name: 'Stool',
          id: 'st-re-pin',
          price: 59.99,
          color: 'red',
          material: 'pine',
          description: 'A light, high-stool',
          quantity: 3
        },
        {
          name: 'Chair',
          id: 'ch-blu-pin',
          price: 49.99,
          color: 'blue',
          material: 'pine',
          description: 'A plain chair for the kitchen table',
          quantity: 1
        },
        {
          name: 'Dresser',
          id: 'dr-wht-ply',
          price: 399.99,
          color: 'white',
          material: 'plywood',
          description: 'A plain dresser with five drawers',
          quantity: 4
        },
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 11
        }
      ];

    promiseDB.then(DB => {

        var tx = DB.transaction('Products', 'readwrite');
        var store = tx.objectStore('Products');
        console.log(store);
        proItems.forEach(item => {
            console.log('adding item', item);
            store.put(item);
        });
        return tx.complete;

    })
    .then(() => {
        console.log('products added');
    })
    .catch(err => {
        console.log(err);
    });

};

document.getElementById('ordBtn').onclick = function () {

    var ordItems = [
        {
          name: 'Cabinet',
          id: 'ca-brn-ma',
          price: 799.99,
          color: 'brown',
          material: 'mahogany',
          description: 'An intricately-designed, antique cabinet',
          quantity: 7
        },
        {
          name: 'Armchair',
          id: 'ac-gr-pin',
          price: 299.99,
          color: 'grey',
          material: 'pine',
          description: 'A plush recliner armchair',
          quantity: 3
        },
        {
          name: 'Couch',
          id: 'cch-blk-ma',
          price: 499.99,
          color: 'black',
          material: 'mahogany',
          description: 'A very comfy couch',
          quantity: 3
        }
      ];

    promiseDB.then(DB => {

        var tx = DB.transaction('Orders', 'readwrite');
        var store = tx.objectStore('Orders');

        ordItems.forEach(item => {
            store.put(item);
            
            checkOrderAgainstStock(item.id);
        });
        
        return tx.complete;

    })
    .then(() => {
        
        console.log('orders added');
    })
    .catch(err => {
        console.log(err);
    });

};

document.getElementById('searchBtn').onclick = function() {
  let prdName = document.getElementById('prdName').value;

  promiseDB.then(DB => {
    var tx    = DB.transaction('Products', 'readonly');
    var store = tx.objectStore('Products');
    var index = store.index('name');

    return index.get(prdName);
  })
  .then(product => {
    console.log(product);
    if (product) {
      document.getElementById('result').innerHTML = '';
      for (var elem in product) {
        document.getElementById('result').innerHTML += `${elem}: ${product[elem]} <br>`;
      }
    } else {
      document.getElementById('result').innerHTML = 'not found';
    }
  });
};

function getProductQuantity(productId) {

    return promiseDB.then(DB => {

        let tx = DB.transaction('Products', 'readonly');
        let store = tx.objectStore('Products');

        return store.get(productId);

    })
    .then(product => {

        if (!product) {
            console.log("Product not found");
            return null;
        }

        console.log("Quantity:", product.quantity);
        return product.quantity;

    })
    .catch(err => {
        console.log(err);
    });

}

// getProductQuantity("cch-blk-ma")
// .then(qty => {
//     console.log("Available:", qty);
// });

function checkOrderAgainstStock(orderId) {

    return promiseDB.then(DB => {

        let tx = DB.transaction('Orders', 'readonly');
        let store = tx.objectStore('Orders');

        return store.get(orderId);

    })
    .then(order => {

        if (!order) {
            console.log("Order not found");
            return;
        }

        return getProductQuantity(order.id)
            .then(qty => {

                if (qty >= order.quantity) {
                    console.log("Stock OK ✅");
                    return true;
                } else {
                    console.log("Not enough stock ❌");
                    return false;
                }

            });

    })
    .catch(err => {
        console.log(err);
    });

}
