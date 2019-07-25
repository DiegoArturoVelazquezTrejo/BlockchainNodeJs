pragma solidity 0.5.0;
contract MyContract{

  string value;

  constructor() public{
    value = "My value";
  }
  function get() public view returns(string memory){
    return value;
  }
  function set(string memory newValue) public{
    value = newValue;
  }
}
