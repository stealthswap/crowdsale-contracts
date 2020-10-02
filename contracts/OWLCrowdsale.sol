// SPDX-License-Identifier: GPLv3

pragma solidity ^0.5.0;
import "@openzeppelin/contracts/crowdsale/Crowdsale.sol";
import "@openzeppelin/contracts/crowdsale/emission/AllowanceCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/IndividuallyCappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/validation/TimedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/FinalizableCrowdsale.sol";

/// @title OWLCrowdsale is Timed Capped Crowdsale smart contract.
/// @author StealthSwap
/// @notice Token is Detailed ERC20 with Capped Supply.
contract OWLCrowdsale is Crowdsale, CappedCrowdsale, AllowanceCrowdsale {

    using SafeERC20 for IERC20;

    uint256 public investorMinCap = 0.5 ether;
	  uint256 public investorHardCap = 75 ether;

    uint256 public _hardCap = 2690 ether;
    uint256 public _exchangeRate = 974;

	mapping(address => uint256) private _contributions;

    constructor(
        uint256 _openingTime,
        uint256 _closingTime,
        uint256 _rate,
        IERC20 token,
        address crowdsaleWallet, // <- new argument
        address payable wallet
    )
        Crowdsale(_rate, wallet, token)
        CappedCrowdsale(_hardCap)
        AllowanceCrowdsale(crowdsaleWallet)  // <- used here
        // TimedCrowdsale(_openingTime,_closingTime)
        // FinalizableCrowdsale()

        public
    {

    }
    function _updatePurchasingState(address _beneficiary, uint256 weiAmount) internal {
        // solhint-disable-previous-line no-empty-blocks
        super._updatePurchasingState(_beneficiary, weiAmount);
        _contributions[_beneficiary] = weiAmount;
    }
    function _preValidatePurchase(
        address _beneficiary,
        uint256 _weiAmount
    )
    internal view
    {
        super._preValidatePurchase(_beneficiary, _weiAmount);
        uint256 _existingContribution = _contributions[_beneficiary];
        uint256 _newContribution = _existingContribution.add(_weiAmount);
        require(_newContribution >= investorMinCap && _newContribution <= investorHardCap, "CappedCrowdsale: individual cap exceeded");
    }
}