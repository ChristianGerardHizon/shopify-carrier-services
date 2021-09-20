const fs = require('fs');
const jsonFile = require('./delivery_sched.json');



var express = require('express'),
    app = express(),
    port = process.env.PORT || 4000;

    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log('Server started on: ' + port);
});


function calculateItems(items) {
    let total = 0;
    let shippingFee = 80;
    for (let index = 0; index < items.length; index++) {
        const item = items[index];
        total+= item.price;
    }
    return total + shippingFee;
}

// request handlers
app.post('/', (req, res) => {

    let errors = null;
    let rates = null;

    try {

        let timeOpening = new Date();
        timeOpening.setHours(0, 0, 0, 0);
        let timeClosing = new Date();
        timeClosing.setHours(4, 0, 0, 0);
        let today = new Date();
        today.setHours(0, 0, 0, 0);
        
        let deliveryToday = JSON.parse(JSON.stringify(jsonFile));
        deliveryToday = deliveryToday.map((data) => {
            data.service_name = `Deliver Today - ${data.service_name}`;
            data.min_delivery_date = `${today.toLocaleString("sv-SE")} +0800`;
            data.max_delivery_date = `${timeClosing.toLocaleString("sv-SE")} +0800`;
            data.total_price = calculateItems(req.body.rate.items);
            return data;
        });

        today.setHours(23, 59, 59, 59);

        timeClosing.setSeconds(1);

        let deliverTom = JSON.parse(JSON.stringify(jsonFile));
        deliverTom = deliverTom.map((data) => {
            data.service_name = `Deliver Tomorrow - ${data.service_name}`;
            data.min_delivery_date = `${timeClosing.toLocaleString("sv-SE")} +0800`;
            data.max_delivery_date = `${today.toLocaleString("sv-SE")} +0800`;
            data.total_price = calculateItems(req.body.rate.items);
            return data;
        });

        rates = [...deliveryToday, ...deliverTom];

    } catch (err) {
        errors = [err];
    }

    if (!errors) {
        res.status(200).json({ "rates": rates });
    } else {
        res.status(500).json({ "errors": errors });
    }
});




