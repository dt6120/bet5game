import { ApolloClient, InMemoryCache } from "@apollo/client";

const API_URL =
  "https://api.thegraph.com/subgraphs/name/dt6120/bet5game-subgraph";

const client = new ApolloClient({
  uri: API_URL,
  cache: new InMemoryCache(),
});

export default client;
