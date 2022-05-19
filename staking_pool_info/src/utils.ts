import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { Connection, PublicKey } from "@solana/web3.js";
import BN from "bn.js";
import { PoolLayout, POOL_ACCOUNT_DATA_LAYOUT, StakeInterestLayout, STAKE_INTEREST_DATA_LAYOUT } from "./layout";

export const getTokenDecimal = async (data: { connection: Connection, contractAddress: string; }): Promise<number> => {
  const myMint = new PublicKey(data.contractAddress);
  const largest = await data.connection.getTokenLargestAccounts(myMint, 'processed');
  const decimals = largest.value[0].decimals;
  return decimals;
}

export const getRateAccountList = async (data: { connection: Connection, firstRateAddress: string; }) => {
  let rate = [];
  let interest = await data.connection.getAccountInfo(new PublicKey(data.firstRateAddress));
  let interestDecode = STAKE_INTEREST_DATA_LAYOUT.decode(interest?.data) as StakeInterestLayout;
  let interestData = {
    rateAccount: data.firstRateAddress,
    nextAccount: new PublicKey(interestDecode.nextPubkey).toBase58(),
    unixTimestamp: new BN(interestDecode.unixTimestamp, 10, "le").toNumber(),
    interestRate: toInterestString(new BN(interestDecode.interestRate, 10, "le")),
  }
  rate.push(interestData);
  while (interestData.nextAccount != TOKEN_PROGRAM_ID.toBase58()) {
    interest = await data.connection.getAccountInfo(new PublicKey(interestData.nextAccount));
    interestDecode = STAKE_INTEREST_DATA_LAYOUT.decode(interest?.data) as StakeInterestLayout;
    interestData = {
      rateAccount: interestData.nextAccount,
      nextAccount: new PublicKey(interestDecode.nextPubkey).toBase58(),
      unixTimestamp: new BN(interestDecode.unixTimestamp, 10, "le").toNumber(),
      interestRate: toInterestString(new BN(interestDecode.interestRate, 10, "le")),
    }
    rate.push(interestData);
  }
  return rate;
}

export const toNative = (amount: number, decimals: number): BigInt => {
  return BigInt(mul10(amount.toString(), decimals));
}

export const toString = (amount: BN, decimals: number): string => {
  return parseFloat(div10(amount.toString(), decimals)).toString();
}

export const numberToString = (amount: number, decimals: number): string => {
  return parseFloat(div10(amount.toString(), decimals)).toString();
}

export const toInterest = (amount: number): BigInt => {
  return BigInt(mul10(amount.toString(), 5));
}

export const toInterestString = (amount: BN): string => {
  return parseFloat(div10(amount.toString(), 5)).toString();
}

export const div10 = (amount: string, decimal: number): string => {
  var arr = [...amount];
  if (!arr.includes('.')) {
    arr.splice(arr.length, 0, '.');
  }
  while (decimal > 0) {
    var idx = arr.indexOf('.');
    if (idx === 0) {
      arr.splice(0, 0, '0');
    }
    else {
      decimal--;
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
    }
  }
  var idx = arr.indexOf('.');
  if (idx === 0) {
    arr.splice(0, 0, '0');
  }
  return arr.join('');
}

export const mul10 = (amount: string, decimal: number): string => {
  var arr = [...amount];
  while (decimal > 0) {
    var idx = arr.indexOf('.');
    if (idx === -1) {
      arr.splice(arr.length, 0, '0');
    }
    else {
      if (idx === arr.length - 1) {
        arr.splice(arr.length, 1, '0');
      }
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
    }
    decimal--;
  }
  var idx = arr.indexOf('.');
  if (idx === arr.length - 1) {
    arr.splice(arr.length - 1, 1);
  }
  return arr.join('');
}

export const getProgramAccounts = async (connection: Connection, programId: PublicKey, filters: any) => {
  return await connection.getProgramAccounts(programId, {
    commitment: connection.commitment,
    filters,
    encoding: 'base64',
  });
}

export const getAssociatedTokenAddressAndBumpSeed = (walletPubkey: PublicKey, mintPubkey: PublicKey, programId: PublicKey) => {
  return PublicKey.findProgramAddress([walletPubkey.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mintPubkey.toBuffer()], programId);
}

export const createConnection = (data: { api?: string }) => {
  if (data.api) {
    return new Connection(data.api, 'confirmed');
  } else {
    return new Connection('mainnet-beta', 'confirmed');
  }
}

