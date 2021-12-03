import { gql } from "@apollo/client";

export const FETCH_ALL_POOLS = gql`
  query (
    $orderBy: BigInt
    $orderDirection: String
    $first: BigInt
    $skip: BigInt
  ) {
    pools(
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      id
      status
      startTime
      endTime
      entryCount
      entryFee
      token
    }
  }
`;

export const FECTH_STATUS_POOL = gql`
  query (
    $status: String
    $orderBy: BigInt
    $orderDirection: String
    $first: BigInt
    $skip: BigInt
  ) {
    pools(
      where: { status: $status }
      orderBy: $orderBy
      orderDirection: $orderDirection
      first: $first
      skip: $skip
    ) {
      id
      status
      startTime
      endTime
      entryCount
      entryFee
      token
    }
  }
`;

export const FETCH_ID_POOL = gql`
  query ($poolId: String) {
    pools(where: { id: $poolId }) {
      id
      status
      startTime
      endTime
      entryCount
      entryFee
      token
    }
  }
`;
