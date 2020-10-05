pragma solidity ^0.5.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/crowdsale/validation/CappedCrowdsale.sol";
import "@openzeppelin/contracts/crowdsale/distribution/PostDeliveryCrowdsale.sol";
import "./IUniswapV2Router.sol"

contract OWLCrowdsale is CappedCrowdsale, PostDeliveryCrowdsale {

    uint256 public investorMinCap   = 0.5 ether;    // Min contribution per address
    uint256 public investorHardCap  = 75 ether;     // Max contribution per address

    uint256 public _hardCap         = 2690 ether;   // Crowdsale hard cap
    uint256 public _exchangeRate    = 974;          // Rate (crowdsale price)

    // Start time 05 October 2020 @ 22:00 UTC
    uint256 public constant _openingTime = 1601935200;
    // End time 08 October 2020 @ 22:00 UTC
    uint256 public constant _closingTime = _openingTime + 3 days;

    // State of contributions
    mapping(address => uint256) private _contributions;

    // Pointer to the UniswapRouter
    IUniswapV2Router02 internal uniswapRouter;

    // Flag to know if liquidity has been locked
    bool public liquidityLocked = false;

    constructor (
        uint256 openingTime,
        uint256 closingTime,
        uint256 rate,
        address payable wallet,
        address _uniswapRouter,
        IERC20 token
    )
        TimedCrowdsale(openingTime, closingTime)
        Crowdsale(rate, wallet, token)
        CappedCrowdsale(_hardCap)
        public
    {
        uniswapRouter = IUniswapV2Router02(_uniswapRouter);
        owlToken = token;
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
        contributions[_beneficiary] = _newContribution;
    }

    /**
     * Function that once sale is complete add the liquidity to Uniswap
     * then locks the liquidity by burning the UNI tokens.
     */
    function finalization() internal {
        require(
            weiRaised() + 0.5 ether > _hardCap || hasClosed(),
            "OWLCrowdsale: can only send liquidity once sale has concluded"
        );

        // TODO: Add proper values
        // Quantity of ETH to add
        uint256 amountEthForUniswap = 1000 ether;
        // Quantity of OWL to add
        uint256 amountOwlForUniswap = 1000000000;

        // Send liquidity to Uniswap LP to create OWL/WETH pair
        owlToken.approve(address(uniswapRouter), amountOwlForUniswap);
        uniswapRouter.addLiquidityETH { value: amountEthForUniswap } (
            address(owlToken),
            amountOwlForUniswap,
            amountOwlForUniswap,
            amountEthForUniswap,
            address(0), // burn LP tokens, locking liquidity
            now
        );
        liquidityLocked = true;
    }
}
