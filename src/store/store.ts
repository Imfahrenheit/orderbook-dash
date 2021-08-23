import { configureStore } from "@reduxjs/toolkit";
import epics from "./rootEpics";
import { epicMiddleware, orderbookReducer } from "./slice";

const store = configureStore({
  reducer: { orderbook: orderbookReducer },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ thunk: false }).concat(epicMiddleware),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;

epicMiddleware.run(epics);

export default store;
