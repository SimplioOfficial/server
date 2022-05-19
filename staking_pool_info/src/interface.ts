export interface Stake {
  amount: number;
  contractAddress: string;
  lastPayment: number;
  poolAccount: string;
  stakingAccount: string;
  stakingOwner: string;
  startTime: number;
  withdrawAccount: string;
}

export interface InterestRate {
  StartedTime: number;
  Rate: number;
}

export interface Pool {
  poolAddress: string,
  mintAddress: string,
  depositAddress: string,
  authorityAddress: string,
  createdTime: number,
  lastActivity: number,
  totalStakeholder: number,
  minStakeValue: number,
  maxStakeValue: number,
  totalValueLock: number,
  poolInterestRateAddress: number,
  rate: Array<any>,
  tiers: Array<any>
}