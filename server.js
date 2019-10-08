const app = require("express")();
const port = 3000;
const bodyParser = require("body-parser");
const axios = require("axios");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

const BOND_ID = "13190";
// const OSBUDDY_GR_PRICES_SUMMARY_GOOGLE_APIS_URL ="https://storage.googleapis.com/osbuddy-exchange/summary.json";
const OSBUDDY_GE_PRICES_SUMMARY_URL ="https://rsbuddy.com/exchange/summary.json";
const OSRS_GE_API_URL = `https://services.runescape.com/m=itemdb_oldschool/api/catalogue/detail.json?item=${BOND_ID}`;
// const FIREBASE_FIXED_VALS_URL = 'https://bondsflip-tool.firebaseio.com/vals.json';

app.get("/summary", (req, res) => {
    axios
        .all([
            axios.get(OSBUDDY_GE_PRICES_SUMMARY_URL),
            axios.get(OSRS_GE_API_URL),
            // axios.get(FIREBASE_FIXED_VALS_URL)
        ])
        // .then(axios.spread((summary, ge_api, fixed_vals) => {
        .then(axios.spread((summary, ge_api, fixed_vals) => {
            // let fixed = fixed_vals.data;
            let bond = summary.data[BOND_ID];
            let convert = Math.round(
                Number(ge_api.data.item.current.price.slice(0, -1)) * 100000
            );
            let isCalcReliable = bond && bond.overall_average && convert ? true : false;

            let floor = bond.overall_average - convert / 2;
            let ceil = bond.overall_average + convert / 2;
            let rest = bond.sell_quantity - bond.buy_quantity;
            let factor = Number((bond.buy_quantity / bond.sell_quantity).toFixed(2));

            // let buy = floor - (floor % 100000) + 6000;
            // let sell = ceil - (ceil % 100000) + 94000;

            // let margin = sell - buy - convert;
            // let fixed_margin = fixed.sell - fixed.buy - convert;

            res.send({
                calc: {
                    // sug: {
                    //     buy,
                    //     sell,
                    //     margin
                    // },
                    floor,
                    ceil,
                    rest,
                    factor,
                    isCalcReliable
                },
                convert,
                bond,
                // fixed,
                // fixed_margin
            });

            res.send("ok")
        }))
        .catch(err => {
            res.send(err.message);
        });
});

const server = app.listen(port, () => {
    console.log(`API running on port ${port}...`);
    app.emit("appStarted");
});

module.exports = server;

module.exports.stop = function stop() {
    server.close();
};
