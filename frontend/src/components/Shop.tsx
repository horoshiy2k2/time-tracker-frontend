import { useState } from "react";
import "../styles/shop.css";
import CoinAnimation from "./CoinAnimation";
import {
  playBuySound,
  playErrorBlipSound,
  playHoverItemSound,
  playUiTabClickSound,
} from "../utils/soundEffects";

const CHEST_COST: Record<string, number> = {
  COMMON: 10,
  UNCOMMON: 25,
  RARE: 50,
  EPIC: 100,
  LEGENDARY: 200,
};

type ShopProps = {
  buyChest: (rarity: string) => Promise<number | string>;
  buyCoinBoostNextSession: () => Promise<number | string>;
  buyCoinBoostTimed: () => Promise<number | string>;
};

export default function Shop({
  buyChest,
  buyCoinBoostNextSession,
  buyCoinBoostTimed,
}: ShopProps) {

  const [notifications, setNotifications] = useState<any[]>([]);
  const [coinAnimAmount, setCoinAnimAmount] = useState<number | null>(null);

  const addNotification = (text: string) => {
    const id = Date.now() + Math.random();

    const newNotif = { id, text };

    setNotifications(prev => [...prev, newNotif]);

    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
  };

  const chests = [
    { rarity: "COMMON", name: "Common Chest", class: "common" },
    { rarity: "UNCOMMON", name: "Uncommon Chest", class: "uncommon" },
    { rarity: "RARE", name: "Rare Chest", class: "rare" },
    { rarity: "EPIC", name: "Epic Chest", class: "epic" },
    { rarity: "LEGENDARY", name: "Legendary Chest", class: "legendary" },
  ];

  const boosts = [
    {
      key: "coin-next-session",
      name: "Coin boost 1 session",
      emoji: "🪙",
      className: "boost",
      handleBuy: buyCoinBoostNextSession,
      successText: "Coin boost for next session purchased",
    },
    {
      key: "coin-timed",
      name: "Coin boost 1-5h",
      emoji: "⏳",
      className: "boost legendary",
      handleBuy: buyCoinBoostTimed,
      successText: "Timed coin boost purchased",
    },
  ];

  const handleBuy = async (rarity: string) => {
    const result = await buyChest(rarity);

    if (result == 200) {
      // покупка прошла успешно
      const cost = CHEST_COST[rarity];
      setCoinAnimAmount(-cost);
      addNotification(`${rarity} chest purchased`);
      playBuySound();

     } else {
      // покупка не удалась
      // addNotification(result || `Failed to buy ${rarity} chest`);
      addNotification('Not enough 🪙');
      playErrorBlipSound();
    }
  };

  const handleBuyBoost = async (
    buyFn: () => Promise<number | string>,
    successText: string,
  ) => {
    const result = await buyFn();

    if (result === 200) {
      addNotification(successText);
      playBuySound();
      return;
    }

    addNotification("Not enough 🪙");
    playErrorBlipSound();
  };

  return (
    <div className="shopContainer">

      <div className="shopGrid">
        {chests.map((c) => (
          <div
            key={c.rarity}
            className={`shopItem ${c.class}`}
            onClick={() => {
              playUiTabClickSound();
              handleBuy(c.rarity);
            }}
            onMouseEnter={playHoverItemSound}
          >
            <div className="shopEmoji">📦</div>
            <div className="shopName">{c.name}</div>
            <div className="shopCost">{CHEST_COST[c.rarity]} 🪙</div>
          </div>
        ))}
        {boosts.map((boost) => (
          <div
            key={boost.key}
            className={`shopItem ${boost.className}`}
            onClick={() => {
              playUiTabClickSound();
              void handleBuyBoost(boost.handleBuy, boost.successText);
            }}
            onMouseEnter={playHoverItemSound}
          >
            <div className="shopEmoji">{boost.emoji}</div>
            <div className="shopName">{boost.name}</div>
          </div>
        ))}
      </div>


      {/* ---------- COIN ANIMATION ---------- */}

      {coinAnimAmount !== null && (
        <CoinAnimation
          amount={coinAnimAmount}
          onFinish={() => setCoinAnimAmount(null)}
        />
      )}


      {/* уведомления */}
      <div className="notifContainer">
        {notifications.map(n => (
          <div key={n.id} className="notif">
            {n.text}
            <button
              className="notifClose"
              onClick={() =>
                setNotifications(prev => prev.filter(x => x.id !== n.id))
              }
            >
              ✕
            </button>
          </div>
        ))}
      </div>

    </div>
  );
}
