use anchor_lang::prelude::*;

declare_id!("3tWipTxd8Nbaqrozw3asMma3j5h1vVuwEkWJgzssPvZH");

#[program]
pub mod verify_ai {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let authority = &ctx.accounts.authority;
        let global_state = &mut ctx.accounts.global_state;

        global_state.authority = authority.key();
        global_state.registered_models_count = 0;
        global_state.verified_contents_count = 0;

        Ok(())
    }

    pub fn register_ai_model(
        ctx: Context<RegisterAIModel>,
        model_name: String,
        model_version: String,
        model_provider: String,
        verification_method: VerificationMethod,
    ) -> Result<()> {
        let ai_model = &mut ctx.accounts.ai_model;
        let global_state = &mut ctx.accounts.global_state;
        let authority = &ctx.accounts.authority;

        // Ensure only the authority can register models
        require!(
            global_state.authority == authority.key(),
            ErrorCode::Unauthorized
        );

        ai_model.name = model_name;
        ai_model.version = model_version;
        ai_model.provider = model_provider;
        ai_model.verification_method = verification_method;
        ai_model.verified_content_count = 0;
        ai_model.authority = authority.key();
        ai_model.created_at = Clock::get()?.unix_timestamp;

        global_state.registered_models_count += 1;

        Ok(())
    }

    pub fn register_content(
        ctx: Context<RegisterContent>,
        content_hash: [u8; 32],
        content_type: ContentType,
        content_metadata: String,
        model_pubkey: Pubkey,
    ) -> Result<()> {
        let content = &mut ctx.accounts.content;
        let ai_model = &mut ctx.accounts.ai_model;
        let creator = &ctx.accounts.creator;

        content.hash = content_hash;
        content.content_type = content_type;
        content.metadata = content_metadata;
        content.model = model_pubkey;
        content.creator = creator.key();
        content.verified = false;
        content.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn verify_content(
        ctx: Context<VerifyContent>,
        verification_proof: Vec<u8>,
    ) -> Result<()> {
        let content = &mut ctx.accounts.content;
        let ai_model = &mut ctx.accounts.ai_model;
        let authority = &ctx.accounts.authority;
        let global_state = &mut ctx.accounts.global_state;

        // Ensure only the model authority can verify content
        require!(
            ai_model.authority == authority.key(),
            ErrorCode::Unauthorized
        );

        // Verify the content based on the model's verification method
        match ai_model.verification_method {
            VerificationMethod::Signature => {
                // Implement signature verification logic
                // For demonstration purposes, we'll just mark it as verified
                content.verified = true;
            },
            VerificationMethod::Watermark => {
                // Implement watermark verification logic
                content.verified = true;
            },
            VerificationMethod::HashMatch => {
                // Implement hash verification logic
                content.verified = true;
            },
        }

        content.verification_proof = verification_proof;
        content.verified_at = Clock::get()?.unix_timestamp;
        
        if content.verified {
            ai_model.verified_content_count += 1;
            global_state.verified_contents_count += 1;
        }

        Ok(())
    }
    
    pub fn challenge_verification(
        ctx: Context<ChallengeVerification>,
        challenge_reason: String,
        evidence_hash: [u8; 32],
    ) -> Result<()> {
        let content = &mut ctx.accounts.content;
        let challenger = &ctx.accounts.challenger;
        let challenge = &mut ctx.accounts.challenge;
        
        // Content must be verified to be challenged
        require!(content.verified, ErrorCode::ContentNotVerified);

        challenge.content = content.key();
        challenge.challenger = challenger.key();
        challenge.reason = challenge_reason;
        challenge.evidence_hash = evidence_hash;
        challenge.status = ChallengeStatus::Pending;
        challenge.created_at = Clock::get()?.unix_timestamp;

        Ok(())
    }

    pub fn resolve_challenge(
        ctx: Context<ResolveChallenge>,
        resolution: ChallengeResolution,
        resolution_notes: String,
    ) -> Result<()> {
        let challenge = &mut ctx.accounts.challenge;
        let content = &mut ctx.accounts.content;
        let ai_model = &mut ctx.accounts.ai_model;
        let authority = &ctx.accounts.authority;
        let global_state = &mut ctx.accounts.global_state;

        // Ensure only the model authority can resolve challenges
        require!(
            ai_model.authority == authority.key(),
            ErrorCode::Unauthorized
        );

        // Store the resolution type before moving it
        let is_upheld = resolution == ChallengeResolution::Upheld;
        
        challenge.status = ChallengeStatus::Resolved;
        challenge.resolution = Some(resolution);
        challenge.resolution_notes = resolution_notes;
        challenge.resolved_at = Clock::get()?.unix_timestamp;

        // Now use the stored boolean instead of the moved value
        if is_upheld {
            content.verified = false;
            if global_state.verified_contents_count > 0 {
                global_state.verified_contents_count -= 1;
            }
            if ai_model.verified_content_count > 0 {
                ai_model.verified_content_count -= 1;
            }
        }

        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = 8 + GlobalState::SIZE
    )]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterAIModel<'info> {
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        init,
        payer = authority,
        space = 8 + AIModel::SIZE
    )]
    pub ai_model: Account<'info, AIModel>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct RegisterContent<'info> {
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        init,
        payer = creator,
        space = 8 + Content::SIZE
    )]
    pub content: Account<'info, Content>,
    
    #[account(mut)]
    pub ai_model: Account<'info, AIModel>,
    
    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyContent<'info> {
    #[account(mut)]
    pub content: Account<'info, Content>,
    
    #[account(
        mut,
        constraint = content.model == ai_model.key() @ ErrorCode::ModelMismatch
    )]
    pub ai_model: Account<'info, AIModel>,
    
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        constraint = ai_model.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub authority: Signer<'info>,
}

