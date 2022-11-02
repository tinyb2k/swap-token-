const {parseEther} = require("ethers/lib/utils");
const {expect} = require("chai");
const {deploy} = require("../scripts/libraries/diamond");
const {deployTokenFacet} = require("../scripts/tokens/deploy-tokens");

const TokenFacet = artifacts.require('TokenFacet')

// test token
const MockToken = artifacts.require('MockToken')

contract("Token factory", (accounts) => {
    let owner = accounts[0];
    let recipient1 = accounts[1];
    let recipient2 = accounts[2];

    let diamondAddress;
    let tokenFacet;
    let mockToken1;

    before(async () => {
        diamondAddress = await deployTokenFacet(owner);
        tokenFacet = new web3.eth.Contract(TokenFacet.abi, diamondAddress);
    })

    it("should create token", async () => {
        mockToken1 = await deploy(owner, MockToken, ["Mock", "MockToken"]);
        try {
            await mockToken1.methods.mint(parseEther("1000000"), owner).send({ from: owner });
            await mockToken1.methods.transfer(diamondAddress, parseEther("1000")).send({ from: owner });
            await tokenFacet.methods.addToken(mockToken1._address).send({ from: owner });
            const tokens = await tokenFacet.methods.getTokens().call();
            expect(tokens).to.have.members([mockToken1._address]);
        } catch (e) {
            expect(e).to.be.null;
        }
    })

    it("should remove token", async() => {
        try {
            await tokenFacet.methods.removeToken(mockToken1._address).send({ from: owner });
            const tokens = await tokenFacet.methods.getTokens().call()
            expect(tokens.length).to.be.eq(0);
        } catch (e) {
            expect(e).to.be.null;
        }
    })
})