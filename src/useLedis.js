import React, { useState } from "react";
export function useLedis() {
  const [store, setStore] = useState({});
  const [history, setHistory] = useState([]);
  const Commands = {
    clear: function () {
      setHistory([]);
    },
    set: function (k, v, x) {
      console.log(k, v);
      setStore({ ...store, [k]: v });
      if (x) throw "more than 2! less than 3 pls";
    },
    get: function (k) {
      setHistory([...history, { cmd: "get", result: store[k] }]);
    },
  };

  function evl(cmd, ...args) {
    try {
      if (typeof Commands[cmd] == "function") {
        Commands[cmd](...args);
      } else {
        throw "command not exists";
      }
    } catch (err) {
      setHistory([...history, { cmd: [cmd, ...args].join(" "), result: err }]);
    }
  }
  return [history, store, evl];
}
