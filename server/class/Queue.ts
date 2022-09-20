type QueueProps = {
  name: string;
  identifier: string;
  priority: number;
  skipQueue: boolean;
};

type GraceProps = {
  identifier: string;
  time: number;
};

export class Queue {
  private queueMax: number = 1;
  private queueList: Array<QueueProps> = [];
  private graceList: Array<GraceProps> = [];

  constructor(queueMax: number) {
    this.queueMax = queueMax;
  }

  public getSize() {
    return this.queueList.length;
  }

  public getQueueList() {
    return this.queueList;
  }

  public getQueueMax() {
    return this.queueMax;
  }

  public isQueueFull() {
    return this.queueList.length >= this.queueMax;
  }

  public isQueueEmpty() {
    return this.queueList.length === 0;
  }

  public enqueue(queue: QueueProps) {
    if (this.isQueueFull()) {
      throw new Error('Queue is full');
    }

    if (this.isQueueEmpty() || queue.priority <= this.queueList[this.queueList.length - 1].priority) {
      this.queueList.push(queue);
    } else {
      for (let index in this.queueList) {
        if (queue.priority > this.queueList[index].priority) {
          this.queueList.splice(Number(index), 0, queue);
          break;
        }
      }
    }
    return this.queueList.length;
  }

  public dequeue(identifier: string) {
    this.queueList = this.queueList.filter((queue) => queue.identifier !== identifier);
  }

  public getPlayerPosition(identifier: string) {
    return this.queueList.findIndex((queue) => queue.identifier === identifier);
  }

  public isPlayerAtFirstPotision(identifier: string) {
    return this.getPlayerPosition(identifier) === 0;
  }

  public addPlayerToGraceList(source: number, identifier: string) {
    const player: GraceProps = {
      identifier: identifier,
      time: GetGameTimer(),
    };
    this.graceList.push(player);
  }

  public doesPlayerHaveGrace(identifier: string) {
    return this.graceList.some((queue) => queue.identifier === identifier);
  }

  public getPlayerGraceTime(identifier: string) {
    const player = this.graceList.find((queue) => queue.identifier === identifier);
    if (player) {
      return player.time;
    }
    return 0;
  }

  public changePlayerPriority(identifier: string, priority: number) {
    const player = this.queueList.find((queue) => queue.identifier === identifier);
    if (player) {
      player.priority = priority;
    }
    this.queueList = this.queueList.sort((a, b) => b.priority - a.priority);
  }

  public removePlayerFromGrace(identifier: string) {
    this.graceList = this.graceList.filter((queue) => queue.identifier !== identifier);
  }

  public skipQueue(identifier: string) {
    const player = this.queueList.find((queue) => queue.identifier === identifier);
    if (player) {
      player.skipQueue = true;
    }
  }

  public canPlayerSkipQueue(identifier: string) {
    const player = this.queueList.find((queue) => queue.identifier === identifier);
    if (player) {
      return player.skipQueue;
    }
    return false;
  }
}
