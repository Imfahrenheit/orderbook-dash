import { ReactNotificationOptions, store as notification } from "react-notifications-component";
import { combineEpics, ofType } from "redux-observable";
import { catchError, map, of, Subject, switchMap, takeUntil, throttleTime, withLatestFrom } from "rxjs";
import { webSocket } from "rxjs/webSocket";
import formatBaseData from "../utils/formatBaseData";
import { orderbookActions, OrderbookEpic, OrderbookState } from "./slice";
import store from "./store";

const wsLocation = "wss://www.cryptofacilities.com/ws/v1";

type WebSocket = { event: string; version: number } | { event: string; feed: string; product_ids: OrderbookState["baseData"]["product_id"][] };

const closeEvents = new Subject<CloseEvent>();
const openEvents = new Subject<Event>();
const webSocket$ = webSocket<WebSocket | OrderbookState["baseData"]>({
  url: wsLocation,
  openObserver: openEvents,
  closeObserver: closeEvents,
});

const toasterProps: ReactNotificationOptions = {
  insert: "top",
  container: "top-right",
  animationIn: ["animate__animated", "animate__fadeIn"],
  animationOut: ["animate__animated", "animate__fadeOut"],
  dismiss: {
    duration: 2000,
    onScreen: false,
  },
};

openEvents.subscribe((_) => {
  console.log("connetion ok");
  store.dispatch(orderbookActions.connected());
  notification.addNotification({
    title: "Connected!",
    message: "connection eshtablished",
    type: "success",
    ...toasterProps,
  });
});
closeEvents.subscribe((evt) => {
  console.log("gracefully closing...");

  notification.addNotification({
    title: "Disconnected!",
    message: "Something went wwrong! Connection terminated",
    type: "danger",
    ...toasterProps,
  });
  store.dispatch(orderbookActions.disconnected());
});

const startStreamEpic: OrderbookEpic = (action$, state$) => {
  return action$.pipe(
    ofType(orderbookActions.connecting.toString()),
    switchMap(() =>
      webSocket$.pipe(
        map((data) => {
          if ("numLevels" in data) {
            store.dispatch(orderbookActions.setBaseSnapshot(data));
          }
          return data;
        }),
        throttleTime(500),
        withLatestFrom(state$),
        map(([stream, state]) => {
          if ("type" in stream) console.log(stream);
          const updatefromDelta = formatBaseData("product_id" in stream ? stream : state.orderbook.baseData, state.orderbook.snapshot);
          return orderbookActions.updateDelta(updatefromDelta);
        }),

        takeUntil(action$.pipe(ofType(orderbookActions.disconnecting.toString()))),
        catchError((evt) => {
          console.log(evt);
          return of(orderbookActions.end());
        })
      )
    )
  );
};

export const messageEpic: OrderbookEpic = (action$, state$) =>
  action$.pipe(
    ofType(orderbookActions.connected.toString()),
    withLatestFrom(state$),
    map(([_, state]) => {
      webSocket$.next({ event: "subscribe", feed: "book_ui_1", product_ids: [state.orderbook.baseData.product_id] });
      return orderbookActions.startFeed();
    })
  );

const toggleCurrencyEpic: OrderbookEpic = (action$, state$) =>
  action$.pipe(
    ofType(orderbookActions.toggleCurrency.toString()),
    withLatestFrom(state$),
    map(([action, state]) => {
      if (["disconnecting", "disconnected"].includes(state.orderbook.connectionState)) {
        store.dispatch(orderbookActions.connecting());
      } else {
        webSocket$.next({ event: "unsubscribe", feed: "book_ui_1", product_ids: [state.orderbook.baseData.product_id] });
        webSocket$.next({ event: "subscribe", feed: "book_ui_1", product_ids: [action.payload] });
      }

      return orderbookActions.startFeed();
    })
  );

const testErrorEpic: OrderbookEpic = (action$, state$) =>
  action$.pipe(
    ofType(orderbookActions.throwWsErr.toString()),
    withLatestFrom(state$),
    map(([action, state]) => {
      if (["disconnecting", "disconnected"].includes(state.orderbook.connectionState)) {
        store.dispatch(orderbookActions.connecting());
      } else {
        // create a synthetic error
        webSocket$.error({ code: 4000, reason: "I think our app just broke!" });
      }

      return orderbookActions.end();
    })
  );

const allEpics = combineEpics(startStreamEpic, toggleCurrencyEpic, messageEpic, testErrorEpic);

export default allEpics;
