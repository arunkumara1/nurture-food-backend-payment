const cors = require("cors");
const express = require("express");
const stripe = require("stripe")("sk_test_51HZy7KHC6rutUpCoWxE6vEhcIucKwkIEDkAMdFUU1hKhxsEksdVHasHFs7M6ZFMOkuJpmxKf7K08zOyMIM2aJqN300naiVWTpR");
const uuid = require("uuid/v4");

const app = express();
const port = process.env.PORT || 9000;

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Add your Stripe Secret Key to the .require('stripe') statement!");
});

app.post("/checkout", async (req, res) => {
  console.log("Request:", req.body);

  let error;
  let status;
  try {
    const { cart, subTotal , token } = req.body;

    const customer = await stripe.customers.create({
      email: token.email,
      source: token.id
    });

    const idempotency_key = uuid();
    const charge = await stripe.charges.create(
      {
        amount: parseInt(subTotal) * 100,
        currency: "inr",
        customer: customer.id,
        receipt_email: token.email,
        description: 'Payment made for Nurture FOOD',
        shipping: {
          name: token.card.name,
          address: {
            line1: token.card.address_line1,
            line2: token.card.address_line2,
            city: token.card.address_city,
            country: token.card.address_country,
            postal_code: token.card.address_zip
          }
        }
      },
      {
        idempotency_key
      }
    );
    console.log("Charge:", { charge });
    status = "success";
  } catch (error) {
    console.error("Error:", error);
    status = "failure";
  }

  res.json({ error, status });
});


app.listen(port,()=>console.log(`listening localhost:${port}`));
