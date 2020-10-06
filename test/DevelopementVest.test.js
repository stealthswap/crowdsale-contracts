const { accounts, contract } = require('@openzeppelin/test-environment');

const { BN, balance, ether, expectRevert, time } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const DevelopmentVest = contract.fromArtifact('DevelopmentVesting');
const Token = contract.fromArtifact('OWLToken');


describe('DevelopementVest', function () {
    this.timeout(0);

    const [ deployer, team1, team2, team3, attacker ] = accounts;

    const vestAmount = ether('1000000');

    unlockDate1 = new BN('1609459200');
    unlockDate2 = new BN('1617235200');
    unlockDate3 = new BN('1625097600');
    unlockDate4 = new BN('1633046400');

    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
      await time.advanceBlock();
    });

    beforeEach(async function () {
      this.token = await Token.new();
      this.vesting = await DevelopmentVest.new(
        this.token.address, team1, team2, team3
      , { from : deployer });
      await this.token.transfer(this.vesting.address, vestAmount);
    });
    it('should have a balance of 1M Token ', async function () {
      const expectedAllowance = ether('1000000');
      const balance = await this.token.balanceOf(this.vesting.address);
      // Test if the returned value is the same one
      // Note that we need to use strings to compare the 256 bit integers
      expect(balance.toString()).equal(expectedAllowance.toString())
    });

    it('should have proper arguments', async function() {
      const _unlockDate1 = await this.vesting.unlockDate1();
      const _unlockDate2 = await this.vesting.unlockDate2();
      const _unlockDate3 = await this.vesting.unlockDate3();
      const _unlockDate4 = await this.vesting.unlockDate4();
      expect(_unlockDate1.toString()).to.equal(unlockDate1.toString());
      expect(_unlockDate2.toString()).to.equal(unlockDate2.toString());
      expect(_unlockDate3.toString()).to.equal(unlockDate3.toString());
      expect(_unlockDate4.toString()).to.equal(unlockDate4.toString());
    })
    context('after first quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate1);
      });


      it('should accept and reject double Q1 withdrawals', async function () {
        await this.vesting.withdrawQ1({ from: team1 });
        await expectRevert(this.vesting.withdrawQ1({ from: team1}), 'Developers have already withdrawn.');
      });

    });
    context('after second quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate2);
      });
      it('should accept and reject double Q2 withdrawals', async function () {
        await this.vesting.withdrawQ2({ from: team2 });
        await expectRevert(this.vesting.withdrawQ2({ from: team1}), 'Developers have already withdrawn.');
      });

    });
    context('after third quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate3);
      });
      it('should accept and reject double Q3 withdrawals', async function () {
        await this.vesting.withdrawQ3({ from: team1 });
        await expectRevert(this.vesting.withdrawQ3({ from: team1}), 'Developers have already withdrawn.');
      });

    });
    context('after fourth quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate4);
      });


      it('should accept and reject double Q4 withdrawals', async function () {
        await this.vesting.withdrawQ4({ from: team3 });
        await expectRevert(this.vesting.withdrawQ4({ from: team1}), 'Developers have already withdrawn.');
      });

    });
  });

