import { AnyAction, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { createEpicMiddleware, Epic } from "redux-observable";

/* Added this custom type to have better understanding on payload */
type Price = number;
type Size = number;

export interface IncomingData {
  feed: string;
  product_id: "PI_ETHUSD" | "PI_XBTUSD";
  bids: [Price, Size][];
  asks: [Price, Size][];
  numLevels?: number;
}

export interface ITable {
  asks: { price: Price; size: Size; total: number }[];
  bids: ITable["asks"];
}
export interface OrderbookState {
  baseData: IncomingData;
  snapshot: IncomingData;
  error?: Error;
  connectionState: "connected" | "connecting" | "disconnecting" | "disconnected";
}
export type OrderbookEpic = Epic<AnyAction, AnyAction, { orderbook: OrderbookState }>;
type ReducerPayload = Omit<OrderbookState, "connectionState">;

const initialState: OrderbookState = {
  baseData: { asks: [], bids: [], product_id: "PI_ETHUSD", feed: "" },

  snapshot: { asks: [], bids: [], product_id: "PI_ETHUSD", feed: "" },
  connectionState: "disconnected",
};
const orderbookSlice = createSlice({
  name: "orderbook",
  initialState,
  reducers: {
    updateDelta: (state, { payload }: PayloadAction<ReducerPayload["baseData"]>) => {
      state.baseData = payload;
    },
    connecting: (state) => {
      state.connectionState = "connecting";
    },
    disconnecting: (state) => {
      state.connectionState = "disconnecting";
    },
    disconnected: (state, { payload }: PayloadAction<OrderbookState["error"]>) => {
      state.connectionState = "disconnected";
      state.error = payload;
    },
    connected: (state) => {
      state.connectionState = "connected";
    },
    toggleCurrency: (state, { payload }: PayloadAction<ReducerPayload["baseData"]["product_id"]>) => {
      /* Should flow only when epic is not handling state */
      if (["connected", "connecting"].includes(state.connectionState) === false) {
        state.baseData.product_id = payload;
      }
    },
    setBaseSnapshot: (state, { payload }: PayloadAction<ReducerPayload["snapshot"]>) => {
      state.snapshot = payload;
    },
    end: () => {
      /* this is to stop current flow of epics, not change on anything  */
    },
    startFeed: () => {
      /* dumb action to indicate the start of the data feeding */
    },
    throwWsErr: () => {
      /* dumb action for websocket error */
    },
  },
});

export const { actions: orderbookActions, reducer: orderbookReducer } = orderbookSlice;
export const epicMiddleware = createEpicMiddleware<AnyAction, AnyAction, { orderbook: OrderbookState }>();
