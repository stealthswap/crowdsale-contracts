pragma solidity ^0.6.2;

// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";


// Dev addresses respectively distributed 25%, 33.5%, 33.5% of 250,000 tokens quarterly
contract DevelopmentVesting {
    
    using SafeMath for uint;
    
    IERC20 private Token;

    mapping(address => uint256) private devShares;
    
    address private dev1; 
    address private dev2;
    address private dev3;
    
    uint256 public timer;
    
    constructor(IERC20 _Token, address _dev1, address _dev2, address _dev3) public {
        timer = now - 4 days; 
        Token = _Token;
        dev1 = _dev1;
        dev2 = _dev2;
        dev3 = _dev3;
        devShares[_dev1] = 62500000000000000000000;
        devShares[_dev2] = 93750000000000000000000;
        devShares[_dev3] = 93750000000000000000000;
     }

    function withdraw() public {
        require(msg.sender == dev1 || msg.sender == dev2 || msg.sender == dev3, "You are not a dev address");
        require(now >= timer + 13 weeks); // make sure its been 13 weeks since last withdraw
        timer = now; // reset distribution timer
        IERC20(Token).transfer(dev1, devShares[dev1]);
        IERC20(Token).transfer(dev2, devShares[dev2]);
        IERC20(Token).transfer(dev3, devShares[dev3]);
    }
}
