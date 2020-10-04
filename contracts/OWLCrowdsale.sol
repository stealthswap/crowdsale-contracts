pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";

contract OWLCrowdsale is CappedCrowdsale, PostDeliveryCrowdsale {

    uint256 public investorMinCap = 0.5 ether;
    uint256 public investorHardCap = 75 ether;

    uint256 public _hardCap = 2690 ether;
    uint256 public _exchangeRate = 974;

	mapping(address => uint256) private _contributions;
    constructor (uint256 openingTime, uint256 closingTime, uint256 rate, address payable wallet, IERC20 token)
        public
        TimedCrowdsale(openingTime, closingTime)
        Crowdsale(rate, wallet, token)
        CappedCrowdsale(_hardCap)
    {
        // solhint-disable-previous-line no-empty-blocks
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