const { artifacts, expect } = require('hardhat')
const { deployDiamond } = require('../scripts/test-deploy.js')
const MintNftFacet = artifacts.require("MintNftFacet")
const {Client} = require('pg');

contract("Diamond", () => {
    let owner
    let mintNftFacet
    let resultsShoe
    let outputs = []

    function sortObj(obj) {
      const ordered = Object.keys(obj).sort().reduce(
       (object, key) => {
          object[key] = obj[key]
          return object
       }
      , {})
      return ordered
  }

    //Connect DB
    const client = new Client({
      user: "postgres",
      password: "A5djmH7BZSXdGhQcJbpdR2ZEV8xwPfLh",
      host: "117.4.242.212",
      port: "5432",
      database: "lemo_db"
    })
    client.connect()
      .then(() => console.log("Connect Successfully"))
      .catch((err) => {})

    before(async () => {
      const diamondAddress = await deployDiamond()
      const accounts = await web3.eth.getAccounts()
      owner = accounts[0]
      mintNftFacet = new web3.eth.Contract(MintNftFacet.abi, diamondAddress)
    })

    it("test", async () => {
      const dataShoe = await client.query("select * from nft_shoe")
      resultsShoe = dataShoe.rows
      console.log(resultsShoe)
      for(let i = 0; i<resultsShoe.length; i++) {
        const data = sortObj(resultsShoe[i]);
        console.log(data)
      }
    })

    // it("Should insert new data into nft_shoe DB", async () => {
    //   try {
    //     for(let i = 0; i< outputs.length; i++) {
    //       await client.query(`INSERT INTO nft_shoe(
    //         id,
    //         created,
    //         creator,
    //         editor,
    //         removed,
    //         status,
    //         updated,
    //         comfort,
    //         comfort_gem,
    //         comfort_up,
    //         efficiency,
    //         efficiency_gem,
    //         efficiency_up,
    //         level,
    //         luck,
    //         luck_gem,
    //         luck_up,
    //         nft_id,
    //         resilience,
    //         resilience_gem,
    //         resilience_up,
    //         shoe_background,
    //         shoe_color,
    //         shoe_image,
    //         shoe_mint,
    //         shoe_model_id,
    //         shoe_rarity_id,
    //         shoe_type_id
    //       ) VALUES(
    //         '${outputs[i].id}',
    //         '${outputs[i].created}',
    //         '${outputs[i].creator}',
    //         '${outputs[i].editor}',
    //         '${outputs[i].removed}',
    //         '${outputs[i].status}',
    //         '${outputs[i].updated}',
    //         '${outputs[i].comfort}',
    //         '${outputs[i].comfort_gem}',
    //         '${outputs[i].comfort_up}',
    //         '${outputs[i].efficiency}',
    //         '${outputs[i].efficiency_gem}',
    //         '${outputs[i].efficiency_up}',
    //         '${outputs[i].level}',
    //         '${outputs[i].luck}',
    //         '${outputs[i].luck_gem}',
    //         '${outputs[i].luck_up}',
    //         '${outputs[i].nft_id}',
    //         '${outputs[i].resilience}',
    //         '${outputs[i].resilience_gem}',
    //         '${outputs[i].resilience_up}',
    //         '${outputs[i].shoe_background}',
    //         '${outputs[i].shoe_color}',
    //         '${outputs[i].shoe_image}',
    //         '${outputs[i].shoe_mint}',
    //         '${outputs[i].shoe_model_id}',
    //         '${outputs[i].shoe_rarity_id}',
    //         '${outputs[i].shoe_type_id}'
    //         )`
    //       )
    //     }
    //   } catch(err) {}
    // })

    it("NFT is minted successfully",async () => {
        await mintNftFacet.methods.createToken("https://www.mytoken1location.com", 1).send({from: owner });
        await mintNftFacet.methods.createToken("https://www.mytoken2location.com", 2).send({from: owner });
        await mintNftFacet.methods.createToken("https://www.mytoken3location.com", 3).send({from: owner });
        const items = await mintNftFacet.methods.getItems().call();
        expect(items.length).to.equal(3);
    })
})