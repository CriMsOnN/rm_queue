import { Queue } from './class/Queue';
import { Deferrals, adaptiveCard, configProps, userProps } from './types';
import { differenceInCalendarDays } from 'date-fns';
const config = JSON.parse(LoadResourceFile('rm_queue', 'config.json')) as configProps;
const adaptivedCard = JSON.parse(LoadResourceFile('rm_queue', 'adaptiveCard.json')) as adaptiveCard;
adaptivedCard.body[1].items[0].text = config.adaptivedWelcomeMessage;
let imageIndex = 0;
setInterval(() => {
  if (imageIndex >= config.adaptiveCardImages.length) {
    imageIndex = 0;
  }
  adaptivedCard.body[0].url = config.adaptiveCardImages[imageIndex];
  imageIndex++;
}, 5000);
StopResource('hardcap');
const maxPlayers = GetConvar('sv_maxclients', '32');
const queue = new Queue(config.queueSize);

setImmediate(async () => {
  await Delay(1000);
  const isTableCreated = await global.exports.oxmysql.query_async("SHOW TABLES LIKE 'priorities'");
  if (isTableCreated.length === 0) {
    const QUERY =
      'CREATE TABLE IF NOT EXISTS `priorities` (\
      `identifier` varchar(50) DEFAULT NULL,\
      `priority` int(11) DEFAULT NULL,\
      `expires` date DEFAULT NULL\
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;';
    const results = await global.exports.oxmysql.query_async(QUERY);
    if (results) {
      console.log('Created table priorities!');
    }
  } else {
    console.log('Table priorities already exists!');
  }
});

const formatCard = (item: number, text: string) => {
  adaptivedCard.body[1].items[item].text = text;
};

export async function fetchUser(identifier: any) {
  const user: userProps = await global.exports.oxmysql.single_async('SELECT * FROM priorities WHERE identifier = ?', [identifier]);
  return user;
}

const emptySlots = () => {
  const players = GetNumPlayerIndices();
  const slots = parseInt(maxPlayers) - players;
  return slots;
};

let graceTime = config.graceTime;
let isQueueClosed = false;

on('playerConnecting', async (name: string, setKickReason: string, deferrals: Deferrals) => {
  const tempId = +source;
  deferrals.defer();
  if (isQueueClosed && emptySlots() <= 0) {
    return deferrals.done('Queue is closed');
  }
  const identifier = getPlayerIdentifiers(tempId)[0];
  const user = await fetchUser(identifier);
  if (user) {
    const diffInDays = differenceInCalendarDays(new Date(user.expires), new Date());
    if (diffInDays <= 0) {
      await global.exports.oxmysql.query_async('DELETE FROM priorities WHERE identifier = ?', [identifier]);
      user.priority = 1;
    }
  }
  queue.enqueue({ name, tempId, identifier: identifier, priority: user?.priority ?? 1, skipQueue: false });
  let interval = setInterval(async () => {
    if (emptySlots() > 2) {
      if (queue.doesPlayerHaveGrace(identifier)) {
        if (queue.getPlayerGraceTime(identifier) + graceTime < GetGameTimer()) {
          queue.changePlayerPriority(identifier, 100);
        }
        queue.removePlayerFromGrace(identifier);
      }
      if (queue.canPlayerSkipQueue(identifier)) {
        formatCard(1, 'A higher staff skipped the queue for you.!');
        formatCard(2, user ? `You have priority ${user.priority}` : 'You dont have active priority');
        formatCard(3, user ? formatExpire(user.expires) : '');
        deferrals.presentCard(adaptivedCard);
        await Delay(1000);
        queue.addPlayerToLoading(tempId);
        if (config.useExternal) {
          global.exports[config.connectingResource][config.connectingExport](tempId, name, setKickReason, deferrals);
        } else {
          deferrals.done();
        }
        clearInterval(interval);
      } else if (queue.getPlayerPosition(identifier) === 0) {
        formatCard(1, `You're next in line. Keep waiting`);
        formatCard(2, user ? `You have priority ${user.priority}` : 'You dont have active priority');
        formatCard(3, user ? formatExpire(user.expires) : '');
        deferrals.presentCard(adaptivedCard);
        if (queue.getPlayersInLoadingState().length < config.slowLoadingNumber) {
          await Delay(1000);
          queue.addPlayerToLoading(tempId);
          console.log(config.useExternal);
          if (config.useExternal) {
            global.exports[config.connectingResource][config.connectingExport](tempId, name, setKickReason, deferrals);
          } else {
            deferrals.done();
          }
          clearInterval(interval);
        }
      } else {
        formatCard(1, `You're ${queue.getPlayerPosition(identifier) + 1}/${queue.getSize()} in line.`);
        formatCard(2, user ? `You have priority ${user.priority}` : 'You dont have active priority');
        formatCard(3, user ? formatExpire(user.expires) : '');
        deferrals.presentCard(adaptivedCard);
      }
    } else {
      formatCard(1, `You're ${queue.getPlayerPosition(identifier) + 1}/${queue.getSize()} in line.`);
      formatCard(2, user ? `You have priority ${user.priority}` : 'You dont have active priority');
      formatCard(3, user ? formatExpire(user.expires) : '');
      deferrals.presentCard(adaptivedCard);
    }
  }, 1000);
  return;
});

const formatExpire = (expires: string) => {
  const diffInDays = differenceInCalendarDays(new Date(expires ?? 0), new Date());
  let message = '';
  if (diffInDays <= 0) {
    message = 'Your priority has expired';
  } else if (diffInDays === 1) {
    message = 'Your priority expires tomorrow';
  } else {
    message = `Your priority expires in ${diffInDays} days`;
  }
  return message;
};

on('playerDropped', () => {
  const _src = +source;
  const identifier = getPlayerIdentifiers(_src)[0];
  queue.dequeue(identifier);
  queue.addPlayerToGraceList(_src, identifier);
});

on('playerJoining', (src: number) => {
  const tempId = +src;
  const identifier = getPlayerIdentifiers(tempId)[0];
  queue.removePlayerFromLoading(tempId);
  queue.dequeue(identifier);
});

onNet('queue:dequeuePlayer', () => {
  const _src = +source;
  const identifier = getPlayerIdentifiers(_src)[0];
  queue.dequeue(identifier);
});

const removePlayerFromQueue = (identifier: string) => {
  queue.dequeue(identifier);
};

const queueClose = (close: boolean) => {
  isQueueClosed = close;
};

const getLoadingPlayers = () => {
  return queue.getPlayersInLoadingState();
};

global.exports('removePlayerFromQueue', removePlayerFromQueue);
global.exports('getLoadingPlayers', getLoadingPlayers);
global.exports('getQueueSize', () => queue.getSize());
global.exports('getQueueList', () => queue.getQueueList());
global.exports('queue', queueClose);

const Delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
