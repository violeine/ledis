import React, { useState } from "react";
import { intersection } from "./utils";
export function useLedis() {
  const [store, setStore] = useState(new Map());
  const [history, setHistory] = useState([]);
  // isSet function
  // JSON stringify replacer releiver
  // refractor commands, add command to argument

  const Commands = {
    clear: function () {
      // setHistory([]);
      return "clear";
    },
    set: function (k, v) {
      if (arguments.length != 2) throw "Wrong number of args for this commands";
      setStore(new Map(store.set(k, v)));
      return "OK";
    },
    get: function (k) {
      return store.get(k);
    },
    sadd: function (k, ...args) {
      if (args.length == 0) throw "Wrong number of args for this commands";
      let v = new Set(args);
      return isSet(
        k,
        function () {
          console.log(store.get(k));
          setStore(new Map(store.set(k, new Set([...v, ...store.get(k)]))));
          return "OK";
        },
        function () {
          console.log("wtf", args);
          setStore(new Map(store.set(k, v)));
          return "OK";
        },
      );
    },
    srem: function (k, ...args) {
      return isSet(
        k,
        function () {
          const set = new Set(store.get(k));
          args.forEach((el) => set.delete(el));
          setStore(new Map(store.set(k, set)));
          return "OK";
        },
        function () {
          return "OK";
        },
      );
    },
    smembers: function (k) {
      return isSet(
        k,
        function () {
          console.log(store.get(k));
          return store.get(k);
        },
        function () {
          return "(empty array)";
        },
      );
    },
    sinter: function (...k) {
      const sets = k.map((el) =>
        isSet(
          el,
          () => store.get(el),
          () => new Set(),
        ),
      );
      return intersection(...sets);
    },
  };

  function isSet(k, t, u) {
    if (store.has(k)) {
      if (store.get(k) instanceof Set) {
        return t();
      } else {
        throw "err wrong type";
      }
    } else {
      return u();
    }
  }
  function print(cmd) {
    if (cmd.result == "clear") setHistory([]);
    else setHistory((history) => [...history, cmd]);
  }

  function evl(str) {
    const [cmd, ...args] = str.split(" ");
    try {
      console.log(args);
      if (typeof Commands[cmd] == "function") {
        return { cmd: str, result: Commands[cmd](...args) };
      } else {
        throw "command not exists";
      }
    } catch (err) {
      return { cmd: str, result: err };
    }
  }
  function rep(str) {
    return print(evl(str));
  }
  return [history, store, rep];
}
