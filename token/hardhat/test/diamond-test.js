const { deploy, getSelectors, initArgs, ADDRESSZERO } = require('../scripts/libraries/diamond')

const DiamondCutFacet = artifacts.require('DiamondCutFacet')
const Diamond = artifacts.require('Diamond')
const DiamondInit = artifacts.require('DiamondInit')
const DiamondLoupeFacet = artifacts.require('DiamondLoupeFacet')
const OwnershipFacet = artifacts.require('OwnershipFacet')
const IDiamondCut = artifacts.require('IDiamondCut')

const MintNftFacet = artifacts.require('MintNftFacet')

const SdexFacet = artifacts.require('SdexFacet')
const ToolShedFacet = artifacts.require('ToolShedFacet')
const TokenFarmFacet = artifacts.require('TokenFarmFacet')
const AutoSdexFarmFacet = artifacts.require('AutoSdexFarmFacet')
const SdexVaultFacet = artifacts.require('SdexVaultFacet')
    //Rewards
const RewardFacet = artifacts.require('RewardFacet')

const ReducedPenaltyReward = artifacts.require('ReducedPenaltyReward')
const ReducedPenaltyRewardFacet = artifacts.require('ReducedPenaltyRewardFacet')

const IncreasedBlockReward = artifacts.require('IncreasedBlockReward')
const IncreasedBlockRewardFacet = artifacts.require('IncreasedBlockRewardFacet')

const RewardAmplifierReward = artifacts.require('RewardAmplifierReward')
const RewardAmplifierRewardFacet = artifacts.require('RewardAmplifierRewardFacet')

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

    // deploy MintNftFacet
    const mintNftFacet = await deploy(owner, MintNftFacet)
    console.log('MintNftFacet deployed:', mintNftFacet._address)

    const FacetArtifacts = [
        DiamondLoupeFacet,
        OwnershipFacet,
        SdexFacet,
        ToolShedFacet,
        TokenFarmFacet,
        AutoSdexFarmFacet,
        SdexVaultFacet,
        RewardFacet,
        ReducedPenaltyRewardFacet,
        IncreasedBlockRewardFacet,
        RewardAmplifierRewardFacet,
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
    console.log('Diamond Cut:', cut)
}



if (require.main === module) {
    deployDiamond()
        .then(() => process.exit(0))
        .catch(error => {
            console.error(error)
            process.exit(1)
        })
}

const _deployDiamond = deployDiamond