const app = require('express')();
const port = 3000;
const bodyParser = require('body-parser');
const axios = require('axios');


app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BOND_ID = "13190";
const OSBUDDY_GR_PRICES_SUMMARY_GOOGLE_APIS = 'https://storage.googleapis.com/osbuddy-exchange/summary.json';
const OSRS_GE_API_URL = `http://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${BOND_ID}`;


app.get('/summary', (req, res) => {
    axios.get(OSBUDDY_GR_PRICES_SUMMARY_GOOGLE_APIS)
    .then(summary => {
        let bond = summary.data[BOND_ID];

        axios.get(OSRS_GE_API_URL)
        .then(ge_api => {
            let convert = Number(ge_api.data.item.current.price.slice(0, -1)) * 100000;
            buy = bond.overall_average - (convert/2);
            sell = bond.overall_average + (convert/2);
            factor = Number((bond.buy_quantity / bond.sell_quantity).toFixed(2));

            res.send({
                calc : {
                    buy,
                    sell,
                    factor
                },
                bond,
                convert
            });
        })
    })
    .catch(err => {
        res.send(err.message);
    });
})

const server = app.listen(port, () => {
    console.log(`API running on port ${port}...`);
    app.emit("appStarted");
});


module.exports = server;

module.exports.stop = function stop() {
    server.close();
};
