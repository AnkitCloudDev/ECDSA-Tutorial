const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1.js");

app.use(cors());
app.use(express.json());

const balances = {
  "036fa740de08d338f8c297c051650b4b40a902d4191021046e7624d281ab1deb17": 100,
  "03aeb29af381399dc8437da67de3a6fac04cc341c52fc8aeb67bfc4640eaeaf285": 50,
  "03b256fb918eb5f3046b6fbacd7fed92b0be7e228f651dc8121ac5f4dd4f783c23": 75,
};

app.get("/balance/:address", (req, res) => {
  const { address } = req.params;
  const balance = balances[address] || 0;
  res.send({ balance });
});

app.post("/send", (req, res) => {
  const { signature, recipient, amount } = req.body;
  console.log(signature);
  const pareseJson = (json) => {
    return JSON.parse(json, (key, value) => {
        if (typeof value === 'object') {
            switch (value?.$T$) {
                case 'bigint':  // warpper
                    return BigInt(value.$V$);
                // Put more cases here ...
                default:
                    return value;
            }
        } else {
            return value;
        }
    });
  };
  const parsedSignature = pareseJson(signature); 
  console.log("Parsed Signature:",parsedSignature);
  const sender = new secp.secp256k1.Signature().recoverPublicKey(parsedSignature);
  console.log(sender);
  setInitialBalance(sender);
  setInitialBalance(recipient);

  if (balances[sender] < amount) {
    res.status(400).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}!`);
});

function setInitialBalance(address) {
  if (!balances[address]) {
    balances[address] = 0;
  }
}

// Hex PrivateKey a4563bbc3641762ff3f8215be4d3393df7f35be10a52938c34d03fdeabad3ec9
// Hex Publickey 036fa740de08d338f8c297c051650b4b40a902d4191021046e7624d281ab1deb17
// Hex PrivateKey 1a2f21453d78bd2be52fd458b450d001bfa06e7e24cbfe896ec2dc616f6e5743
// Hex Publickey 03aeb29af381399dc8437da67de3a6fac04cc341c52fc8aeb67bfc4640eaeaf285
// Hex PrivateKey 358fbd872e8254bd1a371330c43bf948ef206fd102fccbee7024fc52d93d213b
// Hex Publickey 03b256fb918eb5f3046b6fbacd7fed92b0be7e228f651dc8121ac5f4dd4f783c23