export const getPoolInfo = async (api: string, poolPublickey: string, decimals: number) => {
  const connection = createConnection({ api });
  const poolAccount = await connection.getAccountInfo(new PublicKey(poolPublickey));
  const decodedPoolState = POOL_ACCOUNT_DATA_LAYOUT.decode(poolAccount.data) as PoolLayout;

  const temp = {
    poolAddress: poolPublickey,
    mintAddress: new PublicKey(decodedPoolState.mintAddress).toBase58(),
    depositAddress: new PublicKey(decodedPoolState.depositAddress).toBase58(),
    authorityAddress: new PublicKey(decodedPoolState.initializerPubkey).toBase58(),
    createdTime: new BN(decodedPoolState.createdTime, 10, "le").toString(),
    lastActivity: new BN(decodedPoolState.lastActivity, 10, "le").toString(),
    totalStakeholder: new BN(decodedPoolState.totalStakeholder, 10, "le").toString(),
    minStakeValue: toString(new BN(decodedPoolState.minStakeValue, 10, "le"), decimals),
    maxStakeValue: toString(new BN(decodedPoolState.maxStakeValue, 10, "le"), decimals),
    totalValueLock: toString(new BN(decodedPoolState.totalValueLock, 10, "le"), decimals).toString(),
    poolInterestRateAddress: new PublicKey(decodedPoolState.poolInterestRateAddress).toBase58(),
    rate: Array<any>(),
    tiers: Array<any>()
  }
  let tier1Min = toString(new BN(decodedPoolState.tier1MinAmount, 10, "le"), decimals);
  let tier2Min = toString(new BN(decodedPoolState.tier2MinAmount, 10, "le"), decimals);
  let tier3Min = toString(new BN(decodedPoolState.tier3MinAmount, 10, "le"), decimals);
  let tier4Min = toString(new BN(decodedPoolState.tier4MinAmount, 10, "le"), decimals);
  let tier5Min = toString(new BN(decodedPoolState.tier5MinAmount, 10, "le"), decimals);
  let tier6Min = toString(new BN(decodedPoolState.tier6MinAmount, 10, "le"), decimals);
  tier1Min != "0" ? temp.tiers?.push({ name: 1, minValue: tier1Min, ratio: toInterestString(new BN(decodedPoolState.tier1Ratio, 10, "le")) }) : "";
  tier2Min != "0" ? temp.tiers?.push({ name: 2, minValue: tier2Min, ratio: toInterestString(new BN(decodedPoolState.tier2Ratio, 10, "le")) }) : "";
  tier3Min != "0" ? temp.tiers?.push({ name: 3, minValue: tier3Min, ratio: toInterestString(new BN(decodedPoolState.tier3Ratio, 10, "le")) }) : "";
  tier4Min != "0" ? temp.tiers?.push({ name: 4, minValue: tier4Min, ratio: toInterestString(new BN(decodedPoolState.tier4Ratio, 10, "le")) }) : "";
  tier5Min != "0" ? temp.tiers?.push({ name: 5, minValue: tier5Min, ratio: toInterestString(new BN(decodedPoolState.tier5Ratio, 10, "le")) }) : "";
  tier6Min != "0" ? temp.tiers?.push({ name: 6, minValue: tier6Min, ratio: toInterestString(new BN(decodedPoolState.tier6Ratio, 10, "le")) }) : "";

  temp.rate = await getRateAccountList({connection, firstRateAddress: temp.poolInterestRateAddress});

  return temp;
}

export const parseError = (err: string) => {
  const splt = err.split("custom program error:");
  const errorIndex = parseInt(splt[1]);
  let rtn = err;
  switch (errorIndex) {
    default:
      break;
    case 0:
      rtn = "Your instruction is invalid, please contact support";
      break;
    case 1:
      rtn = "Token program is invalid, please contact support";
      break;
    case 2:
      rtn = "Error: Not rent exempt";
      break;
    case 3:
      rtn = "Error: Expected amount mismatch";
      break;
    case 4:
      rtn = "Error: You don't have permission to update data";
      break;
    case 5:
      rtn = "Error: Not request withdrawal";
      break;
    case 6:
      rtn = "Error: Already request withdrawal";
      break;
    case 7:
      rtn = "Error: Waiting withdrawal";
      break;
    case 8:
      rtn = "You don't have any staking reward, please try again later";
      break;
    case 9:
      rtn = "Error: You still have some staking reward, please try to withdraw it first";
      break;
    case 10:
      rtn = "Error: Invalid authority info";
      break;
    case 11:
      rtn = "Error: Invalid pool address";
      break;
    case 12:
      rtn = "Error: Invalid staking amount";
      break;
    case 13:
      rtn = "Error: Max locked value is reached";
      break;
    case 14:
      rtn = "Error: Pool not initialized";
      break;
    case 15:
      rtn = "Error: Incorrect pool deposit address";
      break;
    case 16:
      rtn = "Error: Incorrect withdrawal address";
      break;
    case 17:
      rtn = "Error: Insufficient Amount";
      break;
    case 18:
      rtn = "Less than minimum amount";
      break;
    case 19:
      rtn = "Error: Invalid initializer";
      break;
    case 20:
      rtn = "Error: Rate account list is incorrect";
      break;
    case 21:
      rtn = "Error: End rate account list is incorrect";
      break;
    case 22:
      rtn = "Error: Amount overflow";
      break;
    case 23:
      rtn = "Error: Invalid last payment";
      break;
    case 24:
      rtn = "Error: Invalid time for new rate account";
      break;
  }
  return rtn;
}