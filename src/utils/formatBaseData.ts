import { fromPairs } from "lodash";
import { IncomingData } from "../store/slice";


const removeduplicate = (oldData: IncomingData["asks"], newData: IncomingData["asks"]) => {
  const mergedData = { ...fromPairs(oldData), ...fromPairs(newData) };

  const obj: [number, number][] = Object.keys(mergedData).map((key) => [Number(key), mergedData[key]]);

  return obj;
};
export default function formatBaseData(incomingData: IncomingData, existingData: IncomingData): IncomingData {
  const asks = removeduplicate(
    existingData.asks,
    incomingData.asks.filter((delta) => delta[1] !== 0)
  )
    .sort((a, b) => b[0] - a[0])
    .slice(0, 20);
  const bids = removeduplicate(
    existingData.bids,
    incomingData.bids.filter((delta) => delta[1] !== 0)
  )
    .sort((a, b) => a[0] - b[0])
    .slice(-20);

  return { ...incomingData, asks, bids };
}
