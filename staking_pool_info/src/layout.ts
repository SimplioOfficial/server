import * as BufferLayout from "@solana/buffer-layout";

/**
 * Layout for a public key
 */
const publicKey = (property = "publicKey") => {
  return BufferLayout.blob(32, property);
};

/**
 * Layout for a 64bit unsigned value
 */
const uint64 = (property = "uint64") => {
  return BufferLayout.blob(8, property);
};

/**
 * Layout for a 64bit unsigned value
 */
 const int64 = (property = "int64") => {
  return BufferLayout.blob(8, property);
};

export const STAKE_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("initializerPubkey"),
  publicKey("poolPubkey"),
  publicKey("withdrawPubkey"),
  uint64("amount"),
  uint64("lastPayment"),
  uint64("startSlot"),
  uint64("startTime"),
]);

export interface StakingLayout {
  isInitialized: number,
  initializerPubkey: Uint8Array,
  poolPubkey: Uint8Array,
  withdrawPubkey: Uint8Array,
  amount: Uint8Array,
  lastPayment: Uint8Array,
  startSlot: Uint8Array,
  startTime: Uint8Array
}

export const STAKE_INTEREST_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("initializerPubkey"),
  publicKey("poolPubkey"),
  publicKey("nextPubkey"),
  uint64("unixTimestamp"),
  uint64("interestRate"),
]);

export interface StakeInterestLayout {
  isInitialized: number,
  initializerPubkey: Uint8Array,
  poolPubkey: Uint8Array,
  nextPubkey: Uint8Array,
  unixTimestamp: Uint8Array,
  interestRate: Uint8Array
}

export const POOL_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("initializerPubkey"),
  publicKey("depositAddress"),
  publicKey("mintAddress"),
  publicKey("poolInterestRateAddress"),
  uint64("createdSlot"),
  uint64("createdTime"),
  uint64("lastActivity"),
  uint64("totalStakeholder"),
  uint64("totalValueLock"),
  uint64("minStakeValue"),
  uint64("maxStakeValue"),
  uint64("tier1MinAmount"),
  uint64("tier1Ratio"),
  uint64("tier2MinAmount"),
  uint64("tier2Ratio"),
  uint64("tier3MinAmount"),
  uint64("tier3Ratio"),
  uint64("tier4MinAmount"),
  uint64("tier4Ratio"),
  uint64("tier5MinAmount"),
  uint64("tier5Ratio"),
  uint64("tier6MinAmount"),
  uint64("tier6Ratio"),
]);

export interface PoolLayout {
  isInitialized: number,
  initializerPubkey: Uint8Array,
  depositAddress: Uint8Array,
  mintAddress: Uint8Array,
  poolInterestRateAddress: Uint8Array,
  createdSlot: Uint8Array,
  createdTime: Uint8Array,
  lastActivity: Uint8Array
  totalStakeholder: Uint8Array,
  totalValueLock: Uint8Array,
  minStakeValue: Uint8Array,
  maxStakeValue: Uint8Array,
  tier1MinAmount: Uint8Array,
  tier1Ratio: Uint8Array,
  tier2MinAmount: Uint8Array,
  tier2Ratio: Uint8Array,
  tier3MinAmount: Uint8Array,
  tier3Ratio: Uint8Array,
  tier4MinAmount: Uint8Array,
  tier4Ratio: Uint8Array,
  tier5MinAmount: Uint8Array,
  tier5Ratio: Uint8Array,
  tier6MinAmount: Uint8Array,
  tier6Ratio: Uint8Array,
}

export const LIQUIDITY_ACCOUNT_DATA_LAYOUT = BufferLayout.struct([
  BufferLayout.u8("isInitialized"),
  publicKey("initializerPubkey"),
  publicKey("poolPubkey"),
  publicKey("mintPubkey"),
  publicKey("depositPubkey"),
  publicKey("withdrawPubkey"),
  uint64("createdTime"),
  uint64("lastActivity"),
  uint64("amount"),
]);

export interface LiquidityLayout {
  isInitialized: number,
  initializerPubkey: Uint8Array,
  poolPubkey: Uint8Array,
  mintPubkey: Uint8Array,
  depositPubkey: Uint8Array,
  withdrawPubkey: Uint8Array,
  createdTime: Uint8Array,
  lastActivity: Uint8Array,
  amount: Uint8Array,
}

export const STAKE_DATA_SIZE = 129;
export const POOL_DATA_SIZE = 281;
export const LIQUIDITY_DATA_SIZE = 185;
export const RATE_DATA_SIZE = 113;