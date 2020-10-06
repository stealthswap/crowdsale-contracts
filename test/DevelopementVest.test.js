const { accounts, contract } = require('@openzeppelin/test-environment');

const { BN, balance, ether, expectRevert, time } = require('@openzeppelin/test-helpers');

const { expect } = require('chai');

const DevelopmentVest = contract.fromArtifact('DevelopmentVesting');
const Token = contract.fromArtifact('OWLToken');


describe('DevelopementVest', function () {
    this.timeout(0);

    const [ deployer, team1, team2, team3, attacker ] = accounts;

    const vestAmount = ether('1000000');

    const unlockDate1 = new BN('1609459200');
    const unlockDate2 = new BN('1617235200');
    const unlockDate3 = new BN('1625097600');
    const unlockDate4 = new BN('1633046400');

    const devShares1 = new BN('62500000000000000000000');
    const devShares2 = new BN('93750000000000000000000');
    const devShares3 = new BN('93750000000000000000000');

    before(async function () {
      // Advance to the next block to correctly read time in the solidity "now" function interpreted by ganache
      await time.advanceBlock();
    });

    before(async function () {
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

        const balanceDev1 = await this.token.balanceOf(team1);
        const balanceDev2 = await this.token.balanceOf(team2);
        const balanceDev3 = await this.token.balanceOf(team3);

        expect(balanceDev1.toString()).equal(devShares1.toString());
        expect(balanceDev2.toString()).equal(devShares2.toString());
        expect(balanceDev3.toString()).equal(devShares3.toString());

    });

    });
    context('after second quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate2);
      });
      it('should accept and reject double Q2 withdrawals', async function () {
        await this.vesting.withdrawQ2({ from: team2 });
        await expectRevert(this.vesting.withdrawQ2({ from: team1}), 'Developers have already withdrawn.');

        const balanceDev1 = await this.token.balanceOf(team1);
        const balanceDev2 = await this.token.balanceOf(team2);
        const balanceDev3 = await this.token.balanceOf(team3);

        expect(balanceDev1.toString()).equal(devShares1.add(devShares1).toString());
        expect(balanceDev2.toString()).equal(devShares2.add(devShares2).toString());
        expect(balanceDev3.toString()).equal(devShares3.add(devShares3).toString());
        });

    });
    context('after third quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate3);
      });
      it('should accept and reject double Q3 withdrawals', async function () {
        await this.vesting.withdrawQ3({ from: team1 });
        await expectRevert(this.vesting.withdrawQ3({ from: team1}), 'Developers have already withdrawn.');


        const balanceDev1 = await this.token.balanceOf(team1);
        const balanceDev2 = await this.token.balanceOf(team2);
        const balanceDev3 = await this.token.balanceOf(team3);

        expect(balanceDev1.toString()).equal(devShares1.mul(new BN('3')).toString());
        expect(balanceDev2.toString()).equal(devShares2.mul(new BN('3')).toString());
        expect(balanceDev3.toString()).equal(devShares3.mul(new BN('3')).toString());
        });

    });
    context('after fourth quarter', function () {

      beforeEach(async function () {
        await time.increaseTo(unlockDate4);
      });


      it('should accept and reject double Q4 withdrawals', async function () {
        await this.vesting.withdrawQ4({ from: team3 });
        await expectRevert(this.vesting.withdrawQ4({ from: team1}), 'Developers have already withdrawn.');


        const balanceDev1 = await this.token.balanceOf(team1);
        const balanceDev2 = await this.token.balanceOf(team2);
        const balanceDev3 = await this.token.balanceOf(team3);

        expect(balanceDev1.toString()).equal(devShares1.mul(new BN('4')).toString());
        expect(balanceDev2.toString()).equal(devShares2.mul(new BN('4')).toString());
        expect(balanceDev3.toString()).equal(devShares3.mul(new BN('4')).toString());
        });

    });
  });

