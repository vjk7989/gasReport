async function main() {
    const [deployer] = await ethers.getSigners();
  
    console.log("Deploying contracts with the account:", deployer.address);
  
    const balance = await deployer.getBalance();
    console.log("Account balance:", balance.toString());
  
    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    const nftMarketplace = await NFTMarketplace.deploy();
  
    await nftMarketplace.deployed();
    console.log("NFTMarketplace address:", nftMarketplace.address);
  }
  
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
  