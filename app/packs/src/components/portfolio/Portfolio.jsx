import React, { useMemo, useEffect, useState, useCallback } from "react";
import { ethers } from "ethers";
import { OnChain } from "src/onchain";
import {
  ApolloClient,
  InMemoryCache,
  ApolloProvider,
  useQuery,
  gql,
} from "@apollo/client";

import PortfolioTable from "./PortfolioTable";
import PortfolioTalOverview from "./PortfolioTalOverview";

const client = new ApolloClient({
  uri: "https://api.studio.thegraph.com/query/10292/talent-protocol/v0.0.4",
  cache: new InMemoryCache(),
});

const GET_SPONSOR_PORTFOLIO = gql`
  query GetSponsorPortfolio($id: String!) {
    sponsor(id: $id) {
      id
      totalAmount
      talents {
        id
        amount
        talAmount
        talent {
          id
          symbol
          name
          totalSupply
          sponsorCounter
          owner
        }
      }
    }
  }
`;

const Portfolio = ({ address }) => {
  const { loading, error, data } = useQuery(GET_SPONSOR_PORTFOLIO, {
    variables: { id: address.toLowerCase() },
  });
  const [chainAPI, setChainAPI] = useState(null);
  const [stableBalance, setStableBalance] = useState(0);
  const [returnValues, setReturnValues] = useState({});

  const supportedTalents = useMemo(() => {
    if (!data || data.sponsor == null) {
      return [];
    }

    return data.sponsor.talents.map(({ amount, talent }) => ({
      id: talent.owner,
      symbol: talent.symbol,
      name: talent.name,
      amount: ethers.utils.formatUnits(amount),
      totalSupply: ethers.utils.formatUnits(talent.totalSupply),
      nrOfSponsors: talent.sponsorCounter,
      contract_id: talent.id,
    }));
  }, [data]);

  const amountInvested = useMemo(() => {
    if (!data || data.sponsor == null) {
      return 0;
    }

    return ethers.utils.formatUnits(
      data.sponsor.talents.reduce((prev, current) => {
        return prev.add(ethers.BigNumber.from(current.amount));
      }, ethers.BigNumber.from(0))
    );
  }, [data]);

  const setupChain = useCallback(async () => {
    const newOnChain = new OnChain();

    await newOnChain.initialize();
    await newOnChain.loadStaking();
    await newOnChain.loadStableToken();
    const balance = await newOnChain.getStableBalance(true);
    setStableBalance(balance);

    setChainAPI(newOnChain);
  });

  const updateAll = async () => {
    supportedTalents.forEach((element) => {
      loadReturns(element.contract_id).then((returns) => {
        setReturnValues((prev) => ({
          ...prev,
          [element.id]: returns,
        }));
      });
    });
  };

  const returnsSum = useMemo(() => {
    let sum = ethers.BigNumber.from(0);

    Object.keys(returnValues).map((key) => {
      sum = sum.add(ethers.utils.parseUnits(returnValues[key]));
    });
    return ethers.utils.formatUnits(sum);
  }, [returnValues]);

  useEffect(() => {
    updateAll();
  }, [supportedTalents, chainAPI]);

  useEffect(() => {
    setupChain();
  }, []);

  const loadReturns = async (contractAddress) => {
    if (chainAPI && contractAddress) {
      const value = await chainAPI.calculateEstimatedReturns(
        contractAddress,
        true
      );

      return ethers.utils.formatUnits(
        ethers.utils.parseEther(value.stakerRewards.toString())
      );
    }

    return "0";
  };

  return (
    <>
      <PortfolioTalOverview
        loading={loading}
        cUSDBalance={parseFloat(stableBalance)}
        totalTal={parseFloat(amountInvested)}
        yieldSum={parseFloat(returnsSum)}
        talentCount={supportedTalents.length}
      />
      <PortfolioTable
        loading={loading}
        talents={supportedTalents}
        returnValues={returnValues}
      />
    </>
  );
};

export default (props) => (
  <ApolloProvider client={client}>
    <Portfolio {...props} />
  </ApolloProvider>
);
