const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const Blockchain = require('./blockchain');
const port = process.argv[2];

const rp = require('request-promise');

//For getting the id
const uuid = require('uuid/v1');
const nodeAddress = uuid().split('-').join('');
const bitcoin = new Blockchain();

//These two lines parse the data so we can access it
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.get('/blockchain', function(req, res){
  res.send(bitcoin);
});

app.post('/transaction', function(req, res){
  const newTransaction = req.body;
  const blockIndex = bitcoin.addTransactionToPendingTransactions(newTransaction);
  res.json({  note: `Transaction will be added in block   ${blockIndex}.` });
});

//broadcast the transaction to the entire network
app.post('/transaction/broadcast', function(req, res){
  const newTransaction = bitcoin.createNewTransaction(req.body.amount, req.body.sender, req.body.recipient);
  bitcoin.addTransactionToPendingTransactions(newTransaction);
  //Now we need to broadcast the transaction
  const requestPromises = [];
  //broadcasting the transaction to all the nodes inside the network
  bitcoin.networkNodes.forEach(netWorkNodeUrl =>{
    const requestOptions = {
      uri: netWorkNodeUrl + '/transaction',
      method: 'POST',
      body: newTransaction,
      json: true
    };
    requestPromises.push(rp(requestOptions));
  });
  //Now we need to run the requests of the requestPromises array
  Promise.all(requestPromises).then(data => {
    res.json({ note: 'Transaction created and broadcast successfully' });
  });
});

//Create a new block for us, mining.
app.get('/mine', function(req, res){
  const lastBlock = bitcoin.getLastBlock();
  const previousBlockHash = lastBlock['hash'];
  const currentBlockData = {
    transactions: bitcoin.pendingTransactions,
    index: lastBlock['index'] + 1
  };
  const nonce = bitcoin.proofOfWork(previousBlockHash, currentBlockData);
  const blockHash = bitcoin.hashBlock(previousBlockHash, currentBlockData, nonce);
  const newBlock = bitcoin.createNewBlock(nonce, previousBlockHash, blockHash);
  //Sending the reward to the user who mined the block
  //For getting the address, we will import a new library which is uuid
  const requestPromises = []

  bitcoin.networkNodes.forEach(netWorkNodeUrl => {
    const requestOptions = {
      uri: netWorkNodeUrl+ '/receive-new-block',
      method: 'POST',
      body: { newBlock: newBlock},
      json: true
    };
    //For making the request
    requestPromises.push(rp(requestOptions));
  });
  //running all the promises
  Promise.all(requestPromises).then(data =>{
      //Calling the broadcast transaction for the mining reward
      const requestOptions = {
        uri: bitcoin.currentNodeUrl + '/transaction/broadcast',
        method: 'POST',
        body: {
          amount: 12.5,
          sender: "00",
          recipient: nodeAddress
        },
        json: true
      };
      return rp(requestOptions);
  }).then(data => {
    //send the response after all the calculations were done and finished.
    res.json({
      note:"New Block mined and broadcast successfully",
      block: newBlock
    });
  });
});

//Receiving the new block in each network node
app.post('/receive-new-block', function(req, res){
  //receiving a new block from the broadcast thats taking place
  const newBlock = req.body.newBlock;
  //checking if the block is legitimate
  const lastBlock = bitcoin.getLastBlock();
  //if its true, the new block is legitimate
  const correctHash = lastBlock.hash === newBlock.previuosBlockHash;
  const correctIndex = lastBlock['index'] + 1 === newBlock['index'];
  //Making sure that it has the correct hashes and indexes
  if(correctHash && correctIndex){
    bitcoin.chain.push(newBlock);
    bitcoin.pendingTransactions = [];
    res.json({
      note: 'New Block received and accepted',
      newBlock: newBlock
    });
  } else {
    res.json({
      note: 'New Block rejected',
      newBlock: newBlock
    });
  }
});
// WORKING WITH THE NODES OF OUR NETWORK

