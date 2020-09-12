// SPDX-License-Identifier: GPLv3

pragma solidity ^0.5.0;

/// @title OWL Token is ERC-20 token
/// @author StealthSwap
/// @notice Token is Detailed ERC20 with Capped Supply.

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20Pausable.sol";


contract OWLToken is ERC20, ERC20Detailed, ERC20Burnable, ERC20Capped, ERC20Pausable {

    uint256 constant maxSupply = 10000000 * 1 ether;

    constructor() public ERC20Detailed("OWL Token", "OWL", 18) ERC20Capped(maxSupply) {
        _mint(msg.sender, maxSupply);
    }
}
