pragma solidity ^0.5.0;

import "./contracts/token/ERC20/ERC20.sol";
import "./contracts/token/ERC20/IERC20.sol";
import "./contracts/utils/ReentrancyGuard.sol";

// Governance tokens unlocked on 11/08/2020 @ 12:00am (UTC)
contract GovernanceVesting is ReentrancyGuard {

    using SafeMath for uint;

    IERC20 private Token;

    address public governanceAddress;

    uint256 public unlockDate = 1604793600; // 11/08/2020 @ 12:00am (UTC)

    bool Withdrawn = false;

    constructor(IERC20 _Token, address _govAddress) public {
        Token = _Token;
        
        governanceAddress = _govAddress;
     }

    function withdraw() public nonReentrant {
        require(msg.sender == governanceAddress, "You are not a dev address");
        require(now >= unlockDate, "Can't withdraw before 11/08/2020 @ 12:00am (UTC)");
        require(Withdrawn == false, "Already withdrawn.");
        IERC20(Token).transfer(governanceAddress, 500000000000000000000000);
        Withdrawn = true;
    }
}