//Send the new node we want to add to the network
app.post('/register-and-broadcast-node', function(req, res){
  const newNodeUrl = req.body.newNodeUrl;
  //To register the node, we will just add it to the array of nodes
  if(bitcoin.networkNodes.indexOf(newNodeUrl) == -1) bitcoin.networkNodes.push(newNodeUrl);
  const regNodesPromises = [];
  bitcoin.networkNodes.forEach(networkNodeURL => {
    const requestOptions = {
      uri: networkNodeURL + '/register-node',
      method: 'POST',
      body:{newNodeUrl: newNodeUrl},
      json: true
    };
    regNodesPromises.push(rp(requestOptions));
  });

  //THis will run every single request.
  Promise.all(regNodesPromises).then(data =>{
    const bulkRegisterOptions = {
      uri: newNodeUrl + '/register-nodes-bulk',
      method: 'POST',
      body: {allNetworkNodes: [ ...bitcoin.networkNodes, bitcoin.currentNodeUrl]},
      json:true
    };
    return rp(bulkRegisterOptions);
  }).then(data => {
    res.json({ note: 'New node registeresd with network successfully'});
  });
});

//register a node with the network
app.post('/register-node', function(req, res){
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(newNodeUrl) == -1;
  const notCurrentNode = bitcoin.currentNodeUrl !== newNodeUrl;
  if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(newNodeUrl);
  res.json({ note: 'New node registered successfully with node.' })
});

//Register multiple nodes at once
app.post('/register-nodes-bulk', function(req, res){
  const allNetworkNodes = req.body.allNetworkNodes;
  allNetworkNodes.forEach(networkNodeURL => {
    const nodeNotAlreadyPresent = bitcoin.networkNodes.indexOf(networkNodeURL) == -1;
    const notCurrentNode = bitcoin.currentNodeUrl !== networkNodeURL;
    if(nodeNotAlreadyPresent && notCurrentNode) bitcoin.networkNodes.push(networkNodeURL);
  });
  res.json({ note: "Bulk registration successful."});
});

//Indicates that the server is already running
app.listen(port, function(){
  console.log(`Listening on port  ${port}...`);
});

//Este algoritmo lo tienen todas las blockchains y consiste en actualizar la información de un nodo que se acaba de unir a la red.
//Cuando conectamos el nodo a la red, recientemente carece de toda la informacion de la blockchain, lo que hará consensus será
//tomar toda la infromación de los otros nodos de la red para dársela al nuevo nodo y así pueda entrar a la red.
//make a request to every node inside the network to get the copies of the blockchian to compare them to the node.
app.get('/consensus', function(req, res){
  requestPromises = [];
  bitcoin.networkNodes.forEach(networkNodeURL =>{
    const requestOptions = {
      uri: networkNodeURL + '/blockchain',
      method: 'GET',
      json: true
    }
    requestPromises.push(rp(requestOptions));
  });
  Promise.all(requestPromises).then(blockchains =>{
    //this data will be an array of blockchains, a blockchain from every node inside the network
    //We have access of all the chains inside the network.
    const currentChainLength = bitcoin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions = null;

    blockchains.forEach(blockchain =>{
      //.... do something with each blockchain
      if(blockchain.chain.length > maxChainLength){
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    if(!newLongestChain || (newLongestChain && !bitcoin.chainIsValid(newLongestChain))){
      res.json({
        note: 'Current chain has not been replaced',
        chain: bitcoin.chain
      });
    }else if(newLongestChain && bitcoin.chainIsValid(newLongestChain)){
      bitcoin.chain = newLongestChain;
      bitcoin.pendingTransactions = newPendingTransactions;
      res.json({
        note: 'This chain has been replaced.',
        chain: bitcoin.chain
      });
    }
  });
});


//Interface, this will also modify the blockchain file.
//This endpoint will send us the blockhash corresponding to the blockhash we´ve passed before.
app.get('/block/:blockHash', function(req, res){
  //gives us the access to the parameter in localhost:3001/block/iufbnkybfHASH
  const blockHash = req.params.blockHash;
  const correctBlock = bitcoin.getBlock(blockHash);
  res.json({
    block: correctBlock,
  });
});

//THis endpoint will return the transaction corresponding to the id given before.
app.get('/transaction/:transactionId', function(req, res){
  const transactionId = req.params.transactionId;
  const transactionData = bitcoin.getTransaction(transactionId);
  res.json({
    transaction: transactionData.transaction,
    block: transactionData.block,
  });
});

//This endpoint will return all the transactions that had been made that correspond to the adress
//and the amount of coins the adress has.
app.get('/adress/:adress', function(req, res){
  const adress = req.params.adress;
  const adressData = bitcoin.getAdressData(adress);
  res.json({
    adressTransactions: adressData.adressTransactions,
    balance: adressData.adressBalance
  });
});



//Linking the HTML INTERFACE FILE to this server
app.get('/block-explorer', function(req,res){
  res.sendFile('./block-explorer/index.html',{root: __dirname}); 
});
//NodeMon library will restart the server every time we make a change
