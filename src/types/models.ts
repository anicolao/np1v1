import { ObjectId } from 'mongodb';

/**
 * Player model interface
 */
export interface Player {
  _id?: ObjectId;
  discordId: string;
  username: string;
  rating: number;
  ratingDeviation: number;
  lastPlayedDate: Date;
  createdAt: Date;
}

/**
 * Game model interface
 */
export interface Game {
  _id?: ObjectId;
  password: string;
  tournamentId?: ObjectId;
  leagueMonth?: string; // YYYY-MM format
  team1: ObjectId[]; // array of player IDs for team 1
  team2: ObjectId[]; // array of player IDs for team 2
  winnerId?: ObjectId;
  status: GameStatus;
  createdAt: Date;
  completedAt?: Date;
}

/**
 * Game status enumeration
 */
export enum GameStatus {
  CREATED = 'created',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

/**
 * Tournament model interface
 */
export interface Tournament {
  _id?: ObjectId;
  name: string;
  startDate: Date;
  signupDeadline: Date;
  status: TournamentStatus;
  bracketData: BracketData;
  participants: TournamentParticipant[];
}

/**
 * Tournament status enumeration
 */
export enum TournamentStatus {
  SIGNUP = 'signup',
  ACTIVE = 'active',
  COMPLETED = 'completed',
}

/**
 * Tournament bracket data structure
 */
export interface BracketData {
  rounds: BracketRound[];
  totalRounds: number;
  currentRound: number;
}

/**
 * Tournament bracket round
 */
export interface BracketRound {
  roundNumber: number;
  matches: BracketMatch[];
}

/**
 * Tournament bracket match
 */
export interface BracketMatch {
  matchId: ObjectId;
  player1Id?: ObjectId;
  player2Id?: ObjectId;
  winnerId?: ObjectId;
  gameId?: ObjectId;
  isBye: boolean;
}

/**
 * Tournament participant
 */
export interface TournamentParticipant {
  playerId: ObjectId;
  seedPosition: number;
  eliminatedInRound?: number;
}

/**
 * League participation
 */
export interface LeagueParticipation {
  _id?: ObjectId;
  playerId: ObjectId;
  monthYear: string; // YYYY-MM format
  optedInDate: Date;
}