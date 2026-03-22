import React, { useEffect, useState } from 'react';

interface OrderBookLevel {
  price: number;
  quantity: number;
}

interface OrderBookProps {
  bids: OrderBookLevel[];
  asks: OrderBookLevel[];
}

const OrderBook: React.FC<OrderBookProps> = ({ bids, asks }) => {
  return (
    <div className="flex">
      <div className="w-1/2 pr-2">
        <h3 className="font-bold">Bids (Buy)</h3>
        <div className="grid grid-cols-2 text-sm">
          <span>Price (USD)</span>
          <span>Quantity (ETH)</span>
        </div>
        {bids.slice(0, 10).map((bid, i) => (
          <div key={i} className="grid grid-cols-2 text-green-600">
            <span>{bid.price.toFixed(2)}</span>
            <span>{bid.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>
      <div className="w-1/2 pl-2">
        <h3 className="font-bold">Asks (Sell)</h3>
        <div className="grid grid-cols-2 text-sm">
          <span>Price (USD)</span>
          <span>Quantity (ETH)</span>
        </div>
        {asks.slice(0, 10).map((ask, i) => (
          <div key={i} className="grid grid-cols-2 text-red-600">
            <span>{ask.price.toFixed(2)}</span>
            <span>{ask.quantity.toFixed(4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrderBook;
