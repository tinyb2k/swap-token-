const { deploy, getSelectors, ADDRESSZERO } = require('../scripts/libraries/diamond.js');
const { contract, artifacts } = require("hardhat");
const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");

const IPancakeRouter02 = artifacts.require('IPancakeRouter02');
const IPancakeFactory = artifacts.require('IPancakeFactory');
contract("TokenSwap", (accounts) => {
    let pancakeRouter;

    before(async() => {
        pancakeRouter = await new web3.eth.Contract(IPancakeRouter02.abi, '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3');
    });

    it("should show pancake router", async() => {
        //console.log(pancakeRouter);
    });

    // @todo: add approval test for tokenB to swap

    // address tokenA,
    //     address tokenB,
    //     uint amountADesired,
    //     uint amountBDesired,
    //     uint amountAMin,
    //     uint amountBMin,
    //     address to,
    //     uint deadline
    it("should add liquidity", async() => {
        console.log('account', accounts[0]);
        let txn = await pancakeRouter.methods.addLiquidity(
            '0x2F78d418742C93467A5B6A906cF17fB040F91CF9',
            '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
            parseEther('5000'),
            parseEther('0.00332084'),
            parseEther('1000'),
            parseEther('0.000689504'),
            accounts[0],
            parseEther('1919500'),
        ).send({ from: accounts[0] });
        console.log(txn);
    });

    // function swapExactTokensForTokens(
    //     uint amountIn,
    //     uint amountOutMin,
    //     address[] calldata path,
    //     address to,
    //     uint deadline
    // ) external returns (uint[] memory amounts);
    it("should approve tokens", async() => {
        let txn = await pancakeRouter.methods.approve(
            '0x9Ac64Cc6e4415144C455BD8E4837Fea55603e5c3',
            parseEther('0'),
        ).send({ from: accounts[0] });
        console.log(txn);
    });
    it("should swap tokens", async() => {
        let txn = await pancakeRouter.methods.swapExactTokensForTokens(
            parseEther('0.0001'),
            parseEther('0.0000000000705859'), [
                '0xae13d989daC2f0dEbFf460aC112a837C89BAa7cd',
                '0xa20b0EAA5f46C69a2547DFA6539745270E5b3e5F',
            ],
            accounts[0],
            parseEther('1919500'),
        ).send({ from: accounts[0] });
        console.log(txn);
    });
    // function approve(address spender, uint256 value) external returns (bool);

    // function safeTransferFrom(
    //     address token,
    //     address from,
    //     address to,
    //     uint256 value

    // it('Create an automic swap by running safeTransferFrom()', async(){

    // })

});