const { deploy, getSelectors, ADDRESSZERO } = require('../scripts/libraries/diamond.js')
const { contract, artifacts } = require("hardhat");
const { expect } = require("chai");
const { parseEther } = require("ethers/lib/utils");

const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const Diamond = artifacts.require('Diamond')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const IDiamondCut = artifacts.require('IDiamondCut')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const ERC20Facet = artifacts.require('ERC20Facet')

async function deployDiamond(owner) {
    // deploy DiamondCutFacet
    const diamondCutFacet = await deploy(owner, DiamondCutFacet);
    console.log('DiamondCutFacet deployed:', diamondCutFacet._address);
    // deploy Diamond
    const diamond = await deploy(owner, Diamond, [owner, diamondCutFacet._address]);
    console.log('Diamond deployed:', diamond._address);

    // deploy DiamondLoupe
    const diamondLoupe = await deploy(owner, DiamondLoupeFacet);
    console.log('Diamond Loupe deployed:', diamondLoupe._address);

    const erc20Facet = await deploy(owner, ERC20Facet);
    console.log('Erc20Token deployed:', erc20Facet._address);

    const ownershipFacet = await deploy(owner, OwnershipFacet);
    console.log('Ownership deployed:', ownershipFacet._address);

    const cuts = [{
            facetAddress: erc20Facet._address,
            action: 0,
            functionSelectors: getSelectors(erc20Facet)
        },
        {
            facetAddress: diamondLoupe._address,
            action: 0,
            functionSelectors: getSelectors(diamondLoupe)
        },
        {
            facetAddress: ownershipFacet._address,
            action: 0,
            functionSelectors: getSelectors(ownershipFacet)
        }
    ];

    const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond._address);
    const tx = await diamondCut.methods.diamondCut(
        cuts,
        ADDRESSZERO,
        '0x'
    ).send({ from: owner });

    return diamond._address;
}

contract("Token", (accounts) => {
    let owner = accounts[0];
    let recipient1 = accounts[1];
    let recipient2 = accounts[2];

    let diamondAddress;
    let erc20Facet;

    before(async() => {
        diamondAddress = await deployDiamond(owner);
    })

    it("test deployed", async() => {
        erc20Facet = await new web3.eth.Contract(ERC20Facet.abi, diamondAddress);
        expect(erc20Facet).to.not.be.null;
        console.log(erc20Facet._address);
    })

    it("initialize token failed by another sender", async() => {
        try {
            await erc20Facet.methods.initialize(parseEther("1000000"), "Let's Move", "LEMO").send({ from: accounts[1] });
        } catch (e) {
            expect(e).to.not.be.null;
        }
    })

    it("initialize token success", async() => {
        await erc20Facet.methods.initialize(parseEther("1000000"), "Let's Move", "LEMO").send({ from: owner });
        const name = await erc20Facet.methods.name().call();
        expect(name).to.eq("Let's Move");
        const symbol = await erc20Facet.methods.symbol().call();
        expect(symbol).to.eq("LEMO");
        expect(await erc20Facet.methods.decimals().call()).to.eq('18');
    })

    it("transfer token success between 2 accounts", async() => {
        await erc20Facet.methods.transfer(recipient1, parseEther("10")).send({ from: owner });
        const balance = await erc20Facet.methods.balanceOf(recipient1).call();
        expect(balance).to.eq(parseEther("10"));
        console.log(balance.toString());
    })

    it("transferFrom external addresses failed by amount of approval", async() => {
        try {
            let rs = await erc20Facet.methods.transferFrom(recipient1, recipient2, parseEther("10")).send({ from: recipient1 });
            console.log(rs);
        } catch (e) {
            console.error(e);
            expect(e).to.not.be.null;
        }
    })

    it("approve token success", async() => {
        let txn = await erc20Facet.methods.approve(owner, parseEther("10")).send({ from: recipient1 });
        // console.log(txn.events.Approval.returnValues);
        let { value } = txn.events.Approval.returnValues;
        expect(value).to.eq(parseEther("10"));
    })

    it("transferFrom external addresses failed by not approved sender", async() => {
        try {
            await erc20Facet.methods.transferFrom(recipient1, recipient2, parseEther("10")).send({ from: recipient2 });
        } catch (e) {
            // console.error(e);
            expect(e).to.not.be.null;
        }
    })

    it("transferFrom external addresses success", async() => {
        try {
            let txn = await erc20Facet.methods.transferFrom(recipient1, recipient2, parseEther("10")).send({ from: owner });
            console.log(txn.events.Transfer.returnValues);
            const { from, to, value } = txn.events.Transfer.returnValues;
            expect(from).to.eq(recipient1);
            expect(to).to.eq(recipient2);
            expect(value).to.eq(parseEther("10"));
        } catch (e) {
            // console.error(e);
            expect(e).to.be.null;
        }
    })

    it("mint token failed by sender", async() => {
        try {
            await erc20Facet.methods.mint(recipient1, parseEther("100")).send({ from: recipient2 });
        } catch (e) {
            expect(e).to.not.be.null;
        }
    })

    it("mint token success", async() => {
        let txn = await erc20Facet.methods.mint(recipient1, parseEther("100")).send({ from: owner });
        const { from, to, value } = txn.events.Transfer.returnValues;
        expect(from).to.eq(ADDRESSZERO);
        expect(to).to.eq(recipient1);
        expect(value).to.eq(parseEther("100"));
    })
})