import React, { useEffect, useState } from "react";
import ReactNotification from "react-notifications-component";
import "react-notifications-component/dist/theme.css";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { ITable, orderbookActions } from "../../store/slice";
import getTable from "../../utils/getTable";
import { ConnectionButton, CurrencyButton, TableWrapper, Wrapper, Body, ButtonGroup, OrderBookHeader, Depth } from "./AppStyles";

interface TableProps {
  payload: ITable["asks"];
  variant: "bids" | "asks";
}

const Table: React.FC<TableProps> = ({ payload, variant }) => {
  const [width, setWidth] = useState(window.innerWidth);
  const updateDimensions = () => {
    setWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const maxTotal = payload.length && payload[payload.length - 1].total;

  return variant === "asks" && width > 769 ? (
    <TableWrapper rowsCount={payload.length}>
      <div className="row">
        <p className="thead">total</p>
        <p className="thead">size</p>
        <p className="thead">price</p>
      </div>

      {payload.map((data, key) => (
        <div className="row" key={key}>
          <p className="tbody">{data.total}</p>
          <p className="tbody">{data.size}</p>
          <div className="tbody">
            <Depth style={{ width: `${(data.total * 100) / maxTotal}%`, background: "#8F2C1F", right: 0 }} />
            <div className="price">
              <p>{data.price.toFixed(2)}</p>
            </div>
          </div>
        </div>
      ))}
    </TableWrapper>
  ) : (
    <TableWrapper rowsCount={payload.length}>
      {variant === "bids" && (
        <div className="row">
          <p className="thead">price</p>
          <p className="thead">size</p>
          <p className="thead">total</p>
        </div>
      )}
      {payload.map((data, key) => (
        <div className="row" key={key}>
          {/* needed to add in-line styling to avoid creating hundreds of class names in styled Components */}
          <div className="tbody">
            <Depth
              className={variant === "bids" ? "bids" : "asks"}
              style={{ width: `${(data.total * 100) / maxTotal}%`, background: variant === "asks" ? "#8F2C1F" : "#46952C" }}
            />
            <div className="price" style={{ color: variant === "asks" ? "#8F2C1F" : "hsla(122, 89%, 31%)" }}>
              <p>{data.price.toFixed(2)}</p>
            </div>
          </div>
          <p className="tbody">{data.size}</p>
          <p className="tbody">{data.total}</p>
        </div>
      ))}
    </TableWrapper>
  );
};

function App() {
  const orderbook = useAppSelector((state) => state.orderbook);
  const {
    connectionState,
    baseData: { product_id },
  } = orderbook;
  const tableData = getTable({ orderbook });
  const dispatch = useAppDispatch();
  const handleToggleCurrency = () => {
    dispatch(orderbookActions.toggleCurrency(product_id === "PI_XBTUSD" ? "PI_ETHUSD" : "PI_XBTUSD"));
  };
  const onClick = () => {
    if (["connecting", "connected"].includes(connectionState)) {
      dispatch(orderbookActions.throwWsErr());
    } else {
      dispatch(orderbookActions.connecting());
    }
  };
  // eslint-disable-next-line 
  useEffect(onClick, []);
  return (
    <>
      <ReactNotification />
      <Body>
        <Wrapper>
          <OrderBookHeader className="orderbook-header">
            <h4>Orderbook</h4>
          </OrderBookHeader>

          <Table payload={tableData.asks} variant="asks" />
          <Table payload={tableData.bids} variant="bids" />
        </Wrapper>
        <ButtonGroup>
          <CurrencyButton onClick={handleToggleCurrency} type="button">
            Switch to {product_id === "PI_XBTUSD" ? "ETH" : "XBT"}
          </CurrencyButton>
          <ConnectionButton connectionState={connectionState} onClick={onClick}>
            {["connecting", "connected"].includes(connectionState) ? "kill feed" : "connect"}
          </ConnectionButton>
        </ButtonGroup>
      </Body>
    </>
  );
}

export default App;
