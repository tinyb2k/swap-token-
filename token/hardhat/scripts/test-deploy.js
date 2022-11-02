const fs = require('fs')
const {ethers} = require('ethers')

const { deploy, getSelectors, initArgs, ADDRESSZERO } = require('./libraries/diamond.js')

const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const Diamond = artifacts.require('Diamond')
const DiamondInit = artifacts.require('DiamondInit')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const IDiamondCut = artifacts.require('IDiamondCut')

const MintNftFacet = artifacts.require('MintNftFacet')

async function deployDiamond() {
    const accounts = await web3.eth.getAccounts()
    const owner = accounts[0]

    // deploy DiamondCutFacet
    const diamondCutFacet = await deploy(owner, DiamondCutFacet)
    console.log('DiamondCutFacet deployed:', diamondCutFacet._address)

    // deploy Diamond
    const diamond = await deploy(owner, Diamond, [owner, diamondCutFacet._address])
    console.log('Diamond deployed:', diamond._address)

    // deploy DiamondInit
    const diamondInit = await deploy(owner, DiamondInit)
    console.log('DiamondInit deployed:', diamondInit._address)
    
    const FacetArtifacts = [
        DiamondLoupeFacet,
        OwnershipFacet,
        MintNftFacet
    ]
    const cut = []
    for (const FacetName of FacetArtifacts) {
    const facet = await deploy(owner, FacetName)
    console.log(`deployed: ${facet._address}`)
    cut.push({
        facetAddress: facet._address,
        action: 0,
        functionSelectors: getSelectors(facet)
    })
    }

    const diamondCut = await new web3.eth.Contract(IDiamondCut.abi, diamond._address)
    try {
        const tx = await diamondCut.methods.diamondCut(
          cut,
          ADDRESSZERO,
          "0x"
        ).send({from:owner})

    } catch(err) {}
    return diamond._address
}

if (require.main === module) {
    deployDiamond()
      .then(() => process.exit(0))
      .catch(error => {
        console.error(error)
        process.exit(1)
      })
  }
  
  exports.deployDiamond = deployDiamond
  