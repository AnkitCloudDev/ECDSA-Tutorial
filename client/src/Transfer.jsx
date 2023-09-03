import { useState } from "react";
import server from "./server";
import { utf8ToBytes, toHex } from "ethereum-cryptography/utils.js";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak";
function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    console.log(address);
    const message = {
      sender: address,
      amount: parseInt(sendAmount),
      recipient,
    };
    console.log("Message =", message);
    const messageBytes = utf8ToBytes(JSON.stringify(message));
    const messageHash = keccak256(messageBytes);
    console.log("message Hash", messageHash);
    const signature = secp256k1.sign(messageHash, privateKey, {recoverd: true});
    console.log(signature);
    message.random = BigInt(signature.r).toString();
    message.sign = BigInt(signature.s).toString();
    message.recoveryBit = signature.recovery;
    const recoveredKey = signature.recoverPublicKey(messageHash);
    console.log("recovered key",toHex(recoveredKey.toRawBytes()));
    // message.random = toHex(signature.r);
    console.log('request0:', message);
    try {
      const {
        data: { balance },
      } = await server.post(`send`, message);
      setBalance(balance);
    } catch (ex) {
      console.log(ex);
      alert(ex.response.data.message);
    }
  }

  return (
    <form className="container transfer" onSubmit={transfer}>
      <h1>Send Transaction</h1>

      <label>
        Send Amount
        <input
          placeholder="1, 2, 3..."
          value={sendAmount}
          onChange={setValue(setSendAmount)}
        ></input>
      </label>

      <label>
        Recipient
        <input
          placeholder="Type an address, for example: 0x2"
          value={recipient}
          onChange={setValue(setRecipient)}
        ></input>
      </label>

      <input type="submit" className="button" value="Transfer" />
    </form>
  );
}

export default Transfer;
