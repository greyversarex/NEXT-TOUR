import { createContext, useContext, useState, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface CurrencyData {
  id: string;
  code: string;
  symbol: string;
  nameRu: string;
  nameEn: string;
  rateToBase: string;
  isBase: boolean;
}

interface CurrencyContextType {
  currencies: CurrencyData[];
  currentCode: string;
  setCurrentCode: (code: string) => void;
  formatPrice: (amountInTJS: number | string) => string;
  convertPrice: (amountInTJS: number | string) => number;
  currentSymbol: string;
}

const CurrencyContext = createContext<CurrencyContextType>({
  currencies: [],
  currentCode: "TJS",
  setCurrentCode: () => {},
  formatPrice: (a) => `${a}`,
  convertPrice: (a) => Number(a),
  currentSymbol: "TJS",
});

export function CurrencyProvider({ children }: { children: ReactNode }) {
  const [currentCode, setCurrentCode] = useState<string>(() => {
    return localStorage.getItem("currency") || "TJS";
  });

  const { data: currencies = [] } = useQuery<CurrencyData[]>({
    queryKey: ["/api/currencies"],
  });

  const handleSetCode = (code: string) => {
    setCurrentCode(code);
    localStorage.setItem("currency", code);
  };

  const currentCurrency = currencies.find(c => c.code === currentCode);
  const rate = currentCurrency ? Number(currentCurrency.rateToBase) : 1;
  const currentSymbol = currentCurrency ? currentCurrency.symbol : "TJS";

  const convertPrice = (amountInTJS: number | string): number => {
    const amount = Number(amountInTJS);
    if (!amount || rate === 0) return 0;
    if (!currentCurrency || currentCurrency.isBase) return amount;
    return amount / rate;
  };

  const formatPrice = (amountInTJS: number | string): string => {
    const converted = convertPrice(amountInTJS);
    if (!currentCurrency || currentCurrency.isBase) {
      return `${converted.toFixed(0)} ${currentSymbol}`;
    }
    return `${converted.toFixed(0)} ${currentSymbol}`;
  };

  return (
    <CurrencyContext.Provider value={{
      currencies,
      currentCode,
      setCurrentCode: handleSetCode,
      formatPrice,
      convertPrice,
      currentSymbol,
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}
