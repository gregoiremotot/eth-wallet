import React, { Component, useState } from "react";
import Web3 from "web3";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import ListGroup from "react-bootstrap/ListGroup";
import {ABI} from "./abi";

const web3 = new Web3(
  "https://mainnet.infura.io/v3/" + process.env.REACT_APP_INFURA_API_KEY
);

function Wallet() {
  const [privateKey, setPrivateKey] = useState("");
  const [address, setAddress] = useState("");
  const [contractAddress, setContractAddress] = React.useState("");
  const [tokens, setTokens] = useState([]);

  const listTokens = tokens.map((item, index) => {
    if (item.address) {
      return (
        <ListGroup.Item key={index}>
          {item.name}: {item.balance} {item.symbol}
          <br />
          Contract address: {item.address}
        </ListGroup.Item>
      );
    }

    return (
      <ListGroup.Item key={index}>
        {item.name}: {item.balance} {item.symbol}
      </ListGroup.Item>
    );
  });

  function resetWallet() {
    setTokens([]);
    setAddress("");
    setPrivateKey("");
  }

  async function getERC20Balance() {
    const token = contractAddress;
    const wallet = address;
    const contract = new web3.eth.Contract(ABI, token);
    const getBalance = async () => {
      const balance = await contract.methods.balanceOf(wallet).call();
      const name = await contract.methods.name().call();
      const symbol = await contract.methods.symbol().call();
      const decimals = await contract.methods.decimals().call();

      const adjustedBalance = balance / Math.pow(10, decimals);

      const newList = tokens.concat({
        address: contractAddress,
        balance: adjustedBalance,
        name: name,
        symbol: symbol,
      });
      setTokens(newList);
      setContractAddress("");
    };
    getBalance();
  }

  function handleAddTokenFormSubmit(event) {
    event.preventDefault();

    if (!contractAddress) return;

    getERC20Balance();
  }

  async function getEthBalance(wallet_address) {
    let balance = await web3.eth.getBalance(wallet_address);

    setTokens([
      {
        name: "ETH",
        symbol: "ETH",
        balance: web3.utils.fromWei(balance, "ether"),
        address: "",
      },
    ]);
  }

  function handlePrivateKeyFormSubmit(event) {
    let account = web3.eth.accounts.privateKeyToAccount(privateKey);
    let wallet_address = account.address;

    setAddress(wallet_address);
    getEthBalance(wallet_address);

    event.preventDefault();
  }

  return (
    <>
      <h1>Wallet</h1>
      {!address ? (
        <Form onSubmit={handlePrivateKeyFormSubmit}>
          <Form.Group className="mb-3" controlId="formBasicEmail">
            <Form.Label>Private key</Form.Label>
            <Form.Control
              type="text"
              value={privateKey}
              onChange={(e) => setPrivateKey(e.target.value)}
              placeholder="Enter your private key"
            />
          </Form.Group>

          <Button variant="primary" type="submit">
            Import
          </Button>
        </Form>
      ) : (
        <div>
          <Button variant="outline-danger" size="sm" onClick={resetWallet}>
            Reset
          </Button>
          <br />
          <br />
          Address : {address} <br />
          <h2>Tokens </h2>
          <ListGroup>{listTokens}</ListGroup>
          <br />
          <Form onSubmit={handleAddTokenFormSubmit}>
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Import ERC20 token</Form.Label>
              <Form.Control
                value={contractAddress}
                onChange={(e) => setContractAddress(e.target.value)}
                type="text"
                placeholder="Token contract address"
              />
            </Form.Group>

            <Button variant="primary" type="submit">
              Add token
            </Button>
          </Form>
          <br />
        </div>
      )}
    </>
  );
}

export default Wallet;
