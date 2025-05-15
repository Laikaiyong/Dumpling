import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { Program } from '@project-serum/anchor';
import * as anchor from '@project-serum/anchor';
import verifyAiIdl from './idl/verify_ai.json';

// Constants
const VERIFY_AI_PROGRAM_ID = new PublicKey('3tWipTxd8Nbaqrozw3asMma3j5h1vVuwEkWJgzssPvZH');
const SOLANA_RPC_URL = 'https://api.testnet.solana.com';

/**
 * Get connection to Solana network
 * @returns {Connection} Solana connection
 */
export const getConnection = () => {
  return new Connection(SOLANA_RPC_URL);
};

/**
 * Calculate content hash
 * @param {string} content - Content to hash
 * @returns {Uint8Array} - 32 byte hash
 */
export const calculateContentHash = async (content) => {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return new Uint8Array(hashBuffer);
};

/**
 * Initialize the Verify AI program
 * @param {Wallet} wallet - Solana wallet
 * @returns {Program} Anchor program
 */
export const initVerifyAiProgram = (wallet) => {
  const provider = new anchor.AnchorProvider(
    getConnection(),
    wallet,
    { commitment: 'processed' }
  );
  
  return new Program(verifyAiIdl, VERIFY_AI_PROGRAM_ID, provider);
};

/**
 * Find AI model account address
 * @param {string} modelName - AI model name
 * @param {string} modelVersion - AI model version
 * @returns {[PublicKey, number]} PDA and bump
 */
export const findAiModelAddress = async (modelName, modelVersion) => {
  return await PublicKey.findProgramAddressSync(
    [
      Buffer.from('ai_model'),
      Buffer.from(modelName),
      Buffer.from(modelVersion)
    ],
    VERIFY_AI_PROGRAM_ID
  );
};

/**
 * Find content account address
 * @param {Uint8Array} contentHash - Content hash
 * @returns {[PublicKey, number]} PDA and bump
 */
export const findContentAddress = async (contentHash) => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from('content'), Buffer.from(contentHash)],
    VERIFY_AI_PROGRAM_ID
  );
};

/**
 * Find global state address
 * @returns {[PublicKey, number]} PDA and bump
 */
export const findGlobalStateAddress = async () => {
  return await PublicKey.findProgramAddressSync(
    [Buffer.from('global_state')],
    VERIFY_AI_PROGRAM_ID
  );
};

/**
 * Register AI-generated content
 * @param {Program} program - Anchor program
 * @param {PublicKey} wallet - User wallet public key
 * @param {string} content - Content to verify
 * @param {string} modelName - AI model name
 * @param {string} modelVersion - AI model version
 * @param {string} metadata - Additional metadata
 * @returns {Promise<string>} Transaction signature
 */
export const registerContent = async (program, wallet, content, modelName, modelVersion, metadata = "") => {
  try {
    // Calculate content hash
    const contentHash = await calculateContentHash(content);
    
    // Find AI model account
    const [modelPubkey] = await findAiModelAddress(modelName, modelVersion);
    
    // Find content account
    const [contentPubkey, _] = await findContentAddress(contentHash);
    
    // Find global state account
    const [globalState] = await findGlobalStateAddress();
    
    // Register content transaction
    const tx = await program.methods.registerContent(
      Array.from(contentHash),
      { text: {} }, // ContentType.Text
      metadata,
      modelPubkey
    )
    .accounts({
      globalState,
      content: contentPubkey,
      aiModel: modelPubkey,
      creator: wallet,
      systemProgram: SystemProgram.programId,
    })
    .rpc();
    
    return {
      success: true,
      signature: tx,
      contentPubkey
    };
  } catch (error) {
    console.error('Error registering content:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Verify AI-generated content
 * @param {Program} program - Anchor program
 * @param {PublicKey} wallet - User wallet public key
 * @param {string} content - Content to verify
 * @param {PublicKey} contentPubkey - Content account public key
 * @param {string} modelName - AI model name
 * @param {string} modelVersion - AI model version
 * @returns {Promise<Object>} Verification result
 */
export const verifyAiContent = async (program, wallet, content, contentPubkey, modelName, modelVersion) => {
  try {
    // Find AI model account
    const [modelPubkey] = await findAiModelAddress(modelName, modelVersion);
    
    // Find global state account
    const [globalState] = await findGlobalStateAddress();
    
    // Generate verification proof (this would typically be provided by the AI service)
    // In a real implementation, this would be a signature or other cryptographic proof
    // Here we're just using a placeholder
    const encoder = new TextEncoder();
    const verificationProof = encoder.encode(JSON.stringify({
      timestamp: Date.now(),
      walletAddress: wallet.toString(),
      content: content.substring(0, 100) // Include truncated content in proof
    }));
    
    // Verify content transaction
    const tx = await program.methods.verifyContent(
      Buffer.from(verificationProof)
    )
    .accounts({
      content: contentPubkey,
      aiModel: modelPubkey,
      globalState: globalState,
      authority: wallet,
    })
    .rpc();
    
    return {
      success: true,
      signature: tx,
      verified: true
    };
  } catch (error) {
    console.error('Error verifying content:', error);
    return {
      success: false,
      error: error.message,
      verified: false
    };
  }
};

/**
 * Get content verification status
 * @param {Program} program - Anchor program
 * @param {PublicKey} contentPubkey - Content account public key
 * @returns {Promise<Object>} Content verification status
 */
export const getContentVerification = async (program, contentPubkey) => {
  try {
    const contentAccount = await program.account.content.fetch(contentPubkey);
    return {
      success: true,
      verified: contentAccount.verified,
      createdAt: new Date(contentAccount.createdAt * 1000),
      verifiedAt: contentAccount.verifiedAt ? new Date(contentAccount.verifiedAt * 1000) : null,
      model: contentAccount.model.toString(),
      creator: contentAccount.creator.toString()
    };
  } catch (error) {
    console.error('Error getting content verification:', error);
    return {
      success: false,
      error: error.message
    };
  }
};