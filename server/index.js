const express = require("express");
const app = express();
const cors = require("cors");
const port = 3042;
const secp = require("ethereum-cryptography/secp256k1.js");
const { keccak256 } = require("ethereum-cryptography/keccak");
const { utf8ToBytes,toHex,hexToBytes } = require("ethereum-cryptography/utils");
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
  const { sender, recipient, amount, sign, recoveryBit, random} = req.body;
  const message = {sender, amount,recipient};
  const bytes = utf8ToBytes(JSON.stringify(message));
  const messageHash = keccak256(bytes);
  const signature = secp.secp256k1.Signature.prototype;
  signature.s = BigInt(sign);
  signature.r = BigInt(random);
  signature.recovery = parseInt(recoveryBit);
  // const signature = new secp.secp256k1.Signature( BigInt(random), BigInt(sign)).addRecoveryBit(recoveryBit);
  const recovered = signature.recoverPublicKey(messageHash);
  const addressOfSign = toHex((recovered.toRawBytes()));
  console.log('addressOfSign:',addressOfSign);

  if(sender!==addressOfSign){
    res.status(401).send({ message: "Unauthorized" });
  }else if (balances[sender] < amount) {
    res.status(428).send({ message: "Not enough funds!" });
  } else {
    balances[sender] -= amount;
    balances[recipient] += amount;
    res.send({ balance: balances[sender] });
  }
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
function addressFromPublicKey(publicKey){
  const addrBytes = publicKey.slice(1);
  const hash = keccak256(addrBytes);
  return hash.slice(-20);
}

// Hex PrivateKey a4563bbc3641762ff3f8215be4d3393df7f35be10a52938c34d03fdeabad3ec9
// Hex Publickey 036fa740de08d338f8c297c051650b4b40a902d4191021046e7624d281ab1deb17
// Hex PrivateKey 1a2f21453d78bd2be52fd458b450d001bfa06e7e24cbfe896ec2dc616f6e5743
// Hex Publickey 03aeb29af381399dc8437da67de3a6fac04cc341c52fc8aeb67bfc4640eaeaf285
// Hex PrivateKey 358fbd872e8254bd1a371330c43bf948ef206fd102fccbee7024fc52d93d213b
// Hex Publickey 03b256fb918eb5f3046b6fbacd7fed92b0be7e228f651dc8121ac5f4dd4f783c23