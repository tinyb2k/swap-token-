const { deploy, getSelectors, ADDRESSZERO } = require("../libraries/diamond");
const { parseEther } = require("ethers/lib/utils");
const { expect } = require("chai");

const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const Diamond = artifacts.require('Diamond')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const IDiamondCut = artifacts.require('IDiamondCut')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const ERC20Facet = artifacts.require('ERC20Facet')
const TokenFacet = artifacts.require('TokenFacet')

// tokens
const LemoToken = artifacts.require('LemoToken')
const PaceToken = artifacts.require('PaceToken')

async function deployTokenFacet(owner) {
    // deploy DiamondCutFacet
    const diamondCutFacet = await deploy(owner, DiamondCutFacet);
    console.log('DiamondCutFacet deployed:', diamondCutFacet._address);
    // deploy Diamond
    const diamond = await deploy(owner, Diamond, [owner, diamondCutFacet._address]);
    console.log('Diamond deployed:', diamond._address);

    // deploy DiamondLoupe
    const diamondLoupe = await deploy(owner, DiamondLoupeFacet);
    console.log('Diamond Loupe deployed:', diamondLoupe._address);

    const ownershipFacet = await deploy(owner, OwnershipFacet);
    console.log('Ownership deployed:', ownershipFacet._address);

    const erc20Facet = await deploy(owner, ERC20Facet);
    console.log('Erc20Token deployed:', erc20Facet._address);

    const tokenFacet = await deploy(owner, TokenFacet);
    console.log('TokenFacet deployed: ', tokenFacet._address);

    const cuts = [{
            facetAddress: diamondLoupe._address,
            action: 0,
            functionSelectors: getSelectors(diamondLoupe)
        },
        {
            facetAddress: ownershipFacet._address,
            action: 0,
            functionSelectors: getSelectors(ownershipFacet)
        },
        {
            facetAddress: erc20Facet._address,
            action: 0,
            functionSelectors: getSelectors(erc20Facet)
        },
        {
            facetAddress: tokenFacet._address,
            action: 0,
            functionSelectors: getSelectors(tokenFacet)
        }
    ];
    console.log("cuts", cuts);

    const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond._address);
    await diamondCut.methods.diamondCut(
        cuts,
        ADDRESSZERO,
        '0x'
    ).send({ from: owner });

    return diamond._address;
}

async function deployToken(account, artifact, args) {
    const contract = new web3.eth.Contract(artifact.abi)
    let instance;
    await contract.deploy({
        data: artifact.bytecode,
        arguments: args ? args : []
    }).send({
        from: account,
        gas: 25000000,
        gasPrice: '10000000000'
    }).then((inst) => {
        instance = inst
    })
    return instance;
}

async function deployTokens() {
    const accounts = await web3.eth.getAccounts();
    const owner = accounts[0];
    console.log("Main account:", owner);

    const diamondAddress = await deployTokenFacet(owner);
    const tokenFacet = new web3.eth.Contract(TokenFacet.abi, diamondAddress);

    try {
        const paceToken = await deployToken(owner, PaceToken);
        const lemoToken = await deployToken(owner, LemoToken);
        const deployTokens = [paceToken, lemoToken];

        for (const token of deployTokens) {
            console.log("Token Name:", await token.methods.name().call())
            console.log("Token Symbol:", await token.methods.symbol().call())
            console.log("Token address:", token._address);

            await token.methods.mint(parseEther("1000000"), owner).send({ from: owner });
            await token.methods.transfer(diamondAddress, parseEther("1000")).send({ from: owner });
            await tokenFacet.methods.addToken(token._address).send({ from: owner });

            console.log();
        }
        const tokens = await tokenFacet.methods.getTokens().call();
        console.log("tokens:", tokens);
    } catch (e) {
        console.error(e);
    }
}

if (require.main === module) {
    deployTokens()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}

exports.deployTokenFacet = deployTokenFacet;