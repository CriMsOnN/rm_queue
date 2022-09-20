import { Queue } from './class/Queue';

export type Deferrals = {
  defer: () => void;
  update: (message: string) => void;
  presentCard: (card: adaptiveCard) => void;
  done: (message?: string) => void;
};

type adaptiveCard = {
  type: string;
  body: Array<{ type: string; items: Array<{ type: string; text: string; weight: string; size: string }> }>;
};

const adaptiveCard = JSON.parse(LoadResourceFile('rm_queue', 'adaptiveCard.json')) as adaptiveCard;

StopResource('hardcap');
const maxPlayers = GetConvar('sv_maxclients', '32');
const queue = new Queue(parseInt(maxPlayers) * 2);

export async function fetchUser(identifier: any) {
  const user = await global.exports.oxmysql.single_async('SELECT * FROM priorities WHERE identifier = ?', [identifier]);
  return user;
}

const emptySlots = () => {
  const players = GetNumPlayerIndices();
  const slots = parseInt(maxPlayers) - players;
  return slots;
};

let graceTime = 300000;
let isQueueClosed = false;

on('playerConnecting', async (name: string, setKickReason: string, deferrals: Deferrals) => {
  const _src = +source;
  deferrals.defer();
  if (isQueueClosed && emptySlots() <= 0) {
    return deferrals.done('Queue is closed');
  }
  const identifier = getPlayerIdentifiers(_src)[0];
  const user = await fetchUser(identifier);
  queue.enqueue({ name, identifier: identifier, priority: user.priority ?? 1, skipQueue: false });
  const expiresIn = new Date(new Date(user.expires ?? 0).getTime() - new Date().getTime()).getDate();
  const days = `Expires in ${expiresIn} ${expiresIn > 1 ? 'Days' : 'Day'}`;
  let interval = setInterval(async () => {
    if (emptySlots() > 2) {
      if (queue.doesPlayerHaveGrace(identifier)) {
        if (queue.getPlayerGraceTime(identifier) + graceTime < GetGameTimer()) {
          queue.changePlayerPriority(identifier, 100);
        }
        queue.removePlayerFromGrace(identifier);
      }
      if (queue.canPlayerSkipQueue(identifier)) {
        manipulateCard(1, 'A higher staff skipped the queue for you.!');
        manipulateCard(2, `${user.priority ? `You have priority ${user.priority}` : ' You dont have priority'}`);
        manipulateCard(3, `${user.priority ? `Your priority ${days}` : ''}`);
        deferrals.presentCard(adaptiveCard);
        await Delay(1000);
        global.exports['rm_core'].playerConnecting(_src, name, setKickReason, deferrals);
        clearInterval(interval);
      } else if (queue.getPlayerPosition(identifier) === 0) {
        const loadingPlayers = global.exports['rm_core'].getLoadingPlayers();
        deferrals.update("You're next in line. Keep waiting.");
        if (Object.keys(loadingPlayers).length < 20) {
          await Delay(1000);
          global.exports['rm_core'].playerConnecting(_src, name, setKickReason, deferrals);
          clearInterval(interval);
        }
      } else {
        manipulateCard(1, `You are in position: ${queue.getPlayerPosition(identifier) + 1}/${queue.getSize()}`);
        manipulateCard(2, `${user.priority ? `You have priority ${user.priority}` : ' You dont have priority'}`);
        manipulateCard(3, `${user.priority ? `Your priority ${days}` : ''}`);
        deferrals.presentCard(adaptiveCard);
      }
    } else {
      manipulateCard(1, `You are in position: ${queue.getPlayerPosition(identifier) + 1}/${queue.getSize()}`);
      manipulateCard(2, `${user.priority ? `You have priority ${user.priority}` : ' You dont have priority'}`);
      manipulateCard(3, `${user.priority ? `Your priority ${days}` : ''}`);
      deferrals.presentCard(adaptiveCard);
    }
  }, 1000);
  return;
});

on('playerDropped', () => {
  const _src = +source;
  const identifier = getPlayerIdentifiers(_src)[0];
  queue.dequeue(identifier);
  queue.addPlayerToGraceList(_src, identifier);
});

onNet('queue:dequeuePlayer', () => {
  const _src = +source;
  const identifier = getPlayerIdentifiers(_src)[0];
  queue.dequeue(identifier);
});

RegisterCommand(
  'skipQueue',
  async (src: number) => {
    if (src === 0) {
      const identifier = getPlayerIdentifiers(src)[0];
      queue.skipQueue(identifier);
    }
  },
  true,
);

RegisterCommand(
  'queue',
  (src: number, args: string[], rawCommand: () => void) => {
    if (src === 0) {
      if (args[0] === 'close') {
        isQueueClosed = true;
      } else if (args[0] === 'open') {
        isQueueClosed = false;
      }
    }
  },
  true,
);

const manipulateCard = (item: number, text: string) => {
  adaptiveCard.body[1].items[item].text = text;
};

const removePlayerFromQueue = (identifier: string) => {
  queue.dequeue(identifier);
};

const queueClose = (close: boolean) => {
  isQueueClosed = close;
};

global.exports('removePlayerFromQueue', removePlayerFromQueue);
global.exports('getQueueSize', () => queue.getSize());
global.exports('getQueueList', () => queue.getQueueList());
global.exports('queue', queueClose);

const Delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
