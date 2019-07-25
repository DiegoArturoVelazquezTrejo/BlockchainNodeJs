const Blockchain = require('./blockchain');
const bitcoin = new Blockchain();
const bc1 =   {
"chain": [
{
"index": 1,
"timestamp": 1557098888521,
"transactions": [],
"nonce": 100,
"hash": "0",
"previuosBlockHash": "0"
},
{
"index": 2,
"timestamp": 1557099500409,
"transactions": [],
"nonce": 18140,
"hash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100",
"previuosBlockHash": "0"
},
{
"index": 3,
"timestamp": 1557099513322,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "70cf0c806f8d11e99e3c1f7951f93bd4",
"transactionId": "dd8faa906f8e11e99e3c1f7951f93bd4"
}
],
"nonce": 168195,
"hash": "000043c3f6e794b6a3ac64683442888eeb140617a76cf78ad338d26a2d7f6077",
"previuosBlockHash": "0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100"
},
{
"index": 4,
"timestamp": 1557099604900,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "70cf0c806f8d11e99e3c1f7951f93bd4",
"transactionId": "e5397d206f8e11e99e3c1f7951f93bd4"
},
{
"amount": 590,
"sender": "HBJKNMS",
"recipient": "NDLKEEFR",
"transactionId": "029de7206f8f11e99e3c1f7951f93bd4"
},
{
"amount": 987,
"sender": "UIKDNLFKBRKNLER",
"recipient": "678IFHWBYVGR67",
"transactionId": "08e5b8b06f8f11e99e3c1f7951f93bd4"
},
{
"amount": 123.5,
"sender": "Njlkmenounrlkg",
"recipient": "NBYE678IHFNKE",
"transactionId": "1401f5b06f8f11e99e3c1f7951f93bd4"
}
],
"nonce": 90101,
"hash": "0000fb2a3b2d30e3caac9f183a005b9d27fb69c8246d662a64bd9412daf6bc90",
"previuosBlockHash": "000043c3f6e794b6a3ac64683442888eeb140617a76cf78ad338d26a2d7f6077"
},
{
"index": 5,
"timestamp": 1557099651850,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "70cf0c806f8d11e99e3c1f7951f93bd4",
"transactionId": "1bd326606f8f11e99e3c1f7951f93bd4"
},
{
"amount": 464.5,
"sender": "DIEGOARTUROVELAZQUEZTREJO",
"recipient": "NOSEAQUIENSELOENVIE",
"transactionId": "310ca6f06f8f11e99e3c1f7951f93bd4"
}
],
"nonce": 149737,
"hash": "0000b44366bcf498178008e05f307ac202314daa241abf764eb9e705df5fd3aa",
"previuosBlockHash": "0000fb2a3b2d30e3caac9f183a005b9d27fb69c8246d662a64bd9412daf6bc90"
},
{
"index": 6,
"timestamp": 1557099661035,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "70cf0c806f8d11e99e3c1f7951f93bd4",
"transactionId": "37cae1006f8f11e99e3c1f7951f93bd4"
}
],
"nonce": 20044,
"hash": "0000b2bc7a5ad3cbf30a577414cb2614293403d35ea5da2778b22d07cacf8e6e",
"previuosBlockHash": "0000b44366bcf498178008e05f307ac202314daa241abf764eb9e705df5fd3aa"
},
{
"index": 7,
"timestamp": 1557099663700,
"transactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "70cf0c806f8d11e99e3c1f7951f93bd4",
"transactionId": "3d4417f06f8f11e99e3c1f7951f93bd4"
}
],
"nonce": 18106,
"hash": "0000a350fc9d07f20b36b0b370515f0da694c5c3467303bb60f738e164f0f4b2",
"previuosBlockHash": "0000b2bc7a5ad3cbf30a577414cb2614293403d35ea5da2778b22d07cacf8e6e"
}
],
"pendingTransactions": [
{
"amount": 12.5,
"sender": "00",
"recipient": "70cf0c806f8d11e99e3c1f7951f93bd4",
"transactionId": "3eda96706f8f11e99e3c1f7951f93bd4"
}
],
"currentNodeUrl": "http://localhost:3001",
"networkNodes": []
};

console.log('VALID: ',bitcoin.chainIsValid(bc1.chain));
