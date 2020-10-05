const { accounts, contract } = require('@openzeppelin/test-environment');

const { BN, balance, ether, expectRevert, time } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const Crowdsale = contract.fromArtifact('OWLCrowdsale');
const Token = contract.fromArtifact('OWLToken');

describe('OWLCrowdsale', function () {
  this.timeout(0);

  const [ investor, wallet, purchaser, investor1, purchaser1 ] = accounts;

  const cap = ether('2690');
  const rate = new BN(974);
  const crowdsaleAllowance = ether('2620060');
  const minContribution = ether('0.5');
  const maxContribution = ether('75');
  before(async function () {
    // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
    await time.advanceBlock();
  });

  beforeEach(async function () {
    this.openingTime = (await time.latest()).add(time.duration.weeks(1));
    this.closingTime = this.openingTime.add(time.duration.weeks(1));
    this.afterClosingTime = this.closingTime.add(time.duration.seconds(1));
    this.token = await Token.new();
    this.crowdsale = await Crowdsale.new(
      this.openingTime, this.closingTime, rate, wallet, this.token.address
    );
    await this.token.transfer(this.crowdsale.address, crowdsaleAllowance);
  });
  it('should have a balance of 2.6M Token ', async function () {
    const expectedAllowance = '2620060000000000000000000';
    const balance = await this.token.balanceOf(this.crowdsale.address);
    // Test if the returned value is the same one
    // Note that we need to use strings to compare the 256 bit integers
    expect(balance.toString()).equal(expectedAllowance)
});

  it('should be hardcapped', async function () {
      const crowdsaleCap = await this.crowdsale.cap();
      expect(crowdsaleCap.toString()).equal(cap.toString());
  })

  it('should have proper arguments', async function() {
    const _rate = await this.crowdsale.rate();
    const _token = await this.crowdsale.token();
    const _wallet = await this.crowdsale.wallet();

    expect(_rate.toString()).equal(rate.toString());
    expect(_token).to.equal(this.token.address);
    expect(_wallet).to.equal(wallet);

    const _walletBalance = await balance.current(_wallet);
    expect(_walletBalance.toString()).to.equal(ether('1000').toString());
  })
  context('after opening time', function () {
    const value = ether('42');

    beforeEach(async function () {
      await time.increaseTo(this.openingTime);
    });
    it('should accept payments within cap', async function () {
      await this.crowdsale.buyTokens(investor, { value: maxContribution, from: purchaser });
      await this.crowdsale.buyTokens(investor1, { value: minContribution, from: purchaser1 });
    });
    it('should accept sends', async function () {
      await this.crowdsale.send(value);
    });
    it('should reject payments outside cap', async function () {
      await expectRevert(this.crowdsale.send(cap), 'CappedCrowdsale: individual cap exceeded');
    });
    it('should reject payments that exceed cap', async function () {
      await expectRevert(this.crowdsale.send(cap.addn(1)), 'CappedCrowdsale: cap exceeded');
    });
    context('with bought tokens', function () {
      const value = ether('10');

      beforeEach(async function () {
        await this.crowdsale.buyTokens(investor, { value: value, from: purchaser });
      });

      it('does not immediately assign tokens to beneficiaries', async function () {
        expect(await this.crowdsale.balanceOf(investor)).to.be.bignumber.equal(value.mul(rate));
        expect(await this.token.balanceOf(investor)).to.be.bignumber.equal('0');
      });
      it('does not allow beneficiaries to withdraw tokens before crowdsale ends', async function () {
        await expectRevert(this.crowdsale.withdrawTokens(investor),
          'PostDeliveryCrowdsale: not closed'
        );
      });
      it('should stop at reached cap', async function (){
        const _buyers = accounts.slice(30,298);
        const _amount = ether('10');
        for (let i = 0;i < _buyers.length; i++) {
          _buyer = _buyers[i];
          await this.crowdsale.buyTokens(_buyer, { value: _amount, from: _buyer});
        }

        const hasCapped = await this.crowdsale.capReached();
        const crowdsaleBalance = await this.token.balanceOf(this.crowdsale.address);
        expect(crowdsaleBalance.toString()).to.equal('0');
        expect(hasCapped).to.equal(true);
      })
      context('after closing time', function () {
        beforeEach(async function () {
          await time.increaseTo(this.afterClosingTime);
        });

        it('allows beneficiaries to withdraw tokens', async function () {
          await this.crowdsale.withdrawTokens(investor);
          expect(await this.crowdsale.balanceOf(investor)).to.be.bignumber.equal('0');
          expect(await this.token.balanceOf(investor)).to.be.bignumber.equal(value.mul(rate));
        });

        it('rejects multiple withdrawals', async function () {
          await this.crowdsale.withdrawTokens(investor);
          await expectRevert(this.crowdsale.withdrawTokens(investor),
            'PostDeliveryCrowdsale: beneficiary is not due any tokens'
          );
        });
      });
    });
  });
});