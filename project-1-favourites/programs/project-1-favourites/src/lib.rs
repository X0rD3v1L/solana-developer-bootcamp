use anchor_lang::prelude::*;

declare_id!("UjCwzgcxGLtLd5Jx9H9qvD5piuJYY9Lt2cEw2zz8FZS");

#[program]
pub mod project_1_favourites {
    use super::*;

    pub fn set_favourites(ctx: Context<SetFavourites>, number: u64, color: String, hobbies: Vec<String>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        msg!("User {user_public_key}'s favourite number is {number}");
        
        ctx.accounts.favourites.number = number;
        ctx.accounts.favourites.color = color;
        ctx.accounts.favourites.hobbies = hobbies;

        Ok(())
    }
}

#[derive(InitSpace)]
#[account]
pub struct Favourites {
    pub number: u64,
    #[max_len(50)]
    pub color: String,
    #[max_len(5, 50)]
    pub hobbies: Vec<String>
}

#[derive(Accounts)]
pub struct SetFavourites<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init_if_needed,
        payer = user,
        space = 8 + Favourites::INIT_SPACE,
        seeds = [b"favourites", user.key().as_ref()],
        bump
    )]
    pub favourites: Account<'info, Favourites>,

    pub system_program: Program<'info, System>
}