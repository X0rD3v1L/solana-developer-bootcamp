import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Project1Favourites } from "../target/types/project_1_favourites";

async function main() {
  // Configure the client to use the local cluster
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  // Get the program
  const program = anchor.workspace.Project1Favourites as Program<Project1Favourites>;
  
  // Get the user (wallet) public key
  const user = provider.wallet.publicKey;

  // Derive the PDA for favourites
  const [favouritesPda] = await anchor.web3.PublicKey.findProgramAddress(
    [Buffer.from("favourites"), user.toBuffer()],
    program.programId
  );

  try {
    // Invoke the set_favourites method
    const tx = await program.methods
      .setFavourites(
        new anchor.BN(42),        // number
        "Blue",                   // color
        ["Reading", "Coding"]     // hobbies
      )
      .accounts({
        user: user,
        favourites: favouritesPda,
        systemProgram: anchor.web3.SystemProgram.programId
      })
      .rpc();

    console.log("Transaction successful!");
    console.log("Transaction signature:", tx);

    // Fetch the account to verify
    const favouritesAccount = await program.account.favourites.fetch(favouritesPda);
    console.log("Stored Favourites:", favouritesAccount);
  } catch (err) {
    console.error("Error setting favourites:", err);
  }
}

main().catch(console.error);