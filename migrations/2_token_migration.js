const Token = artifacts.require("Token");

module.exports = async function (deployer) {
  await deployer.deploy(Token,"Airline","AIR");
  let tokenInstance = await Token.deployed();
  await tokenInstance.mint(100,200,100000); //token id 0
  await tokenInstance.mint(100,200,50000); 
  let pet = await tokenInstance.getTokenDetails(0);
  console.log(pet);
};
