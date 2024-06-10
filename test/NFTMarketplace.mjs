import { expect } from 'chai';
import pkg from 'hardhat';
const { ethers } = pkg;

import * as chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { solidity } from 'ethereum-waffle';

chai.use(chaiAsPromised);
chai.use(solidity);

describe("NFTMarketplace", function () {
  let NFTMarketplace;
  let nftMarketplace;
  let owner;
  let addr1;
  let addr2;
  let addrs;

  beforeEach(async function () {
    NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    nftMarketplace = await NFTMarketplace.deploy();
    await nftMarketplace.deployed();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await nftMarketplace.owner()).to.equal(owner.address);
    });
  });

  describe("Create Item", function () {
    it("Should allow the owner to create an item", async function () {
      const createItemTx = await nftMarketplace.createItem("https://example.com/token/1", ethers.utils.parseEther("1"));
      await createItemTx.wait();
      const item = await nftMarketplace.getItem(1);
      expect(item.id.toString()).to.equal('1');
      expect(item.creator).to.equal(owner.address);
      expect(item.uri).to.equal("https://example.com/token/1");
      expect(item.price.toString()).to.equal(ethers.utils.parseEther("1").toString());
      expect(item.sold).to.be.false;
    });

    it("Should emit ItemCreated event", async function () {
      await expect(nftMarketplace.createItem("https://example.com/token/1", ethers.utils.parseEther("1")))
        .to.emit(nftMarketplace, "ItemCreated")
        .withArgs(1, owner.address, "https://example.com/token/1", ethers.utils.parseEther("1"));
    });
  });

  describe("Buy Item", function () {
    beforeEach(async function () {
      const createItemTx = await nftMarketplace.createItem("https://example.com/token/1", ethers.utils.parseEther("1"));
      await createItemTx.wait();
    });

    it("Should allow a user to buy an item", async function () {
      await nftMarketplace.connect(addr1).buyItem(1, { value: ethers.utils.parseEther("1") });
      const item = await nftMarketplace.getItem(1);
      expect(item.sold).to.be.true;
      const itemsSold = await nftMarketplace.getItemsSold();
      expect(itemsSold.toString()).to.equal('1');
    });

    it("Should emit ItemSold event", async function () {
      await expect(nftMarketplace.connect(addr1).buyItem(1, { value: ethers.utils.parseEther("1") }))
        .to.emit(nftMarketplace, "ItemSold")
        .withArgs(1, addr1.address, ethers.utils.parseEther("1"));
    });

    it("Should revert if the item is already sold", async function () {
      await nftMarketplace.connect(addr1).buyItem(1, { value: ethers.utils.parseEther("1") });
      await expect(
        nftMarketplace.connect(addr2).buyItem(1, { value: ethers.utils.parseEther("1") })
      ).to.be.revertedWith("Item already sold");
    });

    it("Should revert if the payment is insufficient", async function () {
      await expect(
        nftMarketplace.connect(addr1).buyItem(1, { value: ethers.utils.parseEther("0.5") })
      ).to.be.revertedWith("Insufficient funds");
    });
  });

  describe("Get Item", function () {
    it("Should return the correct item details", async function () {
      const createItemTx = await nftMarketplace.createItem("https://example.com/token/1", ethers.utils.parseEther("1"));
      await createItemTx.wait();
      const item = await nftMarketplace.getItem(1);
      expect(item.id.toString()).to.equal('1');
      expect(item.creator).to.equal(owner.address);
      expect(item.uri).to.equal("https://example.com/token/1");
      expect(item.price.toString()).to.equal(ethers.utils.parseEther("1").toString());
      expect(item.sold).to.be.false;
    });
  });

  describe("Get Items Sold", function () {
    it("Should return the correct number of items sold", async function () {
      const createItemTx = await nftMarketplace.createItem("https://example.com/token/1", ethers.utils.parseEther("1"));
      await createItemTx.wait();
      await nftMarketplace.connect(addr1).buyItem(1, { value: ethers.utils.parseEther("1") });
      const itemsSold = await nftMarketplace.getItemsSold();
      expect(itemsSold.toString()).to.equal('1');
    });
  });
});
