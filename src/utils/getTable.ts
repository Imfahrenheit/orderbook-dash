import type { OrderbookState } from "../store/slice";

function getRow(price: number, size: number, total: number) {
  return { price, size, total };
}

export default function getTable({ orderbook }: { orderbook: OrderbookState }) {
  const { baseData } = orderbook;
  let bidsTotal = 0;
  let asksTotal = 0;
  const bids = baseData.bids.map(([price, size]) => {
    bidsTotal += size;
    return getRow(price, size, bidsTotal);
  });
  const asks = baseData.asks.map(([price, size]) => {
    asksTotal += size;
    return getRow(price, size, asksTotal);
  });

  return { bids, asks };
}
