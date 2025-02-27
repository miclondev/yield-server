const utils = require('../utils');

const topLvl = async (chainString, url, token, address, underlying) => {
  let dataTvl;
  let dataApy;
  let data;
  let apy;

  if (chainString === 'ethereum') {
    dataTvl = await utils.getData(`${url}/short-lido-stats`);
    dataApy = await utils.getData(`${url}/sma-steth-apr`);
    dataTvl.apr = dataApy;
    data = { ...dataTvl };
  } else {
    data = await utils.getData(url);
  }
  data.token = token;
  data.address = address;

  if (chainString === 'solana') {
    apy = await utils.getData(url);
    data.apr = apy.apy.find((i) => i.title.includes('14-day')).apy;
  }

  return {
    pool: `${data.address}-${chainString}`.toLowerCase(),
    chain: utils.formatChain(chainString),
    project: 'lido',
    symbol: utils.formatSymbol(data.token),
    tvlUsd: chainString === 'ethereum' ? data.marketCap : data.totalStaked.usd,
    apyBase: Number(data.apr),
    underlyingTokens: [underlying],
  };
};

const main = async () => {
  const data = await Promise.all([
    topLvl(
      'ethereum',
      'https://stake.lido.fi/api',
      'stETH',
      '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
      '0x0000000000000000000000000000000000000000'
    ),
    topLvl(
      'polygon',
      'https://polygon.lido.fi/api/stats',
      'stMATIC',
      '0x9ee91F9f426fA633d227f7a9b000E28b9dfd8599',
      '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0'
    ),
    topLvl(
      'solana',
      'https://solana.lido.fi/api/stats',
      'stSOL',
      '7dHbWXmci3dT8UFYWYZweBLXgycu7Y3iL6trKn1Y7ARj',
      '0x0000000000000000000000000000000000000000'
    ),
  ]);

  return data.flat();
};

module.exports = {
  timetravel: false,
  apy: main,
  url: 'https://lido.fi/#networks',
};
