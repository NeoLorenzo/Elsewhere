import { random, clamp, addLog, checkAchievements } from './engine.js';
import { createBlackjack, blackjackMove, createEscape, escapeMove, handValue } from './minigames.js';
import { ensureCharacter, reconcileCharacter } from './character.js';

const money = n => `$${Math.round(n).toLocaleString('en-US')}`;

export function currentGame(state) {
  const session=state.minigame;
  if(!session) return null;
  let game=session.kind==='blackjack'?createBlackjack(session.seed):createEscape(session.seed);
  for(const move of session.moves) {
    if(game.status!=='playing')throw new Error('This game has already ended.');
    game=session.kind==='blackjack'?blackjackMove(game,move):escapeMove(game,move);
  }
  return game;
}

function finish(state,game,forfeit=false) {
  ensureCharacter(state, { seed: state.seed });
  const beforeStats = { ...state.stats };
  const session=state.minigame;
  const kind=session.kind;
  let message;
  if(kind==='blackjack') {
    const result=forfeit?'lose':game.result;
    const natural=!forfeit&&result==='win'&&game.player.length===2&&handValue(game.player)===21;
    const payout=result==='push'?session.bet:result==='win'?Math.round(session.bet*(natural?2.5:2)):0;
    state.cash+=payout;
    state.stats.happiness=clamp(state.stats.happiness+(result==='win'?5:result==='lose'?-3:0));
    if(result==='win')state.flags.gamblingWins=(state.flags.gamblingWins||0)+1;
    message=forfeit?`You left the table and forfeited your ${money(session.bet)} stake.`:result==='push'?`A push. Your ${money(session.bet)} stake was returned.`:result==='win'?`${natural?'Blackjack! ':''}You won ${money(payout-session.bet)}. ${money(payout)} was returned to your balance.`:`The house won. You lost your ${money(session.bet)} stake.`;
    addLog(state,'finance','At the blackjack table',message);
  } else {
    const won=!forfeit&&game.status==='won';
    if(won) {
      state.prison.years=0;state.flags.released=true;state.flags.escaped=true;
      state.prison.heat=clamp(state.prison.heat+30);state.stats.happiness=clamp(state.stats.happiness+10);state.stats.karma=clamp(state.stats.karma-5);
      message='You reached the exit and escaped. You are free, but the authorities are searching for you.';
    } else {
      state.prison.years+=3;state.stats.health=clamp(state.stats.health-12);state.stats.happiness=clamp(state.stats.happiness-10);
      message=`${forfeit?'You abandoned the escape and were discovered.':'The guard caught you.'} Three years were added to your sentence.`;
    }
    addLog(state,'crime','An escape attempt',message);
    reconcileCharacter(state, beforeStats);
    if(state.stats.health<=0){state.alive=false;state.causeOfDeath='injuries following an escape attempt';addLog(state,'life','A life remembered',`I died at age ${state.age} from ${state.causeOfDeath}.`);}
  }
  state.minigame=null;
  checkAchievements(state);
  return {state,game,kind,ok:true,message,settled:true};
}

/** Stake and yearly allowance are committed before any cards or map are shown. */
export function beginMiniGame(input,kind,payload={}) {
  const state=structuredClone(input);
  try {
    if(!['blackjack','escape'].includes(kind))throw new Error('Choose a valid game.');
    if(!state.alive)throw new Error('This life has ended.');
    if(state.pendingEvent)throw new Error('Resolve your current life event first.');
    if(state.minigame)throw new Error('Finish your current game first.');
    const id=kind==='blackjack'?'finance:blackjack':'crime:escape';
    const cap=kind==='blackjack'?3:1;
    state.actionCounts||={};state.flags||={};
    if((state.actionCounts[id]||0)>=cap||(state.actionCounts.__total||0)>=100)throw new Error('You have used this year’s allowance. Age up to continue.');
    let bet=0;
    if(kind==='blackjack') {
      if(state.age<18||state.prison.years>0)throw new Error('The casino is available to free adults.');
      bet=payload.amount===undefined?Math.min(100,state.cash):Number(payload.amount);
      if(!Number.isFinite(bet)||!Number.isInteger(bet)||bet<10||bet>1000000)throw new Error('Choose a whole-dollar stake between $10 and $1,000,000.');
      if(bet>state.cash)throw new Error('You do not have enough cash for that stake.');
      state.cash-=bet;
    } else if(state.prison.years<=0)throw new Error('You are not in prison.');
    state.minigame={kind,seed:Math.floor(random(state)*0x100000000)>>>0,bet,moves:[]};
    state.actionCounts[id]=(state.actionCounts[id]||0)+1;state.actionCounts.__total=(state.actionCounts.__total||0)+1;
    const game=currentGame(state);
    if(game.status!=='playing')return finish(state,game);
    addLog(state,kind==='blackjack'?'finance':'crime',kind==='blackjack'?'Cards on the table':'A way out',kind==='blackjack'?`I staked ${money(bet)} on a hand of blackjack.`:'I began an escape attempt. Each step would matter.');
    return {state,game,kind,ok:true,settled:false,message:kind==='blackjack'?'Your cards are dealt.':'Find your way past the guard.'};
  }catch(error){return {state:structuredClone(input),ok:false,message:error.message};}
}

export function advanceMiniGame(input,move) {
  const state=structuredClone(input);
  try {
    if(!state.alive||!state.minigame)throw new Error('There is no active game.');
    if(move==='forfeit')return finish(state,null,true);
    const session=state.minigame;
    if(session.moves.length>=200)throw new Error('The move limit was reached. Leave the game to continue.');
    if(!(session.kind==='blackjack'?['hit','stand']:['up','down','left','right']).includes(move))throw new Error('Choose a valid move.');
    const before=currentGame(state);
    const game=session.kind==='blackjack'?blackjackMove(before,move):escapeMove(before,move);
    // Moving into a wall does not spend a turn or pollute a saved solution.
    if(session.kind==='escape'&&game.moves===before.moves)return {state,game,kind:session.kind,ok:true,settled:false,message:'A wall blocks that direction.'};
    session.moves.push(move);
    if(game.status!=='playing')return finish(state,game);
    return {state,game,kind:session.kind,ok:true,settled:false,message:''};
  }catch(error){return {state:structuredClone(input),ok:false,message:error.message};}
}
