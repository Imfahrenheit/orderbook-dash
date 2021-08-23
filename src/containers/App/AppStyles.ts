import styled from "styled-components";
import { OrderbookState } from "../../store/slice";


const theme = {
  bids: "hsla(347, 49%, 46%, 1)",
  ask: "hsla(189, 85%, 32%, 1)",
  price: "hsla(122, 89%, 31%)",
  bgColor: "hsla(281, 13%, 9%)",
  textWhite: "hsla(64, 3%, 94%)",
  textGrey: "hsla(64, 4%, 60%)",
  buttonBgColor: "hsla(215, 6%, 20%)",
};

export const CurrencyButton = styled.button`
  background-color: hsla(269, 95%, 48%);
  border: 0;
  border-radius: 0.2rem;
  box-sizing: border-box;
  color: #fff;
  font-size: 1rem;
  height: 3rem;
  padding: 0.8rem 1rem;
  text-shadow: 0.1rem 0.1rem 0.5rem hsla(0, 0%, 0%, 0.5);
  text-transform: uppercase;
  transition: transform 100ms ease-in;

  &:hover {
    background-color: hsla(269, 93%, 47%);
    transform: translateY(-1px);
  }
  &:active {
    background-color: hsla(269, 98%, 49%);
    transform: translateY(-1px);
  }
`;

export const ConnectionButton = styled(CurrencyButton)<{ connectionState: OrderbookState["connectionState"] }>`
  background-color: ${({ connectionState }) => (connectionState === "connected" ? theme.bids : theme.ask)};

  &:hover {
    background-color: ${({ connectionState }) => (connectionState === "connected" ? "hsla(347, 49%, 51%, 1)" : "hsla(189, 85%, 32%, 1)")};
  }
  &:active {
    background-color: ${({ connectionState }) => (connectionState === "connected" ? "hsla(347, 49%, 46%, 1)" : "hsla(189, 85%, 32%, 1)")};
  }
`;

export const TableWrapper = styled.div<{ rowsCount: number }>`
  background: rgba(0, 0, 0, 0.2);
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: ${({ rowsCount }) => `repeat(${rowsCount}, 2rem)`};
  max-height: inherit;
  width: 100%;
  .thead {
    color: ${theme.textGrey};
    text-align: center;
    text-transform: uppercase;
    width: 30%;
    z-index: 2;
  }
  .price {
    color: ${theme.price};
    z-index: 2;
  }
  .row {
    display: flex;
    position: relative;
    width: 100%;
    z-index: 2;
  }
  .tbody {
    text-align: center;
    width: 30%;
  }
`;

export const Wrapper = styled.div`
  box-sizing: border-box;
  color: ${theme.textWhite};
  display: grid;
  grid-template-areas:
    "header header"
    "table2 table2"
    "table1 table1";

  padding: 0 1rem;
  .orderbook-header {
    grid-area: header;
    text-align: center;
  }
  > *:nth-child(2) {
    grid-area: table1;
  }
  > *:nth-child(3) {
    grid-area: table2;
  }

  @media screen and (min-width: 769px) {
    grid-template-areas:
      "header header"
      "table1 table2";
    grid-template-rows: 3rem auto;
    overflow-y: auto;
    padding: 0 2rem;
  }
`;

export const Depth = styled.div`
  height: 100%;
  opacity: 0.2;
  overflow-x: hidden;
  position: absolute;
  z-index: -1;
  .asks,
  .bids {
    right: 0;
  }
  @media screen and (min-width: 769px) {
    opacity: 0.3;
  }
`;

export const Body = styled.div`
  background-color: ${theme.bgColor};
  display: flex;
  flex-direction: column;

  justify-content: space-between;
  @media screen and (min-width: 769px) {
    height: calc(100vh - 2rem);
  }
`;

export const ButtonGroup = styled.div`
  background-color: ${theme.buttonBgColor};
  box-sizing: border-box;
  padding: 8px;
  text-align: center;
  > :first-child {
    margin-right: 2rem;
  }
`;
export const OrderBookHeader = styled.div`
  border-bottom: 1px solid ${theme.textGrey};
  display: flex;
`;
