import { gql } from "@apollo/client";

export const FECTH_USER_POOLS = gql`
  query ($address: String) {
    users(where: { id: $address }) {
      pools {
        id
        status
        startTime
        endTime
        entryFee
        token
        entryCount
      }
    }
  }
`;

export const FETCH_USER_REWARDS = gql`
  query ($address: String) {
    rewards(where: { user: $address }) {
      id
      pool {
        id
        token
      }
      amount
    }
  }
`;
