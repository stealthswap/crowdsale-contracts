pragma solidity ^0.5.0;

// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/IERC20.sol";
// import "@openzeppelin/contracts-ethereum-package/contracts/token/ERC20/SafeERC20.sol";

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

// Dev addresses respectively distributed 25%, 33.5%, 33.5% of 250,000 tokens quarterly
contract DevelopmentVesting is ReentrancyGuard {

    using SafeMath for uint;

    IERC20 private Token;

    mapping(address => uint256) private devShares;

    address private dev1;
    address private dev2;
    address private dev3;

    uint256 public unlockDate1 = 1609459200; // 01/01/2021 @ 12:00am (UTC)
    uint256 public unlockDate2 = 1617235200; // 04/01/2021 @ 12:00am (UTC)
    uint256 public unlockDate3 = 1625097600; // 07/01/2021 @ 12:00am (UTC)
    uint256 public unlockDate4 = 1633046400; // 10/01/2021 @ 12:00am (UTC)

    bool q1Withdrawn = false;
    bool q2Withdrawn = false;
    bool q3Withdrawn = false;
    bool q4Withdrawn = false;

    constructor(IERC20 _Token, address _dev1, address _dev2, address _dev3) public {
        Token = _Token;

        dev1 = _dev1;
        dev2 = _dev2;
        dev3 = _dev3;

        devShares[_dev1] = 62500000000000000000000;
        devShares[_dev2] = 93750000000000000000000;
        devShares[_dev3] = 93750000000000000000000;

     }

    function withdrawQ1() public nonReentrant {
        require(msg.sender == dev1 || msg.sender == dev2 || msg.sender == dev3, "You are not a dev address");
        require(now >= unlockDate1, "Can't withdraw before 01/01/2021 @ 12:00am (UTC)");
        require(q1Withdrawn == false, "Developers have already withdrawn.");
        IERC20(Token).transfer(dev1, devShares[dev1]);
        IERC20(Token).transfer(dev2, devShares[dev2]);
        IERC20(Token).transfer(dev3, devShares[dev3]);
        q1Withdrawn = true;
    }
    function withdrawQ2() public nonReentrant {
        require(msg.sender == dev1 || msg.sender == dev2 || msg.sender == dev3, "You are not a dev address");
        require(now >= unlockDate2, "Can't withdraw before 04/01/2021 @ 12:00am (UTC)");
        require(q2Withdrawn == false, "Developers have already withdrawn.");
        IERC20(Token).transfer(dev1, devShares[dev1]);
        IERC20(Token).transfer(dev2, devShares[dev2]);
        IERC20(Token).transfer(dev3, devShares[dev3]);
        q2Withdrawn = true;
    }
    function withdrawQ3() public nonReentrant {
        require(msg.sender == dev1 || msg.sender == dev2 || msg.sender == dev3, "You are not a dev address");
        require(now >= unlockDate3, "Can't withdraw before 07/01/2021 @ 12:00am (UTC)");
        require(q3Withdrawn == false, "Developers have already withdrawn.");
        IERC20(Token).transfer(dev1, devShares[dev1]);
        IERC20(Token).transfer(dev2, devShares[dev2]);
        IERC20(Token).transfer(dev3, devShares[dev3]);
        q3Withdrawn = true;
    }
    function withdrawQ4() public nonReentrant {
        require(msg.sender == dev1 || msg.sender == dev2 || msg.sender == dev3, "You are not a dev address");
        require(now >= unlockDate4, "Can't withdraw before 10/01/2021 @ 12:00am (UTC)");
        require(q4Withdrawn == false, "Developers have already withdrawn.");
        IERC20(Token).transfer(dev1, devShares[dev1]);
        IERC20(Token).transfer(dev2, devShares[dev2]);
        IERC20(Token).transfer(dev3, devShares[dev3]);
        q4Withdrawn = true;
    }
}
