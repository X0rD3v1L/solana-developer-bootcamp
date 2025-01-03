import { BankrunProvider, startAnchor } from "anchor-bankrun";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Voting } from "../target/types/voting";
import { PublicKey } from "@solana/web3.js";
import { expect } from "chai";

const IDL = require('../target/idl/voting.json');
const votingAddress = new PublicKey("DSJf6RZmn8yX2rimybbD3cS5GdYQzipiSAxQ32RTKGFd");

describe("voting", () => {
  let context;
  let provider;
  let votingProgram;

  before(async () => {
    context = await startAnchor("", [{name: "voting", programId: votingAddress}], []);
    provider = new BankrunProvider(context);

    votingProgram = new Program<Voting>(
      IDL,
      provider,
    );
  })
  it("Initialize Pool", async () => {

    await votingProgram.methods.initializePoll(
      new anchor.BN(1),
      "What is your favourite type of peanut butter",
      new anchor.BN(0),
      new anchor.BN(1834732616)
    ).rpc();
    
    const [pollAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8)],
      votingAddress,
    )

    const poll = await votingProgram.account.poll.fetch(pollAddress);

    console.log(poll);

    expect(poll.pollId.toNumber()).to.equal(1);
    expect(poll.description).to.equal("What is your favourite type of peanut butter");
    expect(poll.pollStart.toNumber()).to.be.lessThan(poll.pollEnd.toNumber());

  });

  it("Initializing Candidate", async() => {
    await votingProgram.methods.initializeCandidate(
      "Smooth",
      new anchor.BN(1)
    ).rpc();
    await votingProgram.methods.initializeCandidate(
      "Crunchy",
      new anchor.BN(1)
    ).rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from('Crunchy')],
      votingAddress
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);
    console.log(crunchyCandidate);

    expect(crunchyCandidate.candidateVotes.toNumber()).to.equal(0);

    const [smoothAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from('Smooth')],
      votingAddress
    )

    const smoothCandidate = await votingProgram.account.candidate.fetch(smoothAddress);
    console.log(smoothCandidate);

    expect(smoothCandidate.candidateVotes.toNumber()).to.equal(0);

  })

  it("vote", async () => {
    await votingProgram.methods.vote(
      "Crunchy",
      new anchor.BN(1)
    ).rpc();

    const [crunchyAddress] = PublicKey.findProgramAddressSync(
      [new anchor.BN(1).toArrayLike(Buffer, 'le', 8),Buffer.from('Crunchy')],
      votingAddress
    )

    const crunchyCandidate = await votingProgram.account.candidate.fetch(crunchyAddress);

    expect(crunchyCandidate.candidateVotes.toNumber()).to.equal(1);
    
  })
});
``