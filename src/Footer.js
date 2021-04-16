import React from "react";

const Commands = [
  [
    "String",
    [
      { name: "SET", args: "k v" },
      { name: "GET", args: "k" },
    ],
  ],
  [
    "Set",
    [
      { name: "SADD", args: "key, v, ..v" },
      { name: "SREM", args: "key, v, ..v" },
      { name: "SMEMBERS", args: "key" },
      { name: "SINTER", args: "k1, k2, ...k" },
    ],
  ],
  [
    "Data Expiration",
    [
      { name: "KEYS", args: "" },
      { name: "DEL", args: "k" },
      { name: "EXPIRE", args: "k, time" },
      { name: "TTL", args: "k" },
    ],
  ],
  [
    "Snapshot",
    [
      { name: "SAVE", args: "" },
      { name: "RESTORE", args: "" },
    ],
  ],
];

export function Footer() {
  return (
    <div className=" bg-indigo-900 flex h-1/4" style={{ minHeight: "220px" }}>
      <div className="w-5/6 bg-indigo-900 text-gray-100 p-5 h-full">
        <h1 className="text-3xl font-bold">Commands</h1>
        <div className="w-full flex">
          {Commands.map(([c, arr]) => (
            <CommandGroups commandsGroup={c} commands={arr} />
          ))}
        </div>
      </div>
      <div className="w-1/6 flex h-full items-center">
        <a
          className="w-20 h-20 mr-2 text-gray-50 block"
          href="https://github.com/violeine/ledis"
        >
          <svg
            role="img"
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
          </svg>
        </a>
        <a href="https://github.com/violeine" className="block">
          <img
            src="https://github.com/violeine.png"
            alt="violeine"
            class="w-20 h-20 rounded-full mr-2"
          />
        </a>
      </div>
    </div>
  );
}

function CommandGroups({ commandsGroup, commands }) {
  return (
    <div className="w-1/4 p-2">
      <p className="text-3xl">{commandsGroup}</p>
      {commands.map(({ name, args }) => (
        <Cmd cmd={name} args={args} />
      ))}
    </div>
  );
}
function Cmd({ cmd, args }) {
  return (
    <p className="text-gray-200 text-lg mr-2">
      {cmd} <span className="text-sm text-gray-50">{args}</span>
    </p>
  );
}
