const { accounts, contract } = require('@openzeppelin/test-environment');

const Token = contract.fromArtifact('OWLToken');
const Crowdsale = contract.fromArtifact('OWLCrowdsale');
const { expect } = require('chai');
const { BN, balance, ether, expectRevert } = require('@openzeppelin/test-helpers');

describe('OWLCrowdsale', function () {

    // 2690 ether
    const cap = ether('2690');
    const crowdsaleAllowance = ether('2620060');
    const minContribution = ether('0.5');
    const maxContribution = ether('75');
    const rate = ether('974');
    const openingTime = new BN (1601935200);
    const closingTime = new BN (1602194400);
    const [ investor, wallet, purchaser, tokenWallet, investor1, purchaser1, investor2 ] = accounts;
    beforeEach(async function () {
        // Deploy a new Token contract for each test
        this.contract = await Token.new({ from: tokenWallet });
        // Deploy a new Crowdsale contract for each test
        this.crowdsale = await Crowdsale.new(openingTime,closingTime,rate,this.contract.address,wallet,tokenWallet);
        await this.contract.approve(this.crowdsale.address, crowdsaleAllowance, {from: tokenWallet});
    });
    it('should have an allowance of 2.6M Token ', async function () {
        const expectedAllowance = '2620060000000000000000000';
        const allowance = await this.contract.allowance(tokenWallet,this.crowdsale.address);
        // Test if the returned value is the same one
        // Note that we need to use strings to compare the 256 bit integers
        expect(allowance.toString()).equal(expectedAllowance)
    });

    it('should be hardcapped', async function () {
        const crowdsaleCap = await this.crowdsale.cap();
        expect(crowdsaleCap.toString()).equal(cap.toString());
    })
    describe('accepting payments', function () {
        it('should accept payments within cap', async function () {
            await this.crowdsale.buyTokens(investor, { value: maxContribution, from: purchaser });
            await this.crowdsale.buyTokens(investor1, { value: minContribution, from: purchaser1 });
          });

        it('should reject payments outside cap', async function () {
          await expectRevert(this.crowdsale.send(cap), 'CappedCrowdsale: individual cap exceeded');
        });
        it('should reject payments that exceed cap', async function () {
          await expectRevert(this.crowdsale.send(cap.addn(1)), 'CappedCrowdsale: cap exceeded');
        });
    })
    describe('high level purchase', function () {
        it('should assign tokens to sender', async function () {
            const expectedTokenAmount = rate.mul(maxContribution)
            await this.crowdsale.sendTransaction({ value: maxContribution, from: investor });
            expect(await this.contract.balanceOf(investor)).to.be.bignumber.equal(expectedTokenAmount);
          });

        it('should forward funds to wallet', async function () {
          const balanceTracker = await balance.tracker(wallet);
          await this.crowdsale.sendTransaction({ value: minContribution, from: investor });
          expect(await balanceTracker.delta()).to.be.bignumber.equal(minContribution);
        });
    })

})