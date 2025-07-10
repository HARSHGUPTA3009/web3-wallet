async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with:", deployer.address);

    const Wallet = await ethers.getContractFactory("MyWallet");
    const wallet = await Wallet.deploy();
    await wallet.waitForDeployment();

    console.log("MyWallet deployed to:", await wallet.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
