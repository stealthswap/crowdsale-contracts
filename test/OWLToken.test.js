const { accounts, contract } = require('@openzeppelin/test-environment');

const MyContract = contract.fromArtifact('OWLToken');
const { expect } = require('chai');
const { BN, expectEvent, expectRevert } = require('@openzeppelin/test-helpers');

describe('OWLToken', function () {
    const owner = accounts[0];
    const receiver = accounts[1];
    const _name = 'OWL Token';
    const _symbol = 'OWL';
    const _decimals = 18;

    beforeEach(async function () {
        // Deploy a new Box contract for each test
        this.contract = await MyContract.new({ from: owner });
    });

    it('should have a total supply of 10M Token ', async function () {
        const expectedTotalSupply = '10000000000000000000000000';
        const totalSupply = await this.contract.totalSupply();
        // Test if the returned value is the same one
        // Note that we need to use strings to compare the 256 bit integers
        expect(totalSupply.toString()).equal(expectedTotalSupply);

    });
    it('owner should have entire balance', async function () {
        const expectedOwnerSupply = '10000000000000000000000000';
        const ownerBalance = await this.contract.balanceOf(owner);
        expect(ownerBalance.toString()).equal(expectedOwnerSupply);
    });
    it('should be transferable', async function () {
        const startingBalanceSender = '10000000000000000000000000';
        const startingBalanceReceiver = '0';

        const finalBalanceSender = '5000000000000000000000000';
        const finalBalanceReceiver = '5000000000000000000000000';

        const receiverBalanceBefore = await this.contract.balanceOf(receiver);
        const senderBalanceBefore = await this.contract.balanceOf(owner);

        expect(senderBalanceBefore.toString()).equal(startingBalanceSender);
        expect(receiverBalanceBefore.toString()).equal(startingBalanceReceiver);


        await this.contract.transfer(receiver, new BN('5000000000000000000000000'), { from: owner });

        const receiverBalanceAfter = await this.contract.balanceOf(receiver);
        const senderBalanceAfter = await this.contract.balanceOf(owner);

        expect(senderBalanceAfter.toString()).equal(finalBalanceSender);
        expect(receiverBalanceAfter.toString()).equal(finalBalanceReceiver);

    })
    it('can transfer allowed tokens', async function() {

        const amountToTransfer = '5000000000000000000000000';
        const expectedFinalSupply = '10000000000000000000000000';

        await this.contract.approve(receiver, new BN(amountToTransfer), {from: owner});


        this.contract.transferFrom(owner, receiver, new BN(amountToTransfer), { from: receiver });


        const ownerBalance = await this.contract.balanceOf(owner);

        expect(ownerBalance.toString()).equal(amountToTransfer);

        const finalSupply = await this.contract.totalSupply();

        expect(finalSupply.toString()).equal(expectedFinalSupply);

    })
    it('only owner should be pauser', async function () {
        const isOwnerPauser = await this.contract.isPauser(owner);
        expect(isOwnerPauser.toString()).equal('true');

        const isAnyPauser = await this.contract.isPauser(receiver);
        expect(isAnyPauser.toString()).equal('false');

    })
    it('should not be transferable if paused', async function () {
        await this.contract.pause({ from: owner });
        const isPaused = await this.contract.paused();
        expect(isPaused.toString()).equal('true');
        await expectRevert(
            this.contract.transfer(receiver, new BN('5000000000000000000000000'), { from: owner }),
            'Pausable: paused'
        );

        await this.contract.unpause({ from: owner });
        const isPausedAfter = await this.contract.paused();
        expect(isPausedAfter.toString()).equal('false');

        const receipt = await this.contract.transfer(receiver, new BN('5000000000000000000000000'), { from: owner });

        expectEvent(
            receipt,
            'Transfer',
            {
                from: owner,
                to: receiver,
                value: new BN('5000000000000000000000000')
            }
        );

    })
    it('should not be paused by non-owner', async function () {

        await expectRevert(
            this.contract.pause({ from: receiver }),
            'PauserRole: caller does not have the Pauser role'
        );
    })
    it('should have a max cap of 10M', async function() {
        const expectedCap = '10000000000000000000000000';
        const tokenCap = await this.contract.cap();
        // Test if the returned value is the same one
        // Note that we need to use strings to compare the 256 bit integers
        expect(tokenCap.toString()).equal(expectedCap);
    })
    it('can be burned', async function() {
        const startingSupply = '10000000000000000000000000';
        const amountToBurn = '5000000000000000000000000';
        const expectedFinalSupply = '5000000000000000000000000';

        const ownerBalance = await this.contract.balanceOf(owner);

        await this.contract.transfer(receiver, new BN('5000000000000000000000000'), { from: owner });

        expect(ownerBalance.toString()).equal(startingSupply);

        const receiverBalance = await this.contract.balanceOf(receiver);

        expect(receiverBalance.toString()).equal(amountToBurn);

        await this.contract.burn(new BN(amountToBurn), {from : receiver});

        const finalSupply = await this.contract.totalSupply();

        expect(finalSupply.toString()).equal(expectedFinalSupply);
    })
    it('only own tokens can be burned', async function() {

        const amountToBurn = '5000000000000000000000000';
        const expectedFinalSupply = '10000000000000000000000000';

        await expectRevert(
            this.contract.burn(new BN(amountToBurn), { from: receiver }),
            'ERC20: burn amount exceeds balance'
        );

        const finalSupply = await this.contract.totalSupply();

        expect(finalSupply.toString()).equal(expectedFinalSupply);
    })
    it('cannot burn non allowed tokens', async function() {

        const amountToBurn = '5000000000000000000000000';
        const expectedFinalSupply = '10000000000000000000000000';

        await expectRevert(
            this.contract.burnFrom(owner, new BN(amountToBurn), { from: receiver }),
            'ERC20: burn amount exceeds allowance'
        );

        const finalSupply = await this.contract.totalSupply();

        expect(finalSupply.toString()).equal(expectedFinalSupply);

        await this.contract.transfer(receiver, new BN('5000000000000000000000000'), { from: owner });

        const receiverBalance = await this.contract.balanceOf(receiver);

        expect(receiverBalance.toString()).equal(amountToBurn);

        await expectRevert(
            this.contract.burnFrom(receiver, new BN(amountToBurn), { from: owner }),
            'ERC20: burn amount exceeds allowance'
        );

        await this.contract.approve(receiver, new BN('2500000000000000000000000'), {from: owner});


        this.contract.burnFrom(owner, new BN('2500000000000000000000000'), { from: receiver });


        const ownerBalance = await this.contract.balanceOf(owner);

        expect(ownerBalance.toString()).equal('2500000000000000000000000');
    })
    it('can burn allowed tokens', async function() {

        const amountToBurn = '5000000000000000000000000';
        const expectedFinalSupply = '5000000000000000000000000';

        await this.contract.approve(receiver, new BN(amountToBurn), {from: owner});


        this.contract.burnFrom(owner, new BN(amountToBurn), { from: receiver });


        const ownerBalance = await this.contract.balanceOf(owner);

        expect(ownerBalance.toString()).equal(amountToBurn);

        const finalSupply = await this.contract.totalSupply();

        expect(finalSupply.toString()).equal(expectedFinalSupply);

    })
});
