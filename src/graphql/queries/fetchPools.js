import { gql } from "@apollo/client";

export const FETCH_ALL_POOLS = gql`
  query ($orderBy: String, $orderDirection: String, $first: Int, $skip: Int) {
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

export const FETCH_STATUS_POOL = gql`
  query (
    $status: String
    $orderBy: BigInt
    $orderDirection: String
    $first: Int
    $skip: Int
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
