# RM Queue

## How to install

---

- Download the repository
- If you want to make any changes you need to install dependencies ( `yarn install` inside the folder and then `yarn watch` and after you can make any change you want )
- Edit `config.json` to your needs ( if you are using an external export for checking banlist etc. You need to edit the `connectingExport` and `connectionResource`)
- You can specify the queue size
- You can specify how many players can join at the same time ( slowLoadingNumber )
- You can also add images to the `adaptiveCardImage` array in `config.json` ( you can add as many as you want )
- Edit the `adaptiveWelcomeMessage` in config.json

## Commands

---

- You can edit the commands in server.lua to add permissions etc.

## Comands List

---

- `skipQueue` - Skips the queue for a player ( you need to use the temporary id that `playerConnecting` assigns to the player )
- `queue` - arguments `open | close` - Opens or closes the queue
- `getQueueList` - Gets the queue list
- `getQueueSize` - Gets the queue size
- `getLoadingPlayers` - Gets the players that are loading

## Grace

---

- You can edit the grace time in `config.json` ( graceTime - defaultTime: 300000 )
- When a player disconnects and reconnects within the grace time, he will be put back in the queue with priority 100
