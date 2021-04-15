import React, { useRef, useEffect } from "react";
import { useLedis } from "./useLedis.js";
import { replacer } from "./utils.js";
import { hot } from "react-hot-loader/root";

function App() {
  const [history, store, exp, rep] = useLedis();
  const debugRef = useRef(null);
  useEffect(() => {
    debugRef.current.scrollTop = debugRef.current.scrollHeight;
  }, [store, history]);
  return (
    <div className="flex flex-col h-screen w-full">
      <div className=" bg-red-50 h-3/4 flex">
        <div className="w-3/4 bg-indigo-200">
          <Cli history={history} rep={rep} />
        </div>
        <div className="w-1/4 bg-green-500 overflow-auto" ref={debugRef}>
          <p>store</p>
          <pre> {JSON.stringify(store, replacer, 2)} </pre>
          <p>expiration</p>
          <pre> {JSON.stringify(exp, replacer, 2)} </pre>
        </div>
      </div>
      <div className=" bg-green-50 h-1/4 flex">
        <div className="w-3/4 flex bg-indigo-900 text-indigo-50">
          <div className="w-1/4 p-2">
            <p className="text-2xl">String</p>
            <p>SET</p>
            <p>GET</p>
          </div>
          <div className="w-1/4 p-2">
            <p className="text-2xl">Set</p>
            <p>SADD</p>
            <p>SMEMBERS</p>
            <p>SINTERS</p>
            <p>SREMS</p>
          </div>

          <div className="w-1/4 p-2">
            <p className="text-2xl">Data Expiration</p>
            <p>KEYS</p>
            <p>DEL</p>
            <p>EXPIRE</p>
            <p>TTL</p>
          </div>
          <div className="w-1/4 p-2">
            <p className="text-2xl">Snapshot</p>
            <p>SAVE</p>
            <p>RESTORE</p>
          </div>
        </div>
        <div className="w-1/4"></div>
      </div>
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
    <div className="p-5 flex flex-col h-full w-full">
      <div className="bg-gray-900 p-2 flex-1 overflow-auto" ref={ttyRef}>
        {history.map(({ cmd, result, error }) => {
          return (
            <>
              <div className="text-red-50"> {cmd} </div>
              <div className="text-red-50">
                {Array.isArray(result) ? renderArray(result) : result}
              </div>
              <div className="text-red-500"> {error} </div>
            </>
          );
        })}
      </div>
      <div className="bg-blue-300 h-14 p-2 flex">
        <span className=" p-2 bg-red-50"> Ledis&gt; </span>
        <input
          type="text"
          className="w-full h-full block p-2 bg-red-50 focus:outline-none"
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
