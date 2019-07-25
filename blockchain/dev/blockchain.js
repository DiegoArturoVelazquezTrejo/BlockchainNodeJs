//Constructor Function
const sha256 = require('sha256');
const currentNodeUrl = process.argv[3];
const uuid = require('uuid/v1');

function Blockchain(){
  this.chain = []; //All the blocks we create and mine will be stored in this array as a chain.
  this.pendingTransactions = []; //All the new transactions created before being placed on a block.
  this.currentNodeUrl = currentNodeUrl;
  // array which has all the url nodes of the network
  this.networkNodes = [];
  this.createNewBlock(100, '0', '0');
}


//Adding more functionality, we can not only store transactions inside a block, but we can store all the data we want in order to make more interesting our blockchain. 

//Adding a new method called createNewBlock
Blockchain.prototype.createNewBlock = function (nonce, previuosBlockHash, hash) {
  //Block inside the blockChain
  const newBlock = {
    index:  this.chain.length + 1,//Specify which block will be (first, second, third).
    timestamp : Date.now(),
    transactions: this.pendingTransactions,
    nonce: nonce, //A number, which is a proof that we created a new block in a legal way.
    hash: hash,  //Data from the new block. ALl the transactions will be compressed into a single string, hash.
    previuosBlockHash: previuosBlockHash //Data from the previus block to this one-
  };
  //Every time that a new transaction is created, it will be pushed into the newTransaction array.
  //This transactions are not reported into the blockchain yet, they get recorded into the blockchain when a new block is mined which is when a new block is created.
  //So all this new transactions are not validated yet.
  this.pendingTransactions = []; //Once we create a new block, we clean the transactions so we can start over with new blocks.
  this.chain.push(newBlock); //Takes the new block and addes it to our chain.

  return newBlock;
}

//Getting the last block of the chain
Blockchain.prototype.getLastBlock = function () {
  return this.chain[this.chain.length - 1];
}


//Method creathing new transaction and pushes it into the pendingTransactions array.
Blockchain.prototype.createNewTransaction = function(amount, sender, recipient){
  const newTransaction = {
    amount: amount,
    sender:sender,
    recipient:recipient,
    transactionId: uuid().split('-').join('')
  };
  return newTransaction;
}

Blockchain.prototype.addTransactionToPendingTransactions = function(transactionObj){
  this.pendingTransactions.push(transactionObj);
  return this.getLastBlock()['index'] + 1;
}

Blockchain.prototype.hashBlock = function(previuosBlockHash, currentBlockData, nonce){
  const dataAsString = previuosBlockHash+ nonce.toString()+JSON.stringify(currentBlockData);
  //Creating the hash
  const hash = sha256(dataAsString);
  return hash;
}

//Proof of work, one of the reason blockchain is so secure
//A proof of work will take the current blockdata and will try to generate a specific hash that starts
Blockchain.prototype.proofOfWork = function (previuosBlockHash, currentBlockData) {
  let nonce = 1;
  let hash = this.hashBlock(previuosBlockHash, currentBlockData, nonce);
  while(hash.substring(0,4) != '0000'){
    nonce++;
    hash = this.hashBlock(previuosBlockHash, currentBlockData, nonce);
  }
  return nonce;
}

//This method will validate if the chain is valid or not
//Validate the other chains inside the network
//iterate all the chain and verify the previus hashes
Blockchain.prototype.chainIsValid = function (blockchain){
  let validChain = true;
  for(var i = 01; i < blockchain.length; i++){
    const currentBlock = blockchain[i];
    const prevBlock = blockchain[i - 1];
    const blockHash = this.hashBlock(prevBlock['hash'], { transactions: currentBlock['transactions'], index: currentBlock['index']},currentBlock['nonce'] );
    if(blockHash.substring(0,4) !== '0000'){
      validChain = false;
      break;
    }
    if(currentBlock['previuosBlockHash'] !== prevBlock['hash']){ //chain is not valid
      validChain = false;
      break;
    }
    console.log('PrevCurrentBlockHash =>', prevBlock['hash']);
    console.log('CurrentBlockHash =>', currentBlock['hash']);
  }
  const genesisBlock = blockchain[0];
  const correctNonce = genesisBlock['nonce'] === 100;
  const correctPrevBlockHash = genesisBlock['previuosBlockHash'] === '0';
  const correctHash = genesisBlock['hash'] === '0';
  const correctTransactions = genesisBlock['transactions'].length === 0;
  if(!(genesisBlock && correctHash && correctNonce && correctPrevBlockHash && correctTransactions))
    validChain = false;
  return validChain;  //true if the chain is valid and false if the chain is not valid.
};


//Methods used for the Interface
Blockchain.prototype.getBlock = function(blockHash){
  let correctBlock = null;
  this.chain.forEach(block => {
    if(block.hash === blockHash){
      correctBlock = block;
    }
  });
  return correctBlock;
};

//Returns the transaction corresponding to the transactionId
Blockchain.prototype.getTransaction = function(transactionId){
  let correctTransaction = null;
  let correctBlock = null;
  this.chain.forEach(block =>{
    block.transactions.forEach(transaction => {
      //Access to all the single transactions inside a block
      if(transaction.transactionId === transactionId){
        correctTransaction = transaction;
        correctBlock = block;
      };
    });
  });
  return {
    transaction: correctTransaction,
    block: correctBlock,
    };
};

//This method will search the specific adresses inside the blockchain
Blockchain.prototype.getAdressData = function(adress){
  //We want to get all the transactions associated with the address
  const adressTransactions = [];
  this.chain.forEach(block => {
    block.transactions.forEach(transaction => {
      //We have access to every single transaction inside the block
      if(transaction.sender == adress || transaction.recipient == adress){
        adressTransactions.push(transaction);
      };
    });
  });
  //Now we want to see the balance of the adress
  let balance = 0;
  adressTransactions.forEach(transaction =>{
    if(transaction.recipient === adress) balance += transaction.amount;
    else if(transaction.sender === adress) balance -= transaction.amount;
  });
  return {
    adressTransactions: adressTransactions,
    adressBalance : balance
  };
};

//Exporting to the file test so we can test our code
module.exports =Blockchain;

//All the transactions become recorded after we have created a new block.
