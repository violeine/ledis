import React, { useState, useCallback, useRef, useEffect } from "react";
import { useLedis } from "./useLedis.js";
import { replacer } from "./utils.js";
import { hot } from "react-hot-loader/root";

function App() {
  const [history, store, rep] = useLedis();
  return (
    <div className="flex flex-col h-screen w-full">
      <div className=" bg-red-50 h-3/4 flex">
        <div className="w-3/4 bg-indigo-200">
          <Cli history={history} rep={rep} />
        </div>
        <div className="w-1/4 bg-green-500">
          <pre> {JSON.stringify(store, replacer, 2)} </pre>
          <pre> {JSON.stringify(history, null, 2)} </pre>
        </div>
      </div>
      <div className=" bg-green-50  h-1/4"> a</div>
    </div>
  );
}

function Cli({ history, rep }) {
  const ttyRef = useRef(null);
  useEffect(() => {
    ttyRef.current.scrollTop = ttyRef.current.scrollHeight;
    // ttyRef.current.scrollIntoView({ behavior: "smooth" });
  }, [history]);
  return (
    <div className="p-5 flex flex-col h-full w-full">
      <div className="bg-gray-900 p-2 flex-1 overflow-auto" ref={ttyRef}>
        {history.map(({ cmd, result }) => {
          return (
            <>
              <div className="text-red-50"> {cmd} </div>;
              <div className="text-red-50"> {result} </div>;
            </>
          );
        })}
      </div>
      <div className="bg-blue-300 h-14 p-2 flex">
        <span className=" p-2 bg-red-50"> Ledis&gt; </span>
        <input
          type="text"
          className="w-full h-full block p-2 bg-red-50 focus:outline-none"
          onChange={(e) => {
            console.log(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key == "Enter") {
              rep(e.target.value);
              e.target.value = "";
            }
          }}
        />
      </div>
    </div>
  );
}

export default hot(App);