#[derive(Accounts)]
pub struct ChallengeVerification<'info> {
    #[account(
        mut,
        constraint = content.verified @ ErrorCode::ContentNotVerified
    )]
    pub content: Account<'info, Content>,
    
    #[account(
        init,
        payer = challenger,
        space = 8 + VerificationChallenge::SIZE
    )]
    pub challenge: Account<'info, VerificationChallenge>,
    
    #[account(mut)]
    pub challenger: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct ResolveChallenge<'info> {
    #[account(mut)]
    pub challenge: Account<'info, VerificationChallenge>,
    
    #[account(
        mut,
        constraint = challenge.content == content.key() @ ErrorCode::ContentMismatch
    )]
    pub content: Account<'info, Content>,
    
    #[account(
        mut,
        constraint = content.model == ai_model.key() @ ErrorCode::ModelMismatch
    )]
    pub ai_model: Account<'info, AIModel>,
    
    #[account(mut)]
    pub global_state: Account<'info, GlobalState>,
    
    #[account(
        constraint = ai_model.authority == authority.key() @ ErrorCode::Unauthorized
    )]
    pub authority: Signer<'info>,
}

#[account]
pub struct GlobalState {
    pub authority: Pubkey,
    pub registered_models_count: u64,
    pub verified_contents_count: u64,
}

#[account]
pub struct AIModel {
    pub name: String,
    pub version: String,
    pub provider: String,
    pub verification_method: VerificationMethod,
    pub verified_content_count: u64,
    pub authority: Pubkey,
    pub created_at: i64,
}

#[account]
pub struct Content {
    pub hash: [u8; 32],
    pub content_type: ContentType,
    pub metadata: String,
    pub model: Pubkey,
    pub creator: Pubkey,
    pub verified: bool,
    pub verification_proof: Vec<u8>,
    pub created_at: i64,
    pub verified_at: i64,
}

#[account]
pub struct VerificationChallenge {
    pub content: Pubkey,
    pub challenger: Pubkey,
    pub reason: String,
    pub evidence_hash: [u8; 32],
    pub status: ChallengeStatus,
    pub resolution: Option<ChallengeResolution>,
    pub resolution_notes: String,
    pub created_at: i64,
    pub resolved_at: i64,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum VerificationMethod {
    Signature,
    Watermark,
    HashMatch,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ContentType {
    Image,
    Video, 
    Audio,
    Text,
    Other,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ChallengeStatus {
    Pending,
    Resolved,
}

#[derive(AnchorSerialize, AnchorDeserialize, Clone, PartialEq, Eq)]
pub enum ChallengeResolution {
    Upheld,   // Challenge was valid, content verification revoked
    Rejected, // Challenge was invalid, content verification stands
}

#[error_code]
pub enum ErrorCode {
    #[msg("You are not authorized to perform this action")]
    Unauthorized,
    #[msg("Content is not associated with the specified model")]
    ModelMismatch,
    #[msg("Challenge is not associated with the specified content")]
    ContentMismatch,
    #[msg("Content must be verified before it can be challenged")]
    ContentNotVerified,
}

// Constants for account sizes
impl GlobalState {
    pub const SIZE: usize = 32 + 8 + 8; // authority + 2 counters
}

impl AIModel {
    pub const SIZE: usize = 100 + 50 + 100 + 1 + 8 + 32 + 8; // name + version + provider + verification_method + count + authority + timestamp
}

impl Content {
    pub const SIZE: usize = 32 + 1 + 200 + 32 + 32 + 1 + 200 + 8 + 8; // hash + type + metadata + model + creator + verified + proof + timestamps
}

impl VerificationChallenge {
    pub const SIZE: usize = 32 + 32 + 200 + 32 + 1 + 1 + 200 + 8 + 8; // content + challenger + reason + evidence + status + resolution + notes + timestamps
}