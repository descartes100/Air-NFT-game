//SPDX-License-Identifier: <SPDX-License>
pragma solidity 0.8.0;

import "../node_modules/@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "../node_modules/@openzeppelin/contracts/access/Ownable.sol";

contract Token is ERC721, Ownable {

    struct Pet {
        uint8 damage;
        uint8 magic;
        uint256 lastMeal;
        uint256 endurance;
    }

    uint256 nextId = 0;

    mapping(uint256 => Pet) private _tokenDetails; //id represents pet 
    constructor(string memory name, string memory symbol) ERC721(name,symbol){

    }

    function getTokenDetails(uint256 tokenId) public view returns (Pet memory){
        return _tokenDetails[tokenId];
    }

    function mint(uint8 damage, uint8 magic, uint256 endurance) public onlyOwner {
        _tokenDetails[nextId] = Pet(damage, magic, block.timestamp, endurance);
        _safeMint(msg.sender, nextId); //only mint token id
        nextId++;
    }

    function feed(uint256 tokenId) public {
        Pet storage pet = _tokenDetails[tokenId];
        require(pet.lastMeal +pet.endurance >block.timestamp);
        pet.lastMeal = block.timestamp;
    }

    function getAllTokensForUser(address user) public view returns (uint256[] memory){
        uint256 tokenCount = balanceOf(user);
        if (tokenCount == 0){
            return new uint256[](0);
        }
        else {
            uint256[] memory result = new uint256[](tokenCount);
            uint256 totalPets = nextId;
            uint256 resultIndex =0;
            uint256 i;
            for (i=0;i<totalPets; i++){
                if  (ownerOf(i) == user){
                    result[resultIndex]=i;
                    resultIndex++;
                }
            }
            return result;
        }
    }

    function _beforeTokenTransfer(address from,address to,uint256 tokenId) internal virtual override{
        Pet storage pet = _tokenDetails[tokenId];
        require(pet.lastMeal +pet.endurance >block.timestamp); //make sure pet still alive, then can be transfered
    }
}