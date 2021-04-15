import React, { useState } from "react";
import { intersection, now, replacer, releiver } from "./utils";

export function useLedis() {
  const [store, setStore] = useState(new Map());
  const [exp, setExp] = useState(new Map());
  const [history, setHistory] = useState([]);
  // isSet function
  // JSON stringify replacer releiver
  // refractor commands, add command to argument

  const Commands = {
    clear: function () {
      return "clear";
    },
    set: function (k, v) {
      if (arguments.length != 2) throw "Wrong number of args for this commands";
      setStore(new Map(store.set(k, v)));
      return "OK";
    },
    get: function (k) {
      if (isExpire(k)) {
        return "empty";
      }
      return store.get(k);
    },
    sadd: function (k, ...args) {
      if (args.length == 0) throw "Wrong number of args for this commands";
      let v = new Set(args);
      if (isExpire(k)) {
        setStore(new Map(store.set(k, v)));
        return "OK";
      }
      return isSet(
        k,
        function () {
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
      if (isExpire(k)) return "OK";
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
      if (isExpire(k)) return "(empty array)";
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
      const sets = k.map((el) => {
        if (isExpire(el)) return new Set();
        return isSet(
          el,
          () => store.get(el),
          () => new Set(),
        );
      });
      return intersection(...sets);
    },

    keys: function () {
      return Array.from(store.keys()).filter((el) => !isExpire(el));
    },

    del: function (...k) {
      const newMap = new Map(store);
      k.forEach((el) => newMap.delete(el));
      setStore(newMap);
      return "OK";
    },

    expire: function (k, time) {
      if (store.has(k)) {
        setExp(new Map(exp.set(k, now() + Number(time))));
        return time;
      }
      return -1;
    },
    ttl: function (k) {
      if (isExpire(k)) {
        return -1;
      } else {
        return exp.get(k) - now();
      }
    },
    save: function () {
      localStorage.setItem("store", JSON.stringify(store, replacer));
      localStorage.setItem("expire", JSON.stringify(exp, replacer));
    },
    restore: function () {
      const store = localStorage.getItem("store");
      const exp = localStorage.getItem("expire");
      setStore(JSON.parse(store, releiver));
      setExp(JSON.parse(exp, releiver));
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

  function isExpire(k) {
    if (store.has(k)) {
      if (exp.has(k)) {
        if (exp.get(k) - now() <= 0) {
          const newStore = new Map(store);
          const newExp = new Map(exp);
          newStore.delete(k);
          newExp.delete(k);
          setStore(new Map(newStore));
          setExp(new Map(newExp));
          return true;
        } else return false;
      } else return false;
    } else return false;
  }

  function evl(str) {
    const [cmd, ...args] = str.split(" ");
    try {
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
  return [history, store, exp, rep];
}
