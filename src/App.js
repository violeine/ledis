import React, { useRef, useEffect } from "react";
import { useLedis } from "./useLedis.js";
import { replacer } from "./utils.js";
import { hot } from "react-hot-loader/root";
import { Footer } from "./Footer.js";

function App() {
  const [history, store, exp, rep] = useLedis();
  const debugRef = useRef(null);
  useEffect(() => {
    debugRef.current.scrollTop = debugRef.current.scrollHeight;
  }, [store, history]);
  useEffect(() => {
    rep("set hello world");
    rep("get hello");
    rep("sadd a new set to ledis");
    rep("srem a new value");
    rep("sadd b to ledis to test sinter");
    rep("sadd c this also to test inter ledis");
    rep("sinter a b c");
    rep("keys");
    rep("del a");
    rep("set expire-key will");
    rep("expire expire-key 300");
    rep("ttl expire-key");
  }, []);
  return (
    <div className="flex flex-col h-screen w-full">
      <div
        className=" bg-red-50 h-3/4 flex"
        style={{ minHeight: "calc(100vh - 220px)" }}
      >
        <div className="w-3/4 bg-indigo-200">
          <Cli history={history} rep={rep} />
        </div>
        <div className="w-1/4 bg-indigo-200 h-full p-5">
          <div
            className="w-full bg-white  h-full rounded-lg shadow-lg overflow-auto p-2"
            ref={debugRef}
          >
            <p class="text-lg">Store</p>
            <pre class="mb-5"> {JSON.stringify(store, replacer, 2)} </pre>
            <p class="text-lg">Expiration</p>
            <pre> {JSON.stringify(exp, replacer, 2)} </pre>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}

function Cli({ history, rep }) {
  const ttyRef = useRef(null);
  useEffect(() => {
    ttyRef.current.scrollTop = ttyRef.current.scrollHeight;
    // ttyRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  function renderArray(arr) {
    return arr.map((el, i) => {
      return (
        <p>
          <span class="mr-1">{i + 1}.</span> {el}
        </p>
      );
    });
  }
  return (
    <div className="p-5 flex flex-col h-full w-full ">
      <div
        className="bg-gray-900 py-4 pl-5 pr-2 flex-1 overflow-auto rounded-t-lg shadow-lg"
        ref={ttyRef}
      >
        {history.map(({ cmd, result, error }) => {
          return (
            <>
              <div className="text-gray-50 mb-2">
                <span className="font-bold">ledis > </span> {cmd}{" "}
              </div>
              <div className="text-gray-50 mb-3">
                {Array.isArray(result) ? renderArray(result) : result}
              </div>
              <div className="text-red-500 mb-3"> {error} </div>
            </>
          );
        })}
      </div>
      <div className="bg-blue-300 h-14 p-2 flex rounded-b-lg shadow-lg">
        <span className=" p-2 bg-red-50 font-bold shadow-lg rounded-l-lg">
          Ledis&gt;
        </span>
        <input
          type="text"
          className="w-full h-full block p-2 bg-red-50 rounded-r-lg shadow-lg focus:outline-none"
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              rep(e.target.value.trim());
              e.target.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

export default hot(App);
