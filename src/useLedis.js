import React, { useState } from "react";
import { intersection, now, replacer, releiver } from "./utils";

export function useLedis() {
  const [store, setStore] = useState(new Map());
  const [exp, setExp] = useState(new Map());
  const [history, setHistory] = useState([
    {
      cmd: "Welcome to ledis",
      result:
        "this is a repl to interact with ledis. Use `clear` command to clear the history",
    },
  ]);
  const Commands = {
    clear: function () {
      return "clear";
    },
    set: function (k, v) {
      if (arguments.length !== 2)
        throw "Wrong number of args for this commands";
      setStore(new Map(store.set(k, v)));
      //delete expire key when override key with set
      const x = new Map(exp);
      x.delete(k);
      setExp(x);
      return "OK";
    },
    get: function (k) {
      if (k === undefined) throw "Wrong number of args for this commands";
      if (isExpire(k)) {
        return "empty";
      }
      if (!store.has(k)) throw "key not available";
      if (store.get(k) instanceof Set) throw "wrong type";
      return store.get(k);
    },
    sadd: function (k, ...args) {
      if (args.length === 0 || k === undefined)
        throw "Wrong number of args for this commands";
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
          setStore(new Map(store.set(k, v)));
          return "OK";
        },
      );
    },
    srem: function (k, ...args) {
      if (args.length === 0 || k === undefined)
        throw "Wrong number of args for this command";
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
      if (k === undefined || arguments.length > 1)
        throw "Wrong number of args for this command";

      if (isExpire(k)) throw "key does not exist";
      return isSet(
        k,
        function () {
          return Array.from(store.get(k));
        },
        function () {
          throw "key does not exist";
        },
      );
    },
    sinter: function (...k) {
      if (k.length === 0) throw "Wrong number of args for this command";
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
      if (k.length === 0) throw "Wrong number of args for this command";
      const newMap = new Map(store);
      const newExp = new Map(exp);
      //delete key also delete expiration time
      k.forEach((el) => {
        newMap.delete(el);
        newExp.delete(el);
      });
      setStore(newMap);
      setExp(newExp);
      return "OK";
    },

    expire: function (k, time) {
      if (arguments.length !== 2)
        throw "Wrong number of args for this commands";
      if (store.has(k)) {
        setExp(new Map(exp.set(k, now() + Number(time))));
        return time;
      }
      return -1;
    },
    ttl: function (k) {
      if (k === undefined) throw "Wrong number of args for this command";
      if (!store.has(k)) throw "ERROR: Key not found";
      if (isExpire(k)) {
        throw "ERROR: key not found";
      } else {
        if (exp.has(k)) return exp.get(k) - now();
        return -1;
      }
    },
    save: function () {
      localStorage.setItem("store", JSON.stringify(store, replacer));
      localStorage.setItem("expire", JSON.stringify(exp, replacer));
      return "OK";
    },
    restore: function () {
      const store = localStorage.getItem("store");
      const exp = localStorage.getItem("expire");
      if (store === null) return "No snapshot to restore";
      setStore(JSON.parse(store, releiver));
      setExp(JSON.parse(exp, releiver));
      return "OK";
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
      if (typeof Commands[cmd.toLowerCase()] == "function") {
        return { cmd: str, result: Commands[cmd.toLowerCase()](...args) };
      } else {
        throw "command not exists";
      }
    } catch (err) {
      return { cmd: str, error: err };
    }
  }

  function rep(str) {
    return print(evl(str));
  }
  return [history, store, exp, rep];
}
