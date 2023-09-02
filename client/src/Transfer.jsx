import { useState } from "react";
import server from "./server";
import { utf8ToBytes } from "ethereum-cryptography/utils.js";
import { secp256k1 } from "ethereum-cryptography/secp256k1.js";
import { keccak256 } from "ethereum-cryptography/keccak";
function Transfer({ address, setBalance, privateKey }) {
  const [sendAmount, setSendAmount] = useState("");
  const [recipient, setRecipient] = useState("");

  const setValue = (setter) => (evt) => setter(evt.target.value);

  async function transfer(evt) {
    evt.preventDefault();
    console.log(address);
    let message = 'Send 10 to ';
    message = message + recipient;
    console.log("Message =", message);
    const messageHash = keccak256(utf8ToBytes(message));
    const signature = secp256k1.sign(messageHash, privateKey, {recoverd: true});
    console.log("Signature = ", signature);
    console.log(secp256k1.verify(signature, messageHash, address));
    const renderJson = (object) => {
      return JSON.stringify(object, (key, value) => {
          switch (typeof value) {
              case 'bigint':
                  return {  // warpper
                      $T$: 'bigint',         // type   // maybe it is good to use some more complicated name instead of $T$
                      $V$: value.toString()  // value  // maybe it is good to use some more complicated name instead of $V$
                  };
              // Put more cases here ...
              default:
                  return value;
          }
      });
  };
  const signatureString = renderJson(signature);

    try {
      const {
        data: { balance },
      } = await server.post(`send`, {
        signature: signatureString,
        amount: parseInt(sendAmount),
        recipient
      });
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
