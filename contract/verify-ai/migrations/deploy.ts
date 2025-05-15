const anchor = require("@coral-xyz/anchor");
const { PublicKey } = require("@solana/web3.js");

module.exports = async function (provider) {
  // Configure client to use the provider
  anchor.setProvider(provider);

  // Deploy the program
  const program = anchor.workspace.VerifyAi;
  console.log("Program ID:", program.programId.toString());

  // Create a new account for GlobalState
  const globalState = anchor.web3.Keypair.generate();
  console.log("Global State account:", globalState.publicKey.toString());

  try {
    // Initialize the program with the GlobalState account
    const tx = await program.methods
      .initialize()
      .accounts({
        globalState: globalState.publicKey,
        authority: provider.wallet.publicKey,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([globalState])
      .rpc();

    console.log("Transaction signature:", tx);
    console.log("Program initialized successfully!");
    
    // You can store the GlobalState pubkey for future interactions
    console.log("Make sure to save the Global State address for future use:", globalState.publicKey.toString());
  } catch (error) {
    console.error("Error during deployment:", error);
  }
};